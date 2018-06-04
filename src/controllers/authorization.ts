import { NprOneSDK } from '../index';
import { ApiError } from '../errors/api-error';
import { AccessToken, AccessTokenJSON } from '../models/access-token';
import { DeviceCode, DeviceCodeJSON } from '../models/device-code';
import { Logger } from '../utils/logger';
import { FetchUtil } from '../utils/fetch-util';

/**
 * Simulates a delay by wrapping a Promise around JavaScript's native `setTimeout` function.
 *
 * @param ms - The amount of time to delay for, in milliseconds
 */
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

/**
 * Encapsulates all of the logic for communication with the [Authorization Service](https://dev.npr.org/api/#/authorization)
 * in the NPR One API.
 *
 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
 * functions in the main {@link NprOneSDK} class.
 *
 * @example <caption>Rudimentary example of implementing the Device Code flow</caption>
 * const NprOneSDK = new NprOneSDK();
 * NprOneSDK.config = { ... };
 * const scopes = ['identity.readonly', 'identity.write', 'listening.readonly', 'listening.write'];
 * NprOneSDK.getDeviceCode(scopes)
 *     .then((deviceCodeModel) => {
 *         // display code to user on the screen
 *         NprOneSDK.pollDeviceCode()
 *             .then(() => {
 *                 NprOneSDK.getRecommendation();
 *             });
 *      })
 *     .catch(() => {
 *         NprOneSDK.getDeviceCode(scopes).then(...); // repeat ad infinitum until `pollDeviceCode()` resolves successfully
 *         // In actual use, it may be preferable to refactor this into a recursive function
 *     ));
 */
export class Authorization {
    /** The device code model for the currently-active device code grant */
    private activeDeviceCodeModel: DeviceCode | null = null;

    /**
     * Attempts to swap the existing access token for a new one using the refresh token endpoint in the OAuth proxy
     *
     * @param numRetries - The number of times this function has been tried. Will retry up to 3 times.
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
     */
    static refreshExistingAccessToken(numRetries: number = 0): Promise<AccessToken> {
        if (!NprOneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to refresh the access token.');
        }
        if (!NprOneSDK.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a refresh.');
        }

        Logger.debug('Access token appears to have expired. Attempting to generate a fresh one.');

        const url = `${NprOneSDK.config.authProxyBaseUrl}${NprOneSDK.config.refreshTokenPath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json: AccessTokenJSON) => {
                const tokenModel = new AccessToken(json);
                Logger.debug(`Access token refresh was successful, new token: ${tokenModel}`);
                NprOneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            })
            .catch((err: Error) => {
                Logger.debug('Error generating a new token in refreshExistingAccessToken()');
                Logger.debug(err);

                if (numRetries < 2) {
                    Logger.debug('refreshExistingAccessToken() will make another attempt');
                    return delay(5000)
                        .then(Authorization.refreshExistingAccessToken.bind(this, numRetries + 1));
                }

                // rethrow
                Logger.debug('refreshExistingAccessToken() has made too many attempts, aborting');
                return Promise.reject(err);
            });
    }

    /**
     * Creates a temporary user from the NPR One API and use that user's access token for
     * subsequent API requests.
     *
     * Caution: most clients are not authorized to use temporary users.
     *
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */
    createTemporaryUser(): Promise<AccessToken> {
        if (!NprOneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to create temporary users.');
        }
        if (!NprOneSDK.config.clientId) {
            throw new TypeError('A client ID must be set for temporary user requests.');
        }

        let url = `${NprOneSDK.config.authProxyBaseUrl}${NprOneSDK.config.tempUserPath}`;
        const glueCharacter = url.indexOf('?') >= 0 ? '&' : '?';
        url = `${url}${glueCharacter}clientId=${NprOneSDK.config.clientId}`;

        const options = {
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json: AccessTokenJSON) => {
                const tokenModel = new AccessToken(json);
                NprOneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            });
    }

    /**
     * Logs out the user, revoking their access token from the authorization server and removing the refresh token from
     * the secure storage in the backend proxy (if a backend proxy is configured). Note that the consuming client is
     * still responsible for removing the access token anywhere else it might be stored outside of this SDK (e.g. in
     * localStorage or elsewhere in application memory).
     *
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */
    logout(): Promise<void> {
        if (!NprOneSDK.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a logout.');
        }
        if (!NprOneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to securely log out the user.');
        }

        const url = `${NprOneSDK.config.authProxyBaseUrl}${NprOneSDK.config.logoutPath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
            body: `token=${NprOneSDK.accessToken}`,
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        };

        return fetch(url, options) // we cannot use FetchUtil.nprApiFetch() here because the success response has an empty body
            .then((response: any) => {
                if (response.ok) {
                    NprOneSDK.accessToken = '';
                    return true;
                }
                return FetchUtil.formatErrorResponse(response);
            });
    }

