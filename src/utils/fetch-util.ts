import { ApiError } from '../errors/api-error';
import { NprOneSDK } from '../index';
import { Logger } from './logger';

/**
 * Simulates a delay by wrapping a Promise around JavaScript's native `setTimeout` function.
 *
 * @param ms - The amount of time to delay for, in milliseconds
 */
const delay = (ms: number): Promise<any> => new Promise(r => setTimeout(r, ms));

/**
 * A thin wrapper around the Fetch API which provides functionality to automatically
 * request a new access token if an existing one has expired.
 */
export class FetchUtil {
    /**
     * Primary workhorse for interacting with the NPR One APIs.
     */
    static nprApiFetch(url: string, options: { [key: string]: any } = {}): Promise<Object> {
        Logger.debug(`Starting JSON fetch ${url}`);

        if (!FetchUtil.requestUrlIsAuthorizationCall(url) && !options.headers) {
            options.headers = FetchUtil.getHeaders(); // eslint-disable-line
        }

        return fetch(url, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }

                if (response.status === 401 && Boolean(NprOneSDK.accessToken)
                    && !FetchUtil.requestUrlIsAuthorizationCall(url)) {
                    return FetchUtil.attemptAccessTokenRefresh(url, options);
                }

                return FetchUtil.formatErrorResponse(response);
            });
    }

    /**
     * Wraps an error response from an API call in an {@link ApiError} object so that consuming code has more
     * flexibility to determine how to handle the error. To be clear: this function returns a Promise that **always**
     * rejects, but it may or may not have the deserialized JSON body based on whether `response.json()` succeeded or
     * failed (the latter is usually an indicator that the response had an empty body).
     */
    static formatErrorResponse(response: Response): Promise<ApiError> {
        return response.json()
            .then((json) => {
                throw new ApiError(response, json);
            }, (err: Error) => { // this will ONLY catch errors from the deserialization, and not from the line above this
                Logger.debug('Problem deserializing JSON from API error');
                Logger.debug(err);
                throw new ApiError(response);
            });
    }

    /**
     * The logic to attempt an access token refresh, broken out for easier readability.
     */
    private static attemptAccessTokenRefresh(url: string, options: { [key: string]: any }): Promise<Object> {
        return NprOneSDK.refreshExistingAccessToken()
            .then(() => { // retry the original request we were making, after a short delay
                const _options = options;
                /* istanbul ignore else */ // defensive coding
                if (options.headers) {
                    _options.headers = FetchUtil.getHeaders(); // make sure we use the new access token
                }

                return delay(250)
                    .then(FetchUtil.nprApiFetch.bind(this, url, _options));
            });
    }

    /**
     * Ensures access token is defined and generates the required Headers object for fetch
     */
    private static getHeaders(): Headers {
        if (NprOneSDK.accessToken === '') {
            throw new Error('An Access Token must set before making API requests.');
        }

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${NprOneSDK.accessToken}`);
        if (NprOneSDK.config.advertisingId) {
            headers.append('X-Advertising-ID', `${NprOneSDK.config.advertisingId}`);
        }
        if (NprOneSDK.config.advertisingTarget) {
            headers.append('X-Advertising-Target', `${NprOneSDK.config.advertisingTarget}`);
        }
        return headers;
    }

    /**
     * Tests whether or not the call to the given URL should be considered an authorization call.
     */
    private static requestUrlIsAuthorizationCall(url: string): boolean {
        return (NprOneSDK.config.authProxyBaseUrl && (url.indexOf(NprOneSDK.config.authProxyBaseUrl) > -1))
            || new RegExp('authorization(\.api)?\.npr\.org').test(url);
    }
}
export default FetchUtil;
