/**
 * A thin wrapper around the raw JSON returned from the authorization server to represent an access token
 */
export interface AccessToken {
    /**
     * Ensure that the given access token model is valid
     *
     * @throws {TypeError} if access token model is invalid
     */
    validate(): void;

    /**
     * Returns whether or not this access token has expired.
     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
     *
     * @returns {boolean}
     */
    isExpired(): boolean;

    /** The access token itself (40-character alphanumeric string) */
    token: string;

    /**
     * Returns the TTL (in milliseconds) until this access token expires. If you are using an auth proxy and have
     * correctly configured the `refreshTokenUrl`, this SDK will automatically refresh expired access tokens for you,
     * so consumers typically do not need to worry about whether or not a token is expired or about to expire.
     */
    ttl: number;

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return only the `access_token` itself, since the rest of the object is typically not useful.
     *
     * @returns {string}
     */
    toString(): string;
}


/**
 * Actions that can be recorded for recommendations.
 * For more detail on user rating actions, see our narrative [Listening Service documentation](http://dev.npr.org/guide/services/listening/#Ratings)
 */
export class Action {
    static COMPLETED: string;

    static PASS: string;

    static SHARE: string;

    static SKIP: string;

    static SRCHCOMPL: string;

    static SRCHSTART: string;

    static START: string;

    static THUMBUP: string;

    static TIMEOUT: string;

    static TAPTHRU: string;

    /**
     * Actions which indicate the recommendation is no longer being presented to the user
     *
     * @returns {Array<string>}
     */
    static getEndActions(): Array<string>;

    /**
     * Actions which should result in the flow advancing
     *
     * @returns {Array<string>}
     */
    static getFlowAdvancingActions(): Array<string>;

    /**
     * Returns whether a given action is valid or not
     *
     * @param {string} action
     * @returns {boolean}
     */
    static isValidAction(action: string): boolean;
}


/**
 * A thin wrapper around the raw JSON returned from the authorization server to represent a device code/user code pair
 */
export interface DeviceCode {
    /**
     * Ensure that the given device code model is valid
     *
     * @throws {TypeError} if device code model is invalid
     */
    validate(): void;

    /**
     * Returns whether or not this device code/user code pair has expired.
     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
     *
     * @returns {boolean}
     */
    isExpired(): boolean;

    /** The user code (8-character alphanumeric string) */
    userCode: string;

    /** The verification URL (the place where the user should go on their mobile device or laptop to log in) */
    verificationUri: string;

    /**
     * Returns the TTL (in milliseconds) until this device code/user code pair expires. The SDK will automatically generate
     * a new key pair upon expiry, so consumers of the SDK will generally not have to use this value directly; however,
     * you may opt to display on the screen how much time the user has left to log in before a new code is generated.
     */
    ttl: number;

    /**
     * Returns the interval (in milliseconds) at which the client (in this case the SDK) should poll the `POST /token`
     * endpoint (or the OAuth proxy that lies in between). Consumers of the SDK should generally not have to use this
     * value directly.
     */
    interval: number;

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the raw JSON string representing the entire object.
     *
     * @returns {string}
     */
    toString(): string;
}


interface RecommendationAttributes {
    /** The type of recommendation, usually `audio`. Can also be `stationId`, `sponsorship`, etc. */
        type: string;

    /** The universal identifier of the recommendation */
    uid: string;

    /** The title of the recommendation */
    title: string;

    /** Whether or not the recommendation is skippable, usually true, but false for e.g. sponsorship */
    skippable: boolean;

    /** A slug or category for the recommendation */
    slug?: string;

    /** The provider of the story, usually `NPR`. Can also be a member station or third-party podcast provider. */
    provider: string;

    /** The program as part of which this recommendation aired */
    program?: string;

    /** The duration of the audio according to the API; note that the actual duration can differ */
    duration: number;

    /** ISO-8601 formatted date/time; the date at which the story was first published */
    date: string;

