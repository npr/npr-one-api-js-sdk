import CollectionDoc from './collection-doc';

/**
 * Container class for all metadata pertaining to an organization (member station) from the NPR One API
 *
 * @extends {CollectionDoc}
 */
export default class Station extends CollectionDoc {
    /**
     * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
     */
    constructor(json) {
        super(json);
        this._validate();
    }

    /**
     * Returns the unique ID that represents this station across NPR's various APIs. The ID is an integer between 1 and
     * 9999, but it will always be returned in string format.
     *
     * @type {string}
     */
    get id() {
        return this._raw.attributes.org_id;
    }

    /**
     * Returns the display name that the station would prefer to use. Please use this anytime you want to display a
     * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
     * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
     *
     * @type {string}
     */
    get displayName() {
        return this._raw.attributes.name ? this._raw.attributes.name : this._raw.attributes.call;
    }

    /**
     * Returns the logo for this station, if one can be found. If it exists, the NPR One-specific logo will take
     * precedence, but it will fall back to the regular station logo if not present. If no logo can be found at all,
     * this will return `null`.
     *
     * @type {null|string}
     */
    get logo() {
        if (this._raw.attributes.apps && this._raw.attributes.apps.npr_one &&
            this._raw.attributes.apps.npr_one.logo) {
            return this._raw.attributes.apps.npr_one.logo;
        }
        if (this._raw.links.image) {
            for (const link of this._raw.links.image) {
                if (link.type_id === '18' || link.type_id === '23') {
                    return link.href;
                }
            }
        }
        return null;
    }

    /**
     * Returns the tagline for this station. This should be used as supplemental metadata for a station; it should never
     * be used as the sole identifying information. Note that while the majority of the stations in our system have
     * taglines, it is not guaranteed that each station has one.
     *
     * @type {string}
     */
    get tagline() {
        return this._raw.attributes.tagline || '';
    }

    /**
     * Returns the call sign, brand (AM or FM), and frequency together as one string, e.g. `'WAMU FM 88.5'` or
     * `'KCFR FM 90.1'` or `'KWSU AM 1250'`. Again, this should be treated as supplemental metadata for a station and
     * not the sole identifying information; where possible, stations prefer to be identified primarily by their
     * {@link displayName} and {@link logo}. However, some local stations are members of networks such as Colorado Public Radio
     * and therefore use the same display name and logo; in those cases, the call sign + band + frequency combination is
     * the main way to disambiguate between multiple stations in the same network. This value is guaranteed to be unique.
     *
     * @type {null|string}
     */
    get callSignAndFrequency() {
        let callSignAndFrequency = '';
        if (this._raw.attributes.call) {
            callSignAndFrequency += this._raw.attributes.call;
        }
        if (this._raw.attributes.band) {
            callSignAndFrequency += ` ${this._raw.attributes.band}`;
        }
        if (this._raw.attributes.frequency) {
            callSignAndFrequency += ` ${this._raw.attributes.frequency}`;
        }
        return callSignAndFrequency.trim() || null;
    }

    /**
     * Returns the location of the station, which always consists of a city and (abbreviated) state, e.g. `'Austin, TX'`
     * or `'Rochester, NY'`. Similarly to {@link callSignAndFrequency}, this is most useful for disambiguating between
     * multiple local stations in a bigger network such as Colorado Public Radio, which use the same {@link displayName}
     * and {@link logo}. Note that this value isn't guaranteed to be unique; some cities (e.g. Boston) have multiple
     * NPR stations.
     *
     * @type {string}
     */
    get location() {
        return `${this._raw.attributes.market_city}, ${this._raw.attributes.market_state}`;
    }

    /**
     * Returns the URL to the station's website, if available.
     *
     * @type {null|string}
     */
    get homepageUrl() {
        if (this._raw.links.web) {
            for (const link of this._raw.links.web) {
                if (link.type_id === '1') {
                    return link.href;
                }
            }
        }
        return null;
    }

