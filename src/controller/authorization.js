import NPROneSDK from './../index';
import AccessToken from './../model/access-token';
import DeviceCode from './../model/device-code';
import Logger from './../util/logger';
import FetchUtil from './../util/fetch-util';
import ApiError from './../error/api-error';


/**
 * Simulates a delay by wrapping a Promise around JavaScript's native `setTimeout` function.
 *
 * @param {number} ms The amount of time to delay for, in milliseconds
 * @returns {Promise}
 * @private
 */
const delay = ms => new Promise(r => setTimeout(r, ms));


/**
 * Encapsulates all of the logic for communication with the [Authorization Service](http://dev.npr.org/api/#/authorization)
 * in the NPR One API.
 *
 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
 * functions in the main {@link NprOneSDK} class.
 *
 * @example <caption>Rudimentary example of implementing the Device Code flow</caption>
 * const nprOneSDK = new NprOneSDK();
 * nprOneSDK.config = { ... };
 * const scopes = ['identity.readonly', 'identity.write', 'listening.readonly', 'listening.write'];
 * nprOneSDK.getDeviceCode(scopes)
 *     .then((deviceCodeModel) => {
 *         // display code to user on the screen
 *         nprOneSDK.pollDeviceCode()
 *             .then(() => {
 *                 nprOneSDK.getRecommendation();
 *             });
 *      })
 *     .catch(() => {
 *         nprOneSDK.getDeviceCode(scopes).then(...); // repeat ad infinitum until `pollDeviceCode()` resolves successfully
 *         // In actual use, it may be preferable to refactor this into a recursive function
 *     ));
 */
export default class Authorization {
    /**
     * Initializes the controller class with private variables needed later on.
     */
    constructor() {
        /** @type {null|DeviceCode} The device code model for the currently-active device code grant
         * @private */
        this._activeDeviceCodeModel = null;
    }

    /**
     * Attempts to swap the existing access token for a new one using the refresh token endpoint in the OAuth proxy
     *
     * @param {number} [numRetries=0]   The number of times this function has been tried. Will retry up to 3 times.
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
     */
    static refreshExistingAccessToken(numRetries = 0) {
        if (!NPROneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to refresh the access token.');
        }
        if (!NPROneSDK.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a refresh.');
        }

        Logger.debug('Access token appears to have expired. Attempting to generate a fresh one.');

        const url = `${NPROneSDK.config.authProxyBaseUrl}${NPROneSDK.config.refreshTokenPath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json) => {
                const tokenModel = new AccessToken(json);
                tokenModel.validate(); // throws exception if invalid
                Logger.debug('Access token refresh was successful, new token:',
                    tokenModel.toString());
                NPROneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            })
            .catch((err) => {
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
     * Logs out the user, revoking their access token from the authorization server and removing the refresh token from
     * the secure storage in the backend proxy (if a backend proxy is configured). Note that the consuming client is
     * still responsible for removing the access token anywhere else it might be stored outside of this SDK (e.g. in
     * localStorage or elsewhere in application memory).
     *
     * @returns {Promise}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */
    logout() {
        if (!NPROneSDK.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a logout.');
        }
        if (!NPROneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to securely log out the user.');
        }

        const url = `${NPROneSDK.config.authProxyBaseUrl}${NPROneSDK.config.logoutPath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
            body: `token=${NPROneSDK.accessToken}`,
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
            },
        };

        return fetch(url, options) // we cannot use FetchUtil.nprApiFetch() here because the success response has an empty body
            .then((response) => {
                if (response.ok) {
                    NPROneSDK.accessToken = '';
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
     * @see http://dev.npr.org/guide/services/authorization/#device_code
     *
     * @param {Array<string>} [scopes=[]]   The scopes (as strings) that should be associated with the resulting access token
     * @returns {Promise<DeviceCode>}
     * @throws {TypeError} if an OAuth proxy is not configured
     */
    getDeviceCode(scopes = []) {
        if (!NPROneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }

        const url = `${NPROneSDK.config.authProxyBaseUrl}${NPROneSDK.config.newDeviceCodePath}`;
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
            .then((json) => {
                const deviceCodeModel = new DeviceCode(json);
                deviceCodeModel.validate(); // throws exception if invalid
                this._activeDeviceCodeModel = deviceCodeModel;
                return deviceCodeModel;
            });
    }

    /**
     * Uses the OAuth proxy to poll the access token endpoint as part of a `device_code` grant flow. This endpoint will
     * continue to poll until the user successfully logs in, _or_ the user goes to log in but then denies the request
     * for access to their account by this client, _or_ the device code/user code pair expires, whichever comes first.
     * In the first case, it will automatically set {@link NPROneSDK.accessToken} to the newly-generated access token,
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
     * @see http://dev.npr.org/guide/services/authorization/#device_code
     *
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
     */
    pollDeviceCode() {
        Logger.debug('Starting to poll device code. Will poll until user logs in or code expires'); // eslint-disable-line max-len

        if (!NPROneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }
        if (!this._activeDeviceCodeModel) {
            throw new TypeError('No active device code set. Please call getDeviceCode() before calling this function.'); // eslint-disable-line max-len
        }

        return this._pollDeviceCodeOnce();
    }

    /**
     * Polls the device code once. If the result is an error of type `'authorization_pending'`, this will recurse,
     * calling itself after a delay equal to the interval specified in the original call to {@link getDeviceCode}.
     *
     * @returns {Promise<AccessToken>}
     * @private
     */
    _pollDeviceCodeOnce() {
        Logger.debug('Polling device code once');

        if (this._activeDeviceCodeModel.isExpired()) {
            return Promise.reject('The device code has expired. Please generate a new one before continuing.'); // eslint-disable-line max-len
        }

        const url = `${NPROneSDK.config.authProxyBaseUrl}${NPROneSDK.config.pollDeviceCodePath}`;
        const options = {
            method: 'POST',
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json) => {
                Logger.debug('Device code poll returned successfully! An access token was returned.'); // eslint-disable-line max-len

                const tokenModel = new AccessToken(json);
                tokenModel.validate(); // throws exception if invalid
                NPROneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            })
            .catch((error) => {
                if (error instanceof ApiError) {
                    if (error.statusCode === 401) {
                        if (error.json.type === 'authorization_pending') {
                            return delay(this._activeDeviceCodeModel.interval)
                                .then(this._pollDeviceCodeOnce.bind(this));
                        }
                        Logger.debug('The response was a 401, but not of type "authorization_pending". The user presumably denied the app access; rejecting.'); // eslint-disable-line max-len
                    } else {
                        Logger.debug('Response was not a 401. The device code has probably expired; rejecting.'); // eslint-disable-line max-len
                    }
                } else {
                    Logger.debug('An unknown type of error was received. Unsure of how to respond; rejecting.'); // eslint-disable-line max-len
                }
                return Promise.reject(error);
            });
    }
}
