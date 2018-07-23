(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["NprOneSDK"] = factory();
	else
		root["NprOneSDK"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _jsLogger = __webpack_require__(22);
	
	var Logger = _interopRequireWildcard(_jsLogger);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	/* istanbul ignore next */
	Logger.useDefaults({
	    formatter: function formatter(messages, context) {
	        messages.unshift('[NPROneSDK]');
	        if (context.name) {
	            messages.unshift('[' + context.name + ']');
	        }
	    }
	});
	
	/**
	 * @typedef {JsLogger} Logger
	 */
	exports.default = Logger;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.NprOneSDK = undefined;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	__webpack_require__(11);
	
	var _action = __webpack_require__(5);
	
	var _action2 = _interopRequireDefault(_action);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _authorization = __webpack_require__(13);
	
	var _authorization2 = _interopRequireDefault(_authorization);
	
	var _listening = __webpack_require__(15);
	
	var _listening2 = _interopRequireDefault(_listening);
	
	var _identity = __webpack_require__(14);
	
	var _identity2 = _interopRequireDefault(_identity);
	
	var _stationFinder = __webpack_require__(7);
	
	var _stationFinder2 = _interopRequireDefault(_stationFinder);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	_logger2.default.setLevel(_logger2.default.WARN);
	
	/**
	 * This SDK attempts to abstract away most of the interaction with the NPR One API.
	 * In general, a consumer of this API should be primarily concerned with asking for
	 * recommendations and recording user actions against those recommendations.
	 */
	
	var NprOneSDK = exports.NprOneSDK = function () {
	    /**
	     * Instantiates the NPR One SDK.
	     */
	    function NprOneSDK() {
	        _classCallCheck(this, NprOneSDK);
	
	        /** @type {null|Function} A callback that gets triggered whenever the access token has changed
	         * @private */
	        this._accessTokenChangedCallback = null;
	        /** @type {Authorization}
	         * @private */
	        this._authorization = new _authorization2.default();
	        /** @type {Listening}
	         * @private */
	        this._listening = new _listening2.default();
	        /** @type {Identity}
	         * @private */
	        this._identity = new _identity2.default();
	        /** @type {StationFinder}
	         * @private */
	        this._stationfinder = new _stationFinder2.default();
	
	        // setup the default config
	        NprOneSDK._initConfig();
	    }
	
	    /**
	     * @typedef {Object} Config
	     * @property {string} [apiBaseUrl='https://api.npr.org'] DEPRECATED / NO LONGER IN USE: The NPR One API hostname and protocol, typically `https://api.npr.org`; in most cases, this does not need to be manually set by clients
	     * @property {string} [apiVersion='v2'] DEPRECATED / NO LONGER IN USE: The NPR One API version, typically `v2`; in most cases, this does not need to be manually set by clients
	     * @property {string} [authProxyBaseUrl] The full URL to your OAuth proxy, e.g. `https://one.example.com/oauth2/`
	     * @property {string} [newDeviceCodePath='/device'] The path to your proxy for starting a `device_code` grant (relative to `authProxyBaseUrl`)
	     * @property {string} [pollDeviceCodePath='/device/poll'] The path to your proxy for polling a `device_code` grant (relative to `authProxyBaseUrl`)
	     * @property {string} [refreshTokenPath='/refresh'] The path to your proxy for the `refresh_token` grant (relative to `authProxyBaseUrl`)
	     * @property {string} [tempUserPath='/temporary'] The path to your proxy for the `temporary_user` grant (relative to `authProxyBaseUrl`), not available to third-party clients
	     * @property {string} [logoutPath='/logout'] The path to your proxy for the `POST /authorization/v2/token/revoke` endpoint (relative to `authProxyBaseUrl`)
	     * @property {string} [accessToken] The access token to use if not using the auth proxy
	     * @property {string} [clientId] The NPR One API `client_id` to use, only required if using the auth proxy with the `temporary_user` grant type
	     * @property {string} [advertisingId] The custom X-Advertising-ID header to send with most requests, not typically used by third-party clients
	     * @property {string} [advertisingTarget] The custom X-Advertising-Target header to send with most requests, not typically used by third-party clients
	     * @property {string} [subdomain] The custom subdomain to use for requests, not typically used by third-party clients
	     */
	    /**
	     * @type {Config}
	     */
	
	
	    /* Authorization */
	
	    /**
	     * See {@link Authorization.refreshExistingAccessToken} for description.
	     *
	     * @param {number} [numRetries=0]   The number of times this function has been tried. Will retry up to 3 times.
	     * @returns {Promise<AccessToken>}
	     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
	     */
	    NprOneSDK.refreshExistingAccessToken = function refreshExistingAccessToken() {
	        var numRetries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	
	        return _authorization2.default.refreshExistingAccessToken(numRetries);
	    };
	
	    /**
	     * See {@link Authorization#logout} for description.
	     *
	     * @returns {Promise}
	     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
	     */
	
	
	    NprOneSDK.prototype.logout = function logout() {
	        return this._authorization.logout();
	    };
	
	    /**
	     * See {@link Authorization#getDeviceCode} for description.
	     *
	     * @param {Array<string>} [scopes=[]]   The scopes (as strings) that should be associated with the resulting access token
	     * @returns {Promise<DeviceCode>}
	     * @throws {TypeError} if an OAuth proxy is not configured
	     */
	
	
	    NprOneSDK.prototype.getDeviceCode = function getDeviceCode() {
	        var scopes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	
	        return this._authorization.getDeviceCode(scopes);
	    };
	
	    /**
	     * See {@link Authorization#pollDeviceCode} for description.
	     *
	     * @returns {Promise<AccessToken>}
	     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
	     */
	
	
	    NprOneSDK.prototype.pollDeviceCode = function pollDeviceCode() {
	        return this._authorization.pollDeviceCode();
	    };
	
	    /* Listening */
	
	    /**
	     * See {@link Listening#getRecommendation} for description.
	     *
	     * @param {string} [uid='']           Optional; a UID for a specific recommendation to play. In 99% of use cases, this is not needed.
	     * @param {string} [channel='npr']    Optional; a channel to pull the recommendation from; the main flow channel of `npr` is used as the default. In 99% of use cases, this does not need to be changed.
	     * @returns {Promise<Recommendation>}
	     */
	
	
	    NprOneSDK.prototype.getRecommendation = function getRecommendation() {
	        var uid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	        var channel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'npr';
	
	        return this._listening.getRecommendation(uid, channel);
	    };
	
	    /**
	     * See {@link Listening#resumeFlowFromRecommendation} for description.
	     *
	     * @param {Object} json JSON object representation of a recommendation
	     * @returns {Recommendation}
	     */
	
	
	    NprOneSDK.prototype.resumeFlowFromRecommendation = function resumeFlowFromRecommendation(json) {
	        return this._listening.resumeFlowFromRecommendation(json);
	    };
	
	    /**
	     * See {@link Listening#getUpcomingFlowRecommendations} for description.
	     *
	     * @experimental
	     * @param {string} [channel='npr']   A channel to pull the next recommendation from
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    NprOneSDK.prototype.getUpcomingFlowRecommendations = function getUpcomingFlowRecommendations() {
	        var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'npr';
	
	        return this._listening.getUpcomingFlowRecommendations(channel);
	    };
	
	    /**
	     * See {@link Listening#getRecommendationsFromChannel} for description.
	     *
	     * @param {string} [channel='recommended']   A non-flow (i.e. non-`npr`) channel to retrieve a list of recommendations from
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    NprOneSDK.prototype.getRecommendationsFromChannel = function getRecommendationsFromChannel() {
	        var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'recommended';
	
	        return this._listening.getRecommendationsFromChannel(channel);
	    };
	
	    /**
	     * See {@link Listening#queueRecommendationFromChannel} for description.
	     *
	     * @param {string} channel   The channel used in the original call to `getRecommendationsFromChannel()`
	     * @param {string} uid       The unique ID of the item to queue up for the user
	     * @returns {Recommendation}
	     * @throws {TypeError} If no valid channel or UID is passed in
	     * @throws {Error} If no recommendations for this channel were previously cached, or if the UID was not found in that cached list
	     */
	
	
	    NprOneSDK.prototype.queueRecommendationFromChannel = function queueRecommendationFromChannel(channel, uid) {
	        return this._listening.queueRecommendationFromChannel(channel, uid);
	    };
	
	    /**
	     * See {@link Listening#getHistory} for description.
	     *
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    NprOneSDK.prototype.getHistory = function getHistory() {
	        return this._listening.getHistory();
	    };
	
	    /**
	     * See {@link Listening#resetFlow} for description.
	     *
	     * @returns {Promise}
	     */
	
	
	    NprOneSDK.prototype.resetFlow = function resetFlow() {
	        return this._listening.resetFlow();
	    };
	
	    /* Identity */
	
	    /**
	     * See {@link Identity#getUser} for description.
	     *
	     * @returns {Promise<User>}
	     */
	
	
	    NprOneSDK.prototype.getUser = function getUser() {
	        return this._identity.getUser();
	    };
	
	    /**
	     * See {@link Identity#setUserStation} for description.
	     *
	     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     */
	
	
	    NprOneSDK.prototype.setUserStation = function setUserStation(stationId) {
	        return this._identity.setUserStation(stationId);
	    };
	
	    /**
	     * See {@link Identity#followShow} for description.
	     *
	     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
	     */
	
	
	    NprOneSDK.prototype.followShow = function followShow(aggregationId) {
	        return this._identity.followShow(aggregationId);
	    };
	
	    /**
	     * See {@link Identity#unfollowShow} for description.
	     *
	     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
	     */
	
	
	    NprOneSDK.prototype.unfollowShow = function unfollowShow(aggregationId) {
	        return this._identity.unfollowShow(aggregationId);
	    };
	
	    /**
	     * See {@link Identity#createTemporaryUser} for description.
	     *
	     * @returns {Promise<User>}
	     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
	     */
	
	
	    NprOneSDK.prototype.createTemporaryUser = function createTemporaryUser() {
	        return this._identity.createTemporaryUser();
	    };
	
	    /* Station Finder */
	
	    /**
	     * See {@link StationFinder#searchStations} for description.
	     *
	     * @param {null|string} [query]   An optional query, which can be a station name, network name, or zip code
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    NprOneSDK.prototype.searchStations = function searchStations() {
	        var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	        return this._stationfinder.searchStations(query);
	    };
	
	    /**
	     * See {@link StationFinder#searchStationsByLatLongCoordinates} for description.
	     *
	     * @param {number} lat    A float representing the latitude value of the geographic coordinates
	     * @param {number} long   A float representing the longitude value of the geographic coordinates
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    NprOneSDK.prototype.searchStationsByLatLongCoordinates = function searchStationsByLatLongCoordinates(lat, long) {
	        return this._stationfinder.searchStationsByLatLongCoordinates(lat, long);
	    };
	
	    /**
	     * See {@link StationFinder#searchStationsByCityAndState} for description.
	     *
	     * @param {string} city     A full city name (e.g. "New York", "San Francisco", "Phoenix")
	     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    NprOneSDK.prototype.searchStationsByCityAndState = function searchStationsByCityAndState(city, state) {
	        return this._stationfinder.searchStationsByCityAndState(city, state);
	    };
	
	    /**
	     * See {@link StationFinder#searchStationsByCity} for description.
	     *
	     * @param {string} city   A full city name (e.g. "New York", "San Francisco", "Phoenix")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    NprOneSDK.prototype.searchStationsByCity = function searchStationsByCity(city) {
	        return this._stationfinder.searchStationsByCity(city);
	    };
	
	    /**
	     * See {@link StationFinder#searchStationsByState} for description.
	     *
	     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    NprOneSDK.prototype.searchStationsByState = function searchStationsByState(state) {
	        return this._stationfinder.searchStationsByState(state);
	    };
	
	    /**
	     * See {@link StationFinder#getStationDetails} for description.
	     *
	     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<Station>}
	     */
	
	
	    NprOneSDK.prototype.getStationDetails = function getStationDetails(stationId) {
	        return this._stationfinder.getStationDetails(stationId);
	    };
	
	    /**
	     * Returns the foundational path for a given service
	     *
	     * @param {string} service
	     * @returns {string}
	     * @throws {TypeError} if the passed-in service name is missing or invalid
	     */
	
	
	    NprOneSDK.getServiceUrl = function getServiceUrl(service) {
	        switch (service) {
	            case 'authorization':
	                return 'https://' + NprOneSDK.config.subdomain + 'authorization.api.npr.org/v2';
	            case 'identity':
	                return 'https://' + NprOneSDK.config.subdomain + 'identity.api.npr.org/v2';
	            case 'listening':
	                return 'https://' + NprOneSDK.config.subdomain + 'listening.api.npr.org/v2';
	            case 'stationfinder':
	                return 'https://' + NprOneSDK.config.subdomain + 'station.api.npr.org/v3';
	            default:
	                throw new TypeError('Must specify a valid service name');
	        }
	    };
	
	    /**
	     * Initializes the config using default settings.
	     *
	     * @private
	     */
	
	
	    NprOneSDK._initConfig = function _initConfig() {
	        if (!NprOneSDK._config) {
	            NprOneSDK._config = {
	                authProxyBaseUrl: '',
	                newDeviceCodePath: '/device',
	                pollDeviceCodePath: '/device/poll',
	                refreshTokenPath: '/refresh',
	                tempUserPath: '/temporary',
	                logoutPath: '/logout',
	                accessToken: '',
	                clientId: '',
	                advertisingId: '',
	                advertisingTarget: '',
	                subdomain: ''
	            };
	        }
	    };
	
	    _createClass(NprOneSDK, null, [{
	        key: 'config',
	        get: function get() {
	            NprOneSDK._initConfig();
	            return NprOneSDK._config;
	        }
	
	        /**
	         * Updates private `_config` member attributes but does not overwrite entire `_config` object
	         *
	         * @type {Config}
	         */
	        ,
	        set: function set(value) {
	            if (value.apiBaseUrl) {
	                _logger2.default.warn('Property "apiBaseUrl" in config is deprecated ' + 'and will be removed in a future release. ' + 'Please use the "subdomain" property instead if a different API URL is needed.');
	            }
	            if (value.apiVersion) {
	                _logger2.default.warn('Property "apiVersion" in config is deprecated ' + 'and will be removed in a future release.');
	            }
	
	            NprOneSDK._initConfig();
	            Object.assign(NprOneSDK._config, value);
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'accessToken',
	        get: function get() {
	            return NprOneSDK.config.accessToken;
	        }
	
	        /** @type {string} */
	        ,
	        set: function set(token) {
	            if (typeof token !== 'string') {
	                throw new TypeError('Value for accessToken must be a string');
	            }
	
	            var oldToken = NprOneSDK.accessToken;
	            NprOneSDK.config.accessToken = token;
	
	            if (oldToken !== token && typeof NprOneSDK._accessTokenChangedCallback === 'function') {
	                NprOneSDK._accessTokenChangedCallback(token);
	            }
	        }
	
	        /**
	         * Sets a callback to be triggered whenever the SDK rotates the access token for a new one, usually when
	         * the old token expires and a `refresh_token` is used to generate a fresh token. Clients who wish to persist
	         * access tokens across sessions are urged to use this callback to be notified whenever a token change has
	         * occurred; the only other alternative is to call `get accessToken()` after every API call.
	         *
	         * @type {Function}
	         * @throws {TypeError} if the passed-in value isn't a function
	         */
	
	    }, {
	        key: 'onAccessTokenChanged',
	        set: function set(callback) {
	            if (typeof callback !== 'function') {
	                throw new TypeError('Value for onAccessTokenChanged must be a function');
	            }
	            NprOneSDK._accessTokenChangedCallback = callback;
	        }
	
	        /**
	         * Exposes the Action class for clients to record actions
	         *
	         * @type {Action}
	         */
	
	    }, {
	        key: 'Action',
	        get: function get() {
	            return _action2.default;
	        }
	
	        /**
	         * Exposes the Logger class for clients to adjust logging if desired
	         *
	         * @type {src/util/logger.js~Logger}
	         */
	
	    }, {
	        key: 'Logger',
	        get: function get() {
	            return _logger2.default;
	        }
	    }]);
	
	    return NprOneSDK;
	}();
	
	exports.default = NprOneSDK;
	
	/**
	 * @external {Response} https://developer.mozilla.org/en-US/docs/Web/API/Response
	 */
	/**
	 * @external {Headers} https://developer.mozilla.org/en-US/docs/Web/API/Headers
	 */
	/**
	 * @external {JsLogger} https://github.com/jonnyreeves/js-logger
	 */

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _index = __webpack_require__(2);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _apiError = __webpack_require__(8);
	
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
	        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
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
	        // eslint-disable-next-line max-len
	        return _index2.default.config.authProxyBaseUrl && url.indexOf(_index2.default.config.authProxyBaseUrl) > -1 || new RegExp(_index2.default.getServiceUrl('authorization')).test(url);
	    };
	
	    return FetchUtil;
	}();
	
	exports.default = FetchUtil;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * A utility class which performs validations by checking of required object properties exist.
	 */
	var Validator = function () {
	    function Validator() {
	        _classCallCheck(this, Validator);
	    }
	
	    /**
	     * Validates collection doc format
	     *
	     * @param {Object} collectionDoc
	     * @throws {TypeError} if collection doc is invalid
	     */
	    Validator.validateCollectionDoc = function validateCollectionDoc(collectionDoc) {
	        var requiredNames = ['version', 'href', 'attributes', 'items', 'links', 'errors'];
	
	        Validator._validate(collectionDoc, requiredNames);
	    };
	
	    /**
	     * Validates an access token model (obtained from the `POST /authorization/v2/token` endpoint)
	     *
	     * @param {Object} accessTokenModel
	     * @throws {TypeError} if access token model is invalid
	     */
	
	
	    Validator.validateAccessToken = function validateAccessToken(accessTokenModel) {
	        var requiredNames = ['access_token', 'token_type', 'expires_in'];
	
	        Validator._validate(accessTokenModel, requiredNames);
	    };
	
	    /**
	     * Validates a device code model (obtained from the `POST /authorization/v2/device` endpoint)
	     *
	     * @param {Object} deviceCodeModel
	     * @throws {TypeError} if device code model is invalid
	     */
	
	
	    Validator.validateDeviceCode = function validateDeviceCode(deviceCodeModel) {
	        var requiredNames = ['user_code', 'verification_uri', 'expires_in', 'interval'];
	
	        Validator._validate(deviceCodeModel, requiredNames);
	    };
	
	    /**
	     * Base validator function.
	     *
	     * @param {Object} object
	     * @param {Array<string>} requiredNames
	     * @throws {TypeError} if object is invalid
	     * @private
	     */
	
	
	    Validator._validate = function _validate(object, requiredNames) {
	        var messages = [];
	
	        for (var _iterator = requiredNames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	            var _ref;
	
	            if (_isArray) {
	                if (_i >= _iterator.length) break;
	                _ref = _iterator[_i++];
	            } else {
	                _i = _iterator.next();
	                if (_i.done) break;
	                _ref = _i.value;
	            }
	
	            var name = _ref;
	
	            if (!Validator._has(object, name)) {
	                messages.push('\'' + name + '\' is missing and is required.');
	            }
	        }
	
	        if (messages.length > 0) {
	            throw new TypeError(messages.join(', ') + ' :' + JSON.stringify(object));
	        }
	    };
	
	    /**
	     * A typesafe check to make sure the property exists within the object.
	     *
	     * @param {Object} object
	     * @param {string} key
	     * @returns {boolean}
	     * @private
	     */
	
	
	    Validator._has = function _has(object, key) {
	        /* istanbul ignore next: defensive coding, not going to worry too much about this */
	        return object ? {}.hasOwnProperty.call(object, key) : false;
	    };
	
	    return Validator;
	}();
	
	exports.default = Validator;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Actions that can be recorded for recommendations.
	 * For more detail on user rating actions, see our narrative [Listening Service documentation](https://dev.npr.org/guide/services/listening/#Ratings)
	 */
	var Action = function () {
	    function Action() {
	        _classCallCheck(this, Action);
	    }
	
	    /**
	     * Actions which indicate the recommendation is no longer being presented to the user
	     *
	     * @returns {Array<string>}
	     */
	    Action.getEndActions = function getEndActions() {
	        return [Action.COMPLETED, Action.SKIP, Action.TIMEOUT, Action.SRCHCOMPL];
	    };
	
	    /**
	     * Actions which should result in the flow advancing
	     *
	     * @returns {Array<string>}
	     */
	
	
	    Action.getFlowAdvancingActions = function getFlowAdvancingActions() {
	        return [Action.START, Action.TAPTHRU, Action.TIMEOUT];
	    };
	
	    /**
	     * Returns whether a given action is valid or not
	     *
	     * @param {string} action
	     * @returns {boolean}
	     */
	
	
	    Action.isValidAction = function isValidAction(action) {
	        return {}.hasOwnProperty.call(Action, action);
	    };
	
	    _createClass(Action, null, [{
	        key: 'COMPLETED',
	
	        /** @type {string} */
	        get: function get() {
	            return 'COMPLETED';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'PASS',
	        get: function get() {
	            return 'PASS';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'SHARE',
	        get: function get() {
	            return 'SHARE';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'SKIP',
	        get: function get() {
	            return 'SKIP';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'SRCHCOMPL',
	        get: function get() {
	            return 'SRCHCOMPL';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'SRCHSTART',
	        get: function get() {
	            return 'SRCHSTART';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'START',
	        get: function get() {
	            return 'START';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'THUMBUP',
	        get: function get() {
	            return 'THUMBUP';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'TIMEOUT',
	        get: function get() {
	            return 'TIMEOUT';
	        }
	
	        /** @type {string} */
	
	    }, {
	        key: 'TAPTHRU',
	        get: function get() {
	            return 'TAPTHRU';
	        }
	    }]);
	
	    return Action;
	}();
	
	exports.default = Action;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _validator = __webpack_require__(4);
	
	var _validator2 = _interopRequireDefault(_validator);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * A base model for any resources following our Collection Doc schema
	 * @see http://cdoc.io
	 */
	var CollectionDoc = function () {
	  /**
	   * @param {CollectionDocJSON} json     The decoded JSON object that should be used as the basis for this model
	   */
	  function CollectionDoc(json) {
	    _classCallCheck(this, CollectionDoc);
	
	    /** @type {Object}
	     * @protected */
	    this._raw = json;
	  }
	
	  /**
	   * Ensure that the given Collection Doc is valid
	   *
	   * @throws {TypeError} if collection doc is invalid
	   * @protected
	   */
	
	
	  CollectionDoc.prototype._validate = function _validate() {
	    _validator2.default.validateCollectionDoc(this._raw);
	  };
	
	  /**
	   * Exposed for legacy reasons. Prefer model accessor methods were possible.
	   *
	   * @type {CollectionDocJSON}
	   */
	
	
	  _createClass(CollectionDoc, [{
	    key: 'collectionDoc',
	    get: function get() {
	      return this._raw;
	    }
	
	    /**
	     * @typedef {Object} CollectionDocJSON
	     * @property {string} version The version of the Collection.Doc+JSON Hypermedia Type Specification being used by this document
	     * @property {string} href A unique identifier of the resource representation in the form of a Uniform Resource Identifier (URI)
	     * @property {Object} attributes A set of metadata attributes that represent the "state" of the resource in the form of key-value pairs; may be an empty object
	     * @property {Array} items A list of items associated with this document; may be an empty array
	     * @property {Object} links A map of resources that expose controls and communicate relationships with other documents; the keys describe the relationship to the current document, while the values are arrays of links
	     * @property {Array} errors A list of errors encountered in the process of creating and/or retrieving this document, intended to facilitate reliable debugging of client/server interactions
	     */
	    /**
	     * @typedef {Object} Link
	     * @property {string} [content-type] The MIME-type of the resource
	     * @property {string} href The URI that represents the resource
	     */
	
	  }]);
	
	  return CollectionDoc;
	}();
	
	exports.default = CollectionDoc;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _index = __webpack_require__(2);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _fetchUtil = __webpack_require__(3);
	
	var _fetchUtil2 = _interopRequireDefault(_fetchUtil);
	
	var _station = __webpack_require__(18);
	
	var _station2 = _interopRequireDefault(_station);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Encapsulates all of the logic for communication with the [Station Finder Service](https://dev.npr.org/api/#/stationfinder)
	 * in the NPR One API.
	 *
	 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
	 * functions in the main {@link NprOneSDK} class.
	 *
	 * @example <caption>How to change a user's station using station search</caption>
	 * const nprOneSDK = new NprOneSDK();
	 * nprOneSDK.config = { ... };
	 * nprOneSDK.getUser() // optional; verifies that you have a logged-in user
	 *     .then(() => {
	 *         return nprOneSDK.searchStations('wnyc');
	 *     })
	 *     .then((stations) => {
	 *         const stationId = stations[0].id; // in reality, you'd probably have the user select a station from returned search results
	 *         nprOneSDK.setUserStation(stationId);
	 *     });
	 */
	var StationFinder = function () {
	    function StationFinder() {
	        _classCallCheck(this, StationFinder);
	    }
	
	    /**
	     * Performs a general search of all NPR One stations, using an optional query. If passed in, the query can be any
	     * string, such as an address or keyword, but the recommended usage is to search for station names, network names
	     * (e.g. "Colorado Public Radio" is a network of stations throughout Colorado), or zip codes.
	     *
	     * If no query is passed in, this function will return a list of one or more stations geographically closest to the
	     * client based on the consumer's IP address. If you are running this in a server-side environment where the IP
	     * address of the server is not necessarily the same as the IP address (and, by extension, the geographic location)
	     * of the end-user, you can use {@link searchStationsByLatLongCoordinates} instead to retrieve a list of stations
	     * geographically closest to the end-user.
	     *
	     * @param {null|string} [query]   An optional query, which can be a station name, network name, or zip code
	     * @returns {Promise<Array<Station>>}
	     */
	    StationFinder.prototype.searchStations = function searchStations() {
	        var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	
	        return this._performStationSearch(query);
	    };
	
	    /**
	     * Performs a geographic search of all NPR One stations using a passed-in pair of lat-long coordinates. In most
	     * cases, this means you will need to first use the [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
	     * or a similar library in order to obtain the lat-long coordinates for the end-user's location.
	     *
	     * Note that {@link searchStations} without a query will already produce a list of stations closest to the user _if_
	     * this code is being run in a client-side environment and/or the IP address of the device making the calls to this
	     * SDK has the same geographic location as the end-user. For that reason, `searchStationsByLatLongCoordinates()`
	     * is really only needed if this SDK is being run in a server-side environment.
	     *
	     * @param {number} lat    A float representing the latitude value of the geographic coordinates
	     * @param {number} long   A float representing the longitude value of the geographic coordinates
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    StationFinder.prototype.searchStationsByLatLongCoordinates = function searchStationsByLatLongCoordinates(lat, long) {
	        return this._performStationSearch(null, lat, long);
	    };
	
	    /**
	     * Performs a geographic search of all NPR One stations using a city name and state. While you _can_ pass in a city
	     * _or_ state to {@link searchStations} as the query, `searchStationsByCityAndState()` will return more accurate
	     * results and is the recommended function for clients wanting to offer a location search.
	     *
	     * @param {string} city     A full city name (e.g. "New York", "San Francisco", "Phoenix")
	     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    StationFinder.prototype.searchStationsByCityAndState = function searchStationsByCityAndState(city, state) {
	        return this._performStationSearch(null, null, null, city, state);
	    };
	
	    /**
	     * Performs a geographic search of all NPR One stations using a city name only. It is generally recommended that you
	     * use {@link searchStationsByCityAndState} instead, as it will return more accurate results and is the recommended
	     * function for clients wanting to offer a location search.
	     *
	     * @param {string} city   A full city name (e.g. "New York", "San Francisco", "Phoenix")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    StationFinder.prototype.searchStationsByCity = function searchStationsByCity(city) {
	        return this._performStationSearch(null, null, null, city);
	    };
	
	    /**
	     * Performs a geographic search of all NPR One stations using a state name or abbreviation only. It is generally
	     * recommended that you use {@link searchStationsByCityAndState} instead, as it will return more accurate results
	     * and is the recommended function for clients wanting to offer a location search.
	     *
	     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
	     * @returns {Promise<Array<Station>>}
	     */
	
	
	    StationFinder.prototype.searchStationsByState = function searchStationsByState(state) {
	        return this._performStationSearch(null, null, null, null, state);
	    };
	
	    /**
	     * Returns a {@link Station} model for the station with the given ID.
	     *
	     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<Station>}
	     */
	
	
	    StationFinder.prototype.getStationDetails = function getStationDetails(stationId) {
	        return StationFinder.validateStation(stationId);
	    };
	
	    /**
	     * Ensures a station ID is associated with a valid NPR station. While this technically returns the raw JSON for
	     * this station if it exists, these results are not meant to be consumed directly; if you need the station details to display to your end-user,
	     * use {@link getStationDetails} instead.
	     *
	     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<Station>}
	     */
	
	
	    StationFinder.validateStation = function validateStation(stationId) {
	        var n = parseInt(stationId, 10);
	        if (isNaN(n) || !isFinite(n)) {
	            return Promise.reject(new Error('Station ID must be an integer greater than 0'));
	        }
	
	        var url = _index2.default.getServiceUrl('stationfinder') + '/stations/' + stationId;
	
	        return _fetchUtil2.default.nprApiFetch(url).then(function (searchResult) {
	            var station = new _station2.default(searchResult);
	            if (!station.isNprOneEligible) {
	                throw new Error('The station ' + station.id + ' is not eligible for NPR One.');
	            }
	            return station;
	        });
	    };
	
	    /**
	     * A private helper function that performs the actual station search.
	     *
	     * @param {null|string} query     An optional query, which can be a station name, network name, or zip code
	     * @param {null|number} [lat]     A float representing the latitude value of the geographic coordinates
	     * @param {null|number} [long]    A float representing the longitude value of the geographic coordinates
	     * @param {null|string} [city]    A full city name (e.g. "New York", "San Francisco", "Phoenix")
	     * @param {null|string} [state]   A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
	     * @returns {Promise<Array<Station>>}
	     * @private
	     */
	
	
	    StationFinder.prototype._performStationSearch = function _performStationSearch(query) {
	        var lat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	        var long = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	        var city = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	        var state = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	
	        var url = _index2.default.getServiceUrl('stationfinder') + '/stations';
	
	        var queryString = '';
	        if (query) {
	            if (typeof query !== 'string') {
	                throw new TypeError('Station search query must be a string');
	            }
	            queryString = 'q=' + query;
	        } else if (lat || long) {
	            if (typeof lat !== 'number' || typeof long !== 'number') {
	                throw new TypeError('Latitude and longitude must both be valid numbers (floats)');
	            }
	            queryString = 'lat=' + lat + '&lon=' + long;
	        } else {
	            if (city) {
	                if (typeof city !== 'string') {
	                    throw new TypeError('Station search city name must be a string');
	                }
	                queryString += 'city=' + city;
	            }
	            if (state) {
	                if (typeof state !== 'string') {
	                    throw new TypeError('Station search state name must be a string');
	                }
	                queryString += 'state=' + state;
	            }
	        }
	
	        return _fetchUtil2.default.nprApiFetch(queryString ? url + '?' + queryString : url).then(function (searchResults) {
	            var stations = [];
	
	            if (searchResults && searchResults.items && searchResults.items.length) {
	                for (var _iterator = searchResults.items, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	                    var _ref;
	
	                    if (_isArray) {
	                        if (_i >= _iterator.length) break;
	                        _ref = _iterator[_i++];
	                    } else {
	                        _i = _iterator.next();
	                        if (_i.done) break;
	                        _ref = _i.value;
	                    }
	
	                    var searchResult = _ref;
	
	                    var station = new _station2.default(searchResult);
	                    if (station.isNprOneEligible) {
	                        stations.push(station);
	                    }
	                }
	            }
	
	            return stations;
	        });
	    };
	
	    return StationFinder;
	}();
	
	exports.default = StationFinder;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _es6Error = __webpack_require__(21);
	
	var _es6Error2 = _interopRequireDefault(_es6Error);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	/**
	 * A custom error class to encapsulate errors thrown by {@link FetchUtil.nprApiFetch}. Behaves like a generic JavaScript
	 * error, but has additional metadata attached to it in case consuming code needs to be able to respond to specific
	 * kinds of errors.
	 *
	 * @example
	 * nprOneSDK.setUserStation(123)
	 *     .catch((error) => {
	 *         if (error instanceof ApiError) {
	 *             if (error.statusCode === 401) {
	 *                 Logger.debug('The response was a 401!');
	 *             } else {
	 *                 Logger.debug('The response was not a 401!');
	 *             }
	 *         }
	 *     });
	 *
	 * @extends {Error}
	 */
	var ApiError = function (_ExtendableError) {
	  _inherits(ApiError, _ExtendableError);
	
	  /**
	   * Creates a new, custom error using the [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
	   * object as its basis.
	   *
	   * @param {Response} response    The actual raw [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) from the failed API call
	   * @param {Object} [json={}]     If available, the decoded JSON from the error response
	   */
	  function ApiError(response) {
	    var json = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	
	    _classCallCheck(this, ApiError);
	
	    /**
	     * The status code of the response (e.g., `400` for a bad request).
	     *
	     * @type {number}
	     */
	    var _this = _possibleConstructorReturn(this, _ExtendableError.call(this, 'Response status: ' + response.status + ' ' + response.statusText));
	
	    _this.statusCode = response.status;
	    /**
	     * The status message corresponding to the status code (e.g., `Bad Request` for 400).
	     *
	     * @type {string}
	     */
	    _this.statusText = response.statusText;
	    /**
	     * The headers associated with the response.
	     *
	     * @type {Headers}
	     */
	    _this.headers = response.headers;
	    /**
	     * Contains the type of the response (e.g., basic, cors).
	     *
	     * @type {string}
	     */
	    _this.responseType = response.type;
	    /**
	     * Contains the URL of the response.
	     *
	     * @type {string}
	     */
	    _this.responseUrl = response.url;
	    /**
	     * Contains the decoded JSON of the response, if any.
	     *
	     * @type {Object}
	     */
	    _this.json = json;
	    return _this;
	  }
	
	  return ApiError;
	}(_es6Error2.default);
	
	exports.default = ApiError;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _validator = __webpack_require__(4);
	
	var _validator2 = _interopRequireDefault(_validator);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * A thin wrapper around the raw JSON returned from the authorization server to represent an access token
	 */
	var AccessToken = function () {
	    /**
	     * @param {Object} json    The decoded JSON object that should be used as the basis for this model
	     */
	    function AccessToken(json) {
	        _classCallCheck(this, AccessToken);
	
	        this._raw = json;
	
	        this._expiryDate = null;
	        if (!isNaN(this._raw.expires_in)) {
	            this._expiryDate = new Date(Date.now() + this.ttl);
	        }
	    }
	
	    /**
	     * Ensure that the given access token model is valid
	     *
	     * @throws {TypeError} if access token model is invalid
	     */
	
	
	    AccessToken.prototype.validate = function validate() {
	        _validator2.default.validateAccessToken(this._raw);
	    };
	
	    /**
	     * Returns whether or not this access token has expired.
	     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
	     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
	     *
	     * @returns {boolean}
	     */
	
	
	    AccessToken.prototype.isExpired = function isExpired() {
	        return this._expiryDate !== null && new Date() >= this._expiryDate;
	    };
	
	    /**
	     * Returns the access token itself (40-character alphanumeric string)
	     *
	     * @type {string}
	     */
	
	
	    /**
	     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	     * In this case, we return only the `access_token` itself, since the rest of the object is typically not useful.
	     *
	     * @returns {string}
	     */
	    AccessToken.prototype.toString = function toString() {
	        return this._raw.access_token;
	    };
	
	    _createClass(AccessToken, [{
	        key: 'token',
	        get: function get() {
	            return this._raw.access_token;
	        }
	
	        /**
	         * Returns the TTL (in milliseconds) until this access token expires. If you are using an auth proxy and have
	         * correctly configured the `refreshTokenUrl`, this SDK will automatically refresh expired access tokens for you,
	         * so consumers typically do not need to worry about whether or not a token is expired or about to expire.
	         *
	         * @type {number}
	         */
	
	    }, {
	        key: 'ttl',
	        get: function get() {
	            return this._raw.expires_in * 1000;
	        }
	    }]);
	
	    return AccessToken;
	}();
	
	exports.default = AccessToken;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Container class for all metadata pertaining to an action that a user has taken against a recommendation.
	 */
	var Rating = function () {
	    /**
	     * @param {Object} json The decoded JSON object that should be used as the basis for this model
	     * @param {string} json.mediaId The media id as given by the media object
	     * @param {string} json.origin How the recommendation was generated
	     * @param {string} json.rating String representing the rating (action)
	     * @param {number} json.elapsed Number of seconds since the start of playback for this media item, as an integer
	     * @param {number} json.duration Number of seconds this audio piece is expected to last
	     * @param {string} json.timestamp ISO-8601 formatted date/time; typically replaced by the client with the actual rating time
	     * @param {string} json.channel The channel this media item was pulled from
	     * @param {string} json.cohort The primary cohort of the current logged-in user
	     * @param {Array} json.affiliations An array of IDs & other data about collections or podcasts the user has ratings for; produced by the server and should be sent back as received; used for tracking program and podcast suggestions
	     */
	    function Rating(json) {
	        _classCallCheck(this, Rating);
	
	        Object.assign(this, json);
	        this._hasSent = false;
	        this._recommendationUrl = '';
	        this._actionUrl = '';
	    }
	
	    /**
	     * Only send the fields back that NPR has sent us
	     *
	     * @param {string} key
	     * @param {boolean|string|number|Array|Object|Function} value
	     * @returns {undefined|boolean|string|number|Array|Object|Function}
	     */
	
	
	    Rating.privateMemberReplacer = function privateMemberReplacer(key, value) {
	        if (['_hasSent', '_recommendationUrl', '_actionUrl'].indexOf(key) >= 0) {
	            return undefined;
	        }
	        return value;
	    };
	
	    /**
	     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	     *
	     * @returns {string}
	     */
	
	
	    Rating.prototype.toString = function toString() {
	        return '[RID=' + this.mediaId + ', R=' + this.rating + ']';
	    };
	
	    return Rating;
	}();
	
	exports.default = Rating;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// the whatwg-fetch polyfill installs the fetch() function
	// on the global object (window or self)
	//
	// Return that as the export for use in Webpack, Browserify etc.
	__webpack_require__(26);
	module.exports = self.fetch.bind(self);


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var required = __webpack_require__(24)
	  , lolcation = __webpack_require__(25)
	  , qs = __webpack_require__(23)
	  , relativere = /^\/(?!\/)/;
	
	/**
	 * These are the parse instructions for the URL parsers, it informs the parser
	 * about:
	 *
	 * 0. The char it Needs to parse, if it's a string it should be done using
	 *    indexOf, RegExp using exec and NaN means set as current value.
	 * 1. The property we should set when parsing this value.
	 * 2. Indication if it's backwards or forward parsing, when set as number it's
	 *    the value of extra chars that should be split off.
	 * 3. Inherit from location if non existing in the parser.
	 * 4. `toLowerCase` the resulting value.
	 */
	var instructions = [
	  ['#', 'hash'],                        // Extract from the back.
	  ['?', 'query'],                       // Extract from the back.
	  ['//', 'protocol', 2, 1, 1],          // Extract from the front.
	  ['/', 'pathname'],                    // Extract from the back.
	  ['@', 'auth', 1],                     // Extract from the front.
	  [NaN, 'host', undefined, 1, 1],       // Set left over value.
	  [/\:(\d+)$/, 'port'],                 // RegExp the back.
	  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
	];
	
	/**
	 * The actual URL instance. Instead of returning an object we've opted-in to
	 * create an actual constructor as it's much more memory efficient and
	 * faster and it pleases my CDO.
	 *
	 * @constructor
	 * @param {String} address URL we want to parse.
	 * @param {Boolean|function} parser Parser for the query string.
	 * @param {Object} location Location defaults for relative paths.
	 * @api public
	 */
	function URL(address, location, parser) {
	  if (!(this instanceof URL)) {
	    return new URL(address, location, parser);
	  }
	
	  var relative = relativere.test(address)
	    , parse, instruction, index, key
	    , type = typeof location
	    , url = this
	    , i = 0;
	
	  //
	  // The following if statements allows this module two have compatibility with
	  // 2 different API:
	  //
	  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
	  //    where the boolean indicates that the query string should also be parsed.
	  //
	  // 2. The `URL` interface of the browser which accepts a URL, object as
	  //    arguments. The supplied object will be used as default values / fall-back
	  //    for relative paths.
	  //
	  if ('object' !== type && 'string' !== type) {
	    parser = location;
	    location = null;
	  }
	
	  if (parser && 'function' !== typeof parser) {
	    parser = qs.parse;
	  }
	
	  location = lolcation(location);
	
	  for (; i < instructions.length; i++) {
	    instruction = instructions[i];
	    parse = instruction[0];
	    key = instruction[1];
	
	    if (parse !== parse) {
	      url[key] = address;
	    } else if ('string' === typeof parse) {
	      if (~(index = address.indexOf(parse))) {
	        if ('number' === typeof instruction[2]) {
	          url[key] = address.slice(0, index);
	          address = address.slice(index + instruction[2]);
	        } else {
	          url[key] = address.slice(index);
	          address = address.slice(0, index);
	        }
	      }
	    } else if (index = parse.exec(address)) {
	      url[key] = index[1];
	      address = address.slice(0, address.length - index[0].length);
	    }
	
	    url[key] = url[key] || (instruction[3] || ('port' === key && relative) ? location[key] || '' : '');
	
	    //
	    // Hostname, host and protocol should be lowercased so they can be used to
	    // create a proper `origin`.
	    //
	    if (instruction[4]) {
	      url[key] = url[key].toLowerCase();
	    }
	  }
	
	  //
	  // Also parse the supplied query string in to an object. If we're supplied
	  // with a custom parser as function use that instead of the default build-in
	  // parser.
	  //
	  if (parser) url.query = parser(url.query);
	
	  //
	  // We should not add port numbers if they are already the default port number
	  // for a given protocol. As the host also contains the port number we're going
	  // override it with the hostname which contains no port number.
	  //
	  if (!required(url.port, url.protocol)) {
	    url.host = url.hostname;
	    url.port = '';
	  }
	
	  //
	  // Parse down the `auth` for the username and password.
	  //
	  url.username = url.password = '';
	  if (url.auth) {
	    instruction = url.auth.split(':');
	    url.username = instruction[0] || '';
	    url.password = instruction[1] || '';
	  }
	
	  //
	  // The href is just the compiled result.
	  //
	  url.href = url.toString();
	}
	
	/**
	 * This is convenience method for changing properties in the URL instance to
	 * insure that they all propagate correctly.
	 *
	 * @param {String} prop Property we need to adjust.
	 * @param {Mixed} value The newly assigned value.
	 * @returns {URL}
	 * @api public
	 */
	URL.prototype.set = function set(part, value, fn) {
	  var url = this;
	
	  if ('query' === part) {
	    if ('string' === typeof value && value.length) {
	      value = (fn || qs.parse)(value);
	    }
	
	    url[part] = value;
	  } else if ('port' === part) {
	    url[part] = value;
	
	    if (!required(value, url.protocol)) {
	      url.host = url.hostname;
	      url[part] = '';
	    } else if (value) {
	      url.host = url.hostname +':'+ value;
	    }
	  } else if ('hostname' === part) {
	    url[part] = value;
	
	    if (url.port) value += ':'+ url.port;
	    url.host = value;
	  } else if ('host' === part) {
	    url[part] = value;
	
	    if (/\:\d+/.test(value)) {
	      value = value.split(':');
	      url.hostname = value[0];
	      url.port = value[1];
	    }
	  } else {
	    url[part] = value;
	  }
	
	  url.href = url.toString();
	  return url;
	};
	
	/**
	 * Transform the properties back in to a valid and full URL string.
	 *
	 * @param {Function} stringify Optional query stringify function.
	 * @returns {String}
	 * @api public
	 */
	URL.prototype.toString = function toString(stringify) {
	  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;
	
	  var query
	    , url = this
	    , result = url.protocol +'//';
	
	  if (url.username) {
	    result += url.username;
	    if (url.password) result += ':'+ url.password;
	    result += '@';
	  }
	
	  result += url.hostname;
	  if (url.port) result += ':'+ url.port;
	
	  result += url.pathname;
	
	  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
	  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;
	
	  if (url.hash) result += url.hash;
	
	  return result;
	};
	
	//
	// Expose the URL parser and some additional properties that might be useful for
	// others.
	//
	URL.qs = qs;
	URL.location = lolcation;
	module.exports = URL;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _index = __webpack_require__(2);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _accessToken = __webpack_require__(9);
	
	var _accessToken2 = _interopRequireDefault(_accessToken);
	
	var _deviceCode = __webpack_require__(16);
	
	var _deviceCode2 = _interopRequireDefault(_deviceCode);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _fetchUtil = __webpack_require__(3);
	
	var _fetchUtil2 = _interopRequireDefault(_fetchUtil);
	
	var _apiError = __webpack_require__(8);
	
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
	 * Encapsulates all of the logic for communication with the [Authorization Service](https://dev.npr.org/api/#/authorization)
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
	
	        var numRetries = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	
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
	     * @see https://dev.npr.org/guide/services/authorization/#device_code
	     *
	     * @param {Array<string>} [scopes=[]]   The scopes (as strings) that should be associated with the resulting access token
	     * @returns {Promise<DeviceCode>}
	     * @throws {TypeError} if an OAuth proxy is not configured
	     */
	
	
	    Authorization.prototype.getDeviceCode = function getDeviceCode() {
	        var _this2 = this;
	
	        var scopes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
	
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
	     * @see https://dev.npr.org/guide/services/authorization/#device_code
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

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _index = __webpack_require__(2);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _fetchUtil = __webpack_require__(3);
	
	var _fetchUtil2 = _interopRequireDefault(_fetchUtil);
	
	var _user = __webpack_require__(19);
	
	var _user2 = _interopRequireDefault(_user);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _accessToken = __webpack_require__(9);
	
	var _accessToken2 = _interopRequireDefault(_accessToken);
	
	var _stationFinder = __webpack_require__(7);
	
	var _stationFinder2 = _interopRequireDefault(_stationFinder);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Encapsulates all of the logic for communication with the [Identity Service](https://dev.npr.org/api/#/identity)
	 * in the NPR One API.
	 *
	 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
	 * functions in the main {@link NprOneSDK} class.
	 *
	 * @example <caption>How to change a user's station using station search</caption>
	 * const nprOneSDK = new NprOneSDK();
	 * nprOneSDK.config = { ... };
	 * nprOneSDK.getUser() // optional; verifies that you have a logged-in user
	 *     .then(() => {
	 *        return nprOneSDK.searchStations('wnyc');
	 *     })
	 *     .then((stations) => {
	 *         const stationId = stations[0].id; // in reality, you'd probably have the user select a station, see the StationFinder for detail
	 *         nprOneSDK.setUserStation(stationId);
	 *     });
	 */
	var Identity = function () {
	    function Identity() {
	        _classCallCheck(this, Identity);
	    }
	
	    /**
	     * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
	     * station.
	     *
	     * @returns {Promise<User>}
	     */
	    Identity.prototype.getUser = function getUser() {
	        var url = _index2.default.getServiceUrl('identity') + '/user';
	
	        return _fetchUtil2.default.nprApiFetch(url).then(function (json) {
	            return new _user2.default(json);
	        });
	    };
	
	    /**
	     * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
	     * ID actually exists, and will return a promise that rejects if not.
	     *
	     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     */
	
	
	    Identity.prototype.setUserStation = function setUserStation(stationId) {
	        return _stationFinder2.default.validateStation(stationId).then(function () {
	            var url = _index2.default.getServiceUrl('identity') + '/stations';
	            var options = {
	                method: 'PUT',
	                body: JSON.stringify([stationId])
	            };
	            return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
	                return new _user2.default(json);
	            });
	        }).catch(function (e) {
	            _logger2.default.debug('setUserStation failed, message: ', e);
	            return Promise.reject(e);
	        });
	    };
	
	    /**
	     * Indicates that the user wishes to follow, or subscribe to, the show, program, or podcast with the given numeric
	     * ID. Followed shows will appear more frequently in a user's list of recommendations.
	     *
	     * Note that at this time, because we have not yet implemented search in this SDK, there is no way to retrieve a list
	     * of aggregation (show) IDs through this SDK. You can either add functionality to your own app that makes an API call
	     * to `GET https://api.npr.org/listening/v2/search/recommendations` with a program name or other search parameters, or
	     * wait until we implement search in this SDK (hopefully later this year).
	     *
	     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
	     */
	
	
	    Identity.prototype.followShow = function followShow(aggregationId) {
	        return this._setFollowingStatusForShow(aggregationId, true);
	    };
	
	    /**
	     * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
	     * numeric ID. See {@link followShow} for more information.
	     *
	     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @returns {Promise<User>}
	     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
	     */
	
	
	    Identity.prototype.unfollowShow = function unfollowShow(aggregationId) {
	        return this._setFollowingStatusForShow(aggregationId, false);
	    };
	
	    /**
	     * Primary workhorse for {@link followShow} and {@link unfollowShow}.
	     *
	     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
	     * @param {boolean} shouldFollow           Whether or not the aggregation should be followed (`true`) or unfollowed (`false`)
	     * @returns {Promise<User>}
	     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
	     * @private
	     */
	
	
	    Identity.prototype._setFollowingStatusForShow = function _setFollowingStatusForShow(aggregationId, shouldFollow) {
	        var n = parseInt(aggregationId, 10);
	        if (isNaN(n) || !isFinite(n)) {
	            throw new TypeError('Aggregation (show) ID must be an integer greater than 0');
	        }
	
	        var data = {
	            id: aggregationId,
	            following: shouldFollow
	        };
	
	        var url = _index2.default.getServiceUrl('identity') + '/following';
	        var options = {
	            method: 'POST',
	            body: JSON.stringify(data)
	        };
	
	        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
	            return new _user2.default(json);
	        });
	    };
	
	    /**
	     * Creates a temporary user from the NPR One API and use that user's access token for
	     * subsequent API requests.
	     *
	     * Caution: most clients are not authorized to use temporary users.
	     *
	     * @returns {Promise<User>}
	     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
	     */
	
	
	    Identity.prototype.createTemporaryUser = function createTemporaryUser() {
	        if (!_index2.default.config.authProxyBaseUrl) {
	            throw new TypeError('OAuth proxy not configured. Unable to create temporary users.');
	        }
	        if (!_index2.default.config.clientId) {
	            throw new TypeError('A client ID must be set for temporary user requests.');
	        }
	
	        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.tempUserPath;
	        var glueCharacter = url.indexOf('?') >= 0 ? '&' : '?';
	        url = '' + url + glueCharacter + 'clientId=' + _index2.default.config.clientId;
	
	        var options = {
	            credentials: 'include'
	        };
	
	        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
	            var tokenModel = new _accessToken2.default(json);
	            tokenModel.validate(); // throws exception if invalid
	            _index2.default.accessToken = tokenModel.token;
	            return tokenModel; // never directly consumed, but useful for testing
	        });
	    };
	
	    return Identity;
	}();
	
	exports.default = Identity;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _index = __webpack_require__(2);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _recommendationCreator = __webpack_require__(20);
	
	var _recommendationCreator2 = _interopRequireDefault(_recommendationCreator);
	
	var _action = __webpack_require__(5);
	
	var _action2 = _interopRequireDefault(_action);
	
	var _rating2 = __webpack_require__(10);
	
	var _rating3 = _interopRequireDefault(_rating2);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	var _fetchUtil = __webpack_require__(3);
	
	var _fetchUtil2 = _interopRequireDefault(_fetchUtil);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * Encapsulates all of the logic for communication with the [Listening Service](https://dev.npr.org/api/#/listening)
	 * in the NPR One API.
	 *
	 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
	 * functions in the main {@link NprOneSDK} class.
	 *
	 * @example <caption>Implementing a rudimentary 'Explore' view</caption>
	 * const nprOneSDK = new NprOneSDK();
	 * nprOneSDK.config = { ... };
	 * nprOneSDK.getRecommendationsFromChannel('recommended')
	 *     .then((recommendations) => {
	 *         // in a real app, the user would select a piece; here we've simulated them selecting one at index 3
	 *         const selectedRecommendationId = recommendations[3].attributes.uid;
	 *         return nprOneSDK.queueRecommendationFromChannel('recommended', selectedRecommendationId);
	 *      })
	 *     .then(() => {
	 *         nprOneSDK.getRecommendation(); // proceed to play the recommendation
	 *     });
	 */
	var Listening = function () {
	    /**
	     * Initializes the controller class with private variables needed later on.
	     */
	    function Listening() {
	        var _this = this;
	
	        _classCallCheck(this, Listening);
	
	        /** @type {Rating[]} Ratings which are queued to be sent to NPR
	         * @private */
	        this._queuedRatings = [];
	        /** @type {Rating[]} Ratings which have already been sent, for debugging purposes
	         * @private */
	        this._sentRatings = [];
	        /** @type {Array<Recommendation>} Unrated recommendations which represent the latest
	         *  recommendations from the API, relies heavily upon numeric key/index
	         * @private */
	        this._flowRecommendations = [];
	        /** @type {boolean} Flow fetches need to be synchronous
	         * @private */
	        this._flowFetchActive = false;
	        /** @type {Promise<Recommendation>}
	         * @private */
	        this._flowPromise = null;
	        /** @type {boolean} Whether ads are blocked by the browser.
	         * @private */
	        this._adsBlocked = false;
	        /** @type {Object} Cached recommendations from channels other than the main flow channel of 'npr'.
	         * A key-value store where the key is the name of the channel and the value is an array of recommendations.
	         * @private */
	        this._channelRecommendations = {};
	
	        // Ad-blocker detection, used when/if we encounter sponsorship in the flow
	        fetch('https://adswizz.com', { mode: 'no-cors' }).catch(function () {
	            fetch('https://delivery-s3.adswizz.com', { mode: 'no-cors' }).catch(function (e) {
	                _logger2.default.debug('Ads are blocked. ', e);
	                _this._adsBlocked = true;
	            });
	        });
	    }
	
	    /**
	     * Get a recommendation from NPR.
	     *
	     * Caution: the resulting recommendation may have been returned previously and must be checked
	     * to ensure the same recommendation is not played twice.
	     *
	     * @param {string} [uid='']           Optional; a UID for a specific recommendation to play. In 99% of use cases, this is not needed.
	     * @param {string} [channel='npr']    Optional; a channel to pull the recommendation from; the main flow channel of `npr` is used as the default. In 99% of use cases, this does not need to be changed.
	     * @returns {Promise<Recommendation>}
	     */
	
	
	    Listening.prototype.getRecommendation = function getRecommendation() {
	        var uid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	        var channel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'npr';
	
	        this._flowPromise = this._advanceFlowRecommendations(channel, uid);
	
	        return this._flowPromise;
	    };
	
	    /**
	     * Return possible recommendations that may come next in the flow. Useful for
	     * pre-caching audio and displaying upcoming recommendations.
	     *
	     * Recommendations returned are not guaranteed to always come next in the flow.
	     *
	     * @experimental
	     * @param {string} [channel='npr']   A channel to pull the next recommendation from
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    Listening.prototype.getUpcomingFlowRecommendations = function getUpcomingFlowRecommendations() {
	        var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'npr';
	
	        if (this._flowRecommendations.length > 0) {
	            return Promise.resolve(this._flowRecommendations);
	        }
	
	        return this._getChannelRecommendations(channel);
	    };
	
	    /**
	     * Makes a new API call to get a list of recommendations. This is NOT intended for regular piece-by-piece consumption;
	     * this function is designed to be used for consumers implementing e.g. the Explore view from the NPR One apps,
	     * where the client displays a list or grid of content, and the user can select a piece to listen to next.
	     * It is hard-coded to use the "recommended" channel by default, although other channels can be used also. That said,
	     * you should really never use this with channel "npr" (the main flow channel), as this is not how that content is
	     * intended to be consumed.
	     *
	     * @param {string} [channel='recommended']   A non-flow (i.e. non-`npr`) channel to retrieve a list of recommendations from
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    Listening.prototype.getRecommendationsFromChannel = function getRecommendationsFromChannel() {
	        var _this2 = this;
	
	        var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'recommended';
	
	        var _channel = !channel || typeof channel !== 'string' ? 'recommended' : channel;
	
	        var prerequisitePromise = Promise.resolve(true);
	        // Send any pending ratings we have first, just in case it impacts the results from the upcoming recommendations call
	        if (this._queuedRatings.length > 0) {
	            prerequisitePromise = this._sendRatings();
	        }
	
	        return prerequisitePromise.then(this._getChannelRecommendations.bind(this, _channel, null)).then(function (recommendations) {
	            /* istanbul ignore if: defensive coding; should never really happen */
	            if (!_this2._channelRecommendations) {
	                _this2._channelRecommendations = {};
	            }
	            _this2._channelRecommendations[_channel] = recommendations;
	            return recommendations;
	        });
	    };
	
	    /**
	     * This synchronous method is intended to be used alongside {@link getRecommendationsFromChannel}.
	     * Once you have a list of recommendations from a channel and an audio story has been selected to play, this method
	     * ensures that the correct ratings (actions) will be sent and the flow of audio will continue appropriately with
	     * the necessary API calls.
	     * If the recommendation with the given UID can be found, it is delivered immediately to be played.
	     * Importantly, this function also returns the selected recommendation on a subsequent call to getRecommendation
	     * (assuming no other ratings are sent in between), so that the consumer can assume that the correct recommendation
	     * will be played next.
	     *
	     * @param {string} channel   The channel used in the original call to `getRecommendationsFromChannel()`
	     * @param {string} uid       The unique ID of the item to queue up for the user
	     * @returns {Recommendation}
	     * @throws {TypeError} If no valid channel or UID is passed in
	     * @throws {Error} If no recommendations for this channel were previously cached, or if the UID was not found in that cached list
	     */
	
	
	    Listening.prototype.queueRecommendationFromChannel = function queueRecommendationFromChannel(channel, uid) {
	        if (!channel || typeof channel !== 'string') {
	            throw new TypeError('Must pass in a valid channel to queueRecommendationFromChannel()');
	        }
	        if (!uid || typeof uid !== 'string') {
	            throw new TypeError('Must pass in a valid uid to queueRecommendationFromChannel()');
	        }
	        if (!(channel in this._channelRecommendations) || this._channelRecommendations[channel].length === 0) {
	            throw new Error('Results from channel "' + channel + '" are not cached. ' + 'You must call getRecommendationsFromChannel() first.');
	        }
	
	        for (var _iterator = this._channelRecommendations[channel], _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	            var _ref;
	
	            if (_isArray) {
	                if (_i >= _iterator.length) break;
	                _ref = _iterator[_i++];
	            } else {
	                _i = _iterator.next();
	                if (_i.done) break;
	                _ref = _i.value;
	            }
	
	            var recommendation = _ref;
	
	            if (recommendation.attributes.uid === uid) {
	                /* istanbul ignore if: defensive coding; should never really happen */
	                if (!this._flowRecommendations) {
	                    this._flowRecommendations = [recommendation];
	                } else {
	                    this._flowRecommendations = [recommendation].concat(this._flowRecommendations);
	                }
	                return recommendation;
	            }
	        }
	        throw new Error('Unable to find story with uid ' + uid + ' ' + ('in cached list of recommendations from channel "' + channel + '".'));
	    };
	
	    /**
	     * Retrieves a user's history as an array of recommendation objects.
	     *
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    Listening.prototype.getHistory = function getHistory() {
	        var url = _index2.default.getServiceUrl('listening') + '/history';
	
	        return _fetchUtil2.default.nprApiFetch(url).then(this._createRecommendations.bind(this));
	    };
	
	    /**
	     * Resets the current flow for the user. Note that 99% of the time, clients will never have to do this (and it is
	     * generally considered an undesirable user experience), but in a few rare cases it might be needed. The best example
	     * is after calling `setUserStation()` if the current recommendation is of `type === 'stationId'`; in this case,
	     * resetting the flow may be necessary in order to make the user aware that they successfully changed their station.
	     *
	     * @example
	     * let currentRecommendation = nprOneSDK.getRecommendation();
	     * playAudio(currentRecommendation); // given a hypothetical playAudio() function in your app
	     * ...
	     * nprOneSDK.setUserStation(123)
	     *     .then(() => {
	     *         if (currentRecommendation.attributes.type === 'stationId') {
	     *             nprOneSDK.resetFlow()
	     *                 .then(() => {
	     *                     currentRecommendation = nprOneSDK.getRecommendation();
	     *                     playAudio(currentRecommendation);
	     *                 });
	     *         }
	     *     });
	     *
	     * @returns {Promise}
	     */
	
	
	    Listening.prototype.resetFlow = function resetFlow() {
	        var _this3 = this;
	
	        var prerequisitePromise = Promise.resolve(true);
	
	        if (this._flowRecommendations && this._flowRecommendations.length) {
	            // Send any pending ratings we have first, just in case it impacts the results from the upcoming recommendations call
	            if (this._queuedRatings.length > 0) {
	                prerequisitePromise = this._sendRatings(false);
	            }
	
	            return prerequisitePromise.then(function () {
	                _this3._flowRecommendations = [];
	                _this3._flowFetchActive = false;
	                _this3._flowPromise = null;
	
	                return true;
	            });
	        }
	
	        return prerequisitePromise;
	    };
	
	    /**
	     * Given a valid JSON recommendation object, the flow will advance as
	     * normal from this recommendation. This method has been created for
	     * a special case (Chromecast sharing) and is not intended for use
	     * in a traditional SDK implementation.
	     *
	     * NOTE: this function will overwrite ALL existing flow
	     * recommendations.
	     *
	     * @param {Object} json   Recommendation JSON Object (CDoc+JSON)
	     * @returns {Recommendation}
	     */
	
	
	    Listening.prototype.resumeFlowFromRecommendation = function resumeFlowFromRecommendation(json) {
	        var recommendations = this._createRecommendations(json);
	        this._flowRecommendations = recommendations;
	        return this._flowRecommendations[0];
	    };
	
	    /**
	     * Advances the flow (retrieves new recommendations from the API).
	     *
	     * @param {string} channel
	     * @param {string} uid
	     * @returns {Promise<Array<Recommendation>>}
	     * @throws {Error} If there are no recommendations to return
	     * @private
	     */
	
	
	    Listening.prototype._advanceFlowRecommendations = function _advanceFlowRecommendations(channel, uid) {
	        var _this4 = this;
	
	        if (this._flowFetchActive) {
	            _logger2.default.debug('A listening service API request is already active, ' + 'returning existing promise if one exists.');
	
	            /* istanbul ignore else: defensive coding */
	            if (this._flowPromise) {
	                return this._flowPromise;
	            }
	            /* istanbul ignore next: defensive coding */
	            return Promise.reject(new Error('No recommendations available. Try again later.'));
	        }
	
	        // if given a UID, we check first to see if we already have the recommendation cached
	        if (uid && !!this._flowRecommendations && this._flowRecommendations.length > 0) {
	            var isRecommendationFound = false;
	            this._flowRecommendations.forEach(function (recommendation, index) {
	                if (!isRecommendationFound && recommendation.attributes.uid === uid) {
	                    _this4._flowRecommendations = _this4._flowRecommendations.slice(index);
	                    isRecommendationFound = true;
	                }
	            });
	            if (isRecommendationFound) {
	                _logger2.default.debug('Recommendation with UID ' + uid + ' was already queued up. ' + 'Returning the cached version instead of making a new API call.');
	                return Promise.resolve(this._flowRecommendations[0]);
	            }
	        }
	
	        this._flowFetchActive = true;
	        return this._getFlowRecommendations(channel, uid).then(function (recommendations) {
	            _this4._flowFetchActive = false;
	            if (recommendations.length <= 0) {
	                _logger2.default.error('API returned no recommendations.');
	            }
	            _this4._flowRecommendations = _this4._filterIncomingRecommendations(recommendations);
	            if (!_this4._flowRecommendations[0]) {
	                throw new Error('All recommendations exhausted!');
	            }
	            return _this4._flowRecommendations[0];
	        }).catch(function (error) {
	            _this4._flowFetchActive = false;
	            throw error;
	        });
	    };
	
	    /**
	     * Provide any necessary filter to incoming recommendations if needed
	     *
	     * @param {Array<Recommendation>} recommendations
	     * @private
	     */
	
	
	    Listening.prototype._filterIncomingRecommendations = function _filterIncomingRecommendations(recommendations) {
	        if (this._adsBlocked) {
	            var unfilteredCount = recommendations.length;
	            var _recommendations = recommendations.filter(function (rec) {
	                return !rec.isSponsorship();
	            });
	            var filteredCount = unfilteredCount - _recommendations.length;
	            if (filteredCount > 0) {
	                _logger2.default.debug('Filtered ' + filteredCount + ' ad(s).');
	            }
	            return _recommendations;
	        }
	
	        return recommendations;
	    };
	
	    /**
	     * Private method to facilitate communication of a rated recommendation.
	     *
	     * @param {Rating} rating
	     * @private
	     */
	
	
	    Listening.prototype._recordRating = function _recordRating(rating) {
	        if (this._queuedRatingsContainsRating(rating)) {
	            return; // no need to take action for the same rating twice
	        }
	
	        _logger2.default.debug('Queued rating: ' + rating);
	        this._queuedRatings.push(rating);
	
	        // Only one of these should ever fire, but this is easiest way to do the lookup
	        for (var _iterator2 = _action2.default.getFlowAdvancingActions(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	            var _ref2;
	
	            if (_isArray2) {
	                if (_i2 >= _iterator2.length) break;
	                _ref2 = _iterator2[_i2++];
	            } else {
	                _i2 = _iterator2.next();
	                if (_i2.done) break;
	                _ref2 = _i2.value;
	            }
	
	            var action = _ref2;
	
	            if (rating.rating === action) {
	                this.getRecommendation();
	                break;
	            }
	        }
	    };
	
	    /**
	     * Request for recommendations from NPR specifically for the flow as opposed to
	     * other channels which will not change the current flow.
	     *
	     * @param {string} channel
	     * @param {string} uid
	     * @returns {Promise<Array<Recommendation>>}
	     */
	
	
	    Listening.prototype._getFlowRecommendations = function _getFlowRecommendations(channel, uid) {
	        for (var _iterator3 = _action2.default.getFlowAdvancingActions(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	            var _ref3;
	
	            if (_isArray3) {
	                if (_i3 >= _iterator3.length) break;
	                _ref3 = _iterator3[_i3++];
	            } else {
	                _i3 = _iterator3.next();
	                if (_i3.done) break;
	                _ref3 = _i3.value;
	            }
	
	            var action = _ref3;
	
	            if (this._queuedRatingsContainsAction(action)) {
	                return this._sendRatings();
	            }
	        }
	
	        if (!uid) {
	            // Only perform the initial recommendation call if all flow recommendations are exhausted
	            if (this._flowRecommendations.length > 0) {
	                return Promise.resolve(this._flowRecommendations);
	            }
	        }
	
	        return this._getChannelRecommendations(channel, uid);
	    };
	
	    /**
	     * @param {string} channel
	     * @param {string} [uid='']
	     * @returns {Promise<Array<Recommendation>>}
	     * @private
	     */
	
	
	    Listening.prototype._getChannelRecommendations = function _getChannelRecommendations(channel) {
	        var uid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
	
	        var _channel = !channel || typeof channel !== 'string' ? 'npr' : channel;
	
	        var url = _index2.default.getServiceUrl('listening') + '/recommendations?channel=' + _channel;
	        url += uid ? '&sharedMediaId=' + uid : '';
	
	        return _fetchUtil2.default.nprApiFetch(url).then(this._createRecommendations.bind(this));
	    };
	
	    /**
	     * Create recommendation objects from collection doc
	     *
	     * @param {Object} json - collection doc
	     * @returns {Array<Recommendation>}
	     * @private
	     */
	
	
	    Listening.prototype._createRecommendations = function _createRecommendations(json) {
	        var recommendations = (0, _recommendationCreator2.default)(json);
	        var recordRating = this._recordRating.bind(this);
	        recommendations.map(function (rec) {
	            return rec.setRatingReceivedCallback(recordRating);
	        });
	
	        return recommendations;
	    };
	
	    /**
	     * Send batched ratings
	     *
	     * @param {boolean} [recommendMore=true] - determines if additional recommendations should be returned
	     * @returns {Promise<Array<Recommendation>>}
	     * @private
	     */
	
	
	    Listening.prototype._sendRatings = function _sendRatings() {
	        var _this5 = this;
	
	        var recommendMore = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	
	        /* istanbul ignore if: defensive coding */
	        if (this._queuedRatings.length === 0) {
	            _logger2.default.error('Things have gone drastically wrong, this: ', this);
	            return Promise.reject(new Error('No queued ratings to send.'));
	        }
	
	        var url = _index2.default.getServiceUrl('listening');
	        url += '/ratings?recommend=' + recommendMore.toString();
	        if (recommendMore) {
	            var latestRating = this._queuedRatings.slice(-1).pop();
	            if (latestRating._actionUrl && latestRating.rating === _action2.default.TAPTHRU) {
	                url = latestRating._actionUrl;
	            } else {
	                url = latestRating._recommendationUrl;
	            }
	        }
	
	        var ratingsToSend = [];
	        this._queuedRatings.forEach(function (rating) {
	            /* istanbul ignore else: defensive coding */
	            if (!rating._hasSent) {
	                ratingsToSend.push(rating);
	            }
	        });
	
	        var options = {
	            method: 'POST',
	            body: JSON.stringify(ratingsToSend, _rating3.default.privateMemberReplacer)
	        };
	
	        _logger2.default.debug('Sending Ratings: ', ratingsToSend.join(', '));
	
	        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
	            // Loop through all queued ratings and mark as sent
	            ratingsToSend.forEach(function (rating) {
	                var _rating = rating;
	                _rating._hasSent = true;
	                _this5._sentRatings.push(_rating);
	                _this5._queuedRatings.splice(_this5._queuedRatings.indexOf(_rating), 1);
	            });
	            return _this5._createRecommendations(json);
	        });
	    };
	
	    /**
	     * Returns whether currently queued ratings contain a specific rating
	     *
	     * This is not a deep copy check and relies on mediaId & rating string
	     *
	     * @param {Rating} rating
	     * @returns {boolean}
	     * @private
	     */
	
	
	    Listening.prototype._queuedRatingsContainsRating = function _queuedRatingsContainsRating(rating) {
	        return this._queuedRatings.some(function (qr) {
	            return qr.rating === rating.rating && qr.mediaId === rating.mediaId;
	        }); // eslint-disable-line
	    };
	
	    /**
	     * Returns whether the currently queued ratings contains a specific action
	     *
	     * @param {string} action
	     * @returns {boolean}
	     * @private
	     */
	
	
	    Listening.prototype._queuedRatingsContainsAction = function _queuedRatingsContainsAction(action) {
	        return this._queuedRatings.some(function (qr) {
	            return qr.rating === action;
	        });
	    };
	
	    return Listening;
	}();
	
	exports.default = Listening;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _validator = __webpack_require__(4);
	
	var _validator2 = _interopRequireDefault(_validator);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * A thin wrapper around the raw JSON returned from the authorization server to represent a device code/user code pair
	 */
	var DeviceCode = function () {
	    /**
	     * @param {Object} json    The decoded JSON object that should be used as the basis for this model
	     */
	    function DeviceCode(json) {
	        _classCallCheck(this, DeviceCode);
	
	        this._raw = json;
	
	        this._expiryDate = null;
	        if (!isNaN(this._raw.expires_in)) {
	            this._expiryDate = new Date(Date.now() + this.ttl);
	        }
	    }
	
	    /**
	     * Ensure that the given device code model is valid
	     *
	     * @throws {TypeError} if device code model is invalid
	     */
	
	
	    DeviceCode.prototype.validate = function validate() {
	        _validator2.default.validateDeviceCode(this._raw);
	    };
	
	    /**
	     * Returns whether or not this device code/user code pair has expired.
	     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
	     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
	     *
	     * @returns {boolean}
	     */
	
	
	    DeviceCode.prototype.isExpired = function isExpired() {
	        return this._expiryDate !== null && new Date() >= this._expiryDate;
	    };
	
	    /**
	     * Returns the user code (8-character alphanumeric string)
	     *
	     * @type {string}
	     */
	
	
	    /**
	     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	     * In this case, we return the raw JSON string representing the entire object.
	     *
	     * @returns {string}
	     */
	    DeviceCode.prototype.toString = function toString() {
	        return JSON.stringify(this._raw);
	    };
	
	    _createClass(DeviceCode, [{
	        key: 'userCode',
	        get: function get() {
	            return this._raw.user_code;
	        }
	
	        /**
	         * Returns the verification URL (the place where the user should go on their mobile device or laptop to log in)
	         *
	         * @type {string}
	         */
	
	    }, {
	        key: 'verificationUri',
	        get: function get() {
	            return this._raw.verification_uri;
	        }
	
	        /**
	         * Returns the TTL (in milliseconds) until this device code/user code pair expires. The SDK will automatically generate
	         * a new key pair upon expiry, so consumers of the SDK will generally not have to use this value directly; however,
	         * you may opt to display on the screen how much time the user has left to log in before a new code is generated.
	         *
	         * @type {number}
	         */
	
	    }, {
	        key: 'ttl',
	        get: function get() {
	            return this._raw.expires_in * 1000;
	        }
	
	        /**
	         * Returns the interval (in milliseconds) at which the client (in this case the SDK) should poll the `POST /token`
	         * endpoint (or the OAuth proxy that lies in between). Consumers of the SDK should generally not have to use this
	         * value directly.
	         *
	         * @type {number}
	         */
	
	    }, {
	        key: 'interval',
	        get: function get() {
	            return this._raw.interval * 1000;
	        }
	    }]);
	
	    return DeviceCode;
	}();
	
	exports.default = DeviceCode;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	__webpack_require__(11);
	
	var _urlParse = __webpack_require__(12);
	
	var _urlParse2 = _interopRequireDefault(_urlParse);
	
	var _collectionDoc = __webpack_require__(6);
	
	var _collectionDoc2 = _interopRequireDefault(_collectionDoc);
	
	var _rating = __webpack_require__(10);
	
	var _rating2 = _interopRequireDefault(_rating);
	
	var _action = __webpack_require__(5);
	
	var _action2 = _interopRequireDefault(_action);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	/**
	 * Container class for all metadata pertaining to a recommendation.
	 *
	 * Provides metadata and the recordAction method, which sends feedback on user actions to NPR's APIs and advances the flow of audio recommendations to the user
	 *
	 * @extends {CollectionDoc}
	 */
	var Recommendation = function (_CollectionDoc) {
	    _inherits(Recommendation, _CollectionDoc);
	
	    /**
	     * @param {CollectionDocJSON} json   The decoded JSON object that should be used as the basis for this model
	     */
	    function Recommendation(json) {
	        _classCallCheck(this, Recommendation);
	
	        /** @type {Object}
	         * @private */
	        var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));
	
	        _this._raw = json;
	        /**
	         * The metadata used to describe this recommendation, such as type and title
	         * @type {RecommendationAttributes}
	         */
	        _this.attributes = {};
	        /**
	         * An internal store of ratings collected for this application; should never be accessed directly by consumers
	         * @type {Array<Rating>}
	         */
	        _this.ratings = [];
	        /**
	         * The actual audio files associated with this recommendation; should never be empty
	         * @type {Array<Link>}
	         */
	        _this.audio = [];
	        /**
	         * A list of API calls the app can make to retrieve subsequent recommendations; should never be accessed directly by consumers
	         * @type {Array<Link>}
	         */
	        _this.recommendations = [];
	        /**
	         * A list of images associated with this recommendation; could be empty
	         * @type {Array<ImageLink>}
	         */
	        _this.images = [];
	        /**
	         * A list of links to other places where this story can be found on the web (for example, on NPR.org); could be empty
	         * @type {Array<Link>}
	         */
	        _this.web = [];
	        /**
	         * A list of links that are used as the canonical link(s) when sharing this story on social media
	         * @type {Array<Link>}
	         */
	        _this.onramps = [];
	        /**
	         * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
	         * @type {Array<Link>}
	         */
	        _this.callsToAction = [];
	        /**
	         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
	         * has played the accompanying audio
	         * @type {Array<FormFactorLink>}
	         */
	        _this.impressions = [];
	        /**
	         * A list of links to places where the app can take the user if they interact with this `sponsorship` item
	         * @type {Array<FormFactorLink>}
	         */
	        _this.relateds = [];
	        /**
	         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client has
	         * chosen to interact with the sponsorship item using the contents of {@link relateds}
	         * @type {Array<FormFactorLink>}
	         */
	        _this.relatedImpressions = [];
	        /** @type {Object}
	          * @private */
	        _this._ratingTemplate = {};
	        /**
	         * Used to prevent impressions from being fired twice
	         * @type {boolean}
	         * @private
	         */
	        _this._hasSentImpressions = false;
	        /** @type {null|Function}
	          * @private */
	        _this._ratingReceivedCallback = null;
	
	        _this._hydrate();
	        return _this;
	    }
	
	    /**
	     * Hydrate the internal member variables.
	     *
	     * @private
	     */
	
	
	    Recommendation.prototype._hydrate = function _hydrate() {
	        this._validate();
	
	        this._ratingTemplate = this._raw.attributes.rating;
	
	        // deep copy, we do not want duplicate rating objects
	        this.attributes = Object.assign({}, this._raw.attributes);
	        delete this.attributes.rating;
	
	        var links = this._raw.links;
	
	        // Required
	        this.audio = links.audio;
	        this.recommendations = links.recommendations;
	
	        // Optional
	        this.web = links.web ? links.web : [];
	        this.images = links.image ? links.image : [];
	        this.onramps = links.onramps ? links.onramps : [];
	        this.callsToAction = links.action ? links.action : [];
	        this.impressions = links.impression ? links.impression : [];
	        this.relateds = links.related ? links.related : [];
	        this.relatedImpressions = links['related-impression'] ? links['related-impression'] : [];
	    };
	
	    /**
	     * Determines whether the collection doc has the required fields for a valid recommendation
	     *
	     * @protected
	     * @throws {TypeError} if the collection doc is invalid
	     */
	
	
	    Recommendation.prototype._validate = function _validate() {
	        var links = this._raw.links;
	
	        if (!links.audio || links.audio.constructor !== Array || links.audio.length <= 0) {
	            throw new TypeError('Audio must exist within links.');
	        }
	
	        if (!links.recommendations || links.recommendations.constructor !== Array || links.recommendations.length <= 0) {
	            throw new TypeError('Recommendation (contains URL) must exist within links.');
	        }
	
	        if (!this._raw.attributes.rating) {
	            throw new TypeError('Attributes must contain a rating object.');
	        }
	    };
	
	    /**
	     * Returns a list of images associated with this recommendation
	     *
	     * @returns {Array<ImageLink>}
	     */
	
	
	    Recommendation.prototype.getImages = function getImages() {
	        return this.images;
	    };
	
	    /**
	     * Returns the actual audio files associated with this recommendation
	     *
	     * @returns {Array<Link>}
	     */
	
	
	    Recommendation.prototype.getAudio = function getAudio() {
	        return this.audio;
	    };
	
	    /**
	     * Returns a list of links to other places where this story can be found on the web (for example, on NPR.org)
	     *
	     * @returns {Array<Link>}
	     */
	
	
	    Recommendation.prototype.getWeb = function getWeb() {
	        return this.web;
	    };
	
	    /**
	     * Returns a list of links that are used as the canonical link(s) when sharing this story on social media.
	     *
	     * @returns {Array<Link>}
	     */
	
	
	    Recommendation.prototype.getOnRamps = function getOnRamps() {
	        return this.onramps;
	    };
	
	    /**
	     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
	     * has played the accompanying audio. Note that the SDK will take care of this automatically as long as the client
	     * uses {@link recordAction} to send the rating.
	     *
	     * @returns {Array<FormFactorLink>}
	     */
	
	
	    Recommendation.prototype.getImpressions = function getImpressions() {
	        return this.impressions;
	    };
	
	    /**
	     * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
	     *
	     * An example of what might be contained within this is array is a link to full-length content
	     * for a promo recommendation.
	     *
	     * @returns {Array<Link>}
	     */
	
	
	    Recommendation.prototype.getCallsToAction = function getCallsToAction() {
	        return this.callsToAction;
	    };
	
	    /**
	     * Returns a list of links to places where the app can take the user if they interact with this `sponsorship` item
	     * (such as by clicking/tapping on the image or using a voice command to learn more)
	     *
	     * @returns {Array<FormFactorLink>}
	     */
	
	
	    Recommendation.prototype.getRelateds = function getRelateds() {
	        return this.relateds;
	    };
	
	    /**
	     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
	     * has chosen to interact with the sponsorship item using the contents returned by {@link getRelateds}. Note that
	     * the SDK will take care of this automatically as long as the client uses {@link recordAction} to send the rating.
	     *
	     * @returns {Array<FormFactorLink>}
	     */
	
	
	    Recommendation.prototype.getRelatedImpressions = function getRelatedImpressions() {
	        return this.relatedImpressions;
	    };
	
	    /**
	     * Returns an internal store of ratings collected for this application. This should never be accessed directly by
	     * consumers; use {@link recordAction} to send ratings, and the SDK will figure out the appropriate time to make
	     * the API call that submits them to the server.
	     *
	     * @returns {Array<Rating>}
	     */
	
	
	    Recommendation.prototype.getRatings = function getRatings() {
	        return this.ratings;
	    };
	
	    /**
	     * Returns the URL that should be used to obtain the next set of recommendations. This should typically not be used
	     * by clients directly; use {@link recordAction} followed by {@link NprOneSDK#getRecommendation} instead.
	     *
	     * @returns {string}
	     */
	
	
	    Recommendation.prototype.getRecommendationUrl = function getRecommendationUrl() {
	        return this.recommendations[0].href;
	    };
	
	    /**
	     * This method looks through the recommendation's action and related array to search for any URL starting with `'nprone://listen'`.
	     * If found, everything from the query params is appended to the original recommendation URL.
	     * This value is then used anytime a user indicates they want more similar stories by clicking or tapping on this recommendation.
	     *
	     * For many recommendations, this will not exist and getRecommendationUrl is used instead.
	     *
	     * @returns {string}
	     */
	
	
	    Recommendation.prototype.getActionRecommendationUrl = function getActionRecommendationUrl() {
	        var original = new _urlParse2.default(this.getRecommendationUrl());
	        var potentialActions = this.callsToAction.concat(this.relateds);
	
	        var nprOneUrl = '';
	        for (var _iterator = potentialActions, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	            var _ref;
	
	            if (_isArray) {
	                if (_i >= _iterator.length) break;
	                _ref = _iterator[_i++];
	            } else {
	                _i = _iterator.next();
	                if (_i.done) break;
	                _ref = _i.value;
	            }
	
	            var action = _ref;
	
	            if (action.href && action.href.indexOf('nprone://') === 0) {
	                nprOneUrl = new _urlParse2.default(action.href);
	                break;
	            }
	        }
	
	        var url = '';
	        if (nprOneUrl) {
	            url = original.set('query', nprOneUrl.query).href + '&recommend=true';
	        }
	
	        return url;
	    };
	
	    /**
	     * Returns whether this recommendation is of type `sponsorship`
	     *
	     * @returns {boolean}
	     */
	
	
	    Recommendation.prototype.isSponsorship = function isSponsorship() {
	        return this.attributes.type === 'sponsorship';
	    };
	
	    /**
	     * Returns whether this recommendation is shareable on social media
	     *
	     * @returns {boolean}
	     */
	
	
	    Recommendation.prototype.isShareable = function isShareable() {
	        return this.onramps.length > 0;
	    };
	
	    /**
	     * Returns whether this recommendation has a given action
	     *
	     * @param {string} action    Which action to look up; should be one of the static string constants returned by {@link Action}
	     * @returns {boolean}
	     */
	
	
	    Recommendation.prototype.hasAction = function hasAction(action) {
	        for (var _iterator2 = this.ratings, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	            var _ref2;
	
	            if (_isArray2) {
	                if (_i2 >= _iterator2.length) break;
	                _ref2 = _iterator2[_i2++];
	            } else {
	                _i2 = _iterator2.next();
	                if (_i2.done) break;
	                _ref2 = _i2.value;
	            }
	
	            var rating = _ref2;
	
	            if (rating.rating === action) {
	                return true;
	            }
	        }
	
	        return false;
	    };
	
	    /**
	     * Returns whether this recommendation has received a rating indicating it is no longer
	     * being presented to the user
	     *
	     * @returns {boolean}
	     */
	
	
	    Recommendation.prototype.hasEndAction = function hasEndAction() {
	        for (var _iterator3 = _action2.default.getEndActions(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	            var _ref3;
	
	            if (_isArray3) {
	                if (_i3 >= _iterator3.length) break;
	                _ref3 = _iterator3[_i3++];
	            } else {
	                _i3 = _iterator3.next();
	                if (_i3.done) break;
	                _ref3 = _i3.value;
	            }
	
	            var endAction = _ref3;
	
	            if (this.hasAction(endAction)) {
	                return true;
	            }
	        }
	
	        return false;
	    };
	
	    /**
	     * Record a user action taken and the time it was taken against this recommendation
	     *
	     * @param {string} action                  Which action to record; should be one of the static string constants returned by {@link Action}
	     * @param {number} elapsedTimeInSeconds    The number of seconds this piece of audio has been playing for
	     */
	
	
	    Recommendation.prototype.recordAction = function recordAction(action, elapsedTimeInSeconds) {
	        var _elapsedTime = elapsedTimeInSeconds;
	
	        if (!_action2.default.isValidAction(action)) {
	            throw new Error(action + ' action is invalid. See Action class for valid actions.');
	        }
	
	        var n = parseInt(_elapsedTime, 10);
	        if (isNaN(n) || !isFinite(n)) {
	            throw new Error('Elapsed time must be supplied and be a positive integer value.');
	        }
	
	        if (_elapsedTime < 0) {
	            _logger2.default.warn('Elapsed time of ' + _elapsedTime + ' is invalid ' + 'and has been changed to 0 seconds.');
	            _elapsedTime = 0;
	        }
	
	        if (_elapsedTime > this.attributes.duration && this.attributes.duration > 0) {
	            // 30s has been arbitrarily chosen as it's enough to indicate the consumer of this SDK might have made a coding error.
	            if (_elapsedTime > this.attributes.duration + 30) {
	                _logger2.default.warn('Elapsed time of ' + _elapsedTime + ' exceeds overall audio duration ' + ('and has been modified to ' + this.attributes.duration + ' seconds.'));
	            }
	            _elapsedTime = this.attributes.duration;
	        }
	
	        if (_elapsedTime === 0 && (action === _action2.default.COMPLETED || action === _action2.default.SKIP)) {
	            _logger2.default.warn('Elapsed time value should be greater than zero; ' + 'please ensure the time passed since the START rating is recorded.');
	        }
	
	        if (action !== _action2.default.START) {
	            if (!this.hasAction(_action2.default.START)) {
	                _logger2.default.warn('Action \'' + action + '\' has been recorded; however, no START action ' + 'exists. Please ensure START actions are recorded first.');
	            }
	        }
	
	        var rating = new _rating2.default(this._ratingTemplate);
	        rating.rating = action;
	        rating.elapsed = _elapsedTime;
	        rating.timestamp = new Date().toISOString();
	        rating._recommendationUrl = this.getRecommendationUrl();
	        rating._actionUrl = this.getActionRecommendationUrl();
	
	        // Handle Sponsorship Impressions
	        if (this.isSponsorship() && action === _action2.default.START && !this._hasSentImpressions) {
	            this._hasSentImpressions = true;
	            var impressions = this.impressions.concat(this.relatedImpressions);
	            impressions.forEach(function (link) {
	                if (link['form-factor'] === 'audio') {
	                    fetch(link.href, { mode: 'no-cors' }); // no really, that's it. We don't care about the result of these fetches.
	                }
	            });
	        }
	
	        this.ratings.push(rating);
	
	        if (this._ratingReceivedCallback !== null) {
	            this._ratingReceivedCallback(rating);
	        }
	    };
	
	    /**
	     * A callback which provides for communication of a received rating
	     *
	     * @param {?Function} callback    A function to call whenever this recommendation has received a rating (action)
	     */
	
	
	    Recommendation.prototype.setRatingReceivedCallback = function setRatingReceivedCallback(callback) {
	        this._ratingReceivedCallback = callback;
	    };
	
	    /**
	     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	     *
	     * @returns {string}
	     */
	
	
	    Recommendation.prototype.toString = function toString() {
	        return '[UID=' + this.attributes.uid + ', R=' + this.getRatings().join(',') + ']';
	    };
	
	    /**
	     * @typedef {Object} RecommendationAttributes
	     * @property {string} type The type of recommendation, usually `audio`. Can also be `stationId`, `sponsorship`, etc.
	     * @property {string} uid The universal identifier of the recommendation
	     * @property {string} title The title of the recommendation
	     * @property {boolean} skippable Whether or not the recommendation is skippable, usually true, but false for e.g. sponsorship
	     * @property {string} [slug] A slug or category for the recommendation
	     * @property {string} provider The provider of the story, usually `NPR`. Can also be a member station or third-party podcast provider.
	     * @property {string} [program] The program as part of which this recommendation aired
	     * @property {number} duration The duration of the audio according to the API; note that the actual duration can differ
	     * @property {string} date ISO-8601 formatted date/time; the date at which the story was first published
	     * @property {string} [description] A short description of the recommendation
	     * @property {string} rationale The reason for recommending this piece to the listener
	     * @property {string} [button] The text to display in a clickable button on a feature card
	     */
	    /**
	     * @typedef {Link} FormFactorLink
	     * @property {string} [form-factor] The form-factor for the most appropriate display of or interaction with the resource, usually irrelevant unless there is more than one link of the same type
	     */
	    /**
	     * @typedef {FormFactorLink} ImageLink
	     * @property {string} [rel] The relation of the image to the content, which usually corresponds to the crop-type
	     * @property {number} [height] The pixel height of the image
	     * @property {number} [width] The pixel width of the image
	     */
	
	
	    return Recommendation;
	}(_collectionDoc2.default);
	
	exports.default = Recommendation;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _collectionDoc = __webpack_require__(6);
	
	var _collectionDoc2 = _interopRequireDefault(_collectionDoc);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	/**
	 * Container class for all metadata pertaining to an organization (member station) from the NPR One API
	 *
	 * @extends {CollectionDoc}
	 */
	var Station = function (_CollectionDoc) {
	    _inherits(Station, _CollectionDoc);
	
	    /**
	     * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
	     */
	    function Station(json) {
	        _classCallCheck(this, Station);
	
	        var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));
	
	        _this._validate();
	        return _this;
	    }
	
	    /**
	     * Returns the unique ID that represents this station across NPR's various APIs. The ID is an integer between 1 and
	     * 9999, but it will always be returned in string format.
	     *
	     * @type {string}
	     */
	
	
	    /**
	     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	     * In this case, we return the station's display name.
	     *
	     * @returns {string}
	     */
	    Station.prototype.toString = function toString() {
	        return this.displayName;
	    };
	
	    /**
	     * @typedef {Object} StationAttributes
	     * @property {string} orgId The system's unique ID for this station, used across NPR One Microservices and NPR's other APIs
	     * @property {string} guid The system's internal unique identifier for a station, not typically used by other APIs or consumers
	     * @property {StationBrandData} brand An associative array of brand-related metadata for this station
	     * @property {StationEligibilityData} eligibility An associative array of eligibility-related metadata for this station
	     * @property {StationNewscastData} [newscast] Metadata about the newscast for this station; newscasts are handled internally by other microservices such as the NPR One Listening Service, so this data should typically not be used by consumers
	     * @property {StationNetwork} Metadata about the network, if this station is part of a network
	     */
	    /**
	     * @typedef {Object} StationBrandData
	     * @property {string} name The display name for the station. In most cases, this will be the same as call letters combined with band. When returning networks, it will return the network name (e.g. Minnesota Public Radio).
	     * @property {string|null} call The three-to-four-letter identifying code for this station. Please use this with caution; most stations prefer to be identified by their name in client applications instead of call.
	     * @property {string|null} frequency Where on the radio dial the station can be heard. If the band is AM, the frequency will be between 540 and 1600. If the band is FM, the frequency will be between 87.8 and 108.0.
	     * @property {string|null} band The subsection of the radio spectrum -- 'AM' or 'FM' -- where this station can be heard
	     * @property {string} tagline A short text-logo for the station
	     * @property {string} marketCity The city that the station is most closely associated with. This may or may not be the city the station is licensed in and it may or may not be the city that the station or the station's antenna is located in.
	     * @property {string} marketState The state that the station is most closely associated with. This may or may not be the state the station is licensed in and it may or may not be the state that the station or the station's antenna is located in.
	     */
	    /**
	     * @typedef {Object} StationEligibilityData
	     * @property {boolean} nprOne Whether or not this organization is considered an NPR One station
	     * @property {boolean} musicOnly Whether or not this station only plays music
	     * @property {string} format The format of the programming on this station
	     * @property {string} status The status of the station within NPR's system, not typically used by consumers
	     */
	    /**
	     * @typedef {Object} StationNewscastData
	     * @property {string} id The ID of the newscast that should be played for this station; this is handled internally by other microservices such as the NPR One Listening Service, so this field should typically not be used by consumers
	     * @property {null|number} recency How often the newscast should be played, in minutes; a value of `null` implies no information is available, and sensible defaults should be used
	     */
	    /**
	     * @typedef {Object} StationNetwork
	     * @property {string} currentOrgId The current station being viewed. Client applications should generally ignore this field.
	     * @property {boolean} usesInheritance Whether or not the current station inherits from a parent organization, also referred to as a network
	     * @property {string} [inheritingFrom] The system' unique ID for the organization that the current station is inheriting from, if inheritance is on
	     * @property {string} name The display name for the current organization
	     * @property {StationNetworkTierOne} [tier1] The top-level organization, if this station is part of a network
	     */
	    /**
	     * @typedef {Object} StationNetworkTierOne
	     * @property {string} id The unique identifier of the top-level organization in the network
	     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
	     * @property {string} name The display name for the top-level organization in the network
	     * @property {string} status The status of the top-level organization within NPR's system, not typically used by consumers
	     * @property {Array<StationNetworkTierTwo>} [tier2] One or more stations that are hierarchical children of this organization
	     */
	    /**
	     * @typedef {Object} StationNetworkTierTwo
	     * @property {string} id The unique identifier of a tier 2 organization in the network
	     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
	     * @property {string} name The display name for a tier 2 organization in the network
	     * @property {Array<StationNetworkTierThree>} [tier3] One or more stations that are hierarchical children of this organization
	     */
	    /**
	     * @typedef {Object} StationNetworkTierThree
	     * @property {string} id The unique identifier of a tier 3 organization in the network
	     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
	     * @property {string} name The display name for a tier 3 organization in the network
	     */
	
	
	    _createClass(Station, [{
	        key: 'id',
	        get: function get() {
	            return this._raw.attributes.orgId;
	        }
	
	        /**
	         * Returns the display name that the station would prefer to use. Please use this anytime you want to display a
	         * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
	         * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
	         *
	         * @type {string}
	         */
	
	    }, {
	        key: 'displayName',
	        get: function get() {
	            return this._raw.attributes.brand.name;
	        }
	
	        /**
	         * Returns the logo for this station, if one can be found. If no logo can be found at all, this will return `null`.
	         *
	         * @type {null|string}
	         */
	
	    }, {
	        key: 'logo',
	        get: function get() {
	            if (this._raw.links.brand) {
	                for (var _iterator = this._raw.links.brand, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	                    var _ref;
	
	                    if (_isArray) {
	                        if (_i >= _iterator.length) break;
	                        _ref = _iterator[_i++];
	                    } else {
	                        _i = _iterator.next();
	                        if (_i.done) break;
	                        _ref = _i.value;
	                    }
	
	                    var link = _ref;
	
	                    if (link.rel === 'logo') {
	                        return link.href;
	                    }
	                }
	            }
	            return null;
	        }
	
	        /**
	         * Returns the tagline for this station. This should be used as supplemental metadata for a station; it should never
	         * be used as the sole identifying information. Note that while the majority of the stations in our system have
	         * taglines, it is not guaranteed that each station has one.
	         *
	         * @type {string}
	         */
	
	    }, {
	        key: 'tagline',
	        get: function get() {
	            return this._raw.attributes.brand.tagline || '';
	        }
	
	        /**
	         * Returns the call sign, brand (AM or FM), and frequency together as one string, e.g. `'WAMU FM 88.5'` or
	         * `'KCFR FM 90.1'` or `'KWSU AM 1250'`. Again, this should be treated as supplemental metadata for a station and
	         * not the sole identifying information; where possible, stations prefer to be identified primarily by their
	         * {@link displayName} and {@link logo}. However, some local stations are members of networks such as Colorado Public Radio
	         * and therefore use the same display name and logo; in those cases, the call sign + band + frequency combination is
	         * the main way to disambiguate between multiple stations in the same network. This value is guaranteed to be unique.
	         *
	         * @type {null|string}
	         */
	
	    }, {
	        key: 'callSignAndFrequency',
	        get: function get() {
	            var callSignAndFrequency = '';
	            var brand = this._raw.attributes.brand;
	            if (brand.call) {
	                callSignAndFrequency += brand.call;
	            }
	            if (brand.band) {
	                callSignAndFrequency += ' ' + brand.band;
	            }
	            if (brand.frequency) {
	                callSignAndFrequency += ' ' + brand.frequency;
	            }
	            return callSignAndFrequency.trim() || null;
	        }
	
	        /**
	         * Returns the location of the station, which always consists of a city and (abbreviated) state, e.g. `'Austin, TX'`
	         * or `'Rochester, NY'`. Similarly to {@link callSignAndFrequency}, this is most useful for disambiguating between
	         * multiple local stations in a bigger network such as Colorado Public Radio, which use the same {@link displayName}
	         * and {@link logo}. Note that this value isn't guaranteed to be unique; some cities (e.g. Boston) have multiple
	         * NPR stations.
	         *
	         * @type {string}
	         */
	
	    }, {
	        key: 'location',
	        get: function get() {
	            var brand = this._raw.attributes.brand;
	            return brand.marketCity + ', ' + brand.marketState;
	        }
	
	        /**
	         * Returns the URL to the station's website, if available.
	         *
	         * @type {null|string}
	         */
	
	    }, {
	        key: 'homepageUrl',
	        get: function get() {
	            if (this._raw.links.brand) {
	                for (var _iterator2 = this._raw.links.brand, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
	                    var _ref2;
	
	                    if (_isArray2) {
	                        if (_i2 >= _iterator2.length) break;
	                        _ref2 = _iterator2[_i2++];
	                    } else {
	                        _i2 = _iterator2.next();
	                        if (_i2.done) break;
	                        _ref2 = _i2.value;
	                    }
	
	                    var link = _ref2;
	
	                    if (link.rel === 'homepage') {
	                        return link.href;
	                    }
	                }
	            }
	            return null;
	        }
	
	        /**
	         * Returns the URL to the station's online donation page, if available.
	         *
	         * @type {null|string}
	         */
	
	    }, {
	        key: 'donationUrl',
	        get: function get() {
	            var preferredUrl = void 0;
	            var fallbackUrl = void 0;
	
	            if (this._raw.links.donation) {
	                for (var _iterator3 = this._raw.links.donation, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
	                    var _ref3;
	
	                    if (_isArray3) {
	                        if (_i3 >= _iterator3.length) break;
	                        _ref3 = _iterator3[_i3++];
	                    } else {
	                        _i3 = _iterator3.next();
	                        if (_i3.done) break;
	                        _ref3 = _i3.value;
	                    }
	
	                    var link = _ref3;
	
	                    if (link.typeId === '27') {
	                        preferredUrl = link.href;
	                        break;
	                    } else if (link.typeId === '4') {
	                        fallbackUrl = link.href;
	                    }
	                }
	            }
	
	            return preferredUrl || fallbackUrl || null;
	        }
	
	        /**
	         * Returns the primary stream object for this station, if one can be found. If no primary stream can be found at all, this will return `null`.
	         *
	         * @type {null|Link}
	         */
	
	    }, {
	        key: 'primaryStream',
	        get: function get() {
	            if (this._raw.links.streams) {
	                return this._raw.links.streams.find(function (item) {
	                    return item.isPrimaryStream;
	                });
	            }
	            return null;
	        }
	
	        /**
	         * Returns the primary stream URL for this station, if one can be found. If no primary stream can be found at all, this will return `null`.
	         *
	         * @type {null|string}
	         */
	
	    }, {
	        key: 'primaryStreamUrl',
	        get: function get() {
	            var primaryStream = this.primaryStream;
	            return primaryStream ? primaryStream.href : null;
	        }
	
	        /**
	         * Returns whether or not the station is eligible for inclusion in NPR One applications.
	         *
	         * @type {boolean}
	         */
	
	    }, {
	        key: 'isNprOneEligible',
	        get: function get() {
	            return this._raw.attributes.eligibility.nprOne;
	        }
	
	        /**
	         * Returns the raw attributes that represent this station. Please use this with caution; the public accessor methods
	         * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
	         * metadata.
	         *
	         * @type {StationAttributes}
	         */
	
	    }, {
	        key: 'attributes',
	        get: function get() {
	            return this._raw.attributes;
	        }
	    }]);
	
	    return Station;
	}(_collectionDoc2.default);
	
	exports.default = Station;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _collectionDoc = __webpack_require__(6);
	
	var _collectionDoc2 = _interopRequireDefault(_collectionDoc);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }
	
	/**
	 * Container class for all metadata pertaining to a user object from the NPR One API
	 *
	 * @extends {CollectionDoc}
	 */
	var User = function (_CollectionDoc) {
	  _inherits(User, _CollectionDoc);
	
	  /**
	   * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
	   */
	  function User(json) {
	    _classCallCheck(this, User);
	
	    /** @type {Object}
	     * @private */
	    var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));
	
	    _this._raw = json;
	    /** @type {UserAttributes} */
	    _this.attributes = {};
	    _this._hydrate();
	    return _this;
	  }
	
	  /**
	   * Hydrate the internal member variables.
	   *
	   * @private
	   */
	
	
	  User.prototype._hydrate = function _hydrate() {
	    this._validate();
	    this.attributes = this._raw.attributes;
	  };
	
	  /**
	   * Whether this user is a temporary user or not
	   *
	   * @returns {boolean}
	   */
	
	
	  User.prototype.isTemporary = function isTemporary() {
	    return parseInt(this.attributes.id, 10) >= 1000000000;
	  };
	
	  /**
	   * Returns the user's cohort. In most cases, SDK consumers will never need to use this.
	   *
	   * @returns {UserCohort}
	   */
	
	
	  User.prototype.getCohort = function getCohort() {
	    return this.attributes.cohort;
	  };
	
	  /**
	   * Returns the list of organizations this user is affiliated with. In most cases, you only want a single
	   * organization, in which case {@link User#getPrimaryOrganization} should be used.
	   *
	   * @returns {Array<UserOrganization>}
	   */
	
	
	  User.prototype.getOrganizations = function getOrganizations() {
	    return this.attributes.organizations || [];
	  };
	
	  /**
	   * Returns the primary, non-NPR organization that this user is affiliated with, or null if no such organization
	   * exists.
	   *
	   * @returns {null|UserOrganization}
	   */
	
	
	  User.prototype.getPrimaryOrganization = function getPrimaryOrganization() {
	    var orgs = this.getOrganizations();
	    return orgs[0] && orgs[0].id !== '1' ? orgs[0] : null;
	  };
	
	  /**
	   * Returns the programs, shows, and podcasts that this user has positively interacted with.
	   *
	   * @returns {Array<UserAffiliation>}
	   */
	
	
	  User.prototype.getAffiliations = function getAffiliations() {
	    return this.attributes.affiliations;
	  };
	
	  /**
	   * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
	   * In this case, we return the user's ID.
	   *
	   * @returns {string}
	   */
	
	
	  User.prototype.toString = function toString() {
	    return this.attributes.id;
	  };
	
	  /**
	   * @typedef {Object} UserAttributes
	   * @property {string} id Some unique identifier for the user
	   * @property {string} email The user's email address
	   * @property {string} firstName The user's first name
	   * @property {string} lastName The user's last name
	   * @property {UserCohort} cohort The user's cohort (an experimental grouping for User Experience A/B Testing)
	   * @property {Array<UserOrganization>} organizations User's chosen NPR Member Station(s)
	   * @property {Array<UserAffiliation>} affiliations Programs, shows, and podcasts that the user has positively interacted with
	   */
	  /**
	   * @typedef {Object} UserCohort
	   * @property {string} id A short ID for this cohort
	   * @property {string} name A text string identifying the cohort, useful for metrics
	   * @property {string} directory For internal use only; represents the current configuration file being used by the Listening Service
	   */
	  /**
	   * @typedef {Object} UserOrganization
	   * @property {string} id Some unique identifier for the organization
	   * @property {string} displayName A short displayable text field for the end user, strictly text
	   * @property {string} call Station call letters
	   * @property {string} city A short description of the station's main market city
	   * @property {string} [logo] Station logo image URL
	   * @property {string} [donationUrl] The URL to a website where users may make a donation to support the station
	   */
	  /**
	   * @typedef {Object} UserAffiliation
	   * @property {number} id A unique identifier for the aggregation (program)
	   * @property {string} [title] The display name of the aggregation (program)
	   * @property {string} href A link that can be followed to get content from this aggregation (program)
	   * @property {boolean} following Whether or not the user is following the aggregation. When changing affiliation status, the client is expected to toggle this value and then send the entire object back.
	   * @property {number} [rating] The user's average rating for this affiliation on a scale of 0-1. Absent if user never listened to the aggregation.
	   * @property {number} [daysSinceLastListen] The number of days since a user last listened to a story from this aggregation. Absent if user never listened to the aggregation.
	   */
	
	
	  return User;
	}(_collectionDoc2.default);
	
	exports.default = User;

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.default = createRecommendations;
	
	var _validator = __webpack_require__(4);
	
	var _validator2 = _interopRequireDefault(_validator);
	
	var _recommendation = __webpack_require__(17);
	
	var _recommendation2 = _interopRequireDefault(_recommendation);
	
	var _logger = __webpack_require__(1);
	
	var _logger2 = _interopRequireDefault(_logger);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/**
	 * Creates recommendation objects from collection doc ensuring that necessary
	 * properties are present
	 *
	 * @param {CollectionDocJSON} collectionDoc
	 * @returns {Array<Recommendation>}
	 * @throws {TypeError} if the collectionDoc passed in is not valid
	 */
	function createRecommendations(collectionDoc) {
	    _validator2.default.validateCollectionDoc(collectionDoc);
	
	    var recommendations = [];
	    collectionDoc.items.forEach(function (item) {
	        try {
	            recommendations.push(new _recommendation2.default(item));
	        } catch (e) {
	            _logger2.default.warn('Recommendation is invalid and has been excluded.', e);
	        }
	    });
	
	    return recommendations;
	}

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function _extendableBuiltin(cls) {
	  function ExtendableBuiltin() {
	    cls.apply(this, arguments);
	  }
	
	  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
	    constructor: {
	      value: cls,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	
	  if (Object.setPrototypeOf) {
	    Object.setPrototypeOf(ExtendableBuiltin, cls);
	  } else {
	    ExtendableBuiltin.__proto__ = cls;
	  }
	
	  return ExtendableBuiltin;
	}
	
	var ExtendableError = function (_extendableBuiltin2) {
	  _inherits(ExtendableError, _extendableBuiltin2);
	
	  function ExtendableError() {
	    var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	
	    _classCallCheck(this, ExtendableError);
	
	    // extending Error is weird and does not propagate `message`
	
	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ExtendableError).call(this, message));
	
	    Object.defineProperty(_this, 'message', {
	      configurable: true,
	      enumerable: false,
	      value: message,
	      writable: true
	    });
	
	    Object.defineProperty(_this, 'name', {
	      configurable: true,
	      enumerable: false,
	      value: _this.constructor.name,
	      writable: true
	    });
	
	    if (Error.hasOwnProperty('captureStackTrace')) {
	      Error.captureStackTrace(_this, _this.constructor);
	      return _possibleConstructorReturn(_this);
	    }
	
	    Object.defineProperty(_this, 'stack', {
	      configurable: true,
	      enumerable: false,
	      value: new Error(message).stack,
	      writable: true
	    });
	    return _this;
	  }
	
	  return ExtendableError;
	}(_extendableBuiltin(Error));
	
	exports.default = ExtendableError;
	module.exports = exports['default'];

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * js-logger - http://github.com/jonnyreeves/js-logger
	 * Jonny Reeves, http://jonnyreeves.co.uk/
	 * js-logger may be freely distributed under the MIT license.
	 */
	(function (global) {
		"use strict";
	
		// Top level module for the global, static logger instance.
		var Logger = { };
	
		// For those that are at home that are keeping score.
		Logger.VERSION = "1.3.0";
	
		// Function which handles all incoming log messages.
		var logHandler;
	
		// Map of ContextualLogger instances by name; used by Logger.get() to return the same named instance.
		var contextualLoggersByNameMap = {};
	
		// Polyfill for ES5's Function.bind.
		var bind = function(scope, func) {
			return function() {
				return func.apply(scope, arguments);
			};
		};
	
		// Super exciting object merger-matron 9000 adding another 100 bytes to your download.
		var merge = function () {
			var args = arguments, target = args[0], key, i;
			for (i = 1; i < args.length; i++) {
				for (key in args[i]) {
					if (!(key in target) && args[i].hasOwnProperty(key)) {
						target[key] = args[i][key];
					}
				}
			}
			return target;
		};
	
		// Helper to define a logging level object; helps with optimisation.
		var defineLogLevel = function(value, name) {
			return { value: value, name: name };
		};
	
		// Predefined logging levels.
		Logger.DEBUG = defineLogLevel(1, 'DEBUG');
		Logger.INFO = defineLogLevel(2, 'INFO');
		Logger.TIME = defineLogLevel(3, 'TIME');
		Logger.WARN = defineLogLevel(4, 'WARN');
		Logger.ERROR = defineLogLevel(8, 'ERROR');
		Logger.OFF = defineLogLevel(99, 'OFF');
	
		// Inner class which performs the bulk of the work; ContextualLogger instances can be configured independently
		// of each other.
		var ContextualLogger = function(defaultContext) {
			this.context = defaultContext;
			this.setLevel(defaultContext.filterLevel);
			this.log = this.info;  // Convenience alias.
		};
	
		ContextualLogger.prototype = {
			// Changes the current logging level for the logging instance.
			setLevel: function (newLevel) {
				// Ensure the supplied Level object looks valid.
				if (newLevel && "value" in newLevel) {
					this.context.filterLevel = newLevel;
				}
			},
	
			// Is the logger configured to output messages at the supplied level?
			enabledFor: function (lvl) {
				var filterLevel = this.context.filterLevel;
				return lvl.value >= filterLevel.value;
			},
	
			debug: function () {
				this.invoke(Logger.DEBUG, arguments);
			},
	
			info: function () {
				this.invoke(Logger.INFO, arguments);
			},
	
			warn: function () {
				this.invoke(Logger.WARN, arguments);
			},
	
			error: function () {
				this.invoke(Logger.ERROR, arguments);
			},
	
			time: function (label) {
				if (typeof label === 'string' && label.length > 0) {
					this.invoke(Logger.TIME, [ label, 'start' ]);
				}
			},
	
			timeEnd: function (label) {
				if (typeof label === 'string' && label.length > 0) {
					this.invoke(Logger.TIME, [ label, 'end' ]);
				}
			},
	
			// Invokes the logger callback if it's not being filtered.
			invoke: function (level, msgArgs) {
				if (logHandler && this.enabledFor(level)) {
					logHandler(msgArgs, merge({ level: level }, this.context));
				}
			}
		};
	
		// Protected instance which all calls to the to level `Logger` module will be routed through.
		var globalLogger = new ContextualLogger({ filterLevel: Logger.OFF });
	
		// Configure the global Logger instance.
		(function() {
			// Shortcut for optimisers.
			var L = Logger;
	
			L.enabledFor = bind(globalLogger, globalLogger.enabledFor);
			L.debug = bind(globalLogger, globalLogger.debug);
			L.time = bind(globalLogger, globalLogger.time);
			L.timeEnd = bind(globalLogger, globalLogger.timeEnd);
			L.info = bind(globalLogger, globalLogger.info);
			L.warn = bind(globalLogger, globalLogger.warn);
			L.error = bind(globalLogger, globalLogger.error);
	
			// Don't forget the convenience alias!
			L.log = L.info;
		}());
	
		// Set the global logging handler.  The supplied function should expect two arguments, the first being an arguments
		// object with the supplied log messages and the second being a context object which contains a hash of stateful
		// parameters which the logging function can consume.
		Logger.setHandler = function (func) {
			logHandler = func;
		};
	
		// Sets the global logging filter level which applies to *all* previously registered, and future Logger instances.
		// (note that named loggers (retrieved via `Logger.get`) can be configured independently if required).
		Logger.setLevel = function(level) {
			// Set the globalLogger's level.
			globalLogger.setLevel(level);
	
			// Apply this level to all registered contextual loggers.
			for (var key in contextualLoggersByNameMap) {
				if (contextualLoggersByNameMap.hasOwnProperty(key)) {
					contextualLoggersByNameMap[key].setLevel(level);
				}
			}
		};
	
		// Retrieve a ContextualLogger instance.  Note that named loggers automatically inherit the global logger's level,
		// default context and log handler.
		Logger.get = function (name) {
			// All logger instances are cached so they can be configured ahead of use.
			return contextualLoggersByNameMap[name] ||
				(contextualLoggersByNameMap[name] = new ContextualLogger(merge({ name: name }, globalLogger.context)));
		};
	
		// CreateDefaultHandler returns a handler function which can be passed to `Logger.setHandler()` which will
		// write to the window's console object (if present); the optional options object can be used to customise the
		// formatter used to format each log message.
		Logger.createDefaultHandler = function (options) {
			options = options || {};
	
			options.formatter = options.formatter || function defaultMessageFormatter(messages, context) {
				// Prepend the logger's name to the log message for easy identification.
				if (context.name) {
					messages.unshift("[" + context.name + "]");
				}
			};
	
			// Map of timestamps by timer labels used to track `#time` and `#timeEnd()` invocations in environments
			// that don't offer a native console method.
			var timerStartTimeByLabelMap = {};
	
			// Support for IE8+ (and other, slightly more sane environments)
			var invokeConsoleMethod = function (hdlr, messages) {
				Function.prototype.apply.call(hdlr, console, messages);
			};
	
			// Check for the presence of a logger.
			if (typeof console === "undefined") {
				return function () { /* no console */ };
			}
	
			return function(messages, context) {
				// Convert arguments object to Array.
				messages = Array.prototype.slice.call(messages);
	
				var hdlr = console.log;
				var timerLabel;
	
				if (context.level === Logger.TIME) {
					timerLabel = (context.name ? '[' + context.name + '] ' : '') + messages[0];
	
					if (messages[1] === 'start') {
						if (console.time) {
							console.time(timerLabel);
						}
						else {
							timerStartTimeByLabelMap[timerLabel] = new Date().getTime();
						}
					}
					else {
						if (console.timeEnd) {
							console.timeEnd(timerLabel);
						}
						else {
							invokeConsoleMethod(hdlr, [ timerLabel + ': ' +
								(new Date().getTime() - timerStartTimeByLabelMap[timerLabel]) + 'ms' ]);
						}
					}
				}
				else {
					// Delegate through to custom warn/error loggers if present on the console.
					if (context.level === Logger.WARN && console.warn) {
						hdlr = console.warn;
					} else if (context.level === Logger.ERROR && console.error) {
						hdlr = console.error;
					} else if (context.level === Logger.INFO && console.info) {
						hdlr = console.info;
					}
	
					options.formatter(messages, context);
					invokeConsoleMethod(hdlr, messages);
				}
			};
		};
	
		// Configure and example a Default implementation which writes to the `window.console` (if present).  The
		// `options` hash can be used to configure the default logLevel and provide a custom message formatter.
		Logger.useDefaults = function(options) {
			Logger.setLevel(options && options.defaultLevel || Logger.DEBUG);
			Logger.setHandler(Logger.createDefaultHandler(options));
		};
	
		// Export to popular environments boilerplate.
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (Logger), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
		else if (typeof module !== 'undefined' && module.exports) {
			module.exports = Logger;
		}
		else {
			Logger._prevLogger = global.Logger;
	
			Logger.noConflict = function () {
				global.Logger = Logger._prevLogger;
				return Logger;
			};
	
			global.Logger = Logger;
		}
	}(this));


