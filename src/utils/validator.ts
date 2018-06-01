/**
 * A utility class which performs validations by checking of required object properties exist.
 */
export default class Validator {
    /**
     * Validates collection doc format
     *
     * @param {Object} collectionDoc
     * @throws {TypeError} if collection doc is invalid
     */
    static validateCollectionDoc(collectionDoc) {
        const requiredNames = [
            'version', 'href', 'attributes', 'items', 'links', 'errors',
        ];

        Validator._validate(collectionDoc, requiredNames);
    }

    /**
     * Validates an access token model (obtained from the `POST /authorization/v2/token` endpoint)
     *
     * @param {Object} accessTokenModel
     * @throws {TypeError} if access token model is invalid
     */
    static validateAccessToken(accessTokenModel) {
        const requiredNames = [
            'access_token', 'token_type', 'expires_in',
        ];

        Validator._validate(accessTokenModel, requiredNames);
    }

    /**
     * Validates a device code model (obtained from the `POST /authorization/v2/device` endpoint)
     *
     * @param {Object} deviceCodeModel
     * @throws {TypeError} if device code model is invalid
     */
    static validateDeviceCode(deviceCodeModel) {
        const requiredNames = [
            'user_code', 'verification_uri', 'expires_in', 'interval',
        ];

        Validator._validate(deviceCodeModel, requiredNames);
    }

    /**
     * Base validator function.
     *
     * @param {Object} object
     * @param {Array<string>} requiredNames
     * @throws {TypeError} if object is invalid
     * @private
     */
    static _validate(object, requiredNames) {
        const messages = [];

        for (const name of requiredNames) {
            if (!Validator._has(object, name)) {
                messages.push(`'${name}' is missing and is required.`);
            }
        }

        if (messages.length > 0) {
            throw new TypeError(`${messages.join(', ')} :${JSON.stringify(object)}`);
        }
    }

    /**
     * A typesafe check to make sure the property exists within the object.
     *
     * @param {Object} object
     * @param {string} key
     * @returns {boolean}
     * @private
     */
    static _has(object, key) {
        /* istanbul ignore next: defensive coding, not going to worry too much about this */
        return object ? {}.hasOwnProperty.call(object, key) : false;
    }
}
