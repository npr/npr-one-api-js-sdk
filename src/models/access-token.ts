/** The expected shape of the raw, decoded JSON response from an API call to the Authorization Service */
export interface AccessTokenJSON {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

/**
 * A thin wrapper around the raw JSON returned from the authorization server to represent an access token
 */
export class AccessToken {
    /** The raw, decoded JSON response from an API call to the Authorization Service */
    private raw: AccessTokenJSON;
    /** A date object representing the expiration of the access token */
    private expiryDate: Date | null = null;

    /**
     * @param json The decoded JSON object that should be used as the basis for this model
     */
    constructor(json: AccessTokenJSON) {
        this.raw = json;
        if (!isNaN(this.raw.expires_in)) {
            this.expiryDate = new Date(Date.now() + this.ttl);
        }
    }

    /**
     * Returns whether or not this access token has expired.
     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
     */
    public isExpired(): boolean {
        return this.expiryDate !== null && (new Date()) >= this.expiryDate;
    }

    /**
     * Returns the access token itself (40-character or 80-character alphanumeric string)
     */
    public get token(): string {
        return this.raw.access_token;
    }

    /**
     * Returns the refresh token to pair with this access token (40-character or 80-character alphanumeric string)
     */
    public get refreshToken(): string | undefined {
        return this.raw.refresh_token;
    }

    /**
     * Returns the TTL (in milliseconds) until this access token expires. If you are using an auth proxy and have
     * correctly configured the `refreshTokenUrl`, this SDK will automatically refresh expired access tokens for you,
     * so consumers typically do not need to worry about whether or not a token is expired or about to expire.
     */
    public get ttl(): number {
        return this.raw.expires_in * 1000;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used for log output.
     * In this case, we return only the `access_token` itself, since the rest of the object is typically not useful.
     */
    public toString(): string {
        return this.raw.access_token;
    }
}
export default AccessToken;