    /** A short description of the recommendation */
    description?: string;

    /** The reason for recommending this piece to the listener */
    rationale: string;

    /** The text to display in a clickable button on a feature card */
    button?: string;
}


interface Link {
    /** The URI that represents the resource */
    href: string;

    /** The MIME-type of the resource */
        'content-type'?: string;
}


interface FormFactorLink extends Link {
    /** The form-factor for the most appropriate display of or interaction with the resource, usually irrelevant unless there is more than one link of the same type */
        'form-factor'?: string;
}


interface ImageLink extends FormFactorLink {
    /** The relation of the image to the content, which usually corresponds to the crop-type */
    rel?: string;

    /** The pixel height of the image */
    height?: number;

    /** The pixel width of the image */
    width?: number;
}


/**
 * Container class for all metadata pertaining to a recommendation.
 *
 * Provides metadata and the recordAction method, which sends feedback on user actions to NPR's APIs and advances the flow of audio recommendations to the user
 */
export interface Recommendation {
    /** The metadata used to describe this recommendation, such as type and title */
    attributes: RecommendationAttributes;

    /** The actual audio files associated with this recommendation; should never be empty */
    audio: Array<Link>;

    /** A list of images associated with this recommendation; could be empty */
    images: Array<ImageLink>;

    /** A list of links to other places where this story can be found on the web (for example, on NPR.org); could be empty */
    web: Array<Link>;

    /** A list of links that are used as the canonical link(s) when sharing this story on social media */
    onramps: Array<Link>;

    /** This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action} */
    callsToAction: Array<Link>;

    /**
     * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has played the accompanying audio
     */
    impressions: Array<FormFactorLink>;

    /** A list of links to places where the app can take the user if they interact with this `sponsorship` item */
    relateds: Array<FormFactorLink>;

    /**
     * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client has
     * chosen to interact with the sponsorship item using the contents of `relateds`
     */
    relatedImpressions: Array<FormFactorLink>;

    /**
     * Returns a list of images associated with this recommendation
     *
     * @returns {Array<ImageLink>}
     */
    getImages(): Array<ImageLink>;

    /**
     * Returns the actual audio files associated with this recommendation
     *
     * @returns {Array<Link>}
     */
    getAudio(): Array<Link>;

    /**
     * Returns a list of links to other places where this story can be found on the web (for example, on NPR.org)
     *
     * @returns {Array<Link>}
     */
    getWeb(): Array<Link>;

    /**
     * Returns a list of links that are used as the canonical link(s) when sharing this story on social media.
     *
     * @returns {Array<Link>}
     */
    getOnRamps(): Array<Link>;

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has played the accompanying audio. Note that the SDK will take care of this automatically as long as the client
     * uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */
    getImpressions(): Array<FormFactorLink>;

    /**
     * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
     *
     * An example of what might be contained within this is array is a link to full-length content
     * for a promo recommendation.
     *
     * @returns {Array<Link>}
     */
    getCallsToAction(): Array<Link>;

    /**
     * Returns a list of links to places where the app can take the user if they interact with this `sponsorship` item
     * (such as by clicking/tapping on the image or using a voice command to learn more)
     *
     * @returns {Array<FormFactorLink>}
     */
    getRelateds(): Array<FormFactorLink>;

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has chosen to interact with the sponsorship item using the contents returned by {@link getRelateds}. Note that
     * the SDK will take care of this automatically as long as the client uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */
    getRelatedImpressions(): Array<FormFactorLink>;

    /**
     * Returns the URL that should be used to obtain the next set of recommendations. This should typically not be used
     * by clients directly; use {@link recordAction} followed by {@link NprOneSDK#getRecommendation} instead.
     *
     * @returns {string}
     */
    getRecommendationUrl(): string;

