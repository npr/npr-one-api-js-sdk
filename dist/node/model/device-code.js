'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validator = require('./../util/validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A thin wrapper around the raw JSON returned from the authorization server to represent a device code/user code pair
 */
var DeviceCode = function () {
    /**
     * @param {Object} json    The decoded JSON object that should be used as the basis for this model
     */
    function DeviceCode(json) {
        _classCallCheck(this, DeviceCode);

        this._raw = json;

        this._expiryDate = null;
        if (!isNaN(this._raw.expires_in)) {
            this._expiryDate = new Date(Date.now() + this.ttl);
        }
    }

    /**
     * Ensure that the given device code model is valid
     *
     * @throws {TypeError} if device code model is invalid
     */


    DeviceCode.prototype.validate = function validate() {
        _validator2.default.validateDeviceCode(this._raw);
    };

    /**
     * Returns whether or not this device code/user code pair has expired.
     * Note that due to network latency, etc., it's possible that the internally-stored expiry date could be about a
     * second or so behind, and so this function is not guaranteed to be perfectly accurate.
     *
     * @returns {boolean}
     */


    DeviceCode.prototype.isExpired = function isExpired() {
        return this._expiryDate !== null && new Date() >= this._expiryDate;
    };

    /**
     * Returns the user code (8-character alphanumeric string)
     *
     * @type {string}
     */


    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the raw JSON string representing the entire object.
     *
     * @returns {string}
     */
    DeviceCode.prototype.toString = function toString() {
        return JSON.stringify(this._raw);
    };

    _createClass(DeviceCode, [{
        key: 'userCode',
        get: function get() {
            return this._raw.user_code;
        }

        /**
         * Returns the verification URL (the place where the user should go on their mobile device or laptop to log in)
         *
         * @type {string}
         */

    }, {
        key: 'verificationUri',
        get: function get() {
            return this._raw.verification_uri;
        }

        /**
         * Returns the TTL (in milliseconds) until this device code/user code pair expires. The SDK will automatically generate
         * a new key pair upon expiry, so consumers of the SDK will generally not have to use this value directly; however,
         * you may opt to display on the screen how much time the user has left to log in before a new code is generated.
         *
         * @type {number}
         */

    }, {
        key: 'ttl',
        get: function get() {
            return this._raw.expires_in * 1000;
        }

        /**
         * Returns the interval (in milliseconds) at which the client (in this case the SDK) should poll the `POST /token`
         * endpoint (or the OAuth proxy that lies in between). Consumers of the SDK should generally not have to use this
         * value directly.
         *
         * @type {number}
         */

    }, {
        key: 'interval',
        get: function get() {
            return this._raw.interval * 1000;
        }
    }]);

    return DeviceCode;
}();

exports.default = DeviceCode;