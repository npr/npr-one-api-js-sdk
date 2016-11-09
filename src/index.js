import 'isomorphic-fetch';
import Action from './model/action';
import Logger from './util/logger';
import Authorization from './controller/authorization';
import Listening from './controller/listening';
import Identity from './controller/identity';
import StationFinder from './controller/station-finder';

Logger.setLevel(Logger.WARN);

/**
 * This SDK attempts to abstract away most of the interaction with the NPR One API.
 * In general, a consumer of this API should be primarily concerned with asking for
 * recommendations and recording user actions against those recommendations.
 */
export default class NprOneSDK
{
    /**
     * Instantiates the NPR One SDK.
     */
    constructor() {
        /** @type {null|Function} A callback that gets triggered whenever the access token has changed
         * @private */
        this._accessTokenChangedCallback = null;
        /** @type {Authorization}
         * @private */
        this._authorization = new Authorization();
        /** @type {Listening}
         * @private */
        this._listening = new Listening();
        /** @type {Identity}
         * @private */
        this._identity = new Identity();
        /** @type {StationFinder}
         * @private */
        this._stationfinder = new StationFinder();

        // setup the default config
        NprOneSDK.config; // eslint-disable-line
    }

    /**
     * @typedef {Object} Config
     * @property {string} [apiBaseUrl='https://api.npr.org'] The NPR One API hostname and protocol, typically `https://api.npr.org`; in most cases, this does not need to be manually set by clients
     * @property {string} [apiVersion='v2'] The NPR One API version, typically `v2`; in most cases, this does not need to be manually set by clients
     * @property {string} [authProxyBaseUrl] The full URL to your OAuth proxy, e.g. `http://one.example.com/oauth2/`
     * @property {string} [newDeviceCodePath='/device'] The path to your proxy for starting a `device_code` grant (relative to `authProxyBaseUrl`)
     * @property {string} [pollDeviceCodePath='/device/poll'] The path to your proxy for polling a `device_code` grant (relative to `authProxyBaseUrl`)
     * @property {string} [refreshTokenPath='/refresh'] The path to your proxy for the `refresh_token` grant (relative to `authProxyBaseUrl`)
     * @property {string} [tempUserPath='/temporary'] The path to your proxy for the `temporary_user` grant (relative to `authProxyBaseUrl`), not available to third-party clients
     * @property {string} [logoutPath='/logout'] The path to your proxy for the `POST /authorization/v2/token/revoke` endpoint (relative to `authProxyBaseUrl`)
     * @property {string} [accessToken] The access token to use if not using the auth proxy
     * @property {string} [clientId] The NPR One API `client_id` to use, only required if using the auth proxy with the `temporary_user` grant type
     * @property {string} [advertisingId] The custom X-Advertising-ID header to send with most requests, not typically used by third-party clients
     * @property {string} [advertisingTarget] The custom X-Advertising-Target header to send with most requests, not typically used by third-party clients
     */
    /**
     * @type {Config}
     */
    static get config() {
        if (!NprOneSDK._config) {
            NprOneSDK._config = {
                apiBaseUrl: 'https://api.npr.org',
                apiVersion: 'v2',
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
            };
        }

        /** @type {Config} */
        return NprOneSDK._config;
    }

    /**
     * Updates private `_config` member attributes but does not overwrite entire `_config` object
     *
     * @type {Config}
     */
    static set config(value) {
        if (!NprOneSDK._config) {
            NprOneSDK.config; // eslint-disable-line
        }
        Object.assign(NprOneSDK._config, value);
    }

    /** @type {string} */
    static get accessToken() {
        return NprOneSDK.config.accessToken;
    }

