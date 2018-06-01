import 'isomorphic-fetch';

import { Actions } from './constants/actions';
import * as Authorization from './controllers/authorization';
import * as Listening from './controllers/listening';
import * as Identity from './controllers/identity';
import * as StationFinder from './controllers/station-finder';
import { AccessToken } from './models/access-token';
import { CollectionDocJSON } from './models/collection-doc';
import { Config } from './models/config';
import { DeviceCode } from './models/device-code';
import { Recommendation } from './models/recommendation';
import { Station } from './models/station';
import { User } from './models/user';
import { Logger } from './utils/logger';

export * from './constants';
export * from './errors';
export * from './models';

Logger.setLevel(Logger.WARN);

/**
 * This SDK attempts to abstract away most of the interaction with the NPR One API.
 * In general, a consumer of this API should be primarily concerned with asking for
 * recommendations and recording user actions against those recommendations.
 */
export class NprOneSDK {
    private static _config: Config;

    /** A callback that gets triggered whenever the access token has changed */
    private static _accessTokenChangedCallback: Function | null;
    private _authorization: Authorization;
    private _listening: Listening;

    /**
     * Instantiates the NPR One SDK.
     */
    constructor() {
        this._authorization = new Authorization();
        this._listening = new Listening();

        NprOneSDK._accessTokenChangedCallback = null;
        // setup the default config
        NprOneSDK.initConfig();
    }

    static get config(): Config {
        NprOneSDK.initConfig();
        return NprOneSDK._config;
    }

    /**
     * Updates private `_config` member attributes but does not overwrite entire `_config` object
     */
    static set config(value: Config) {
        if (value.apiBaseUrl) {
            Logger.warn('Property "apiBaseUrl" in config is deprecated and will be removed in a future release. '
                + 'Please use the "subdomain" property instead if a different API URL is needed.');
        }
        if (value.apiVersion) {
            Logger.warn('Property "apiVersion" in config is deprecated and will be removed in a future release.');
        }

        NprOneSDK.initConfig();
        Object.assign(NprOneSDK._config, value);
    }

    get config(): Config {
        return NprOneSDK.config;
    }

    static get accessToken(): string | undefined {
        return NprOneSDK.config.accessToken;
    }

