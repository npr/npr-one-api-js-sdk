import Validator from './../util/validator';

/**
 * A base model for any resources following our Collection Doc schema
 * @see http://cdoc.io
 */
export default class CollectionDoc
{
    /**
     * @param {CollectionDocJSON} json     The decoded JSON object that should be used as the basis for this model
     */
    constructor(json) {
        /** @type {Object}
         * @protected */
        this._raw = json;
    }

    /**
     * Ensure that the given Collection Doc is valid
     *
     * @throws {TypeError} if collection doc is invalid
     * @protected
     */
    _validate() {
        Validator.validateCollectionDoc(this._raw);
    }

    /**
     * Exposed for legacy reasons. Prefer model accessor methods were possible.
     *
     * @type {CollectionDocJSON}
     */
    get collectionDoc() {
        return this._raw;
    }

    /**
     * @typedef {Object} CollectionDocJSON
     * @property {string} version The version of the Collection.Doc+JSON Hypermedia Type Specification being used by this document
     * @property {string} href A unique identifier of the resource representation in the form of a Uniform Resource Identifier (URI)
     * @property {Object} attributes A set of metadata attributes that represent the "state" of the resource in the form of key-value pairs; may be an empty object
     * @property {Array} items A list of items associated with this document; may be an empty array
     * @property {Object} links A map of resources that expose controls and communicate relationships with other documents; the keys describe the relationship to the current document, while the values are arrays of links
     * @property {Array} errors A list of errors encountered in the process of creating and/or retrieving this document, intended to facilitate reliable debugging of client/server interactions
     */
    /**
     * @typedef {Object} Link
     * @property {string} [content-type] The MIME-type of the resource
     * @property {string} href The URI that represents the resource
     */
}
