import Rating from '../../../src/model/rating';
import chai from 'chai';
import { LISTENING_V2_RECOMMENDATIONS_RESPONSE } from '../../test-data';


/** @test {Rating} */
describe('Rating', () => {
    /** @type Rating */
    let rating;
    let responseClone;

    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(
            LISTENING_V2_RECOMMENDATIONS_RESPONSE.items[0].attributes.rating
        ));
        rating = new Rating(responseClone);
    });

    /** @test {Rating#constructor} */
    describe('constructor', () => {
        it('should hydrate the model', () => {
            rating.mediaId.should.equal(responseClone.mediaId);
            rating.origin.should.equal(responseClone.origin);
        });
    });

    /** @test {Rating#toString} */
    describe('toString', () => {
        it('should match what is specified', () => {
            rating.toString().should.equal('[RID=300305:idWAMU2016-02-16-09-37, R=START]');
        });
    });

    /** @test {Rating.privateMemberReplacer} */
    describe('privateMemberReplacer', () => {
        it('should remove private member variables', () => {
            chai.expect(Rating.privateMemberReplacer('_hasSent', 'value1')).to.be.undefined;
            Rating.privateMemberReplacer('mediaId', 'value2').should.equal('value2');
        });
    });
});
