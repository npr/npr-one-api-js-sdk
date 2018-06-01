import { AudioContentTypes, ImageContentTypes, WebContentTypes } from '../constants/content-types';
import { FormFactors } from '../constants/form-factors';
import { AudioRels, ImageRels, WebRels } from '../constants/link-rels';

export interface CollectionDocJSON {
    /** The version of the Collection.Doc+JSON Hypermedia Type Specification being used by this document */
    version: string;

    /** A unique identifier of the resource representation in the form of a Uniform Resource Identifier (URI) */
    href: string;

    /** A set of metadata attributes that represent the "state" of the resource in the form of key-value pairs; may be an empty object */
    attributes: { [key: string]: any };

    /** A list of items associated with this document; may be an empty array */
    items: CollectionDocJSON[];

    /** A map of resources that expose controls and communicate relationships with other documents;
     * the keys describe the relationship to the current document, while the values are arrays of links */
    links: { [key: string]: Link[] };

    /** A list of errors encountered in the process of creating and/or retrieving this document,
     * intended to facilitate reliable debugging of client/server interactions */
    errors: any[];
}

export interface Link {
    /** The URI that represents the resource */
    href: string;

    /** The MIME-type of the resource */
    'content-type'?: string;
}

export interface FormFactorLink extends Link {
    /**
     * The form-factor for the most appropriate display of or interaction with the resource,
     * usually irrelevant unless there is more than one link of the same type
     */
    'form-factor'?: FormFactors | string;
}

export interface RelLink extends Link {
    /** The relation of the link to the content */
    rel?: string;
}

export interface AudioLink extends RelLink {
    'content-type': AudioContentTypes | string;

    rel?: AudioRels | string;
}

export interface ImageLink extends FormFactorLink, RelLink {
    'content-type': ImageContentTypes | string;

    /** The relation of the image to the content, which usually corresponds to the crop-type */
    rel?: ImageRels | string;

    /** The pixel height of the image */
    height?: number;

    /** The pixel width of the image */
    width?: number;

    /** The producer of the image; should be used for properly attributing the image when it exists */
    producer?: string;

    /** The provider of the image; should be used for properly attributing the image when it exists */
    provider?: string;

    /** A unique identifier for the image */
    image?: string;
}

export interface WebLink extends RelLink {
    'content-type': WebContentTypes | string;

    rel?: WebRels | string;
}

/**
 * A base model for any resources following our Collection Doc schema
 * @see http://cdoc.io
 */
export class CollectionDoc {
    /** The raw, decoded JSON response from an API call to one of the NPR One Services */
    protected raw: CollectionDocJSON;

    /**
     * @param json The decoded JSON object that should be used as the basis for this model
     */
    constructor(json: CollectionDocJSON) {
        this.raw = json;
    }

    /**
     * Exposed for legacy reasons. Prefer model accessor methods where possible.
     */
    public get collectionDoc(): CollectionDocJSON {
        return this.raw;
    }
}
export default CollectionDoc;
