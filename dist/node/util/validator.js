'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A utility class which performs validations by checking of required object properties exist.
 */
var Validator = function () {
    function Validator() {
        _classCallCheck(this, Validator);
    }

    /**
     * Validates collection doc format
     *
     * @param {Object} collectionDoc
     * @throws {TypeError} if collection doc is invalid
     */
    Validator.validateCollectionDoc = function validateCollectionDoc(collectionDoc) {
        var requiredNames = ['version', 'href', 'attributes', 'items', 'links', 'errors'];

        Validator._validate(collectionDoc, requiredNames);
    };

    /**
     * Validates an access token model (obtained from the `POST /authorization/v2/token` endpoint)
     *
     * @param {Object} accessTokenModel
     * @throws {TypeError} if access token model is invalid
     */


    Validator.validateAccessToken = function validateAccessToken(accessTokenModel) {
        var requiredNames = ['access_token', 'token_type', 'expires_in'];

        Validator._validate(accessTokenModel, requiredNames);
    };

    /**
     * Validates a device code model (obtained from the `POST /authorization/v2/device` endpoint)
     *
     * @param {Object} deviceCodeModel
     * @throws {TypeError} if device code model is invalid
     */


    Validator.validateDeviceCode = function validateDeviceCode(deviceCodeModel) {
        var requiredNames = ['user_code', 'verification_uri', 'expires_in', 'interval'];

        Validator._validate(deviceCodeModel, requiredNames);
    };

    /**
     * Base validator function.
     *
     * @param {Object} object
     * @param {Array<string>} requiredNames
     * @throws {TypeError} if object is invalid
     * @private
     */


    Validator._validate = function _validate(object, requiredNames) {
        var messages = [];

        for (var _iterator = requiredNames, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var name = _ref;

            if (!Validator._has(object, name)) {
                messages.push('\'' + name + '\' is missing and is required.');
            }
        }

        if (messages.length > 0) {
            throw new TypeError(messages.join(', ') + ' :' + JSON.stringify(object));
        }
    };

    /**
     * A typesafe check to make sure the property exists within the object.
     *
     * @param {Object} object
     * @param {string} key
     * @returns {boolean}
     * @private
     */


    Validator._has = function _has(object, key) {
        /* istanbul ignore next: defensive coding, not going to worry too much about this */
        return object ? {}.hasOwnProperty.call(object, key) : false;
    };

    return Validator;
}();

exports.default = Validator;