    /**
     * This method looks through the recommendation's action and related array to search for any URL starting with `'nprone://listen'`.
     * If found, everything from the query params is appended to the original recommendation URL.
     * This value is then used anytime a user indicates they want more similar stories by clicking or tapping on this recommendation.
     *
     * For many recommendations, this will not exist and getRecommendationUrl is used instead.
     *
     * @returns {string}
     */
    getActionRecommendationUrl(): string;

    /**
     * Returns whether this recommendation is of type `sponsorship`
     *
     * @returns {boolean}
     */
    isSponsorship(): boolean;

    /**
     * Returns whether this recommendation is shareable on social media
     *
     * @returns {boolean}
     */
    isShareable(): boolean;

    /**
     * Returns whether this recommendation has a given action
     *
     * @param {string} action    Which action to look up; should be one of the static string constants returned by {@link Action}
     * @returns {boolean}
     */
    hasAction(action: string): boolean;

    /**
     * Returns whether this recommendation has received a rating indicating it is no longer
     * being presented to the user
     *
     * @returns {boolean}
     */
    hasEndAction(): boolean;

    /**
     * Record a user action taken and the time it was taken against this recommendation
     *
     * @param {string} action                  Which action to record; should be one of the static string constants returned by {@link Action}
     * @param {number} elapsedTimeInSeconds    The number of seconds this piece of audio has been playing for
     */
    recordAction(action: string, elapsedTimeInSeconds: number): void;

    /**
     * A callback which provides for communication of a received rating
     *
     * @param {?Function} callback    A function to call whenever this recommendation has received a rating (action)
     */
    setRatingReceivedCallback(callback?: Function): void;

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     *
     * @returns {string}
     */
    toString(): string;
}


/**
 * Container class for all metadata pertaining to an organization (member station) from the NPR One API
 */
export interface Station {
    /**
     * The unique ID that represents this station across NPR's various APIs. The ID is an integer between 1 and
     * 9999, but it will always be returned in string format.
     */
    id: string;

    /**
     * The display name that the station would prefer to use. Please use this anytime you want to display a
     * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
     * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
     */
    displayName: string;

    /**
     * The logo for this station, if one can be found. If no logo can be found at all, this will return `null`.
     */
    logo?: string;

    /**
     * The tagline for this station. This should be used as supplemental metadata for a station; it should never
     * be used as the sole identifying information. Note that while the majority of the stations in our system have
     * taglines, it is not guaranteed that each station has one.
     */
    tagline: string;

    /**
     * The call sign, brand (AM or FM), and frequency together as one string, e.g. `'WAMU FM 88.5'` or
     * `'KCFR FM 90.1'` or `'KWSU AM 1250'`. Again, this should be treated as supplemental metadata for a station and
     * not the sole identifying information; where possible, stations prefer to be identified primarily by their
     * {@link displayName} and {@link logo}. However, some local stations are members of networks such as Colorado Public Radio
     * and therefore use the same display name and logo; in those cases, the call sign + band + frequency combination is
     * the main way to disambiguate between multiple stations in the same network. This value is guaranteed to be unique.
     */
    callSignAndFrequency?: string;

    /**
     * The location of the station, which always consists of a city and (abbreviated) state, e.g. `'Austin, TX'`
     * or `'Rochester, NY'`. Similarly to {@link callSignAndFrequency}, this is most useful for disambiguating between
     * multiple local stations in a bigger network such as Colorado Public Radio, which use the same {@link displayName}
     * and {@link logo}. Note that this value isn't guaranteed to be unique; some cities (e.g. Boston) have multiple
     * NPR stations.
     */
    location: string;

    /** The URL to the station's website, if available. */
    homepageUrl?: string;

    /** The URL to the station's online donation page, if available. */
    donationUrl?: string;

    /** Whether or not the station is eligible for inclusion in NPR One applications. */
    isNprOneEligible: boolean;

    /**
     * The raw attributes that represent this station. Please use this with caution; the public accessor methods
     * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
     * metadata. These attributes will also be changing in version 3 of the Station Finder Service, so we are
     * discouraging clients from writing code against these.
     */
    attributes: any;

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the station's display name.
     *
     * @returns {string}
     */
    toString(): string;
}


