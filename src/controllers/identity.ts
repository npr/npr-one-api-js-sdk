import { CollectionDocJSON } from '../models/collection-doc';
import { Config } from '../models/config';
import { User } from '../models/user';
import * as FetchUtil from '../utils/fetch-util';
import { Logger } from '../utils/logger';
import * as StationFinder from './station-finder';

function getServiceUrl(subdomain: string = ''): string {
    return `https://${subdomain}identity.api.npr.org/v2`;
}

/**
 * Gets user metadata, such as first and last name, programs they have shown an affinity for, and preferred NPR One
 * station.
 *
 * @param config - The configuration object powering all API calls
 */
async function getUser(config: Config): Promise<User> {
    const url = `${getServiceUrl(config.subdomain)}/user`;
    const json: CollectionDocJSON = await FetchUtil.nprApiFetch(config, url);

    return new User(json);
}

/**
 * Sets a user's favorite NPR station. Note that this function will first validate whether the station with the given
 * ID actually exists, and will return a promise that rejects if not.
 *
 * @param config - The configuration object powering all API calls
 * @param stationId - The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
 */
async function setUserStation(config: Config, stationId: string | number): Promise<User> {
    await StationFinder.getStationDetails(config, stationId); // just verifying that it doesn't throw

    const url = `${getServiceUrl(config.subdomain)}/stations`;
    const options = {
        method: 'PUT',
        body: [stationId],
    };

    let json: CollectionDocJSON;
    try {
        json = await FetchUtil.nprApiFetch(config, url, options);
    } catch (err) {
        Logger.debug(`setUserStation failed, message: ${err}`);
        return Promise.reject(err);
    }

    return new User(json);
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
 * @param config - The configuration object powering all API calls
 * @param aggregationId - The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
 *
 * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
 */
async function followShow(config: Config, aggregationId: string | number): Promise<User> {
    return setFollowingStatusForShow(config, aggregationId, true);
}

/**
 * Indicates that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given
 * numeric ID. See {@link followShow} for more information.
 *
 * @param config The configuration object powering all API calls
 * @param aggregationId The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
 *
 * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
 */
async function unfollowShow(config: Config, aggregationId: string | number): Promise<User> {
    return setFollowingStatusForShow(config, aggregationId, false);
}

/**
 * Primary workhorse for {@link followShow} and {@link unfollowShow}.
 *
 * @param config The configuration object powering all API calls
 * @param aggregationId The aggregation (show) ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
 * @param shouldFollow Whether or not the aggregation should be followed (`true`) or unfollowed (`false`)
 *
 * @throws {TypeError} if the passed-in aggregation (show) ID is not either a number or a numeric string
 */
async function setFollowingStatusForShow(config: Config, aggregationId: string | number, shouldFollow: boolean): Promise<User> {
    const n = typeof aggregationId === 'string' ? parseInt(aggregationId, 10) : aggregationId;
    if (isNaN(n) || !isFinite(n)) {
        throw new TypeError('Aggregation (show) ID must be an integer greater than 0');
    }

    const data = {
        id: aggregationId,
        following: shouldFollow,
    };

    const url = `${getServiceUrl(config.subdomain)}/following`;
    const options = {
        method: 'POST',
        body: data,
    };
    const json: CollectionDocJSON = await FetchUtil.nprApiFetch(config, url, options);

    return new User(json);
}

/**
 * Encapsulates all of the logic for communication with the [Identity Service](https://dev.npr.org/api/#/identity)
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
 */
export {
    getUser,
    setUserStation,
    followShow,
    unfollowShow,
};