    static set accessToken(token: string | undefined) {
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
     * @throws {TypeError} if the passed-in value isn't a function
     */
    static set onAccessTokenChanged(callback: Function) {
        if (typeof callback !== 'function') {
            throw new TypeError('Value for onAccessTokenChanged must be a function');
        }
        NprOneSDK._accessTokenChangedCallback = callback;
    }

    /**
     * Exposes the Action class for clients to record actions
     */
    static get Action() {
        return Actions;
    }

    /**
     * Exposes the Logger class for clients to adjust logging if desired
     */
    static get Logger(): Logger {
        return Logger;
    }

    /* Authorization */

    /**
     * See {@link Authorization.refreshExistingAccessToken} for description.
     *
     * @param numRetries - The number of times this function has been tried. Will retry up to 3 times.
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
     */
    static refreshExistingAccessToken(numRetries: number = 0): Promise<AccessToken> {
        return Authorization.refreshExistingAccessToken(numRetries);
    }

    /**
     * See {@link Authorization#createTemporaryUser} for description.
     *
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */
    async createTemporaryUser(): Promise<User> {
        return this._authorization.createTemporaryUser();
    }

    /**
     * See {@link Authorization#logout} for description.
     *
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */
    async logout(): Promise<void> {
        return this._authorization.logout();
    }

    /**
     * See {@link Authorization#getDeviceCode} for description.
     *
     * @param scopes - The scopes (as strings) that should be associated with the resulting access token
     * @throws {TypeError} if an OAuth proxy is not configured
     */
    async getDeviceCode(scopes: string[] = []): Promise<DeviceCode> {
        return this._authorization.getDeviceCode(scopes);
    }

    /**
     * See {@link Authorization#pollDeviceCode} for description.
     *
     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
     */
    async pollDeviceCode(): Promise<AccessToken> {
        return this._authorization.pollDeviceCode();
    }

    /* Listening */

    /**
     * See {@link Listening#getRecommendation} for description.
     *
     * @param uid - Optional; a UID for a specific recommendation to play. In 99% of use cases, this is not needed.
     * @param channel - Optional; a channel to pull the recommendation from; the main flow channel of `npr` is used as the default.
     *                  In 99% of use cases, this does not need to be changed.
     */
    async getRecommendation(uid: string = '', channel: string = 'npr'): Promise<Recommendation> {
        return this._listening.getRecommendation(uid, channel);
    }

    /**
     * See {@link Listening#resumeFlowFromRecommendation} for description.
     *
     * @param json - JSON object representation of a recommendation
     */
    resumeFlowFromRecommendation(json: Object): Recommendation {
        return this._listening.resumeFlowFromRecommendation(json);
    }

    /**
     * See {@link Listening#getUpcomingFlowRecommendations} for description.
     *
     * @experimental
     * @param channel - A channel to pull the next recommendation from
     */
    async getUpcomingFlowRecommendations(channel: string = 'npr'): Promise<Recommendation[]> {
        return this._listening.getUpcomingFlowRecommendations(channel);
    }

    /**
     * See {@link Listening#getRecommendationsFromChannel} for description.
     *
     * @param channel - A non-flow (i.e. non-`npr`) channel to retrieve a list of recommendations from
     */
    async getRecommendationsFromChannel(channel: string = 'recommended'): Promise<Recommendation[]> {
        return this._listening.getRecommendationsFromChannel(channel);
    }

    /**
     * See {@link Listening#queueRecommendationFromChannel} for description.
     *
     * @param channel   The channel used in the original call to `getRecommendationsFromChannel()`
     * @param uid       The unique ID of the item to queue up for the user
     * @throws {TypeError} If no valid channel or UID is passed in
     * @throws {Error} If no recommendations for this channel were previously cached, or if the UID was not found in that cached list
     */
    queueRecommendationFromChannel(channel: string, uid: string): Recommendation {
        return this._listening.queueRecommendationFromChannel(channel, uid);
    }

    /**
     * See {@link Listening#getHistory} for description.
     */
    async getHistory(): Promise<Recommendation[]> {
        return this._listening.getHistory();
    }

    /**
     * See {@link Listening#resetFlow} for description.
     */
    async resetFlow(): Promise<void> {
        return this._listening.resetFlow();
    }

    /* Identity */

    /**
     * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
     * station.
     */
    async getUser(): Promise<User> {
        return Identity.getUser(this.config);
    }

    /**
     * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
     * ID actually exists, and will return a promise that rejects if not.
     *
     * @param stationId - The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     */
    async setUserStation(stationId: number | string): Promise<User> {
        return Identity.setUserStation(this.config, stationId);
    }

    /**
     * Indicates that the user wishes to follow, or subscribe to, the show, program, or podcast with the given numeric
     * ID. Followed shows will appear more frequently in a user's list of recommendations.
     *
     * Note that at this time, because we have not yet implemented search in this SDK, there is no way to retrieve a list
     * of aggregation (show) IDs through this SDK. You can either add functionality to your own app that makes an API call
     * to `GET https://api.npr.org/listening/v2/search/recommendations` with a program name or other search parameters, or
     * wait until we implement search in this SDK (hopefully later this year).
     *
     * @param aggregationId - The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     *
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    async followShow(aggregationId: number | string): Promise<User> {
        return Identity.followShow(this.config, aggregationId);
    }

    /**
     * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
     * numeric ID. See {@link followShow} for more information.
     *
     * @param aggregationId - The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     *
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    async unfollowShow(aggregationId: number | string): Promise<User> {
        return Identity.unfollowShow(this.config, aggregationId);
    }

    /* Station Finder */

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
     * @param query - An optional query, which can be a station name, network name, or zip code
     */
    async searchStations(query?: string): Promise<Station[]> {
        return StationFinder.searchStations(this.config, query);
    }

    /**
     * Performs a geographic search of all NPR One stations using a passed-in pair of lat-long coordinates. In most
     * cases, this means you will need to first use the
     * [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
     * or a similar library in order to obtain the lat-long coordinates for the end-user's location.
     *
     * Note that {@link searchStations} without a query will already produce a list of stations closest to the user _if_
     * this code is being run in a client-side environment and/or the IP address of the device making the calls to this
     * SDK has the same geographic location as the end-user. For that reason, `searchStationsByLatLongCoordinates()`
     * is really only needed if this SDK is being run in a server-side environment.
     *
     * @param lat - A float representing the latitude value of the geographic coordinates
     * @param long - A float representing the longitude value of the geographic coordinates
     */
    async searchStationsByLatLongCoordinates(lat: number, long: number): Promise<Station[]> {
        return StationFinder.searchStationsByLatLongCoordinates(this.config, lat, long);
    }

    /**
     * Performs a geographic search of all NPR One stations using a city name and state. While you _can_ pass in a city
     * _or_ state to {@link searchStations} as the query, `searchStationsByCityAndState()` will return more accurate
     * results and is the recommended function for clients wanting to offer a location search.
     *
     * @param city - A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @param state - A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     */
    async searchStationsByCityAndState(city: string, state: string): Promise<Station[]> {
        return StationFinder.searchStationsByCityAndState(this.config, city, state);
    }

    /**
     * Performs a geographic search of all NPR One stations using a city name only. It is generally recommended that you
     * use {@link searchStationsByCityAndState} instead, as it will return more accurate results and is the recommended
     * function for clients wanting to offer a location search.
     *
     * @param city - A full city name (e.g. "New York", "San Francisco", "Phoenix")
     */
    async searchStationsByCity(city: string): Promise<Station[]> {
        return StationFinder.searchStationsByCity(this.config, city);
    }

    /**
     * Performs a geographic search of all NPR One stations using a state name or abbreviation only. It is generally
     * recommended that you use {@link searchStationsByCityAndState} instead, as it will return more accurate results
     * and is the recommended function for clients wanting to offer a location search.
     *
     * @param state - A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     */
    async searchStationsByState(state: string): Promise<Station[]> {
        return StationFinder.searchStationsByState(this.config, state);
    }

    /**
     * Returns a {@link Station} model for the station with the given ID.
     *
     * @param stationId - The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     */
    async getStationDetails(stationId: number | string): Promise<Station> {
        return StationFinder.getStationDetails(this.config, stationId);
    }

    /**
     * Initializes the config using default settings.
     */
    private static initConfig(): void {
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
                subdomain: '',
            };
        }
    }
}
export default NprOneSDK;
