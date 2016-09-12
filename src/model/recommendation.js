import 'isomorphic-fetch';
import URL from 'url-parse';
import CollectionDoc from './collection-doc';
import Rating from './rating';
import Action from './action';
import Logger from './../util/logger';


/**
 * Container class for all metadata pertaining to a recommendation.
 *
 * Provides metadata and the recordAction method, which sends feedback on user actions to NPR's APIs and advances the flow of audio recommendations to the user
 *
 * @extends {CollectionDoc}
 */
export default class Recommendation extends CollectionDoc
{
    /**
     * @param {CollectionDocJSON} json   The decoded JSON object that should be used as the basis for this model
     */
    constructor(json) {
        super(json);
        /** @type {Object}
         * @private */
        this._raw = json;
        /**
         * The metadata used to describe this recommendation, such as type and title
         * @type {RecommendationAttributes}
         */
        this.attributes = {};
        /**
         * An internal store of ratings collected for this application; should never be accessed directly by consumers
         * @type {Array<Rating>}
         */
        this.ratings = [];
        /**
         * The actual audio files associated with this recommendation; should never be empty
         * @type {Array<Link>}
         */
        this.audio = [];
        /**
         * A list of API calls the app can make to retrieve subsequent recommendations; should never be accessed directly by consumers
         * @type {Array<Link>}
         */
        this.recommendations = [];
        /**
         * A list of images associated with this recommendation; could be empty
         * @type {Array<ImageLink>}
         */
        this.images = [];
        /**
         * A list of links to other places where this story can be found on the web (for example, on NPR.org); could be empty
         * @type {Array<Link>}
         */
        this.web = [];
        /**
         * A list of links that are used as the canonical link(s) when sharing this story on social media
         * @type {Array<Link>}
         */
        this.onramps = [];
        /**
         * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
         * @type {Array<Link>}
         */
        this.callsToAction = [];
        /**
         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
         * has played the accompanying audio
         * @type {Array<FormFactorLink>}
         */
        this.impressions = [];
        /**
         * A list of links to places where the app can take the user if they interact with this `sponsorship` item
         * @type {Array<FormFactorLink>}
         */
        this.relateds = [];
        /**
         * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client has
         * chosen to interact with the sponsorship item using the contents of {@link relateds}
         * @type {Array<FormFactorLink>}
         */
        this.relatedImpressions = [];
        /** @type {Object}
          * @private */
        this._ratingTemplate = {};
        /**
         * Used to prevent impressions from being fired twice
         * @type {boolean}
         * @private
         */
        this._hasSentImpressions = false;
        /** @type {null|Function}
          * @private */
        this._ratingReceivedCallback = null;

        this._hydrate();
    }

    /**
     * Hydrate the internal member variables.
     *
     * @private
     */
    _hydrate() {
        this._validate();

        this._ratingTemplate = this._raw.attributes.rating;

        // deep copy, we do not want duplicate rating objects
        this.attributes = Object.assign({}, this._raw.attributes);
        delete this.attributes.rating;

        const links = this._raw.links;

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
    }

    /**
     * Determines whether the collection doc has the required fields for a valid recommendation
     *
     * @protected
     * @throws {TypeError} if the collection doc is invalid
     */
    _validate() {
        const links = this._raw.links;

        if (!links.audio ||
            links.audio.constructor !== Array ||
            links.audio.length <= 0) {
            throw new TypeError('Audio must exist within links.');
        }

        if (!links.recommendations ||
            links.recommendations.constructor !== Array ||
            links.recommendations.length <= 0) {
            throw new TypeError('Recommendation (contains URL) must exist within links.');
        }

        if (!this._raw.attributes.rating) {
            throw new TypeError('Attributes must contain a rating object.');
        }
    }

    /**
     * Returns a list of images associated with this recommendation
     *
     * @returns {Array<ImageLink>}
     */
    getImages() {
        return this.images;
    }

    /**
     * Returns the actual audio files associated with this recommendation
     *
     * @returns {Array<Link>}
     */
    getAudio() {
        return this.audio;
    }

    /**
     * Returns a list of links to other places where this story can be found on the web (for example, on NPR.org)
     *
     * @returns {Array<Link>}
     */
    getWeb() {
        return this.web;
    }

    /**
     * Returns a list of links that are used as the canonical link(s) when sharing this story on social media.
     *
     * @returns {Array<Link>}
     */
    getOnRamps() {
        return this.onramps;
    }

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has played the accompanying audio. Note that the SDK will take care of this automatically as long as the client
     * uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */
    getImpressions() {
        return this.impressions;
    }

    /**
     * This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action}
     *
     * An example of what might be contained within this is array is a link to full-length content
     * for a promo recommendation.
     *
     * @returns {Array<Link>}
     */
    getCallsToAction() {
        return this.callsToAction;
    }

    /**
     * Returns a list of links to places where the app can take the user if they interact with this `sponsorship` item
     * (such as by clicking/tapping on the image or using a voice command to learn more)
     *
     * @returns {Array<FormFactorLink>}
     */
    getRelateds() {
        return this.relateds;
    }

    /**
     * Returns a list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has chosen to interact with the sponsorship item using the contents returned by {@link getRelateds}. Note that
     * the SDK will take care of this automatically as long as the client uses {@link recordAction} to send the rating.
     *
     * @returns {Array<FormFactorLink>}
     */
    getRelatedImpressions() {
        return this.relatedImpressions;
    }

