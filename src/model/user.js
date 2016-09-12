import CollectionDoc from './collection-doc';

/**
 * Container class for all metadata pertaining to a user object from the NPR One API
 *
 * @extends {CollectionDoc}
 */
export default class User extends CollectionDoc
{
    /**
     * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
     */
    constructor(json) {
        super(json);
        /** @type {Object}
         * @private */
        this._raw = json;
        /** @type {UserAttributes} */
        this.attributes = {};
        this._hydrate();
    }

    /**
     * Hydrate the internal member variables.
     *
     * @private
     */
    _hydrate() {
        this._validate();
        this.attributes = this._raw.attributes;
    }

    /**
     * Whether this user is a temporary user or not
     *
     * @returns {boolean}
     */
    isTemporary() {
        return parseInt(this.attributes.id, 10) >= 1000000000;
    }

    /**
     * Returns the user's cohort. In most cases, SDK consumers will never need to use this.
     *
     * @returns {UserCohort}
     */
    getCohort() {
        return this.attributes.cohort;
    }

    /**
     * Returns the list of organizations this user is affiliated with. In most cases, you only want a single
     * organization, in which case {@link User#getPrimaryOrganization} should be used.
     *
     * @returns {Array<UserOrganization>}
     */
    getOrganizations() {
        return this.attributes.organizations || [];
    }

    /**
     * Returns the primary, non-NPR organization that this user is affiliated with, or null if no such organization
     * exists.
     *
     * @returns {null|UserOrganization}
     */
    getPrimaryOrganization() {
        const orgs = this.getOrganizations();
        return orgs[0] && orgs[0].id !== '1' ? orgs[0] : null;
    }

    /**
     * Returns the programs, shows, and podcasts that this user has positively interacted with.
     *
     * @returns {Array<UserAffiliation>}
     */
    getAffiliations() {
        return this.attributes.affiliations;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the user's ID.
     *
     * @returns {string}
     */
    toString() {
        return this.attributes.id;
    }

    /**
     * @typedef {Object} UserAttributes
     * @property {string} id Some unique identifier for the user
     * @property {string} email The user's email address
     * @property {string} firstName The user's first name
     * @property {string} lastName The user's last name
     * @property {UserCohort} cohort The user's cohort (an experimental grouping for User Experience A/B Testing)
     * @property {Array<UserOrganization>} organizations User's chosen NPR Member Station(s)
     * @property {Array<UserAffiliation>} affiliations Programs, shows, and podcasts that the user has positively interacted with
     */
    /**
     * @typedef {Object} UserCohort
     * @property {string} id A short ID for this cohort
     * @property {string} name A text string identifying the cohort, useful for metrics
     * @property {string} directory For internal use only; represents the current configuration file being used by the Listening Service
     */
    /**
     * @typedef {Object} UserOrganization
     * @property {string} id Some unique identifier for the organization
     * @property {string} displayName A short displayable text field for the end user, strictly text
     * @property {string} call Station call letters
     * @property {string} city A short description of the station's main market city
     * @property {string} [logo] Station logo image URL
     * @property {string} [donationUrl] The URL to a website where users may make a donation to support the station
     */
    /**
     * @typedef {Object} UserAffiliation
     * @property {number} id A unique identifier for the aggregation (program)
     * @property {string} [title] The display name of the aggregation (program)
     * @property {string} href A link that can be followed to get content from this aggregation (program)
     * @property {boolean} following Whether or not the user is following the aggregation. When changing affiliation status, the client is expected to toggle this value and then send the entire object back.
     * @property {number} [rating] The user's average rating for this affiliation on a scale of 0-1. Absent if user never listened to the aggregation.
     * @property {number} [daysSinceLastListen] The number of days since a user last listened to a story from this aggregation. Absent if user never listened to the aggregation.
     */
}
