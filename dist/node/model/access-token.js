'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validator = require('./../util/validator');

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