interface UserAttributes {
    /** Some unique identifier for the user */
    id: string;

    /** The user's email address */
    email: string;

    /** The user's first name */
    firstName: string;

    /** The user's last name */
    lastName: string;
}


interface UserOrganization {
    /** Some unique identifier for the organization */
    id: string;

    /** A short displayable text field for the end user, strictly text */
    displayName: string;

    /** Station call letters */
    call: string;

    /** A short description of the station's main market city */
    city: string;

    /** Station logo image URL */
    logo?: string;

    /** The URL to a website where users may make a donation to support the station */
    donationUrl?: string;
}


interface UserAffiliation {
    /** A unique identifier for the aggregation (program) */
    id: number;

    /** The display name of the aggregation (program) */
    title?: string;

    /** A link that can be followed to get content from this aggregation (program) */
    href: string;

    /** Whether or not the user is following the aggregation. When changing affiliation status, the client is expected to toggle this value and then send the entire object back. */
    following: boolean;

    /** The user's average rating for this affiliation on a scale of 0-1. Absent if user never listened to the aggregation. */
    rating?: number;

    /** The number of days since a user last listened to a story from this aggregation. Absent if user never listened to the aggregation. */
    daysSinceLastListen?: number;
}


/**
 * Container class for all metadata pertaining to a user object from the NPR One API
 */
export interface User {
    /** The actual metadata about this user, such as name and e-mail address (if known) */
    attributes: UserAttributes;

    /**
     * Whether this user is a temporary user or not
     *
     * @returns {boolean}
     */
    isTemporary(): boolean;

    /**
     * Returns the list of organizations this user is affiliated with. In most cases, you only want a single
     * organization, in which case {@link User#getPrimaryOrganization} should be used.
     *
     * @returns {Array<UserOrganization>}
     */
    getOrganizations(): Array<UserOrganization>;

    /**
     * Returns the primary, non-NPR organization that this user is affiliated with, or null if no such organization
     * exists.
     *
     * @returns {null|UserOrganization}
     */
    getPrimaryOrganization(): UserOrganization;

    /**
     * Returns the programs, shows, and podcasts that this user has positively interacted with.
     *
     * @returns {Array<UserAffiliation>}
     */
    getAffiliations(): Array<UserAffiliation>;

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the user's ID.
     *
     * @returns {string}
     */
    toString(): string;
}


export interface Config {
    /** The NPR One API hostname and protocol, typically `https://api.npr.org`; in most cases, this does not need to be manually set by clients */
    apiBaseUrl?: string;

    /** The NPR One API version, typically `v2`; in most cases, this does not need to be manually set by clients */
    apiVersion?: string;

    /** The full URL to your OAuth proxy, e.g. `http://one.example.com/oauth2/` */
    authProxyBaseUrl?: string;

    /** The path to your proxy for starting a `device_code` grant (relative to `authProxyBaseUrl`) */
    newDeviceCodePath?: string;

    /** The path to your proxy for polling a `device_code` grant (relative to `authProxyBaseUrl`) */
    pollDeviceCodePath?: string;

    /** The path to your proxy for the `refresh_token` grant (relative to `authProxyBaseUrl`) */
    refreshTokenPath?: string;

    /** The path to your proxy for the `temporary_user` grant (relative to `authProxyBaseUrl`), not available to third-party clients */
    tempUserPath?: string;

    /** The path to your proxy for the `POST /authorization/v2/token/revoke` endpoint (relative to `authProxyBaseUrl`) */
    logoutPath?: string;

    /** The access token to use if not using the auth proxy */
    accessToken?: string;

    /** The NPR One API `client_id` to use, only required if using the auth proxy with the `temporary_user` grant type */
    clientId?: string;

    /** The custom X-Advertising-ID header to send with most requests, not typically used by third-party clients */
    advertisingId?: string;

