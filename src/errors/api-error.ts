import es6Error from 'es6-error';
import 'isomorphic-fetch';

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
 */
export class ApiError extends es6Error {
    /** The status code of the response (e.g., `400` for a bad request). */
    public readonly statusCode: number;
    /** The status message corresponding to the status code (e.g., `Bad Request` for 400). */
    public readonly statusText: string;
    /** The headers associated with the response. */
    public readonly headers: Headers;
    /** Contains the type of the response (e.g., basic, cors). */
    public readonly responseType: string;
    /** Contains the URL of the response. */
    public readonly responseUrl: string;
    /** Contains the decoded JSON of the response, if any. */
    public readonly json: { [key: string]: any };

    /**
     * Creates a new, custom error using the [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
     * object as its basis.
     *
     * @param response - The actual raw [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response) from the failed API call
     * @param json - If available, the decoded JSON from the error response
     */
    constructor(response: Response, json = {}) {
        super(`Response status: ${response.status} ${response.statusText}`);

        this.statusCode = response.status;
        this.statusText = response.statusText;
        this.headers = response.headers;
        this.responseType = response.type;
        this.responseUrl = response.url;
        this.json = json;
    }
}
export default ApiError;
