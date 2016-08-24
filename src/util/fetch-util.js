import Logger from './logger';
import NPROneSDK from './../index';
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
 * A thin wrapper around the Fetch API which provides functionality to automatically
 * request a new access token if an existing one has expired.
 */
export default class FetchUtil
{
    /**
     * Primary workhorse for interacting with the NPR One APIs.
     *
     * @param {string} url
     * @param {Object} [options]
     * @returns {Promise<Object>}
     */
    static nprApiFetch(url, options = {}) {
        Logger.debug(`Starting JSON fetch ${url}`);

        if (!FetchUtil._requestUrlIsAuthorizationCall(url) && !options.headers) {
            options.headers = FetchUtil._getHeaders(); // eslint-disable-line
        }

        return fetch(url, options)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401 && Boolean(NPROneSDK.accessToken)
                    && !FetchUtil._requestUrlIsAuthorizationCall(url)) {
                    return FetchUtil._attemptAccessTokenRefresh(url, options);
                }
                return FetchUtil.formatErrorResponse(response);
            });
    }

    /**
     * Wraps an error response from an API call in an {@link ApiError} object so that consuming code has more
     * flexibility to determine how to handle the error. To be clear: this function returns a Promise that **always**
     * rejects, but it may or may not have the deserialized JSON body based on whether `response.json()` succeeded or
     * failed (the latter is usually an indicator that the response had an empty body).
     *
     * @param {Response} response
     * @returns {Promise}
     */
    static formatErrorResponse(response) {
        return response.json()
            .then((json) => {
                throw new ApiError(response, json);
            }, (err) => { // this will ONLY catch errors from the deserialization, and not from the line above this
                Logger.debug('Problem deserializing JSON from API error');
                Logger.debug(err);
                throw new ApiError(response);
            });
    }

    /**
     * The logic to attempt an access token refresh, broken out for easier readability.
     *
     * @param {string} url
     * @param {Object} options
     * @returns {Promise<Object>}
     * @private
     */
    static _attemptAccessTokenRefresh(url, options) {
        return NPROneSDK.refreshExistingAccessToken()
            .then(() => { // retry the original request we were making, after a short delay
                const _options = options;
                /* istanbul ignore else */ // defensive coding
                if (options.headers) {
                    _options.headers = FetchUtil._getHeaders(); // make sure we use the new access token
                }

                return delay(250)
                    .then(FetchUtil.nprApiFetch.bind(this, url, _options));
            });
    }

    /**
     * Ensures access token is defined and generates the required Headers object for fetch
     *
     * @returns {Headers}
     * @private
     */
    static _getHeaders() {
        if (NPROneSDK.accessToken === '') {
            throw new Error('An Access Token must set before making API requests.');
        }

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${NPROneSDK.accessToken}`);
        if (NPROneSDK.config.advertisingId) {
            headers.append('X-Advertising-ID', `${NPROneSDK.config.advertisingId}`);
        }
        if (NPROneSDK.config.advertisingTarget) {
            headers.append('X-Advertising-Target', `${NPROneSDK.config.advertisingTarget}`);
        }
        return headers;
    }

    /**
     * Tests whether or not the call to the given URL should be considered an authorization call.
     *
     * @param {string} url
     * @returns {boolean}
     * @private
     */
    static _requestUrlIsAuthorizationCall(url) {
        return (NPROneSDK.config.authProxyBaseUrl && (url.indexOf(NPROneSDK.config.authProxyBaseUrl) > -1))
            || new RegExp(`/authorization/${NPROneSDK.config.apiVersion}`).test(url);
    }
}
