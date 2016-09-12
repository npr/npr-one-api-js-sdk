'use strict';

exports.__esModule = true;

require('isomorphic-fetch');

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

var _collectionDoc = require('./collection-doc');

var _collectionDoc2 = _interopRequireDefault(_collectionDoc);

var _rating = require('./rating');

var _rating2 = _interopRequireDefault(_rating);

var _action = require('./action');

var _action2 = _interopRequireDefault(_action);

var _logger = require('./../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * Container class for all metadata pertaining to a recommendation.
 *
 * Provides metadata and the recordAction method, which sends feedback on user actions to NPR's APIs and advances the flow of audio recommendations to the user
 *
 * @extends {CollectionDoc}
 */
var Recommendation = function (_CollectionDoc) {
    _inherits(Recommendation, _CollectionDoc);

    /**
     * @param {CollectionDocJSON} json   The decoded JSON object that should be used as the basis for this model
     */
    function Recommendation(json) {
        _classCallCheck(this, Recommendation);

        /** @type {Object}
         * @private */
        var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));

        _this._raw = json;
        /**
         * The metadata used to describe this recommendation, such as type and title
         * @type {RecommendationAttributes}
         */
        _this.attributes = {};
        /**
         * An internal store of ratings collected for this application; should never be accessed directly by consumers
         * @type {Array<Rating>}
         */
        _this.ratings = [];
        /**
         * The actual audio files associated with this recommendation; should never be empty
         * @type {Array<Link>}
         */
        _this.audio = [];
        /**
         * A list of API calls the app can make to retrieve subsequent recommendations; should never be accessed directly by consumers
         * @type {Array<Link>}
         */
        _this.recommendations = [];
        /**
         * A list of images associated with this recommendation; could be empty
         * @type {Array<ImageLink>}
         */
        _this.images = [];
        /**
         * A list of links to other places where this story can be found on the web (for example, on NPR.org); could be empty
         * @type {Array<Link>}
         */
        _this.web = [];
        /**
         * A list of links that are used as the canonical link(s) when sharing this story on social media
         * @type {Array<Link>}
         */
        _this.onramps = [];
        /**
         * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
         * @type {Array<Link>}
         */
        _this.callsToAction = [];
        /**
         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
         * has played the accompanying audio
         * @type {Array<FormFactorLink>}
         */
        _this.impressions = [];
        /**
         * A list of links to places where the app can take the user if they interact with this `sponsorship` item
         * @type {Array<FormFactorLink>}
         */
        _this.relateds = [];
        /**
         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client has
         * chosen to interact with the sponsorship item using the contents of {@link relateds}
         * @type {Array<FormFactorLink>}
         */
        _this.relatedImpressions = [];
        /** @type {Object}
          * @private */
        _this._ratingTemplate = {};
        /**
         * Used to prevent impressions from being fired twice
         * @type {boolean}
         * @private
         */
        _this._hasSentImpressions = false;
        /** @type {null|Function}
          * @private */
        _this._ratingReceivedCallback = null;

        _this._hydrate();
        return _this;
    }

    /**
     * Hydrate the internal member variables.
     *
     * @private
     */


    Recommendation.prototype._hydrate = function _hydrate() {
        this._validate();

        this._ratingTemplate = this._raw.attributes.rating;

        // deep copy, we do not want duplicate rating objects
        this.attributes = Object.assign({}, this._raw.attributes);
        delete this.attributes.rating;

        var links = this._raw.links;

        // Required
        this.audio = links.audio;
        this.recommendations = links.recommendations;

        // Optional
        this.web = links.web ? links.web : [];
        this.images = links.image ? links.image : [];
        this.onramps = links.onramps ? links.onramps : [];
        this.callsToAction = links.action ? links.action : [];
        this.impressions = links.impression ? links.impression : [];
        this.relateds = links.related ? links.related : [];
        this.relatedImpressions = links['related-impression'] ? links['related-impression'] : [];
    };

    /**
     * Determines whether the collection doc has the required fields for a valid recommendation
     *
     * @protected
     * @throws {TypeError} if the collection doc is invalid
     */


    Recommendation.prototype._validate = function _validate() {
        var links = this._raw.links;

        if (!links.audio || links.audio.constructor !== Array || links.audio.length <= 0) {
            throw new TypeError('Audio must exist within links.');
        }

        if (!links.recommendations || links.recommendations.constructor !== Array || links.recommendations.length <= 0) {
            throw new TypeError('Recommendation (contains URL) must exist within links.');
        }

        if (!this._raw.attributes.rating) {
            throw new TypeError('Attributes must contain a rating object.');
        }
    };

    /**
     * Returns a list of images associated with this recommendation
     *
     * @returns {Array<ImageLink>}
     */


    Recommendation.prototype.getImages = function getImages() {
        return this.images;
    };

    /**
     * Returns the actual audio files associated with this recommendation
     *
     * @returns {Array<Link>}
     */


    Recommendation.prototype.getAudio = function getAudio() {
        return this.audio;
    };

    /**
     * Returns a list of links to other places where this story can be found on the web (for example, on NPR.org)
     *
     * @returns {Array<Link>}
     */


    Recommendation.prototype.getWeb = function getWeb() {
        return this.web;
    };

    /**
     * Returns a list of links that are used as the canonical link(s) when sharing this story on social media.
     *
     * @returns {Array<Link>}
     */


    Recommendation.prototype.getOnRamps = function getOnRamps() {
        return this.onramps;
    };

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has played the accompanying audio. Note that the SDK will take care of this automatically as long as the client
     * uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */


    Recommendation.prototype.getImpressions = function getImpressions() {
        return this.impressions;
    };

    /**
     * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
     *
     * An example of what might be contained within this is array is a link to full-length content
     * for a promo recommendation.
     *
     * @returns {Array<Link>}
     */


    Recommendation.prototype.getCallsToAction = function getCallsToAction() {
        return this.callsToAction;
    };

    /**
     * Returns a list of links to places where the app can take the user if they interact with this `sponsorship` item
     * (such as by clicking/tapping on the image or using a voice command to learn more)
     *
     * @returns {Array<FormFactorLink>}
     */


    Recommendation.prototype.getRelateds = function getRelateds() {
        return this.relateds;
    };

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has chosen to interact with the sponsorship item using the contents returned by {@link getRelateds}. Note that
     * the SDK will take care of this automatically as long as the client uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */


    Recommendation.prototype.getRelatedImpressions = function getRelatedImpressions() {
        return this.relatedImpressions;
    };

    /**
     * Returns an internal store of ratings collected for this application. This should never be accessed directly by
     * consumers; use {@link recordAction} to send ratings, and the SDK will figure out the appropriate time to make
     * the API call that submits them to the server.
     *
     * @returns {Array<Rating>}
     */


    Recommendation.prototype.getRatings = function getRatings() {
        return this.ratings;
    };

    /**
     * Returns the URL that should be used to obtain the next set of recommendations. This should typically not be used
     * by clients directly; use {@link recordAction} followed by {@link NprOneSDK#getRecommendation} instead.
     *
     * @returns {string}
     */


    Recommendation.prototype.getRecommendationUrl = function getRecommendationUrl() {
        return this.recommendations[0].href;
    };

    /**
     * This method looks through the recommendation's action and related array to search for any URL starting with `'nprone://listen'`.
     * If found, everything from the query params is appended to the original recommendation URL.
     * This value is then used anytime a user indicates they want more similar stories by clicking or tapping on this recommendation.
     *
     * For many recommendations, this will not exist and getRecommendationUrl is used instead.
     *
     * @returns {string}
     */


    Recommendation.prototype.getActionRecommendationUrl = function getActionRecommendationUrl() {
        var original = new _urlParse2.default(this.getRecommendationUrl());
        var potentialActions = this.callsToAction.concat(this.relateds);

        var nprOneUrl = '';
        for (var _iterator = potentialActions, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var action = _ref;

            if (action.href && action.href.indexOf('nprone://') === 0) {
                nprOneUrl = new _urlParse2.default(action.href);
                break;
            }
        }

        var url = '';
        if (nprOneUrl) {
            url = original.set('query', nprOneUrl.query).href + '&recommend=true';
        }

        return url;
    };

    /**
     * Returns whether this recommendation is of type `sponsorship`
     *
     * @returns {boolean}
     */


    Recommendation.prototype.isSponsorship = function isSponsorship() {
        return this.attributes.type === 'sponsorship';
    };

    /**
     * Returns whether this recommendation is shareable on social media
     *
     * @returns {boolean}
     */


    Recommendation.prototype.isShareable = function isShareable() {
        return this.onramps.length > 0;
    };

    /**
     * Returns whether this recommendation has a given action
     *
     * @param {string} action    Which action to look up; should be one of the static string constants returned by {@link Action}
     * @returns {boolean}
     */


    Recommendation.prototype.hasAction = function hasAction(action) {
        for (var _iterator2 = this.ratings, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            var rating = _ref2;

            if (rating.rating === action) {
                return true;
            }
        }

        return false;
    };

    /**
     * Returns whether this recommendation has received a rating indicating it is no longer
     * being presented to the user
     *
     * @returns {boolean}
     */


    Recommendation.prototype.hasEndAction = function hasEndAction() {
        for (var _iterator3 = _action2.default.getEndActions(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                _ref3 = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                _ref3 = _i3.value;
            }

            var endAction = _ref3;

            if (this.hasAction(endAction)) {
                return true;
            }
        }

        return false;
    };

    /**
     * Record a user action taken and the time it was taken against this recommendation
     *
     * @param {string} action                  Which action to record; should be one of the static string constants returned by {@link Action}
     * @param {number} elapsedTimeInSeconds    The number of seconds this piece of audio has been playing for
     */


    Recommendation.prototype.recordAction = function recordAction(action, elapsedTimeInSeconds) {
        var _elapsedTime = elapsedTimeInSeconds;

        if (!_action2.default.isValidAction(action)) {
            throw new Error(action + ' action is invalid. See Action class for valid actions.');
        }

        var n = parseInt(_elapsedTime, 10);
        if (isNaN(n) || !isFinite(n)) {
            throw new Error('Elapsed time must be supplied and be a positive integer value.');
        }

        if (_elapsedTime < 0) {
            _logger2.default.warn('Elapsed time of ' + _elapsedTime + ' is invalid ' + 'and has been changed to 0 seconds.');
            _elapsedTime = 0;
        }

        if (_elapsedTime > this.attributes.duration && this.attributes.duration > 0) {
            // 30s has been arbitrarily chosen as it's enough to indicate the consumer of this SDK might have made a coding error.
            if (_elapsedTime > this.attributes.duration + 30) {
                _logger2.default.warn('Elapsed time of ' + _elapsedTime + ' exceeds overall audio duration ' + ('and has been modified to ' + this.attributes.duration + ' seconds.'));
            }
            _elapsedTime = this.attributes.duration;
        }

        if (_elapsedTime === 0 && (action === _action2.default.COMPLETED || action === _action2.default.SKIP)) {
            _logger2.default.warn('Elapsed time value should be greater than zero; ' + 'please ensure the time passed since the START rating is recorded.');
        }

        if (action !== _action2.default.START) {
            if (!this.hasAction(_action2.default.START)) {
                _logger2.default.warn('Action \'' + action + '\' has been recorded; however, no START action ' + 'exists. Please ensure START actions are recorded first.');
            }
        }

        var rating = new _rating2.default(this._ratingTemplate);
        rating.rating = action;
        rating.elapsed = _elapsedTime;
        rating.timestamp = new Date().toISOString();
        rating._recommendationUrl = this.getRecommendationUrl();
        rating._actionUrl = this.getActionRecommendationUrl();

        // Handle Sponsorship Impressions
        if (this.isSponsorship() && action === _action2.default.START && !this._hasSentImpressions) {
            this._hasSentImpressions = true;
            var impressions = this.impressions.concat(this.relatedImpressions);
            impressions.forEach(function (link) {
                if (link['form-factor'] === 'audio') {
                    fetch(link.href, { mode: 'no-cors' }); // no really, that's it. We don't care about the result of these fetches.
                }
            });
        }

        this.ratings.push(rating);

        if (this._ratingReceivedCallback !== null) {
            this._ratingReceivedCallback(rating);
        }
    };

    /**
     * A callback which provides for communication of a received rating
     *
     * @param {?Function} callback    A function to call whenever this recommendation has received a rating (action)
     */


    Recommendation.prototype.setRatingReceivedCallback = function setRatingReceivedCallback(callback) {
        this._ratingReceivedCallback = callback;
    };

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     *
     * @returns {string}
     */


    Recommendation.prototype.toString = function toString() {
        return '[UID=' + this.attributes.uid + ', R=' + this.getRatings().join(',') + ']';
    };

    /**
     * @typedef {Object} RecommendationAttributes
     * @property {string} type The type of recommendation, usually `audio`. Can also be `stationId`, `sponsorship`, etc.
     * @property {string} uid The universal identifier of the recommendation
     * @property {string} title The title of the recommendation
     * @property {boolean} skippable Whether or not the recommendation is skippable, usually true, but false for e.g. sponsorship
     * @property {string} [slug] A slug or category for the recommendation
     * @property {string} provider The provider of the story, usually `NPR`. Can also be a member station or third-party podcast provider.
     * @property {string} [program] The program as part of which this recommendation aired
     * @property {number} duration The duration of the audio according to the API; note that the actual duration can differ
     * @property {string} date ISO-8601 formatted date/time; the date at which the story was first published
     * @property {string} [description] A short description of the recommendation
     * @property {string} rationale The reason for recommending this piece to the listener
     * @property {string} [button] The text to display in a clickable button on a feature card
     */
    /**
     * @typedef {Link} FormFactorLink
     * @property {string} [form-factor] The form-factor for the most appropriate display of or interaction with the resource, usually irrelevant unless there is more than one link of the same type
     */
    /**
     * @typedef {FormFactorLink} ImageLink
     * @property {string} [rel] The relation of the image to the content, which usually corresponds to the crop-type
     * @property {number} [height] The pixel height of the image
     * @property {number} [width] The pixel width of the image
     */


    return Recommendation;
}(_collectionDoc2.default);

exports.default = Recommendation;