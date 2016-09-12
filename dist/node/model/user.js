'use strict';

exports.__esModule = true;

var _collectionDoc = require('./collection-doc');

var _collectionDoc2 = _interopRequireDefault(_collectionDoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * Container class for all metadata pertaining to a user object from the NPR One API
 *
 * @extends {CollectionDoc}
 */
var User = function (_CollectionDoc) {
  _inherits(User, _CollectionDoc);

  /**
   * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
   */
  function User(json) {
    _classCallCheck(this, User);

    /** @type {Object}
     * @private */
    var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));

    _this._raw = json;
    /** @type {UserAttributes} */
    _this.attributes = {};
    _this._hydrate();
    return _this;
  }

  /**
   * Hydrate the internal member variables.
   *
   * @private
   */


  User.prototype._hydrate = function _hydrate() {
    this._validate();
    this.attributes = this._raw.attributes;
  };

  /**
   * Whether this user is a temporary user or not
   *
   * @returns {boolean}
   */


  User.prototype.isTemporary = function isTemporary() {
    return parseInt(this.attributes.id, 10) >= 1000000000;
  };

  /**
   * Returns the user's cohort. In most cases, SDK consumers will never need to use this.
   *
   * @returns {UserCohort}
   */


  User.prototype.getCohort = function getCohort() {
    return this.attributes.cohort;
  };

  /**
   * Returns the list of organizations this user is affiliated with. In most cases, you only want a single
   * organization, in which case {@link User#getPrimaryOrganization} should be used.
   *
   * @returns {Array<UserOrganization>}
   */


  User.prototype.getOrganizations = function getOrganizations() {
    return this.attributes.organizations || [];
  };

  /**
   * Returns the primary, non-NPR organization that this user is affiliated with, or null if no such organization
   * exists.
   *
   * @returns {null|UserOrganization}
   */


  User.prototype.getPrimaryOrganization = function getPrimaryOrganization() {
    var orgs = this.getOrganizations();
    return orgs[0] && orgs[0].id !== '1' ? orgs[0] : null;
  };

  /**
   * Returns the programs, shows, and podcasts that this user has positively interacted with.
   *
   * @returns {Array<UserAffiliation>}
   */


  User.prototype.getAffiliations = function getAffiliations() {
    return this.attributes.affiliations;
  };

  /**
   * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
   * In this case, we return the user's ID.
   *
   * @returns {string}
   */


  User.prototype.toString = function toString() {
    return this.attributes.id;
  };

  /**
   * @typedef {Object} UserAttributes
   * @property {string} id Some unique identifier for the user
   * @property {string} email The user's email address
   * @property {string} firstName The user's first name
   * @property {string} lastName The user's last name
   * @property {UserCohort} cohort The user's cohort (an experimental grouping for User Experience A/B Testing)
   * @property {Array<UserOrganization>} organizations User's chosen NPR Member Station(s)
   * @property {Array<UserAffiliation>} affiliations Programs, shows, and podcasts that the user has positively interacted with
   */
  /**
   * @typedef {Object} UserCohort
   * @property {string} id A short ID for this cohort
   * @property {string} name A text string identifying the cohort, useful for metrics
   * @property {string} directory For internal use only; represents the current configuration file being used by the Listening Service
   */
  /**
   * @typedef {Object} UserOrganization
   * @property {string} id Some unique identifier for the organization
   * @property {string} displayName A short displayable text field for the end user, strictly text
   * @property {string} call Station call letters
   * @property {string} city A short description of the station's main market city
   * @property {string} [logo] Station logo image URL
   * @property {string} [donationUrl] The URL to a website where users may make a donation to support the station
   */
  /**
   * @typedef {Object} UserAffiliation
   * @property {number} id A unique identifier for the aggregation (program)
   * @property {string} [title] The display name of the aggregation (program)
   * @property {string} href A link that can be followed to get content from this aggregation (program)
   * @property {boolean} following Whether or not the user is following the aggregation. When changing affiliation status, the client is expected to toggle this value and then send the entire object back.
   * @property {number} [rating] The user's average rating for this affiliation on a scale of 0-1. Absent if user never listened to the aggregation.
   * @property {number} [daysSinceLastListen] The number of days since a user last listened to a story from this aggregation. Absent if user never listened to the aggregation.
   */


  return User;
}(_collectionDoc2.default);

exports.default = User;