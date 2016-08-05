import CollectionDoc from '../../../src/model/collection-doc';
import { IDENTITY_V2_USER_RESPONSE } from '../../test-data';


/** @test {CollectionDoc} */
describe('CollectionDoc', () => {
    /** @type CollectionDoc */
    let collectionDoc;
    let responseClone;

    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));
        collectionDoc = new CollectionDoc(responseClone);
    });

    /** @test {CollectionDoc#collectionDoc} */
    describe('collectionDoc', () => {
        it('should match the API response', () => {
            collectionDoc.collectionDoc.should.equal(responseClone);
        });
    });
});
