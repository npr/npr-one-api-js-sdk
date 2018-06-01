import Validator from './validator';
import Recommendation from './../model/recommendation';
import Logger from './../util/logger';


/**
 * Creates recommendation objects from collection doc ensuring that necessary
 * properties are present
 *
 * @param {CollectionDocJSON} collectionDoc
 * @returns {Array<Recommendation>}
 * @throws {TypeError} if the collectionDoc passed in is not valid
 */
export default function createRecommendations(collectionDoc) {
    Validator.validateCollectionDoc(collectionDoc);

    const recommendations = [];
    collectionDoc.items.forEach((item) => {
        try {
            recommendations.push(new Recommendation(item));
        } catch (e) {
            Logger.warn('Recommendation is invalid and has been excluded.', e);
        }
    });

    return recommendations;
}
