import chai from 'chai';
import createRecommendations from '../../../src/util/recommendation-creator.js';
import { LISTENING_V2_RECOMMENDATIONS_RESPONSE } from '../../test-data';

const should = chai.should();

/** @test {createRecommendations} */
describe('createRecommendations', () => {
    let responseClone;

    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(LISTENING_V2_RECOMMENDATIONS_RESPONSE));
    });

    it('should create an array of recommendations with valid input', () => {
        const recommendations = createRecommendations(responseClone);

        recommendations.length.should.equal(6);
    });

    it('should filter out recommendations which are not valid', () => {
        delete responseClone.items[3].links.audio;
        delete responseClone.items[2].links.recommendations;
        const recommendations = createRecommendations(responseClone);

        recommendations.length.should.equal(4);
    });
});
