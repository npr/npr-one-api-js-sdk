'use strict';

exports.__esModule = true;

var _es6Error = require('es6-error');

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