    /**
     * Returns an internal store of ratings collected for this application. This should never be accessed directly by
     * consumers; use {@link recordAction} to send ratings, and the SDK will figure out the appropriate time to make
     * the API call that submits them to the server.
     *
     * @returns {Array<Rating>}
     */
    getRatings() {
        return this.ratings;
    }

    /**
     * Returns the URL that should be used to obtain the next set of recommendations. This should typically not be used
     * by clients directly; use {@link recordAction} followed by {@link NprOneSDK#getRecommendation} instead.
     *
     * @returns {string}
     */
    getRecommendationUrl() {
        return this.recommendations[0].href;
    }

    /**
     * This method looks through the recommendation's action and related array to search for any URL starting with `'nprone://listen'`.
     * If found, everything from the query params is appended to the original recommendation URL.
     * This value is then used anytime a user indicates they want more similar stories by clicking or tapping on this recommendation.
     *
     * For many recommendations, this will not exist and getRecommendationUrl is used instead.
     *
     * @returns {string}
     */
    getActionRecommendationUrl() {
        const original = new URL(this.getRecommendationUrl());
        const potentialActions = this.callsToAction.concat(this.relateds);

        let nprOneUrl = '';
        for (const action of potentialActions) {
            if (action.href && action.href.indexOf('nprone://') === 0) {
                nprOneUrl = new URL(action.href);
                break;
            }
        }

        let url = '';
        if (nprOneUrl) {
            url = `${original.set('query', nprOneUrl.query).href}&recommend=true`;
        }

        return url;
    }

    /**
     * Returns whether this recommendation is of type `sponsorship`
     *
     * @returns {boolean}
     */
    isSponsorship() {
        return this.attributes.type === 'sponsorship';
    }

    /**
     * Returns whether this recommendation is shareable on social media
     *
     * @returns {boolean}
     */
    isShareable() {
        return this.onramps.length > 0;
    }

    /**
     * Returns whether this recommendation has a given action
     *
     * @param {string} action    Which action to look up; should be one of the static string constants returned by {@link Action}
     * @returns {boolean}
     */
    hasAction(action) {
        for (const rating of this.ratings) {
            if (rating.rating === action) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns whether this recommendation has received a rating indicating it is no longer
     * being presented to the user
     *
     * @returns {boolean}
     */
    hasEndAction() {
        for (const endAction of Action.getEndActions()) {
            if (this.hasAction(endAction)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Record a user action taken and the time it was taken against this recommendation
     *
     * @param {string} action                  Which action to record; should be one of the static string constants returned by {@link Action}
     * @param {number} elapsedTimeInSeconds    The number of seconds this piece of audio has been playing for
     */
    recordAction(action, elapsedTimeInSeconds) {
        let _elapsedTime = elapsedTimeInSeconds;

        if (!Action.isValidAction(action)) {
            throw new Error(`${action} action is invalid. See Action class for valid actions.`);
        }

        const n = parseInt(_elapsedTime, 10);
        if (isNaN(n) || !isFinite(n)) {
            throw new Error('Elapsed time must be supplied and be a positive integer value.');
        }

        if (_elapsedTime < 0) {
            Logger.warn(`Elapsed time of ${_elapsedTime} is invalid ` +
                'and has been changed to 0 seconds.');
            _elapsedTime = 0;
        }

        if (_elapsedTime > this.attributes.duration && this.attributes.duration > 0) {
            // 30s has been arbitrarily chosen as it's enough to indicate the consumer of this SDK might have made a coding error.
            if (_elapsedTime > this.attributes.duration + 30) {
                Logger.warn(`Elapsed time of ${_elapsedTime} exceeds overall audio duration ` +
                    `and has been modified to ${this.attributes.duration} seconds.`);
            }
            _elapsedTime = this.attributes.duration;
        }

        if (_elapsedTime === 0 && (action === Action.COMPLETED || action === Action.SKIP)) {
            Logger.warn('Elapsed time value should be greater than zero; ' +
                'please ensure the time passed since the START rating is recorded.');
        }

        if (action !== Action.START) {
            if (!this.hasAction(Action.START)) {
                Logger.warn(`Action '${action}' has been recorded; however, no START action ` +
                    'exists. Please ensure START actions are recorded first.');
            }
        }

        const rating = new Rating(this._ratingTemplate);
        rating.rating = action;
        rating.elapsed = _elapsedTime;
        rating.timestamp = new Date().toISOString();
        rating._recommendationUrl = this.getRecommendationUrl();
        rating._actionUrl = this.getActionRecommendationUrl();

        // Handle Sponsorship Impressions
        if (this.isSponsorship() && action === Action.START && !this._hasSentImpressions) {
            this._hasSentImpressions = true;
            const impressions = this.impressions.concat(this.relatedImpressions);
            impressions.forEach((link) => {
                if (link['form-factor'] === 'audio') {
                    fetch(link.href, { mode: 'no-cors' });  // no really, that's it. We don't care about the result of these fetches.
                }
            });
        }

        this.ratings.push(rating);

        if (this._ratingReceivedCallback !== null) {
            this._ratingReceivedCallback(rating);
        }
    }

    /**
     * A callback which provides for communication of a received rating
     *
     * @param {?Function} callback    A function to call whenever this recommendation has received a rating (action)
     */
    setRatingReceivedCallback(callback) {
        this._ratingReceivedCallback = callback;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     *
     * @returns {string}
     */
    toString() {
        return `[UID=${this.attributes.uid}, R=${this.getRatings().join(',')}]`;
    }

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
}
