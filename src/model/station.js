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
        return this._raw.attributes.orgId;
    }

    /**
     * Returns the display name that the station would prefer to use. Please use this anytime you want to display a
     * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
     * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
     *
     * @type {string}
     */
    get displayName() {
        return this._raw.attributes.brand.name;
    }

    /**
     * Returns the logo for this station, if one can be found. If no logo can be found at all, this will return `null`.
     *
     * @type {null|string}
     */
    get logo() {
        if (this._raw.links.brand) {
            for (const link of this._raw.links.brand) {
                if (link.rel === 'logo') {
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
        return this._raw.attributes.brand.tagline || '';
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
        const brand = this._raw.attributes.brand;
        if (brand.call) {
            callSignAndFrequency += brand.call;
        }
        if (brand.band) {
            callSignAndFrequency += ` ${brand.band}`;
        }
        if (brand.frequency) {
            callSignAndFrequency += ` ${brand.frequency}`;
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
        const brand = this._raw.attributes.brand;
        return `${brand.marketCity}, ${brand.marketState}`;
    }

    /**
     * Returns the URL to the station's website, if available.
     *
     * @type {null|string}
     */
    get homepageUrl() {
        if (this._raw.links.brand) {
            for (const link of this._raw.links.brand) {
                if (link.rel === 'homepage') {
                    return link.href;
                }
            }
        }
        return null;
    }

    /**
     * Returns the URL to the station's online donation page, if available.
     *
     * @type {null|string}
     */
    get donationUrl() {
        let preferredUrl;
        let fallbackUrl;

        if (this._raw.links.donation) {
            for (const link of this._raw.links.donation) {
                if (link.typeId === '27') {
                    preferredUrl = link.href;
                    break;
                } else if (link.typeId === '4') {
                    fallbackUrl = link.href;
                }
            }
        }

        return preferredUrl || fallbackUrl || null;
    }

    /**
     * Returns whether or not the station is eligible for inclusion in NPR One applications.
     *
     * @type {boolean}
     */
    get isNprOneEligible() {
        return this._raw.attributes.eligibility.nprOne;
    }

    /**
     * Returns the raw attributes that represent this station. Please use this with caution; the public accessor methods
     * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
     * metadata.
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
     * @property {string} orgId The system's unique ID for this station, used across NPR One Microservices and NPR's other APIs
     * @property {string} guid The system's internal unique identifier for a station, not typically used by other APIs or consumers
     * @property {StationBrandData} brand An associative array of brand-related metadata for this station
     * @property {StationEligibilityData} eligibility An associative array of eligibility-related metadata for this station
     * @property {StationNewscastData} [newscast] Metadata about the newscast for this station; newscasts are handled internally by other microservices such as the NPR One Listening Service, so this data should typically not be used by consumers
     * @property {StationNetwork} Metadata about the network, if this station is part of a network
     */
    /**
     * @typedef {Object} StationBrandData
     * @property {string} name The display name for the station. In most cases, this will be the same as call letters combined with band. When returning networks, it will return the network name (e.g. Minnesota Public Radio).
     * @property {string|null} call The three-to-four-letter identifying code for this station. Please use this with caution; most stations prefer to be identified by their name in client applications instead of call.
     * @property {string|null} frequency Where on the radio dial the station can be heard. If the band is AM, the frequency will be between 540 and 1600. If the band is FM, the frequency will be between 87.8 and 108.0.
     * @property {string|null} band The subsection of the radio spectrum -- 'AM' or 'FM' -- where this station can be heard
     * @property {string} tagline A short text-logo for the station
     * @property {string} marketCity The city that the station is most closely associated with. This may or may not be the city the station is licensed in and it may or may not be the city that the station or the station's antenna is located in.
     * @property {string} marketState The state that the station is most closely associated with. This may or may not be the state the station is licensed in and it may or may not be the state that the station or the station's antenna is located in.
     */
    /**
     * @typedef {Object} StationEligibilityData
     * @property {boolean} nprOne Whether or not this organization is considered an NPR One station
     * @property {boolean} musicOnly Whether or not this station only plays music
     * @property {string} format The format of the programming on this station
     * @property {string} status The status of the station within NPR's system, not typically used by consumers
     */
    /**
     * @typedef {Object} StationNewscastData
     * @property {string} id The ID of the newscast that should be played for this station; this is handled internally by other microservices such as the NPR One Listening Service, so this field should typically not be used by consumers
     * @property {null|number} recency How often the newscast should be played, in minutes; a value of `null` implies no information is available, and sensible defaults should be used
     */
    /**
     * @typedef {Object} StationNetwork
     * @property {string} currentOrgId The current station being viewed. Client applications should generally ignore this field.
     * @property {boolean} usesInheritance Whether or not the current station inherits from a parent organization, also referred to as a network
     * @property {string} [inheritingFrom] The system' unique ID for the organization that the current station is inheriting from, if inheritance is on
     * @property {string} name The display name for the current organization
     * @property {StationNetworkTierOne} [tier1] The top-level organization, if this station is part of a network
     */
    /**
     * @typedef {Object} StationNetworkTierOne
     * @property {string} id The unique identifier of the top-level organization in the network
     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
     * @property {string} name The display name for the top-level organization in the network
     * @property {string} status The status of the top-level organization within NPR's system, not typically used by consumers
     * @property {Array<StationNetworkTierTwo>} [tier2] One or more stations that are hierarchical children of this organization
     */
    /**
     * @typedef {Object} StationNetworkTierTwo
     * @property {string} id The unique identifier of a tier 2 organization in the network
     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
     * @property {string} name The display name for a tier 2 organization in the network
     * @property {Array<StationNetworkTierThree>} [tier3] One or more stations that are hierarchical children of this organization
     */
    /**
     * @typedef {Object} StationNetworkTierThree
     * @property {string} id The unique identifier of a tier 3 organization in the network
     * @property {boolean} usesInheritance Whether or not this station inherits from a parent organization, also referred to as a network
     * @property {string} name The display name for a tier 3 organization in the network
     */
}
