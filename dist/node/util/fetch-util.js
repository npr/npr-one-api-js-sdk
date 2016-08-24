'use strict';

exports.__esModule = true;

var _logger = require('./logger');

var _logger2 = _interopRequireDefault(_logger);

var _index = require('./../index');

var _index2 = _interopRequireDefault(_index);

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
 * A thin wrapper around the Fetch API which provides functionality to automatically
 * request a new access token if an existing one has expired.
 */

var FetchUtil = function () {
    function FetchUtil() {
        _classCallCheck(this, FetchUtil);
    }

    /**
     * Primary workhorse for interacting with the NPR One APIs.
     *
     * @param {string} url
     * @param {Object} [options]
     * @returns {Promise<Object>}
     */
    FetchUtil.nprApiFetch = function nprApiFetch(url) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _logger2.default.debug('Starting JSON fetch ' + url);

        if (!FetchUtil._requestUrlIsAuthorizationCall(url) && !options.headers) {
            options.headers = FetchUtil._getHeaders(); // eslint-disable-line
        }

        return fetch(url, options).then(function (response) {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401 && Boolean(_index2.default.accessToken) && !FetchUtil._requestUrlIsAuthorizationCall(url)) {
                return FetchUtil._attemptAccessTokenRefresh(url, options);
            }
            return FetchUtil.formatErrorResponse(response);
        });
    };

    /**
     * Wraps an error response from an API call in an {@link ApiError} object so that consuming code has more
     * flexibility to determine how to handle the error. To be clear: this function returns a Promise that **always**
     * rejects, but it may or may not have the deserialized JSON body based on whether `response.json()` succeeded or
     * failed (the latter is usually an indicator that the response had an empty body).
     *
     * @param {Response} response
     * @returns {Promise}
     */


    FetchUtil.formatErrorResponse = function formatErrorResponse(response) {
        return response.json().then(function (json) {
            throw new _apiError2.default(response, json);
        }, function (err) {
            // this will ONLY catch errors from the deserialization, and not from the line above this
            _logger2.default.debug('Problem deserializing JSON from API error');
            _logger2.default.debug(err);
            throw new _apiError2.default(response);
        });
    };

    /**
     * The logic to attempt an access token refresh, broken out for easier readability.
     *
     * @param {string} url
     * @param {Object} options
     * @returns {Promise<Object>}
     * @private
     */


    FetchUtil._attemptAccessTokenRefresh = function _attemptAccessTokenRefresh(url, options) {
        var _this = this;

        return _index2.default.refreshExistingAccessToken().then(function () {
            // retry the original request we were making, after a short delay
            var _options = options;
            /* istanbul ignore else */ // defensive coding
            if (options.headers) {
                _options.headers = FetchUtil._getHeaders(); // make sure we use the new access token
            }

            return delay(250).then(FetchUtil.nprApiFetch.bind(_this, url, _options));
        });
    };

    /**
     * Ensures access token is defined and generates the required Headers object for fetch
     *
     * @returns {Headers}
     * @private
     */


    FetchUtil._getHeaders = function _getHeaders() {
        if (_index2.default.accessToken === '') {
            throw new Error('An Access Token must set before making API requests.');
        }

        var headers = new Headers();
        headers.append('Authorization', 'Bearer ' + _index2.default.accessToken);
        if (_index2.default.config.advertisingId) {
            headers.append('X-Advertising-ID', '' + _index2.default.config.advertisingId);
        }
        if (_index2.default.config.advertisingTarget) {
            headers.append('X-Advertising-Target', '' + _index2.default.config.advertisingTarget);
        }
        return headers;
    };

    /**
     * Tests whether or not the call to the given URL should be considered an authorization call.
     *
     * @param {string} url
     * @returns {boolean}
     * @private
     */


    FetchUtil._requestUrlIsAuthorizationCall = function _requestUrlIsAuthorizationCall(url) {
        return _index2.default.config.authProxyBaseUrl && url.indexOf(_index2.default.config.authProxyBaseUrl) > -1 || new RegExp('/authorization/' + _index2.default.config.apiVersion).test(url);
    };

    return FetchUtil;
}();

exports.default = FetchUtil;