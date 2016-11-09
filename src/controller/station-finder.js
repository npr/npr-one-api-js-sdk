import NPROneSDK from './../index';
import FetchUtil from './../util/fetch-util';
import Station from './../model/station';


/**
 * Encapsulates all of the logic for communication with the [Station Finder Service](http://dev.npr.org/api/#/stationfinder)
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
export default class StationFinder {
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
     * @param {null|string} [query]   An optional query, which can be a station name, network name, or zip code
     * @returns {Promise<Array<Station>>}
     */
    searchStations(query = null) {
        return this._performStationSearch(query);
    }

    /**
     * Performs a geographic search of all NPR One stations using a passed-in pair of lat-long coordinates. In most
     * cases, this means you will need to first use the [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation)
     * or a similar library in order to obtain the lat-long coordinates for the end-user's location.
     *
     * Note that {@link searchStations} without a query will already produce a list of stations closest to the user _if_
     * this code is being run in a client-side environment and/or the IP address of the device making the calls to this
     * SDK has the same geographic location as the end-user. For that reason, `searchStationsByLatLongCoordinates()`
     * is really only needed if this SDK is being run in a server-side environment.
     *
     * @param {number} lat    A float representing the latitude value of the geographic coordinates
     * @param {number} long   A float representing the longitude value of the geographic coordinates
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByLatLongCoordinates(lat, long) {
        return this._performStationSearch(null, lat, long);
    }

    /**
     * Performs a geographic search of all NPR One stations using a city name and state. While you _can_ pass in a city
     * _or_ state to {@link searchStations} as the query, `searchStationsByCityAndState()` will return more accurate
     * results and is the recommended function for clients wanting to offer a location search.
     *
     * @param {string} city     A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCityAndState(city, state) {
        return this._performStationSearch(null, null, null, city, state);
    }

    /**
     * Performs a geographic search of all NPR One stations using a city name only. It is generally recommended that you
     * use {@link searchStationsByCityAndState} instead, as it will return more accurate results and is the recommended
     * function for clients wanting to offer a location search.
     *
     * @param {string} city   A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByCity(city) {
        return this._performStationSearch(null, null, null, city);
    }

    /**
     * Performs a geographic search of all NPR One stations using a state name or abbreviation only. It is generally
     * recommended that you use {@link searchStationsByCityAndState} instead, as it will return more accurate results
     * and is the recommended function for clients wanting to offer a location search.
     *
     * @param {string} state    A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     */
    searchStationsByState(state) {
        return this._performStationSearch(null, null, null, null, state);
    }

    /**
     * Returns a {@link Station} model for the station with the given ID.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<Station>}
     */
    getStationDetails(stationId) {
        return StationFinder.validateStation(stationId);
    }

    /**
     * Ensures a station ID is associated with a valid NPR station. While this technically returns the raw JSON for
     * this station if it exists, these results are not meant to be consumed directly; if you need the station details to display to your end-user,
     * use {@link getStationDetails} instead.
     *
     * @param {number|string} stationId   The station's ID, which is either an integer or a numeric string (e.g. `123` or `'123'`)
     * @returns {Promise<Station>}
     */
    static validateStation(stationId) {
        const n = parseInt(stationId, 10);
        if (isNaN(n) || !isFinite(n)) {
            return Promise.reject(new Error('Station ID must be an integer greater than 0'));
        }

        const url = `${NPROneSDK.getServiceUrl('stationfinder')}/stations/${stationId}`;

        return FetchUtil.nprApiFetch(url)
            .then((searchResult) => {
                const station = new Station(searchResult);
                if (!station.isNprOneEligible) {
                    throw new Error(`The station ${station.id} is not eligible for NPR One.`);
                }
                return station;
            });
    }

    /**
     * A private helper function that performs the actual station search.
     *
     * @param {null|string} query     An optional query, which can be a station name, network name, or zip code
     * @param {null|number} [lat]     A float representing the latitude value of the geographic coordinates
     * @param {null|number} [long]    A float representing the longitude value of the geographic coordinates
     * @param {null|string} [city]    A full city name (e.g. "New York", "San Francisco", "Phoenix")
     * @param {null|string} [state]   A state name (e.g. "Maryland") or abbreviation (e.g. "MD")
     * @returns {Promise<Array<Station>>}
     * @private
     */
    _performStationSearch(query, lat = null, long = null, city = null, state = null) {
        const url = `${NPROneSDK.getServiceUrl('stationfinder')}/stations`;

        let queryString = '';
        if (query) {
            if (typeof query !== 'string') {
                throw new TypeError('Station search query must be a string');
            }
            queryString = `q=${query}`;
        } else if (lat || long) {
            if (typeof lat !== 'number' || typeof long !== 'number') {
                throw new TypeError('Latitude and longitude must both be valid numbers (floats)');
            }
            queryString = `lat=${lat}&lon=${long}`;
        } else {
            if (city) {
                if (typeof city !== 'string') {
                    throw new TypeError('Station search city name must be a string');
                }
                queryString += `city=${city}`;
            }
            if (state) {
                if (typeof state !== 'string') {
                    throw new TypeError('Station search state name must be a string');
                }
                queryString += `state=${state}`;
            }
        }

        return FetchUtil.nprApiFetch(queryString ? `${url}?${queryString}` : url)
            .then((searchResults) => {
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
            });
    }
}
