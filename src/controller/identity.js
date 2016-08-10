import NPROneSDK from './../index';
import FetchUtil from './../util/fetch-util';
import User from './../model/user';
import Logger from './../util/logger';
import AccessToken from './../model/access-token';
import StationFinder from './station-finder';


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
export default class Identity {
    /**
     * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
     * station.
     *
     * @returns {Promise<User>}
     */
    getUser() {
        const url = `${NPROneSDK.getServiceUrl('identity')}/user`;

        return FetchUtil.nprApiFetch(url).then(json => new User(json));
    }

    /**
     * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
     * ID actually exists, and will return a promise that rejects if not.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     */
    setUserStation(stationId) {
        return StationFinder.validateStation(stationId)
            .then(() => {
                const url = `${NPROneSDK.getServiceUrl('identity')}/stations`;
                const options = {
                    method: 'PUT',
                    body: JSON.stringify([stationId]),
                };
                return FetchUtil.nprApiFetch(url, options).then(json => new User(json));
            })
            .catch((e) => {
                Logger.debug('setUserStation failed, message: ', e);
                return Promise.reject(e);
            });
    }

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
    followShow(aggregationId) {
        return this._setFollowingStatusForShow(aggregationId, true);
    }

    /**
     * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
     * numeric ID. See {@link followShow} for more information.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     */
    unfollowShow(aggregationId) {
        return this._setFollowingStatusForShow(aggregationId, false);
    }

    /**
     * Primary workhorse for {@link followShow} and {@link unfollowShow}.
     *
     * @param {number|string} aggregationId    The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @param {boolean} shouldFollow           Whether or not the aggregation should be followed (`true`) or unfollowed (`false`)
     * @returns {Promise<User>}
     * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
     * @private
     */
    _setFollowingStatusForShow(aggregationId, shouldFollow) {
        const n = parseInt(aggregationId, 10);
        if (isNaN(n) || !isFinite(n)) {
            throw new TypeError('Aggregation (show) ID must be an integer greater than 0');
        }

        const data = {
            id: aggregationId,
            following: shouldFollow,
        };

        const url = `${NPROneSDK.getServiceUrl('identity')}/following`;
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
        };

        return FetchUtil.nprApiFetch(url, options).then(json => new User(json));
    }

    /**
     * Creates a temporary user from the NPR One API and use that user's access token for
     * subsequent API requests.
     *
     * Caution: most clients are not authorized to use temporary users.
     *
     * @returns {Promise<User>}
     * @throws {TypeError} if an OAuth proxy is not configured or no client ID is set
     */
    createTemporaryUser() {
        if (!NPROneSDK.config.authProxyBaseUrl) {
            throw new TypeError('OAuth proxy not configured. Unable to create temporary users.');
        }
        if (!NPROneSDK.config.clientId) {
            throw new TypeError('A client ID must be set for temporary user requests.');
        }

        let url = `${NPROneSDK.config.authProxyBaseUrl}${NPROneSDK.config.tempUserPath}`;
        const glueCharacter = url.indexOf('?') >= 0 ? '&' : '?';
        url = `${url}${glueCharacter}clientId=${NPROneSDK.config.clientId}`;

        const options = {
            credentials: 'include',
        };

        return FetchUtil.nprApiFetch(url, options)
            .then((json) => {
                const tokenModel = new AccessToken(json);
                tokenModel.validate(); // throws exception if invalid
                NPROneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            });
    }
}
