import ExtendableError from 'es6-error';


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
export default class ApiError extends ExtendableError {
    /**
     * Creates a new, custom error using the [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
     * object as its basis.
     *
     * @param {Response} response    The actual raw [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) from the failed API call
     * @param {Object} [json={}]     If available, the decoded JSON from the error response
     */
    constructor(response, json = {}) {
        super(`Response status: ${response.status} ${response.statusText}`);

        /**
         * The status code of the response (e.g., `400` for a bad request).
         *
         * @type {number}
         */
        this.statusCode = response.status;
        /**
         * The status message corresponding to the status code (e.g., `Bad Request` for 400).
         *
         * @type {string}
         */
        this.statusText = response.statusText;
        /**
         * The headers associated with the response.
         *
         * @type {Headers}
         */
        this.headers = response.headers;
        /**
         * Contains the type of the response (e.g., basic, cors).
         *
         * @type {string}
         */
        this.responseType = response.type;
        /**
         * Contains the URL of the response.
         *
         * @type {string}
         */
        this.responseUrl = response.url;
        /**
         * Contains the decoded JSON of the response, if any.
         *
         * @type {Object}
         */
        this.json = json;
    }
}
