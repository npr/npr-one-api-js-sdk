'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _validator = require('./../util/validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * A base model for any resources following our Collection Doc schema
 * @see http://cdoc.io
 */
var CollectionDoc = function () {
  /**
   * @param {CollectionDocJSON} json     The decoded JSON object that should be used as the basis for this model
   */
  function CollectionDoc(json) {
    _classCallCheck(this, CollectionDoc);

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


  CollectionDoc.prototype._validate = function _validate() {
    _validator2.default.validateCollectionDoc(this._raw);
  };

  /**
   * Exposed for legacy reasons. Prefer model accessor methods were possible.
   *
   * @type {CollectionDocJSON}
   */


  _createClass(CollectionDoc, [{
    key: 'collectionDoc',
    get: function get() {
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

  }]);

  return CollectionDoc;
}();

exports.default = CollectionDoc;