/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';
	
	var has = Object.prototype.hasOwnProperty;
	
	/**
	 * Simple query string parser.
	 *
	 * @param {String} query The query string that needs to be parsed.
	 * @returns {Object}
	 * @api public
	 */
	function querystring(query) {
	  var parser = /([^=?&]+)=?([^&]*)/g
	    , result = {}
	    , part;
	
	  //
	  // Little nifty parsing hack, leverage the fact that RegExp.exec increments
	  // the lastIndex property so we can continue executing this loop until we've
	  // parsed all results.
	  //
	  for (;
	    part = parser.exec(query);
	    result[decodeURIComponent(part[1])] = decodeURIComponent(part[2])
	  );
	
	  return result;
	}
	
	/**
	 * Transform a query string to an object.
	 *
	 * @param {Object} obj Object that should be transformed.
	 * @param {String} prefix Optional prefix.
	 * @returns {String}
	 * @api public
	 */
	function querystringify(obj, prefix) {
	  prefix = prefix || '';
	
	  var pairs = [];
	
	  //
	  // Optionally prefix with a '?' if needed
	  //
	  if ('string' !== typeof prefix) prefix = '?';
	
	  for (var key in obj) {
	    if (has.call(obj, key)) {
	      pairs.push(encodeURIComponent(key) +'='+ encodeURIComponent(obj[key]));
	    }
	  }
	
	  return pairs.length ? prefix + pairs.join('&') : '';
	}
	
	//
	// Expose the module.
	//
	exports.stringify = querystringify;
	exports.parse = querystring;


