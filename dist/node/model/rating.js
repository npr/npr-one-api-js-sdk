'use strict';

exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Container class for all metadata pertaining to an action that a user has taken against a recommendation.
 */
var Rating = function () {
    /**
     * @param {Object} json The decoded JSON object that should be used as the basis for this model
     * @param {string} json.mediaId The media id as given by the media object
     * @param {string} json.origin How the recommendation was generated
     * @param {string} json.rating String representing the rating (action)
     * @param {number} json.elapsed Number of seconds since the start of playback for this media item, as an integer
     * @param {number} json.duration Number of seconds this audio piece is expected to last
     * @param {string} json.timestamp ISO-8601 formatted date/time; typically replaced by the client with the actual rating time
     * @param {string} json.channel The channel this media item was pulled from
     * @param {string} json.cohort The primary cohort of the current logged-in user
     * @param {Array} json.affiliations An array of IDs & other data about collections or podcasts the user has ratings for; produced by the server and should be sent back as received; used for tracking program and podcast suggestions
     */
    function Rating(json) {
        _classCallCheck(this, Rating);

        Object.assign(this, json);
        this._hasSent = false;
        this._recommendationUrl = '';
        this._actionUrl = '';
    }

    /**
     * Only send the fields back that NPR has sent us
     *
     * @param {string} key
     * @param {boolean|string|number|Array|Object|Function} value
     * @returns {undefined|boolean|string|number|Array|Object|Function}
     */


    Rating.privateMemberReplacer = function privateMemberReplacer(key, value) {
        if (['_hasSent', '_recommendationUrl', '_actionUrl'].indexOf(key) >= 0) {
            return undefined;
        }
        return value;
    };

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     *
     * @returns {string}
     */


    Rating.prototype.toString = function toString() {
        return '[RID=' + this.mediaId + ', R=' + this.rating + ']';
    };

    return Rating;
}();

exports.default = Rating;