    /** @type {string} */
    static set accessToken(token) {
        if (typeof token !== 'string') {
            throw new TypeError('Value for accessToken must be a string');
        }

        const oldToken = NprOneSDK.accessToken;
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
    static set onAccessTokenChanged(callback) {
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
    static get Action() {
        return Action;
    }

    /**
     * Exposes the Logger class for clients to adjust logging if desired
     *
     * @type {src/util/logger.js~Logger}
     */
    static get Logger() {
        return Logger;
    }

    /* Authorization */

    /**
     * See {@link Authorization.refreshExistingAccessToken} for description.
     *
     * @param {number} [numRetries=0]   The number of times this function has been tried. Will retry up to 3 times.
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
     */
    static refreshExistingAccessToken(numRetries = 0) {
        return Authorization.refreshExistingAccessToken(numRetries);
    }

    /**
     * See {@link Authorization#logout} for description.
     *
     * @returns {Promise}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */
    logout() {
        return this._authorization.logout();
    }

    /**
     * See {@link Authorization#getDeviceCode} for description.
     *
     * @param {Array<string>} [scopes=[]]   The scopes (as strings) that should be associated with the resulting access token
     * @returns {Promise<DeviceCode>}
     * @throws {TypeError} if an OAuth proxy is not configured
     */
    getDeviceCode(scopes = []) {
        return this._authorization.getDeviceCode(scopes);
    }

    /**
     * See {@link Authorization#pollDeviceCode} for description.
     *
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
     */
    pollDeviceCode() {
        return this._authorization.pollDeviceCode();
    }

    /* Listening */

    /**
     * See {@link Listening#getRecommendation} for description.
     *
     * @param {string} [uid='']           Optional; a UID for a specific recommendation to play. In 99% of use cases, this is not needed.
     * @param {string} [channel='npr']    Optional; a channel to pull the recommendation from; the main flow channel of `npr` is used as the default. In 99% of use cases, this does not need to be changed.
     * @returns {Promise<Recommendation>}
     */
    getRecommendation(uid = '', channel = 'npr') {
        return this._listening.getRecommendation(uid, channel);
    }

    /**
     * See {@link Listening#resumeFlowFromRecommendation} for description.
     *
     * @param {Object} json JSON object representation of a recommendation
     * @returns {Recommendation}
     */
    resumeFlowFromRecommendation(json) {
        return this._listening.resumeFlowFromRecommendation(json);
    }

    /**
     * See {@link Listening#getUpcomingFlowRecommendations} for description.
     *
     * @experimental
     * @param {string} [channel='npr']   A channel to pull the next recommendation from
     * @returns {Promise<Array<Recommendation>>}
     */
    getUpcomingFlowRecommendations(channel = 'npr') {
        return this._listening.getUpcomingFlowRecommendations(channel);
    }

    /**
     * See {@link Listening#getRecommendationsFromChannel} for description.
     *
     * @param {string} [channel='recommended']   A non-flow (i.e. non-`npr`) channel to retrieve a list of recommendations from
     * @returns {Promise<Array<Recommendation>>}
     */
    getRecommendationsFromChannel(channel = 'recommended') {
        return this._listening.getRecommendationsFromChannel(channel);
    }

    /**
     * See {@link Listening#queueRecommendationFromChannel} for description.
     *
     * @param {string} channel   The channel used in the original call to `getRecommendationsFromChannel()`
     * @param {string} uid       The unique ID of the item to queue up for the user
     * @returns {Recommendation}
     * @throws {TypeError} If no valid channel or UID is passed in
     * @throws {Error} If no recommendations for this channel were previously cached, or if the UID was not found in that cached list
     */
    queueRecommendationFromChannel(channel, uid) {
        return this._listening.queueRecommendationFromChannel(channel, uid);
    }

    /**
     * See {@link Listening#getHistory} for description.
     *
     * @returns {Promise<Array<Recommendation>>}
     */
    getHistory() {
        return this._listening.getHistory();
    }

    /**
     * See {@link Listening#resetFlow} for description.
     *
     * @returns {Promise}
     */
    resetFlow() {
        return this._listening.resetFlow();
    }

    /* Identity */

    /**
     * See {@link Identity#getUser} for description.
     *
     * @returns {Promise<User>}
     */
    getUser() {
        return this._identity.getUser();
    }

    /**
     * See {@link Identity#setUserStation} for description.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     */
    setUserStation(stationId) {
        return this._identity.setUserStation(stationId);
    }

    /**
     * See {@link Identity#followShow} for description.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    followShow(aggregationId) {
        return this._identity.followShow(aggregationId);
    }

    /**
     * See {@link Identity#unfollowShow} for description.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    unfollowShow(aggregationId) {
        return this._identity.unfollowShow(aggregationId);
    }

    /**
     * See {@link Identity#createTemporaryUser} for description.
     *
     * @returns {Promise<User>}
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */
    createTemporaryUser() {
        return this._identity.createTemporaryUser();
    }

    /* Station Finder */

    /**
     * See {@link StationFinder#searchStations} for description.
     *
     * @param {null|string} [query]   An optional query, which can be a station name, network name, or zip code
     * @returns {Promise<Array<Station>>}
     */
    searchStations(query = null) {
        return this._stationfinder.searchStations(query);
    }

    /**
     * See {@link StationFinder#searchStationsByLatLongCoordinates} for description.
     *
     * @param {number} lat    A float representing the latitude value of the geographic coordinates
     * @param {number} long   A float representing the longitude value of the geographic coordinates
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByLatLongCoordinates(lat, long) {
        return this._stationfinder.searchStationsByLatLongCoordinates(lat, long);
    }

    /**
     * See {@link StationFinder#searchStationsByCityAndState} for description.
     *
     * @param {string} city     A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCityAndState(city, state) {
        return this._stationfinder.searchStationsByCityAndState(city, state);
    }

    /**
     * See {@link StationFinder#searchStationsByCity} for description.
     *
     * @param {string} city   A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCity(city) {
        return this._stationfinder.searchStationsByCity(city);
    }

    /**
     * See {@link StationFinder#searchStationsByState} for description.
     *
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByState(state) {
        return this._stationfinder.searchStationsByState(state);
    }

    /**
     * See {@link StationFinder#getStationDetails} for description.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<Station>}
     */
    getStationDetails(stationId) {
        return this._stationfinder.getStationDetails(stationId);
    }

    /**
     * Returns the foundational path for a given service
     *
     * @param {string} service
     * @returns {string}
     */
    static getServiceUrl(service) {
        // @TODO we need to figure out a better long-term solution for the individually-versioned services
        if (service === 'stationfinder') {
            return `${NprOneSDK.config.apiBaseUrl}/${service}/v3`;
        }
        return `${NprOneSDK.config.apiBaseUrl}/${service}/${NprOneSDK.config.apiVersion}`;
    }
}

/**
 * @external {Response} https://developer.mozilla.org/en-US/docs/Web/API/Response
 */
/**
 * @external {Headers} https://developer.mozilla.org/en-US/docs/Web/API/Headers
 */
/**
 * @external {JsLogger} https://github.com/jonnyreeves/js-logger
 */
