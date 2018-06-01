const { URL } = require('url');

import { Actions, EndActions } from '../constants/actions';
import { RecommendationTypes } from '../constants/recommendation-types';

import { AudioLink, CollectionDoc, CollectionDocJSON, FormFactorLink, ImageLink, Link, WebLink } from './collection-doc';

export interface RecommendationAttributes {
    /** The type of recommendation, usually `audio`. Can also be `stationId`, `sponsorship`, etc. */
    type: RecommendationTypes | string;

    /** The universal identifier of the recommendation */
    uid: string;

    /** The title of the recommendation */
    title: string;

    /** Whether or not the recommendation is skippable, usually true, but false for e.g. sponsorship */
    skippable: boolean;

    /** A slug or category for the recommendation */
    slug?: string;

    /** The provider of the story, usually `NPR`. Can also be a member station or third-party podcast provider. */
    provider: string;

    /** The program as part of which this recommendation aired */
    program?: string;

    /** The duration of the audio according to the API; note that the actual duration can differ */
    duration: number;

    /** ISO-8601 formatted date/time; the date at which the story was first published */
    date: string;

    /** A short description of the recommendation */
    description?: string;

    /** The reason for recommending this piece to the listener */
    rationale: string;

    /** The text to display in a clickable button on a feature card */
    button?: string;
}

export interface Rating {
    /** The media id as given by the media object */
    mediaId: string;

    /** How the recommendation was generated */
    origin: string;

    /** String representing the rating (action) */
    rating: string;

    /** Number of seconds since the start of playback for this media item, as an integer */
    elapsed: number;

    /** Number of seconds this audio piece is expected to last */
    duration: number;

    /** ISO-8601 formatted date/time; typically replaced by the client with the actual rating time */
    timestamp: string;

    /** The channel this media item was pulled from */
    channel: string;

    /** The primary cohort of the current logged-in user */
    cohort: string;

    /**
     * An array of IDs & other data about collections or podcasts the user has ratings for;
     * produced by the server and should be sent back as received; used for tracking program and podcast suggestions
     */
    affiliations: string[];
}

/**
 * Container class for all metadata pertaining to a recommendation.
 *
 * Provides metadata and the recordAction method, which sends feedback on user actions to NPR's APIs
 * and advances the flow of audio recommendations to the user.
 */
export class Recommendation extends CollectionDoc {
    /** The metadata used to describe this recommendation, such as type and title */
    public readonly attributes: RecommendationAttributes;
    /** The actual audio files associated with this recommendation; should never be empty */
    public readonly audio: AudioLink[] = [];
    /** A list of API calls the app can make to send heartbeat events; should never be accessed directly by consumers */
    public readonly ratings: Link[] = [];
    /** A list of API calls the app can make to retrieve subsequent recommendations; should never be accessed directly by consumers */
    public readonly recommendations: Link[] = [];
    /** A list of images associated with this recommendation; could be empty */
    public readonly images: ImageLink[] = [];
    /** A list of links to other places where this story can be found on the web (for example, on NPR.org); could be empty */
    public readonly web: WebLink[] = [];
    /** A list of links that are used as the canonical link(s) when sharing this story on social media */
    public readonly onramps: WebLink[] = [];
    /** This is the `action` array from the API within `links`, and _NOT_ this SDK's notion of {@link Action} */
    public readonly callsToAction: Link[] = [];
    /**
     * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client
     * has played the accompanying audio
     */
    public readonly impressions: FormFactorLink[] = [];
    /** A list of links to places where the app can take the user if they interact with this `sponsorship` item */
    public readonly relateds: FormFactorLink[] = [];
    /**
     * A list of API calls to make if this recommendation is of type `sponsorship` and the consuming client has
     * chosen to interact with the sponsorship item using the contents of {@link relateds}
     */
    public readonly relatedImpressions: FormFactorLink[] = [];
    /**
     * Used to return the rating "template" later used to produce the actual ratings to send back to the API.
     * The SDK will work with this, and consumers of the SDK are not expected to touch these on their own.
     */
    public readonly ratingTemplate: Rating;

