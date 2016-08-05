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
     * Sets a user's station preference
     *
     * @param {number|string} stationId
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
            .catch(e => {
                Logger.debug('setUserStation failed, message: ', e);
                return Promise.reject(e);
            });
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
            .then(json => {
                const tokenModel = new AccessToken(json);
                tokenModel.validate(); // throws exception if invalid
                NPROneSDK.accessToken = tokenModel.token;
                return tokenModel; // never directly consumed, but useful for testing
            });
    }
}
