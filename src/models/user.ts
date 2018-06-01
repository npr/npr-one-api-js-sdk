import { CollectionDoc, CollectionDocJSON } from './collection-doc';

export interface UserAttributes {
    /** Some unique identifier for the user */
    id: string;

    /** The user's email address */
    email: string;

    /** The user's first name */
    firstName: string;

    /** The user's last name */
    lastName: string;

    /** The user's cohort (an experimental grouping for User Experience A/B Testing) */
    cohort: UserCohort;

    /** User's chosen NPR Member Station(s) */
    organizations: UserOrganization[];

    /** Programs, shows, and podcasts that the user has positively interacted with */
    affiliations: UserAffiliation[];
}

export interface UserOrganization {
    /** Some unique identifier for the organization */
    id: string;

    /** A short displayable text field for the end user, strictly text */
    displayName: string;

    /** Station call letters */
    call: string;

    /** A short description of the station's main market city */
    city: string;

    /** Station logo image URL */
    logo?: string;

    /** The URL to a website where users may make a donation to support the station */
    donationUrl?: string;
}

export interface UserAffiliation {
    /** A unique identifier for the aggregation (program) */
    id: number;

    /** The display name of the aggregation (program) */
    title?: string;

    /** A link that can be followed to get content from this aggregation (program) */
    href: string;

    /**
     * Whether or not the user is following the aggregation. When changing affiliation status,
     * the client is expected to toggle this value and then send the entire object back.
     */
    following: boolean;

    /** The user's average rating for this affiliation on a scale of 0-1. Absent if user never listened to the aggregation. */
    rating?: number;

    /** The number of days since a user last listened to a story from this aggregation. Absent if user never listened to the aggregation. */
    daysSinceLastListen?: number;
}

export interface UserCohort {
    /** A short ID for this cohort */
    id: string;

    /** A text string identifying the cohort, useful for metrics */
    name: string;

    /** For internal use only; represents the current configuration file being used by the Listening Service */
    directory: string;
}

/**
 * Container class for all metadata pertaining to a user object from the NPR One API
 */
export class User extends CollectionDoc {
    public readonly attributes: UserAttributes;

    /**
     * @param json The decoded JSON object that should be used as the basis for this model
     */
    constructor(json: CollectionDocJSON) {
        super(json);

        this.attributes = this.raw.attributes as UserAttributes;
    }

    /**
     * Whether this user is a temporary user or not
     */
    isTemporary(): boolean {
        return parseInt(this.attributes.id, 10) >= 1000000000;
    }

    /**
     * Returns the user's cohort. In most cases, SDK consumers will never need to use this.
     */
    get cohort(): UserCohort {
        return this.attributes.cohort;
    }

    /**
     * Returns the list of organizations this user is affiliated with. In most cases, you only want a single
     * organization, in which case {@link User#getPrimaryOrganization} should be used.
     *
     * @returns {Array<UserOrganization>}
     */
    get organizations(): UserOrganization[] {
        return this.attributes.organizations || [];
    }

    /**
     * Returns the primary, non-NPR organization that this user is affiliated with, or null if no such organization
     * exists.
     */
    get primaryOrganization(): UserOrganization | null {
        const orgs = this.organizations;
        return orgs[0] && orgs[0].id !== '1' ? orgs[0] : null;
    }

    /**
     * Returns the programs, shows, and podcasts that this user has positively interacted with.
     */
    get affiliations(): UserAffiliation[] {
        return this.attributes.affiliations;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used for log output.
     */
    toString(): string {
        return this.attributes.id;
    }
}
export default User;
