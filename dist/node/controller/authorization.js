'use strict';

exports.__esModule = true;

var _index = require('./../index');

var _index2 = _interopRequireDefault(_index);

var _accessToken = require('./../model/access-token');

var _accessToken2 = _interopRequireDefault(_accessToken);

var _deviceCode = require('./../model/device-code');

var _deviceCode2 = _interopRequireDefault(_deviceCode);

var _logger = require('./../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fetchUtil = require('./../util/fetch-util');

var _fetchUtil2 = _interopRequireDefault(_fetchUtil);

var _apiError = require('./../error/api-error');

var _apiError2 = _interopRequireDefault(_apiError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simulates a delay by wrapping a Promise around JavaScript's native `setTimeout` function.
 *
 * @param {number} ms The amount of time to delay for, in milliseconds
 * @returns {Promise}
 * @private
 */
var delay = function delay(ms) {
    return new Promise(function (r) {
        return setTimeout(r, ms);
    });
};

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

var Authorization = function () {
    /**
     * Initializes the controller class with private variables needed later on.
     */
    function Authorization() {
        _classCallCheck(this, Authorization);

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


    Authorization.refreshExistingAccessToken = function refreshExistingAccessToken() {
        var _this = this;

        var numRetries = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

        if (!_index2.default.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to refresh the access token.');
        }
        if (!_index2.default.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a refresh.');
        }

        _logger2.default.debug('Access token appears to have expired. Attempting to generate a fresh one.');

        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.refreshTokenPath;
        var options = {
            method: 'POST',
            credentials: 'include'
        };

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            var tokenModel = new _accessToken2.default(json);
            tokenModel.validate(); // throws exception if invalid
            _logger2.default.debug('Access token refresh was successful, new token:', tokenModel.toString());
            _index2.default.accessToken = tokenModel.token;
            return tokenModel; // never directly consumed, but useful for testing
        }).catch(function (err) {
            _logger2.default.debug('Error generating a new token in refreshExistingAccessToken()');
            _logger2.default.debug(err);

            if (numRetries < 2) {
                _logger2.default.debug('refreshExistingAccessToken() will make another attempt');
                return delay(5000).then(Authorization.refreshExistingAccessToken.bind(_this, numRetries + 1));
            }

            // rethrow
            _logger2.default.debug('refreshExistingAccessToken() has made too many attempts, aborting');
            return Promise.reject(err);
        });
    };

    /**
     * Logs out the user, revoking their access token from the authorization server and removing the refresh token from
     * the secure storage in the backend proxy (if a backend proxy is configured). Note that the consuming client is
     * still responsible for removing the access token anywhere else it might be stored outside of this SDK (e.g. in
     * localStorage or elsewhere in application memory).
     *
     * @returns {Promise}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */


    Authorization.prototype.logout = function logout() {
        if (!_index2.default.accessToken) {
            throw new TypeError('An access token must be set in order to attempt a logout.');
        }
        if (!_index2.default.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to securely log out the user.');
        }

        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.logoutPath;
        var options = {
            method: 'POST',
            credentials: 'include',
            body: 'token=' + _index2.default.accessToken,
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        };

        return fetch(url, options) // we cannot use FetchUtil.nprApiFetch() here because the success response has an empty body
        .then(function (response) {
            if (response.ok) {
                _index2.default.accessToken = '';
                return true;
            }
            return _fetchUtil2.default.formatErrorResponse(response);
        });
    };

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


    Authorization.prototype.getDeviceCode = function getDeviceCode() {
        var _this2 = this;

        var scopes = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

        if (!_index2.default.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }

        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.newDeviceCodePath;
        var options = {
            method: 'POST',
            credentials: 'include',
            body: 'scope=' + encodeURIComponent(scopes.join(' ')).replace('%20', '+'),
            headers: {
                Accept: 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        };

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            var deviceCodeModel = new _deviceCode2.default(json);
            deviceCodeModel.validate(); // throws exception if invalid
            _this2._activeDeviceCodeModel = deviceCodeModel;
            return deviceCodeModel;
        });
    };

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


    Authorization.prototype.pollDeviceCode = function pollDeviceCode() {
        _logger2.default.debug('Starting to poll device code. Will poll until user logs in or code expires'); // eslint-disable-line max-len

        if (!_index2.default.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to use the device code.');
        }
        if (!this._activeDeviceCodeModel) {
            throw new TypeError('No active device code set. Please call getDeviceCode() before calling this function.'); // eslint-disable-line max-len
        }

        return this._pollDeviceCodeOnce();
    };

    /**
     * Polls the device code once. If the result is an error of type `'authorization_pending'`, this will recurse,
     * calling itself after a delay equal to the interval specified in the original call to {@link getDeviceCode}.
     *
     * @returns {Promise<AccessToken>}
     * @private
     */


    Authorization.prototype._pollDeviceCodeOnce = function _pollDeviceCodeOnce() {
        var _this3 = this;

        _logger2.default.debug('Polling device code once');

        if (this._activeDeviceCodeModel.isExpired()) {
            return Promise.reject('The device code has expired. Please generate a new one before continuing.'); // eslint-disable-line max-len
        }

        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.pollDeviceCodePath;
        var options = {
            method: 'POST',
            credentials: 'include'
        };

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            _logger2.default.debug('Device code poll returned successfully! An access token was returned.'); // eslint-disable-line max-len

            var tokenModel = new _accessToken2.default(json);
            tokenModel.validate(); // throws exception if invalid
            _index2.default.accessToken = tokenModel.token;
            return tokenModel; // never directly consumed, but useful for testing
        }).catch(function (error) {
            if (error instanceof _apiError2.default) {
                if (error.statusCode === 401) {
                    if (error.json.type === 'authorization_pending') {
                        return delay(_this3._activeDeviceCodeModel.interval).then(_this3._pollDeviceCodeOnce.bind(_this3));
                    }
                    _logger2.default.debug('The response was a 401, but not of type "authorization_pending". The user presumably denied the app access; rejecting.'); // eslint-disable-line max-len
                } else {
                    _logger2.default.debug('Response was not a 401. The device code has probably expired; rejecting.'); // eslint-disable-line max-len
                }
            } else {
                _logger2.default.debug('An unknown type of error was received. Unsure of how to respond; rejecting.'); // eslint-disable-line max-len
            }
            return Promise.reject(error);
        });
    };

    return Authorization;
}();

exports.default = Authorization;