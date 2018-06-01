import { StationBrandRels } from '../constants/link-rels';
import { CollectionDoc, CollectionDocJSON, Link, RelLink } from './collection-doc';

export interface StationAttributes {
    /** The system's unique ID for this station, used across NPR One Microservices and NPR's other APIs */
    orgId: string;

    /** The system's internal unique identifier for a station, not typically used by other APIs or consumers */
    guid: string;

    /** An associative array of brand-related metadata for this station */
    brand: StationBrandData;

    /** An associative array of eligibility-related metadata for this station */
    eligibility: StationEligibilityData;

    /**
     * Metadata about the newscast for this station; newscasts are handled internally by other microservices
     * such as the NPR One Listening Service, so this data should typically not be used by consumers.
     */
    newscast?: StationNewscastData;

    /** Metadata about the network, if this station is part of a network */
    network: StationNetwork;
}

export interface StationFinderLink extends Link {
    /** The system's internal unique identifier for a link, not typically used by other APIs or consumers */
    guid: string;

    /** A display name for the link. These can change at any time and should not be used to look for a specific kind of link. */
    title?: string;

    /** A string identifier for the type of link. Use these when looking for a specific kind of link. */
    typeId: string;

    /** A label for the `typeId`. It is not recommended to use these when looking for a specific kind of link. */
    typeName: string;
}

export interface StationBrandData {
    /**
     * The display name for the station. In most cases, this will be the same as call letters combined with band.
     * When returning networks, it will return the network name (e.g. Minnesota Public Radio).
     */
    name: string;

    /**
     * The three-to-four-letter identifying code for this station. Please use this with caution;
     * most stations prefer to be identified by their name in client applications instead of call letters.
     */
    call?: string;

    /**
     * Where on the radio dial the station can be heard. If the band is AM, the frequency will be between 540 and 1600.
     * If the band is FM, the frequency will be between 87.8 and 108.0.
     */
    frequency?: string;

    /** The subsection of the radio spectrum -- 'AM' or 'FM' -- where this station can be heard */
    band?: string;

    /** A short text-logo for the station */
    tagline: string;

    /**
     * The city that the station is most closely associated with. This may or may not be the city the station is licensed in
     * and it may or may not be the city that the station or the station's antenna is located in.
     */
    marketCity: string;

    /**
     * The state that the station is most closely associated with. This may or may not be the state the station is licensed in
     * and it may or may not be the state that the station or the station's antenna is located in.
     */
    marketState: string;
}

export interface StationEligibilityData {
    /** Whether or not this organization is considered an NPR One station */
    nprOne: boolean;

    /** Whether or not this station only plays music */
    musicOnly: boolean;

    /** The format of the programming on this station */
    format: string;

    /** The status of the station within NPR's system, not typically used by consumers */
    status: string;
}

export interface StationNewscastData {
    /**
     * The ID of the newscast that should be played for this station; this is handled internally by other microservices
     * such as the NPR One Listening Service, so this field should typically not be used by consumers.
     */
    id: string;

    /** How often the newscast should be played, in minutes; a value of `null` implies no */
    recency?: number;
}

export interface StationNetwork {
    /** The current station being viewed. Client applications should generally ignore this field. */
    currentOrgId: string;

    /** Whether or not the current station inherits from a parent organization, also referred to as a network */
    usesInheritance: boolean;

    /** The system' unique ID for the organization that the current station is inheriting from, if inheritance is on */
    inheritingFrom?: string;

    /** The display name for the current organization, if inheritance is on */
    name?: string;

    /** The top-level organization. Even if the organization is not part of a network, its own data will be returned as tier1. */
    tier1: StationNetworkTierOne;
}

export interface StationNetworkTier {
    /** The unique identifier of this organization in the network */
    id: string;

    /** Whether or not this station inherits from a parent organization, also referred to as a network */
    usesInheritance: boolean;

    /** The display name for this organization in the network */
    name: string;
}

export interface StationNetworkTierOne extends StationNetworkTier {
    /** The status of the top-level organization within NPR's system, not typically used by consumers */
    status: string;

    /** One or more stations that are hierarchical children of this organization */
    tier2?: StationNetworkTierTwo[];
}

export interface StationNetworkTierTwo extends StationNetworkTier {
    /** One or more stations that are hierarchical children of this organization */
    tier3?: StationNetworkTier[];
}

/**
 * Container class for all metadata pertaining to an organization (member station) from the NPR One API
 */
export class Station extends CollectionDoc {
    /**
     * Returns the unique ID that represents this station across NPR's various APIs. The ID is an integer between 1 and
     * 9999, but it will always be returned in string format.
     */
    get id(): string {
        return (this.raw.attributes as StationAttributes).orgId;
    }

    /**
     * Returns the display name that the station would prefer to use. Please use this anytime you want to display a
     * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
     * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
     */
    get displayName(): string {
        return (this.raw.attributes as StationAttributes).brand.name;
    }

    /**
     * Returns the logo for this station, if one can be found. If no logo can be found at all, this will return `null`.
     */
    get logo(): string | null {
        if (this.raw.links.brand) {
            for (const link of (this.raw.links.brand as RelLink[])) {
                if (link.rel === StationBrandRels.Logo) {
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
     */
    get tagline(): string {
        return (this.raw.attributes as StationAttributes).brand.tagline || '';
    }

    /**
     * Returns the call sign, brand (AM or FM), and frequency together as one string, e.g. `'WAMU FM 88.5'` or
     * `'KCFR FM 90.1'` or `'KWSU AM 1250'`. Again, this should be treated as supplemental metadata for a station and
     * not the sole identifying information; where possible, stations prefer to be identified primarily by their
     * {@link displayName} and {@link logo}. However, some local stations are members of networks such as Colorado Public Radio
     * and therefore use the same display name and logo; in those cases, the call sign + band + frequency combination is
     * the main way to disambiguate between multiple stations in the same network. This value is guaranteed to be unique.
     */
    get callSignAndFrequency(): string | null {
        let callSignAndFrequency = '';
        const brand = (this.raw.attributes as StationAttributes).brand;
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
     */
    get location(): string {
        const brand = (this.raw.attributes as StationAttributes).brand;
        return `${brand.marketCity}, ${brand.marketState}`;
    }

    /**
     * Returns the URL to the station's website, if available.
     */
    get homepageUrl(): string | null {
        if (this.raw.links.brand) {
            for (const link of  (this.raw.links.brand as RelLink[])) {
                if (link.rel === StationBrandRels.Homepage) {
                    return link.href;
                }
            }
        }
        return null;
    }

    /**
     * Returns the URL to the station's online donation page, if available.
     */
    get donationUrl(): string | null {
        let preferredUrl;
        let fallbackUrl;

        if (this.raw.links.donation) {
            for (const link of (this.raw.links.donation as StationFinderLink[])) {
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
     */
    get isNprOneEligible(): boolean {
        return (this.raw.attributes as StationAttributes).eligibility.nprOne;
    }

    /**
     * Returns the raw attributes that represent this station. Please use this with caution; the public accessor methods
     * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
     * metadata.
     */
    get attributes(): StationAttributes {
        return this.raw.attributes as StationAttributes;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used for log output.
     */
    toString(): string {
        return this.displayName;
    }
}
export default Station;
