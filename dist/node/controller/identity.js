'use strict';

exports.__esModule = true;

var _index = require('./../index');

var _index2 = _interopRequireDefault(_index);

var _fetchUtil = require('./../util/fetch-util');

var _fetchUtil2 = _interopRequireDefault(_fetchUtil);

var _user = require('./../model/user');

var _user2 = _interopRequireDefault(_user);

var _logger = require('./../util/logger');

var _logger2 = _interopRequireDefault(_logger);

var _accessToken = require('./../model/access-token');

var _accessToken2 = _interopRequireDefault(_accessToken);

var _stationFinder = require('./station-finder');

var _stationFinder2 = _interopRequireDefault(_stationFinder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Encapsulates all of the logic for communication with the [Identity Service](http://dev.npr.org/api/#/identity)
 * in the NPR One API.
 *
 * Note that consumers should not be accessing this class directly but should instead use the provided pass-through
 * functions in the main {@link NprOneSDK} class.
 *
 * @example <caption>How to change a user's station using station search</caption>
 * const nprOneSDK = new NprOneSDK();
 * nprOneSDK.config = { ... };
 * nprOneSDK.getUser() // optional; verifies that you have a logged-in user
 *     .then(() => {
 *        return nprOneSDK.searchStations('wnyc');
 *     })
 *     .then((stations) => {
 *         const stationId = stations[0].id; // in reality, you'd probably have the user select a station, see the StationFinder for detail
 *         nprOneSDK.setUserStation(stationId);
 *     });
 */
var Identity = function () {
    function Identity() {
        _classCallCheck(this, Identity);
    }

    /**
     * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
     * station.
     *
     * @returns {Promise<User>}
     */
    Identity.prototype.getUser = function getUser() {
        var url = _index2.default.getServiceUrl('identity') + '/user';

        return _fetchUtil2.default.nprApiFetch(url).then(function (json) {
            return new _user2.default(json);
        });
    };

    /**
     * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
     * ID actually exists, and will return a promise that rejects if not.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     */


    Identity.prototype.setUserStation = function setUserStation(stationId) {
        return _stationFinder2.default.validateStation(stationId).then(function () {
            var url = _index2.default.getServiceUrl('identity') + '/stations';
            var options = {
                method: 'PUT',
                body: JSON.stringify([stationId])
            };
            return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
                return new _user2.default(json);
            });
        }).catch(function (e) {
            _logger2.default.debug('setUserStation failed, message: ', e);
            return Promise.reject(e);
        });
    };

    /**
     * Indicates that the user wishes to follow, or subscribe to, the show, program, or podcast with the given numeric
     * ID. Followed shows will appear more frequently in a user's list of recommendations.
     *
     * Note that at this time, because we have not yet implemented search in this SDK, there is no way to retrieve a list
     * of aggregation (show) IDs through this SDK. You can either add functionality to your own app that makes an API call
     * to `GET https://api.npr.org/listening/v2/search/recommendations` with a program name or other search parameters, or
     * wait until we implement search in this SDK (hopefully later this year).
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */


    Identity.prototype.followShow = function followShow(aggregationId) {
        return this._setFollowingStatusForShow(aggregationId, true);
    };

    /**
     * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
     * numeric ID. See {@link followShow} for more information.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */


    Identity.prototype.unfollowShow = function unfollowShow(aggregationId) {
        return this._setFollowingStatusForShow(aggregationId, false);
    };

    /**
     * Primary workhorse for {@link followShow} and {@link unfollowShow}.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @param {boolean} shouldFollow           Whether or not the aggregation should be followed (`true`) or unfollowed (`false`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     * @private
     */


    Identity.prototype._setFollowingStatusForShow = function _setFollowingStatusForShow(aggregationId, shouldFollow) {
        var n = parseInt(aggregationId, 10);
        if (isNaN(n) || !isFinite(n)) {
            throw new TypeError('Aggregation (show) ID must be an integer greater than 0');
        }

        var data = {
            id: aggregationId,
            following: shouldFollow
        };

        var url = _index2.default.getServiceUrl('identity') + '/following';
        var options = {
            method: 'POST',
            body: JSON.stringify(data)
        };

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            return new _user2.default(json);
        });
    };

    /**
     * Creates a temporary user from the NPR One API and use that user's access token for
     * subsequent API requests.
     *
     * Caution: most clients are not authorized to use temporary users.
     *
     * @returns {Promise<User>}
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */


    Identity.prototype.createTemporaryUser = function createTemporaryUser() {
        if (!_index2.default.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to create temporary users.');
        }
        if (!_index2.default.config.clientId) {
            throw new TypeError('A client ID must be set for temporary user requests.');
        }

        var url = '' + _index2.default.config.authProxyBaseUrl + _index2.default.config.tempUserPath;
        var glueCharacter = url.indexOf('?') >= 0 ? '&' : '?';
        url = '' + url + glueCharacter + 'clientId=' + _index2.default.config.clientId;

        var options = {
            credentials: 'include'
        };

        return _fetchUtil2.default.nprApiFetch(url, options).then(function (json) {
            var tokenModel = new _accessToken2.default(json);
            tokenModel.validate(); // throws exception if invalid
            _index2.default.accessToken = tokenModel.token;
            return tokenModel; // never directly consumed, but useful for testing
        });
    };

    return Identity;
}();

exports.default = Identity;