    /**
     * Uses the OAuth proxy to start a `device_code` grant flow. This function _just_ makes an API call that produces a
     * device code/user code pair, and should be followed up with a call to {@link pollDeviceCode} in order to complete
     * the process.
     *
     * Note that device code/user code pairs do expire after a set time, so the consuming client may need to call these
     * 2 functions multiple times before the user logs in. It is a good idea to encapsulate them in a function which
     * can be called recursively on errors; see the example below for details.
     *
     * @example
     * function logInViaDeviceCode(scopes) {
     *     nprOneSDK.getDeviceCode(scopes)
     *         .then((deviceCodeModel) => {
     *             displayCodeToUser(deviceCodeModel); // display code to user on the screen
     *             nprOneSDK.pollDeviceCode()
     *                 .then(() => {
     *                     startPlayingAudio(); // you're now ready to call `nprOneSDK.getRecommendation()` elsewhere in your app
     *                 }).catch(logInViaDeviceCode.bind(this, scopes)); // recursively call this function until the user logs in
     *         });
     * }
     *
     * @see https://dev.npr.org/guide/services/authorization/#device_code
     *
     * @param scopes - The scopes (as strings) that should be associated with the resulting access token
     * @throws {TypeError} if an OAuth proxy is not configured
     */
    getDeviceCode(scopes: string[] = []): Promise<DeviceCode> {
        if (!NprOneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }

        const url = `${NprOneSDK.config.authProxyBaseUrl}${NprOneSDK.config.newDeviceCodePath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
            body: `scope=${encodeURIComponent(scopes.join(' ')).replace('%20', '+')}`,
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json: DeviceCodeJSON) => {
                const deviceCodeModel = new DeviceCode(json);
                deviceCodeModel.validate(); // throws exception if invalid
                this.activeDeviceCodeModel = deviceCodeModel;
                return deviceCodeModel;
            });
    }

    /**
     * Uses the OAuth proxy to poll the access token endpoint as part of a `device_code` grant flow. This endpoint will
     * continue to poll until the user successfully logs in, _or_ the user goes to log in but then denies the request
     * for access to their account by this client, _or_ the device code/user code pair expires, whichever comes first.
     * In the first case, it will automatically set {@link NprOneSDK.accessToken} to the newly-generated access token,
     * and the consuming client can proceed to play recommendations immediately; in the other 2 cases, it will return
     * a Promise that rejects with a debugging message, but the next course of action would generally be to call
     * {@link getDeviceCode} again and start the whole process from the top.
     *
     * @example
     * function logInViaDeviceCode(scopes) {
     *     nprOneSDK.getDeviceCode(scopes)
     *         .then((deviceCodeModel) => {
     *             displayCodeToUser(deviceCodeModel); // display code to user on the screen
     *             nprOneSDK.pollDeviceCode()
     *                 .then(() => {
     *                     startPlayingAudio(); // you're now ready to call `nprOneSDK.getRecommendation()` elsewhere in your app
     *                 }).catch(logInViaDeviceCode.bind(this, scopes)); // recursively call this function until the user logs in
     *         });
     * }
     *
     * @see https://dev.npr.org/guide/services/authorization/#device_code
     *
     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
     */
    pollDeviceCode(): Promise<AccessToken> {
        Logger.debug('Starting to poll device code. Will poll until user logs in or code expires');

        if (!NprOneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }
        if (!this.activeDeviceCodeModel) {
            throw new TypeError('No active device code set. Please call getDeviceCode() before calling this function.');
        }

        return this.pollDeviceCodeOnce();
    }

    /**
     * Polls the device code once. If the result is an error of type `'authorization_pending'`, this will recurse,
     * calling itself after a delay equal to the interval specified in the original call to {@link getDeviceCode}.
     */
    private pollDeviceCodeOnce(): Promise<AccessToken> {
        Logger.debug('Polling device code once');

        if (!this.activeDeviceCodeModel) {
            throw new TypeError('No active device code set. Please call getDeviceCode() before calling this function.');
        }
        if (this.activeDeviceCodeModel.isExpired()) {
            return Promise.reject('The device code has expired. Please generate a new one before continuing.');
        }

        const url = `${NprOneSDK.config.authProxyBaseUrl}${NprOneSDK.config.pollDeviceCodePath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json: AccessTokenJSON) => {
                Logger.debug('Device code poll returned successfully! An access token was returned.');

                const tokenModel = new AccessToken(json);
                NprOneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            })
            .catch((error: Error) => {
                if (error instanceof ApiError) {
                    if ((error as ApiError).statusCode === 401) {
                        if ((error as ApiError).json.type === 'authorization_pending') {
                            return delay((this.activeDeviceCodeModel as DeviceCode).interval)
                                .then(this.pollDeviceCodeOnce.bind(this));
                        }
                        Logger.debug('The response was a 401, but not of type "authorization_pending". ' +
                            'The user presumably denied the app access; rejecting.');
                    } else {
                        Logger.debug('Response was not a 401. The device code has probably expired; rejecting.');
                    }
                } else {
                    Logger.debug('An unknown type of error was received. Unsure of how to respond; rejecting.');
                }
                return Promise.reject(error);
            });
    }
}
export default Authorization;
