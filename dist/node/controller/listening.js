'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _index = require('./../index');

var _index2 = _interopRequireDefault(_index);

var _recommendationCreator = require('./../util/recommendation-creator');

var _recommendationCreator2 = _interopRequireDefault(_recommendationCreator);

var _action = require('./../model/action');

var _action2 = _interopRequireDefault(_action);

var _rating2 = require('./../model/rating');

var _rating3 = _interopRequireDefault(_rating2);

var _logger = require('./../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _fetchUtil = require('./../util/fetch-util');

var _fetchUtil2 = _interopRequireDefault(_fetchUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Encapsulates all of the logic for communication with the [Listening Service](http://dev.npr.org/api/#/listening)
 * in the NPR One API.
 *
 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
 * functions in the main {@link NprOneSDK} class.
 *
 * @example <caption>Implementing a rudimentary 'Explore' view</caption>
 * const nprOneSDK = new NprOneSDK();
 * nprOneSDK.config = { ... };
 * nprOneSDK.getRecommendationsFromChannel('recommended')
 *     .then((recommendations) => {
 *         // in a real app, the user would select a piece; here we've simulated them selecting one at index 3
 *         const selectedRecommendationId = recommendations[3].attributes.uid;
 *         return nprOneSDK.queueRecommendationFromChannel('recommended', selectedRecommendationId);
 *      })
 *     .then(() => {
 *         nprOneSDK.getRecommendation(); // proceed to play the recommendation
 *     });
 */
var Listening = function () {
    /**
     * Initializes the controller class with private variables needed later on.
     */
    function Listening() {
        var _this = this;

        _classCallCheck(this, Listening);

        /** @type {Rating[]} Ratings which are queued to be sent to NPR
         * @private */
        this._queuedRatings = [];
        /** @type {Rating[]} Ratings which have already been sent, for debugging purposes
         * @private */
        this._sentRatings = [];
        /** @type {Array<Recommendation>} Unrated recommendations which represent the latest
         *  recommendations from the API, relies heavily upon numeric key/index
         * @private */
        this._flowRecommendations = [];
        /** @type {boolean} Flow fetches need to be synchronous
         * @private */
        this._flowFetchActive = false;
        /** @type {Promise<Recommendation>}
         * @private */
        this._flowPromise = null;
        /** @type {boolean} Whether ads are blocked by the browser.
         * @private */
        this._adsBlocked = false;
        /** @type {Object} Cached recommendations from channels other than the main flow channel of 'npr'.
         * A key-value store where the key is the name of the channel and the value is an array of recommendations.
         * @private */
        this._channelRecommendations = {};

        // Ad-blocker detection, used when/if we encounter sponsorship in the flow
        fetch('http://adswizz.com', { mode: 'no-cors' }).catch(function () {
            fetch('http://delivery-s3.adswizz.com', { mode: 'no-cors' }).catch(function (e) {
                _logger2.default.debug('Ads are blocked. ', e);
                _this._adsBlocked = true;
            });
        });
    }

    /**
     * Get a recommendation from NPR.
     *
     * Caution: the resulting recommendation may have been returned previously and must be checked
     * to ensure the same recommendation is not played twice.
     *
     * @param {string} [uid='']           Optional; a UID for a specific recommendation to play. In 99% of use cases, this is not needed.
     * @param {string} [channel='npr']    Optional; a channel to pull the recommendation from; the main flow channel of `npr` is used as the default. In 99% of use cases, this does not need to be changed.
     * @returns {Promise<Recommendation>}
     */


    Listening.prototype.getRecommendation = function getRecommendation() {
        var uid = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var channel = arguments.length <= 1 || arguments[1] === undefined ? 'npr' : arguments[1];

        this._flowPromise = this._advanceFlowRecommendations(channel, uid);

        return this._flowPromise;
    };

    /**
     * Return possible recommendations that may come next in the flow. Useful for
     * pre-caching audio and displaying upcoming recommendations.
     *
     * Recommendations returned are not guaranteed to always come next in the flow.
     *
     * @experimental
     * @param {string} [channel='npr']   A channel to pull the next recommendation from
     * @returns {Promise<Array<Recommendation>>}
     */


    Listening.prototype.getUpcomingFlowRecommendations = function getUpcomingFlowRecommendations() {
        var channel = arguments.length <= 0 || arguments[0] === undefined ? 'npr' : arguments[0];

        if (this._flowRecommendations.length > 0) {
            return Promise.resolve(this._flowRecommendations);
        }

        return this._getChannelRecommendations(channel);
    };

    /**
     * Makes a new API call to get a list of recommendations. This is NOT intended for regular piece-by-piece consumption;
     * this function is designed to be used for consumers implementing e.g. the Explore view from the NPR One apps,
     * where the client displays a list or grid of content, and the user can select a piece to listen to next.
     * It is hard-coded to use the "recommended" channel by default, although other channels can be used also. That said,
     * you should really never use this with channel "npr" (the main flow channel), as this is not how that content is
     * intended to be consumed.
     *
     * @param {string} [channel='recommended']   A non-flow (i.e. non-`npr`) channel to retrieve a list of recommendations from
     * @returns {Promise<Array<Recommendation>>}
     */


    Listening.prototype.getRecommendationsFromChannel = function getRecommendationsFromChannel() {
        var _this2 = this;

        var channel = arguments.length <= 0 || arguments[0] === undefined ? 'recommended' : arguments[0];

        var _channel = !channel || typeof channel !== 'string' ? 'recommended' : channel;

        var prerequisitePromise = Promise.resolve(true);
        // Send any pending ratings we have first, just in case it impacts the results from the upcoming recommendations call
        if (this._queuedRatings.length > 0) {
            prerequisitePromise = this._sendRatings();
        }

        return prerequisitePromise.then(this._getChannelRecommendations.bind(this, _channel, null)).then(function (recommendations) {
            /* istanbul ignore if: defensive coding; should never really happen */
            if (!_this2._channelRecommendations) {
                _this2._channelRecommendations = {};
            }
            _this2._channelRecommendations[_channel] = recommendations;
            return recommendations;
        });
    };

    /**
     * This synchronous method is intended to be used alongside {@link getRecommendationsFromChannel}.
     * Once you have a list of recommendations from a channel and an audio story has been selected to play, this method
     * ensures that the correct ratings (actions) will be sent and the flow of audio will continue appropriately with
     * the necessary API calls.
     * If the recommendation with the given UID can be found, it is delivered immediately to be played.
     * Importantly, this function also returns the selected recommendation on a subsequent call to getRecommendation
     * (assuming no other ratings are sent in between), so that the consumer can assume that the correct recommendation
     * will be played next.
     *
     * @param {string} channel   The channel used in the original call to `getRecommendationsFromChannel()`
     * @param {string} uid       The unique ID of the item to queue up for the user
     * @returns {Recommendation}
     * @throws {TypeError} If no valid channel or UID is passed in
     * @throws {Error} If no recommendations for this channel were previously cached, or if the UID was not found in that cached list
     */


    Listening.prototype.queueRecommendationFromChannel = function queueRecommendationFromChannel(channel, uid) {
        if (!channel || typeof channel !== 'string') {
            throw new TypeError('Must pass in a valid channel to queueRecommendationFromChannel()');
        }
        if (!uid || typeof uid !== 'string') {
            throw new TypeError('Must pass in a valid uid to queueRecommendationFromChannel()');
        }
        if (!(channel in this._channelRecommendations) || this._channelRecommendations[channel].length === 0) {
            throw new Error('Results from channel "' + channel + '" are not cached. ' + 'You must call getRecommendationsFromChannel() first.');
        }

        for (var _iterator = this._channelRecommendations[channel], _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var recommendation = _ref;

            if (recommendation.attributes.uid === uid) {
                /* istanbul ignore if: defensive coding; should never really happen */
                if (!this._flowRecommendations) {
                    this._flowRecommendations = [recommendation];
                } else {
                    this._flowRecommendations = [recommendation].concat(this._flowRecommendations);
                }
                return recommendation;
            }
        }
        throw new Error('Unable to find story with uid ' + uid + ' ' + ('in cached list of recommendations from channel "' + channel + '".'));
    };

    /**
     * Retrieves a user's history as an array of recommendation objects.
     *
     * @returns {Promise<Array<Recommendation>>}
     */


    Listening.prototype.getHistory = function getHistory() {
        var url = _index2.default.getServiceUrl('listening') + '/history';

        return _fetchUtil2.default.nprApiFetch(url).then(this._createRecommendations.bind(this));
    };

    /**
     * Resets the current flow for the user. Note that 99% of the time, clients will never have to do this (and it is
     * generally considered an undesirable user experience), but in a few rare cases it might be needed. The best example
     * is after calling `setUserStation()` if the current recommendation is of `type === 'stationId'`; in this case,
     * resetting the flow may be necessary in order to make the user aware that they successfully changed their station.
     *
     * @example
     * let currentRecommendation = nprOneSDK.getRecommendation();
     * playAudio(currentRecommendation); // given a hypothetical playAudio() function in your app
     * ...
     * nprOneSDK.setUserStation(123)
     *     .then(() => {
     *         if (currentRecommendation.attributes.type === 'stationId') {
     *             nprOneSDK.resetFlow()
     *                 .then(() => {
     *                     currentRecommendation = nprOneSDK.getRecommendation();
     *                     playAudio(currentRecommendation);
     *                 });
     *         }
     *     });
     *
     * @returns {Promise}
     */


    Listening.prototype.resetFlow = function resetFlow() {
        var _this3 = this;

        var prerequisitePromise = Promise.resolve(true);

        if (this._flowRecommendations && this._flowRecommendations.length) {
            // Send any pending ratings we have first, just in case it impacts the results from the upcoming recommendations call
            if (this._queuedRatings.length > 0) {
                prerequisitePromise = this._sendRatings(false);
            }

            return prerequisitePromise.then(function () {
                _this3._flowRecommendations = [];
                _this3._flowFetchActive = false;
                _this3._flowPromise = null;

                return true;
            });
        }

        return prerequisitePromise;
    };

    /**
     * Given a valid JSON recommendation object, the flow will advance as
     * normal from this recommendation. This method has been created for
     * a special case (Chromecast sharing) and is not intended for use
     * in a traditional SDK implementation.
     *
     * NOTE: this function will overwrite ALL existing flow
     * recommendations.
     *
     * @param {Object} json   Recommendation JSON Object (CDoc+JSON)
     * @returns {Recommendation}
     */


    Listening.prototype.resumeFlowFromRecommendation = function resumeFlowFromRecommendation(json) {
        var recommendations = this._createRecommendations(json);
        this._flowRecommendations = recommendations;
        return this._flowRecommendations[0];
    };

    /**
     * Advances the flow (retrieves new recommendations from the API).
     *
     * @param {string} channel
     * @param {string} uid
     * @returns {Promise<Array<Recommendation>>}
     * @throws {Error} If there are no recommendations to return
     * @private
     */


    Listening.prototype._advanceFlowRecommendations = function _advanceFlowRecommendations(channel, uid) {
        var _this4 = this;

        if (this._flowFetchActive) {
            _logger2.default.debug('A listening service API request is already active, ' + 'returning existing promise if one exists.');

            /* istanbul ignore else: defensive coding */
            if (this._flowPromise) {
                return this._flowPromise;
            }
            /* istanbul ignore next: defensive coding */
            return Promise.reject(new Error('No recommendations available. Try again later.'));
        }

        // if given a UID, we check first to see if we already have the recommendation cached
        if (uid && !!this._flowRecommendations && this._flowRecommendations.length > 0) {
            var _ret = function () {
                var isRecommendationFound = false;
                _this4._flowRecommendations.forEach(function (recommendation, index) {
                    if (!isRecommendationFound && recommendation.attributes.uid === uid) {
                        _this4._flowRecommendations = _this4._flowRecommendations.slice(index);
                        isRecommendationFound = true;
                    }
                });
                if (isRecommendationFound) {
                    _logger2.default.debug('Recommendation with UID ' + uid + ' was already queued up. ' + 'Returning the cached version instead of making a new API call.');
                    return {
                        v: Promise.resolve(_this4._flowRecommendations[0])
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }

        this._flowFetchActive = true;
        return this._getFlowRecommendations(channel, uid).then(function (recommendations) {
            _this4._flowFetchActive = false;
            if (recommendations.length <= 0) {
                _logger2.default.error('API returned no recommendations.');
            }
            _this4._flowRecommendations = _this4._filterIncomingRecommendations(recommendations);
            if (!_this4._flowRecommendations[0]) {
                throw new Error('All recommendations exhausted!');
            }
            return _this4._flowRecommendations[0];
        }).catch(function (error) {
            _this4._flowFetchActive = false;
            throw error;
        });
    };

    /**
     * Provide any necessary filter to incoming recommendations if needed
     *
     * @param {Array<Recommendation>} recommendations
     * @private
     */


    Listening.prototype._filterIncomingRecommendations = function _filterIncomingRecommendations(recommendations) {
        if (this._adsBlocked) {
            var unfilteredCount = recommendations.length;
            var _recommendations = recommendations.filter(function (rec) {
                return !rec.isSponsorship();
            });
            var filteredCount = unfilteredCount - _recommendations.length;
            if (filteredCount > 0) {
                _logger2.default.debug('Filtered ' + filteredCount + ' ad(s).');
            }
            return _recommendations;
        }

        return recommendations;
    };

    /**
     * Private method to facilitate communication of a rated recommendation.
     *
     * @param {Rating} rating
     * @private
     */


    Listening.prototype._recordRating = function _recordRating(rating) {
        if (this._queuedRatingsContainsRating(rating)) {
            return; // no need to take action for the same rating twice
        }

        _logger2.default.debug('Queued rating: ' + rating);
        this._queuedRatings.push(rating);

        // Only one of these should ever fire, but this is easiest way to do the lookup
        for (var _iterator2 = _action2.default.getFlowAdvancingActions(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            var action = _ref2;

            if (rating.rating === action) {
                this.getRecommendation();
                break;
            }
        }
    };

    /**
     * Request for recommendations from NPR specifically for the flow as opposed to
     * other channels which will not change the current flow.
     *
     * @param {string} channel
     * @param {string} uid
     * @returns {Promise<Array<Recommendation>>}
     */


    Listening.prototype._getFlowRecommendations = function _getFlowRecommendations(channel, uid) {
        for (var _iterator3 = _action2.default.getFlowAdvancingActions(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                _ref3 = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                _ref3 = _i3.value;
            }

            var action = _ref3;

            if (this._queuedRatingsContainsAction(action)) {
                return this._sendRatings();
            }
        }

        if (!uid) {
            // Only perform the initial recommendation call if all flow recommendations are exhausted
            if (this._flowRecommendations.length > 0) {
                return Promise.resolve(this._flowRecommendations);
            }
        }

        return this._getChannelRecommendations(channel, uid);
    };

    /**
     * @param {string} channel
     * @param {string} [uid='']
     * @returns {Promise<Array<Recommendation>>}
     * @private
     */


    Listening.prototype._getChannelRecommendations = function _getChannelRecommendations(channel) {
        var uid = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        var _channel = !channel || typeof channel !== 'string' ? 'npr' : channel;

        var url = _index2.default.getServiceUrl('listening') + '/recommendations?channel=' + _channel;
        url += uid ? '&sharedMediaId=' + uid : '';

        return _fetchUtil2.default.nprApiFetch(url).then(this._createRecommendations.bind(this));
    };

    /**
     * Create recommendation objects from collection doc
     *
     * @param {Object} json - collection doc
     * @returns {Array<Recommendation>}
     * @private
     */


    Listening.prototype._createRecommendations = function _createRecommendations(json) {
        var recommendations = (0, _recommendationCreator2.default)(json);
        var recordRating = this._recordRating.bind(this);
        recommendations.map(function (rec) {
            return rec.setRatingReceivedCallback(recordRating);
        });

        return recommendations;
    };

    /**
     * Send batched ratings
     *
     * @param {boolean} [recommendMore=true] - determines if additional recommendations should be returned
     * @returns {Promise<Array<Recommendation>>}
     * @private
     */


    Listening.prototype._sendRatings = function _sendRatings() {
        var _this5 = this;

        var recommendMore = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

        /* istanbul ignore if: defensive coding */
        if (this._queuedRatings.length === 0) {
            _logger2.default.error('Things have gone drastically wrong, this: ', this);
            return Promise.reject(new Error('No queued ratings to send.'));
        }

        var url = _index2.default.getServiceUrl('listening');
        url += '/ratings?recommend=' + recommendMore.toString();
        if (recommendMore) {
            var latestRating = this._queuedRatings.slice(-1).pop();
            if (latestRating._actionUrl && latestRating.rating === _action2.default.TAPTHRU) {
                url = latestRating._actionUrl;
            } else {
                url = latestRating._recommendationUrl;
            }
        }

        var ratingsToSend = [];
        this._queuedRatings.forEach(function (rating) {
            /* istanbul ignore else: defensive coding */
            if (!rating._hasSent) {
                ratingsToSend.push(rating);
            }
        });

        var options = {
            method: 'POST',
            body: JSON.stringify(ratingsToSend, _rating3.default.privateMemberReplacer)
        };

        _logger2.default.debug('Sending Ratings: ', ratingsToSend.join(', '));

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            // Loop through all queued ratings and mark as sent
            ratingsToSend.forEach(function (rating) {
                var _rating = rating;
                _rating._hasSent = true;
                _this5._sentRatings.push(_rating);
                _this5._queuedRatings.splice(_this5._queuedRatings.indexOf(_rating), 1);
            });
            return _this5._createRecommendations(json);
        });
    };

    /**
     * Returns whether currently queued ratings contain a specific rating
     *
     * This is not a deep copy check and relies on mediaId & rating string
     *
     * @param {Rating} rating
     * @returns {boolean}
     * @private
     */


    Listening.prototype._queuedRatingsContainsRating = function _queuedRatingsContainsRating(rating) {
        return this._queuedRatings.some(function (qr) {
            return qr.rating === rating.rating && qr.mediaId === rating.mediaId;
        }); // eslint-disable-line
    };

    /**
     * Returns whether the currently queued ratings contains a specific action
     *
     * @param {string} action
     * @returns {boolean}
     * @private
     */


    Listening.prototype._queuedRatingsContainsAction = function _queuedRatingsContainsAction(action) {
        return this._queuedRatings.some(function (qr) {
            return qr.rating === action;
        });
    };

    return Listening;
}();

exports.default = Listening;