/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Check if we're required to add a port number.
	 *
	 * @see https://url.spec.whatwg.org/#default-port
	 * @param {Number|String} port Port number we need to check
	 * @param {String} protocol Protocol we need to check against.
	 * @returns {Boolean} Is it a default port for the given protocol
	 * @api private
	 */
	module.exports = function required(port, protocol) {
	  protocol = protocol.split(':')[0];
	  port = +port;
	
	  if (!port) return false;
	
	  switch (protocol) {
	    case 'http':
	    case 'ws':
	    return port !== 80;
	
	    case 'https':
	    case 'wss':
	    return port !== 443;
	
	    case 'ftp':
	    return port !== 21;
	
	    case 'gopher':
	    return port !== 70;
	
	    case 'file':
	    return false;
	  }
	
	  return port !== 0;
	};


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	/**
	 * These properties should not be copied or inherited from. This is only needed
	 * for all non blob URL's as the a blob URL does not include a hash, only the
	 * origin.
	 *
	 * @type {Object}
	 * @private
	 */
	var ignore = { hash: 1, query: 1 }
	  , URL;
	
	/**
	 * The location object differs when your code is loaded through a normal page,
	 * Worker or through a worker using a blob. And with the blobble begins the
	 * trouble as the location object will contain the URL of the blob, not the
	 * location of the page where our code is loaded in. The actual origin is
	 * encoded in the `pathname` so we can thankfully generate a good "default"
	 * location from it so we can generate proper relative URL's again.
	 *
	 * @param {Object} loc Optional default location object.
	 * @returns {Object} lolcation object.
	 * @api public
	 */
	module.exports = function lolcation(loc) {
	  loc = loc || global.location || {};
	  URL = URL || __webpack_require__(12);
	
	  var finaldestination = {}
	    , type = typeof loc
	    , key;
	
	  if ('blob:' === loc.protocol) {
	    finaldestination = new URL(unescape(loc.pathname), {});
	  } else if ('string' === type) {
	    finaldestination = new URL(loc, {});
	    for (key in ignore) delete finaldestination[key];
	  } else if ('object' === type) for (key in loc) {
	    if (key in ignore) continue;
	    finaldestination[key] = loc[key];
	  }
	
	  return finaldestination;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 26 */
/***/ function(module, exports) {

	(function(self) {
	  'use strict';
	
	  if (self.fetch) {
	    return
	  }
	
	  var support = {
	    searchParams: 'URLSearchParams' in self,
	    iterable: 'Symbol' in self && 'iterator' in Symbol,
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob()
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }
	
	  // Build a destructive iterator for the value list
	  function iteratorFor(items) {
	    var iterator = {
	      next: function() {
	        var value = items.shift()
	        return {done: value === undefined, value: value}
	      }
	    }
	
	    if (support.iterable) {
	      iterator[Symbol.iterator] = function() {
	        return iterator
	      }
	    }
	
	    return iterator
	  }
	
	  function Headers(headers) {
	    this.map = {}
	
	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)
	
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }
	
	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }
	
	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }
	
	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }
	
	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }
	
	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }
	
	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }
	
	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }
	
	  Headers.prototype.keys = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push(name) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.values = function() {
	    var items = []
	    this.forEach(function(value) { items.push(value) })
	    return iteratorFor(items)
	  }
	
	  Headers.prototype.entries = function() {
	    var items = []
	    this.forEach(function(value, name) { items.push([name, value]) })
	    return iteratorFor(items)
	  }
	
	  if (support.iterable) {
	    Headers.prototype[Symbol.iterator] = Headers.prototype.entries
	  }
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }
	
	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }
	
	  function Body() {
	    this.bodyUsed = false
	
	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	        this._bodyText = body.toString()
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }
	
	      if (!this.headers.get('content-type')) {
	        if (typeof body === 'string') {
	          this.headers.set('content-type', 'text/plain;charset=UTF-8')
	        } else if (this._bodyBlob && this._bodyBlob.type) {
	          this.headers.set('content-type', this._bodyBlob.type)
	        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
	          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
	        }
	      }
	    }
	
	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }
	
	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	
	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }
	
	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }
	
	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }
	
	    return this
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }
	
	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }
	
	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }
	
	  Request.prototype.clone = function() {
	    return new Request(this)
	  }
	
	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }
	
	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = (xhr.getAllResponseHeaders() || '').trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }
	
	  Body.call(Request.prototype)
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }
	
	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	    this._initBody(bodyInit)
	  }
	
	  Body.call(Response.prototype)
	
	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }
	
	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }
	
	  var redirectStatuses = [301, 302, 303, 307, 308]
	
	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }
	
	    return new Response(null, {status: status, headers: {location: url}})
	  }
	
	  self.Headers = Headers
	  self.Request = Request
	  self.Response = Response
	
	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }
	
	      var xhr = new XMLHttpRequest()
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }
	
	        return
	      }
	
	      xhr.onload = function() {
	        var options = {
	          status: xhr.status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText
	        resolve(new Response(body, options))
	      }
	
	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.ontimeout = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.open(request.method, request.url, true)
	
	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }
	
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})(typeof self !== 'undefined' ? self : this);


/***/ }
/******/ ])
});
;
//# sourceMappingURL=npr-one-sdk.js.map