    /** The custom X-Advertising-Target header to send with most requests, not typically used by third-party clients */
    advertisingTarget?: string;
}


/**
 * @see https://github.com/jonnyreeves/js-logger
 */
export class Logger {
    /** Changes the current logging level for the logging instance. */
    static setLevel(newLevel: any): void;

    /** Is the logger configured to output messages at the supplied level? */
    static enabledFor(lvl: any): void;

    static debug(...args: any[]): void;

    static info(...args: any[]): void;

    static warn(...args: any[]): void;

    static error(...args: any[]): void;

    static time(label: string): void;

    static timeEnd(label: string): void;
}


/**
 * This SDK attempts to abstract away most of the interaction with the NPR One API.
 * In general, a consumer of this API should be primarily concerned with asking for
 * recommendations and recording user actions against those recommendations.
 */
export default class NprOneSDK {
    /** Updates private `_config` member attributes but does not overwrite entire `_config` object */
    static config: Config;

    /** The actual access token being used for all API calls requiring an Authorization header */
    static accessToken: string;

    /**
     * Sets a callback to be triggered whenever the SDK rotates the access token for a new one, usually when
     * the old token expires and a `refresh_token` is used to generate a fresh token. Clients who wish to persist
     * access tokens across sessions are urged to use this callback to be notified whenever a token change has
     * occurred; the only other alternative is to call `get accessToken()` after every API call.
     *
     * @throws {TypeError} if the passed-in value isn't a function
     */
    static onAccessTokenChanged: Function;

    /** Exposes the Action class for clients to record actions */
    static Action: Action;

    /** Exposes the Logger class for clients to adjust logging if desired */
    static Logger: Logger;

    /**
     * Attempts to swap the existing access token for a new one using the refresh token endpoint in the OAuth proxy
     *
     * @param {number} [numRetries=0]   The number of times this function has been tried. Will retry up to 3 times.
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is set
     */
    static refreshExistingAccessToken(numRetries?: number): Promise<AccessToken>;

    /**
     * Logs out the user, revoking their access token from the authorization server and removing the refresh token from
     * the secure storage in the backend proxy (if a backend proxy is configured). Note that the consuming client is
     * still responsible for removing the access token anywhere else it might be stored outside of this SDK (e.g. in
     * localStorage or elsewhere in application memory).
     *
     * @returns {Promise<void>}
     * @throws {TypeError} if an OAuth proxy is not configured or no access token is currently set
     */
    logout(): Promise<void>;

    /**
     * Uses the OAuth proxy to start a `device_code` grant flow. This function _just_ makes an API call that produces a
     * device code/user code pair, and should be followed up with a call to {@link pollDeviceCode} in order to complete
     * the process.
     *
     * Note that device code/user code pairs do expire after a set time, so the consuming client may need to call these
     * 2 functions multiple times before the user logs in. It is a good idea to encapsulate them in a function which
     * can be called recursively on errors.
     *
     * @see http://dev.npr.org/guide/services/authorization/#device_code
     *
     * @param {Array<string>} [scopes=[]]   The scopes (as strings) that should be associated with the resulting access token
     * @returns {Promise<DeviceCode>}
     * @throws {TypeError} if an OAuth proxy is not configured
     */
    getDeviceCode(scopes?: string[]): Promise<DeviceCode>;

    /**
     * Uses the OAuth proxy to poll the access token endpoint as part of a `device_code` grant flow. This endpoint will
     * continue to poll until the user successfully logs in, _or_ the user goes to log in but then denies the request
     * for access to their account by this client, _or_ the device code/user code pair expires, whichever comes first.
     * In the first case, it will automatically set {@link accessToken} to the newly-generated access token,
     * and the consuming client can proceed to play recommendations immediately; in the other 2 cases, it will return
     * a Promise that rejects with a debugging message, but the next course of action would generally be to call
     * {@link getDeviceCode} again and start the whole process from the top.
     *
     * @see http://dev.npr.org/guide/services/authorization/#device_code
     *
     * @returns {Promise<AccessToken>}
     * @throws {TypeError} if an OAuth proxy is not configured or `getDeviceCode()` was not previously called
     */
    pollDeviceCode(): Promise<AccessToken>;

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
    getRecommendation(uid?: string, channel?: string): Promise<Recommendation>;

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
    getUpcomingFlowRecommendations(channel?: string): Promise<Array<Recommendation>>;

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
    getRecommendationsFromChannel(channel?: string): Promise<Array<Recommendation>>;

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
    queueRecommendationFromChannel(channel: string, uid: string): Recommendation;