    /**
     * Returns the URL to the station's online pledge page, if available.
     *
     * @type {null|string}
     */
    get donationUrl() {
        if (this._raw.attributes.apps && this._raw.attributes.apps.npr_one &&
            this._raw.attributes.apps.npr_one.donation_url) {
            return this._raw.attributes.apps.npr_one.donation_url;
        }
        if (this._raw.links.web) {
            for (const link of this._raw.links.web) {
                if (link.type_id === '4' || link.type_id === '27') {
                    return link.href;
                }
            }
        }
        return null;
    }

    /**
     * Returns the raw attributes that represent this station. Please use this with caution; the public accessor methods
     * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
     * metadata. These attributes will also be changing in version 3 of the Station Finder Service, so we are
     * discouraging clients from writing code against these.
     *
     * @type {StationAttributes}
     */
    get attributes() {
        return this._raw.attributes;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the station's display name.
     *
     * @returns {string}
     */
    toString() {
        return this.displayName;
    }

    /**
     * @typedef {Object} StationAttributes
     * @property {StationAppsList} apps An associative array of application-specific metadata for this station
     * @property {string} guid The system's internal unique identifier for a station, not typically used by other APIs or consumers
     * @property {string} org_id The system's unique ID for this station, used across NPR One Microservices and NPR's other APIs
     * @property {string} name The display name for the station. In most cases, this will be the same as call letters combined with band. When returning networks, it will return the network name (e.g. Minnesota Public Radio).
     * @property {string} title An alternative display name for the station. Consumers are discouraged from using this and encouraged to use name instead.
     * @property {string} abbreviation An abbreviated name for the station. Consumers are discouraged from using this and encouraged to use name instead.
     * @property {string} call The three-to-four-letter identifying code for this station. Please use this with caution; most stations prefer to be identified by their name in client applications instead of call.
     * @property {string} frequency Where on the radio dial the station can be heard. If the band is AM, the frequency will be between 540 and 1600. If the band is FM, the frequency will be between 87.8 and 108.0.
     * @property {string} band The subsection of the radio spectrum -- 'AM' or 'FM' -- where this station can be heard
     * @property {string} tagline A short text-logo for the station
     * @property {Array<string>} address The address of the station's main office
     * @property {string} market_city The city that the station is most closely associated with. This may or may not be the city the station is licensed in and it may or may not be the city that the station or the station's antenna is located in.
     * @property {string} market_state The state that the station is most closely associated with. This may or may not be the state the station is licensed in and it may or may not be the state that the station or the station's antenna is located in.
     * @property {string} format The format of the programming on this station
     * @property {boolean} music_only Whether or not this station only plays music
     * @property {string} status The status of the station within NPR's system, not typically used by consumers
     * @property {string} status_name The semantic name corresponding to the status ID
     * @property {string} email The station's primary contact e-mail address
     * @property {string} area_code The area code for the station's main office
     * @property {string} phone The phone number for the station's main office
     * @property {string} phone_extension The phone extension for the station's main office
     * @property {string} fax The fax number for the station's main office
     * @property {StationNetwork} network The parent organization, if this station is part of a network
     * @property {boolean} npr_one Whether or not this organization is considered an NPR One station
     */
    /**
     * @typedef {Object} StationAppsList
     * @property {StationNprOneData} npr_one A list of metadata designed for use by NPR One clients
     */
    /**
     * @typedef {Object} StationNprOneData
     * @property {string} name The name to display for this station within NPR One clients
     * @property {string} logo The URL of an image associated with the station
     * @property {string} donation_url The URL to a website where users may make a donation to support the station
     * @property {string} donation_audio The audio to play inviting users to make a donation
     * @property {string} thankyou_audio The audio to play when users have successfully made an in-app donation
     * @property {Array<string>} sonic_id_audio The audio to play when users start a listening session, not typically used directly by consumers
     * @property {Array<string>} hello_id_audio The audio to play when users start a listening session, not typically used directly by consumers
     */
    /**
     * @typedef {Object} StationNetwork
     * @property {string} org_id The system's unique ID for the parent organization (network), used across NPR One Microservices and NPR's other APIs
     * @property {string} name The display name for the parent organization (network)
     */
}
