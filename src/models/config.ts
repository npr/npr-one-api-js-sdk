export interface Config {
    /**
     * The NPR One API hostname and protocol, typically `https://api.npr.org`;
     * in most cases, this does not need to be manually set by clients.
     *
     * @deprecated - No longer used and will be removed in the next major version of this SDK
     */
    apiBaseUrl?: string;

    /**
     * The NPR One API version, typically `v2`; in most cases, this does not need to be manually set by clients.
     *
     * @deprecated - No longer used and will be removed in the next major version of this SDK
     */
    apiVersion?: string;

    /** The full URL to your OAuth proxy, e.g. `https://one.example.com/oauth2/` */
    authProxyBaseUrl?: string;

    /** The path to your proxy for starting a `device_code` grant (relative to `authProxyBaseUrl`) */
    newDeviceCodePath?: string;

    /** The path to your proxy for polling a `device_code` grant (relative to `authProxyBaseUrl`) */
    pollDeviceCodePath?: string;

    /** The path to your proxy for the `refresh_token` grant (relative to `authProxyBaseUrl`) */
    refreshTokenPath?: string;

    /** The path to your proxy for the `temporary_user` grant (relative to `authProxyBaseUrl`), not available to third-party clients */
    tempUserPath?: string;

    /** The path to your proxy for the `POST /v2/token/revoke` endpoint (relative to `authProxyBaseUrl`) */
    logoutPath?: string;

    /** The access token to use if not using the auth proxy */
    accessToken?: string;

    /** The NPR One API `client_id` to use, only required if using the auth proxy with the `temporary_user` grant type */
    clientId?: string;

    /** The custom X-Advertising-ID header to send with most requests, not typically used by third-party clients */
    advertisingId?: string;

    /** The custom X-Advertising-Target header to send with most requests, not typically used by third-party clients */
    advertisingTarget?: string;

    /** The custom subdomain to use for requests, not typically used by third-party clients */
    subdomain?: string;
}
export default Config;