    /**
     * @param json The decoded JSON object that should be used as the basis for this model
     *
     * @throws {TypeError} if the collection doc is invalid
     */
    constructor(json: CollectionDocJSON) {
        super(json);

        if (!this.raw.attributes.rating) {
            throw new TypeError('Attributes must contain a rating object.');
        }
        this.ratingTemplate = this.raw.attributes.rating;

        // deep copy, we do not want duplicate rating objects
        this.attributes = Object.assign({}, this.raw.attributes as RecommendationAttributes);
        delete (this.attributes as any).rating;

        const links = this.raw.links;
        // Required
        if (links.audio && links.audio.length > 0) {
            this.audio = links.audio as AudioLink[];
        } else {
            throw new TypeError('Audio must exist within links.');
        }

        if (links.recommendations  && links.recommendations.length > 0) {
            this.recommendations = links.recommendations;
        } else {
            throw new TypeError('Recommendations (contains URL) must exist within links.');
        }

        if (links.ratings  && links.ratings.length > 0) {
            this.ratings = links.ratings;
        } else {
            throw new TypeError('Ratings (contains URL) must exist within links.');
        }

        // Optional
        this.web = links.web ? links.web as WebLink[] : [];
        this.images = links.image ? links.image as ImageLink[] : [];
        this.onramps = links.onramps ? links.onramps as WebLink[] : [];
        this.callsToAction = links.action ? links.action : [];
        this.impressions = links.impression ? links.impression : [];
        this.relateds = links.related ? links.related : [];
        this.relatedImpressions = links['related-impression'] ? links['related-impression'] : [];
    }

    /**
     * Shorthand to get the unique identifier for this recommendation
     */
    public get id(): string {
        return this.attributes.uid;
    }

    /**
     * Returns whether this recommendation is skippable
     */
    public get isSkippable(): boolean {
        return this.attributes.skippable;
    }

    /**
     * Returns whether this recommendation is of type `sponsorship`
     */
    public get isSponsorship(): boolean {
        return this.attributes.type === RecommendationTypes.Sponsorship;
    }

    /**
     * Returns whether this recommendation is of type `stationId`
     */
    public get isStationId(): boolean {
        return this.attributes.type === RecommendationTypes.StationID;
    }

    /**
     * Returns whether this recommendation is a feature card (e.g. `featureCardInformational`, `featureCardPromotion`)
     */
    public get isFeatureCard(): boolean {
        return /^featureCard/.test(this.attributes.type);
    }

    /**
     * Returns whether this recommendation is shareable on social media
     */
    public get isShareable(): boolean {
        return this.onramps.length > 0;
    }

    /**
     * Returns the URL that should be used to send heartbeat ratings, which do NOT result in fresh recommendations.
     * This should typically not be used by clients directly; use {@link NprOneSDK#sendRatings} instead.
     */
    public get heartbeatUrl(): string {
        return this.ratings[0].href;
    }

    /**
     * Returns the URL that should be used to obtain the next set of recommendations. This should typically not be used
     * by clients directly; use {@link NprOneSDK#sendRatings} instead.
     */
    public get recommendationUrl(): string {
        return this.recommendations[0].href;
    }

    /**
     * This method looks through the recommendation's action and related array to search for any URL starting with `'nprone://listen'`.
     * If found, everything from the query params is appended to the original recommendation URL.
     * This value is then used anytime a user indicates they want more similar stories by clicking or tapping on this recommendation.
     *
     * For many recommendations, this will not exist and getRecommendationUrl is used instead.
     */
    public get actionRecommendationUrl(): string {
        const original = new URL(this.recommendationUrl);
        const potentialActions = this.callsToAction.concat(this.relateds);

        let nprOneUrl: any;
        for (const action of potentialActions) {
            if (action.href && action.href.indexOf('nprone://') === 0) {
                nprOneUrl = new URL(action.href);
                break;
            }
        }

        let url = '';
        if (nprOneUrl) {
            url = `${original.set('query', nprOneUrl.query).href}&recommend=true`;
        }

        return url;
    }

    /**
     * Like with `actionRecommendationUrl()` above, this should not typically be used for 99% of use cases.
     * This is specifically designed for when this recommendation was obtained through a channel other than
     * the default channel of `npr`, and the client sends a `TIMEOUT` or `PASS` rating, which is one of the
     * only cases in which we want to keep asking for recommendations from the original channel instead of
     * kicking the user back into the regular flow, which is what using `recommendationUrl` would do.
     */
    public get channelRecommendationUrl(): string {
        const original = new URL(this.recommendationUrl);
        return `${original.origin}${original.pathname}?channel=${this.ratingTemplate.channel}&recommend=true`;
    }

    /**
     * A convenience function to cast this object back to a string, generally only used for log output.
     */
    public toString(): string {
        return `[UID=${this.attributes.uid}}]`;
    }
}
export default Recommendation;