    /**
     * Retrieves a user's history as an array of recommendation objects.
     *
     * @returns {Promise<Array<Recommendation>>}
     */
    getHistory(): Promise<Array<Recommendation>>;

    /**
     * Resets the current flow for the user. Note that 99% of the time, clients will never have to do this (and it is
     * generally considered an undesirable user experience), but in a few rare cases it might be needed. The best example
     * is after calling `setUserStation()` if the current recommendation is of `type === 'stationId'`; in this case,
     * resetting the flow may be necessary in order to make the user aware that they successfully changed their station.
     *
     * @returns {Promise}
     */
    resetFlow(): Promise<void>;

    /**
     * Given a valid JSON recommendation object, the flow will advance as normal from this recommendation. This method
     * has been created for a special case (Chromecast sharing) and is not intended for use in a traditional SDK implementation.
     *
     * NOTE: this function will overwrite ALL existing flow recommendations.
     *
     * @param {Object} json   Recommendation JSON Object (CDoc+JSON)
     * @returns {Recommendation}
     */
    resumeFlowFromRecommendation(json: any): Recommendation;

    /**
     * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
     * station.
     *
     * @returns {Promise<User>}
     */
    getUser(): Promise<User>;

    /**
     * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
     * ID actually exists, and will return a promise that rejects if not.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     */
    setUserStation(stationId: number | string): Promise<User>;

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
    followShow(aggregationId: number | string): Promise<User>;

    /**
     * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
     * numeric ID. See {@link followShow} for more information.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    unfollowShow(aggregationId: number | string): Promise<User>;

    /**
     * Creates a temporary user from the NPR One API and use that user's access token for
     * subsequent API requests.
     *
     * Caution: most clients are not authorized to use temporary users.
     *
     * @returns {Promise<User>}
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */
    createTemporaryUser(): Promise<User>;

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
    searchStations(query?: string): Promise<Array<Station>>;

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
    searchStationsByLatLongCoordinates(lat: number, long: number): Promise<Array<Station>>;

    /**
     * Performs a geographic search of all NPR One stations using a city name and state. While you _can_ pass in a city
     * _or_ state to {@link searchStations} as the query, `searchStationsByCityAndState()` will return more accurate
     * results and is the recommended function for clients wanting to offer a location search.
     *
     * @param {string} city     A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCityAndState(city: string, state: string): Promise<Array<Station>>;

    /**
     * Performs a geographic search of all NPR One stations using a city name only. It is generally recommended that you
     * use {@link searchStationsByCityAndState} instead, as it will return more accurate results and is the recommended
     * function for clients wanting to offer a location search.
     *
     * @param {string} city   A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCity(city: string): Promise<Array<Station>>;

    /**
     * Performs a geographic search of all NPR One stations using a state name or abbreviation only. It is generally
     * recommended that you use {@link searchStationsByCityAndState} instead, as it will return more accurate results
     * and is the recommended function for clients wanting to offer a location search.
     *
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByState(state: string): Promise<Array<Station>>;

    /**
     * Returns a {@link Station} model for the station with the given ID.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<Station>}
     */
    getStationDetails(stationId: number | string): Promise<Array<Station>>;

    /**
     * Returns the foundational path for a given service
     *
     * @param {string} service
     * @returns {string}
     */
    static getServiceUrl(service: string): string;
}
