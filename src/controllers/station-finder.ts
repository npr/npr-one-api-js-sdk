import { CollectionDocJSON } from '../models/collection-doc';
import { Config } from '../models/config';
import { Station } from '../models/station';
import * as FetchUtil from '../utils/fetch-util';

function getServiceUrl(subdomain: string = ''): string {
    return `https://${subdomain}station.api.npr.org/v3`;
}

/**
 * Returns a {@link Station} model for the station with the given ID.
 *
 * @param config The configuration object powering all API calls
 * @param stationId The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
 *
 * @throws {Error} if the station is a valid NPR member station but it is not eligible for NPR One
 */
async function getStationDetails(config: Config, stationId: string | number): Promise<Station> {
    const n = typeof stationId === 'string' ? parseInt(stationId, 10) : stationId;
    if (isNaN(n) || !isFinite(n)) {
        return Promise.reject(new Error('Station ID must be an integer greater than 0'));
    }

    const url = `${getServiceUrl(config.subdomain)}/stations/${stationId}`;
    const searchResult: CollectionDocJSON = await FetchUtil.nprApiCall(config, url);
    const station = new Station(searchResult);
    if (!station.isNprOneEligible) {
        throw new Error(`The station ${station.id} is not eligible for NPR One.`);
    }

    return station;
}

/**
 * Performs a general search of all NPR One stations, using an optional query. If passed in, the query can be any
 * string, such as an address or keyword, but the recommended usage is to search for station names, network names
 * (e.g. "Colorado Public Radio" is a network of stations throughout Colorado), or zip codes.
 *
 * If no query is passed in, this function will return a list of one or more stations geographically closest to the
 * client based on the consumer's IP address. If you are running this in a server-side environment where the IP
 * address of the server is not necessarily the same as the IP address (and, by extension, the geographic location)
 * of the end-user, you can use {@link searchStationsByLatLongCoordinates} instead to retrieve a list of stations
 * geographically closest to the end-user.
 *
 * @param config The configuration object powering all API calls
 * @param query An optional query, which can be a station name, network name, or zip code
 */
async function searchStations(config: Config, query?: string): Promise<Station[]> {
    return performStationSearch(config, query);
}

/**
 * Performs a geographic search of all NPR One stations using a passed-in pair of lat-long coordinates. In most
 * cases, this means you will need to first use the
 * [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
 * or a similar library in order to obtain the lat-long coordinates for the end-user's location.
 *
 * Note that {@link searchStations} without a query will already produce a list of stations closest to the user _if_
 * this code is being run in a client-side environment and/or the IP address of the device making the calls to this
 * SDK has the same geographic location as the end-user. For that reason, `searchStationsByLatLongCoordinates()`
 * is really only needed if this SDK is being run in a server-side environment.
 *
 * @param config The configuration object powering all API calls
 * @param lat A float representing the latitude value of the geographic coordinates
 * @param long A float representing the longitude value of the geographic coordinates
 */
async function searchStationsByLatLongCoordinates(config: Config, lat: number, long: number): Promise<Station[]> {
    return performStationSearch(config, undefined, lat, long);
}

/**
 * Performs a geographic search of all NPR One stations using a city name and state. While you _can_ pass in a city
 * _or_ state to {@link searchStations} as the query, `searchStationsByCityAndState()` will return more accurate
 * results and is the recommended function for clients wanting to offer a location search.
 *
 * @param config The configuration object powering all API calls
 * @param city A full city name (e.g. "New York", "San Francisco", "Phoenix")
 * @param state A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
 */
async function searchStationsByCityAndState(config: Config, city: string, state: string): Promise<Station[]> {
    return performStationSearch(config, undefined, undefined, undefined, city, state);
}

/**
 * Performs a geographic search of all NPR One stations using a city name only. It is generally recommended that you
 * use {@link searchStationsByCityAndState} instead, as it will return more accurate results and is the recommended
 * function for clients wanting to offer a location search.
 *
 * @param config The configuration object powering all API calls
 * @param city A full city name (e.g. "New York", "San Francisco", "Phoenix")
 */
async function searchStationsByCity(config: Config, city: string): Promise<Station[]> {
    return performStationSearch(config, undefined, undefined, undefined, city);
}

/**
 * Performs a geographic search of all NPR One stations using a state name or abbreviation only. It is generally
 * recommended that you use {@link searchStationsByCityAndState} instead, as it will return more accurate results
 * and is the recommended function for clients wanting to offer a location search.
 *
 * @param config The configuration object powering all API calls
 * @param state A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
 */
async function searchStationsByState(config: Config, state: string): Promise<Station[]> {
    return performStationSearch(config, undefined, undefined, undefined, undefined, state);
}

/**
 * A private helper function that performs the actual station search.
 *
 * @param config The configuration object powering all API calls
 * @param query An optional query, which can be a station name, network name, or zip code
 * @param lat A float representing the latitude value of the geographic coordinates
 * @param long A float representing the longitude value of the geographic coordinates
 * @param city A full city name (e.g. "New York", "San Francisco", "Phoenix")
 * @param state A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
 */
async function performStationSearch(
    config: Config,
    query?: string,
    lat?: number,
    long?: number,
    city?: string,
    state?: string,
): Promise<Station[]> {
    const url = `${getServiceUrl(config.subdomain)}/stations`;

    let queryString = '';
    if (query) {
        queryString = `q=${query}`;
    } else if (lat || long) {
        queryString = `lat=${lat}&lon=${long}`;
    } else {
        if (city) {
            queryString += `city=${city}`;
        }
        if (state) {
            queryString += `${city ? '&' : ''}state=${state}`;
        }
    }

    const searchResults: CollectionDocJSON = await FetchUtil.nprApiCall(config, queryString ? `${url}?${queryString}` : url);
    const stations = [];

    if (searchResults && searchResults.items && searchResults.items.length) {
        for (const searchResult of searchResults.items) {
            const station = new Station(searchResult);
            if (station.isNprOneEligible) {
                stations.push(station);
            }
        }
    }

    return stations;
}

/**
 * Encapsulates all of the logic for communication with the [Station Finder Service](https://dev.npr.org/api/#/stationfinder)
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
 *         return nprOneSDK.searchStations('wnyc');
 *     })
 *     .then((stations) => {
 *         const stationId = stations[0].id; // in reality, you'd probably have the user select a station from returned search results
 *         nprOneSDK.setUserStation(stationId);
 *     });
 */
export {
    getStationDetails,
    searchStations,
    searchStationsByLatLongCoordinates,
    searchStationsByCityAndState,
    searchStationsByCity,
    searchStationsByState,
};
