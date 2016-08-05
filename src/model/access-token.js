import Validator from './../util/validator';

/**
 * A thin wrapper around the raw JSON returned from the authorization server to represent an access token
 */
export default class AccessToken
{
    /**
     * @param {Object} json    The decoded JSON object that should be used as the basis for this model
     */
    constructor(json) {
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
    validate() {
        Validator.validateAccessToken(this._raw);
    }

    /**
     * Returns whether or not this access token has expired.
     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
     *
     * @returns {boolean}
     */
    isExpired() {
        return this._expiryDate !== null && (new Date()) >= this._expiryDate;
    }

    /**
     * Returns the access token itself (40-character alphanumeric string)
     *
     * @type {string}
     */
    get token() {
        return this._raw.access_token;
    }

    /**
     * Returns the TTL (in milliseconds) until this access token expires. If you are using an auth proxy and have
     * correctly configured the `refreshTokenUrl`, this SDK will automatically refresh expired access tokens for you,
     * so consumers typically do not need to worry about whether or not a token is expired or about to expire.
     *
     * @type {number}
     */
    get ttl() {
        return this._raw.expires_in * 1000;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return only the `access_token` itself, since the rest of the object is typically not useful.
     *
     * @returns {string}
     */
    toString() {
        return this._raw.access_token;
    }
}
