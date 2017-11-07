import fetchMock from 'fetch-mock';
import mockery from 'mockery';
import chai from 'chai';
import NprOne from '../../../src/index';
import Recommendation from '../../../src/model/recommendation';
import { LISTENING_V2_RECOMMENDATIONS_RESPONSE } from '../../test-data';


/** @test {Recommendation} */
describe('Recommendation', () => {
    const response = LISTENING_V2_RECOMMENDATIONS_RESPONSE;
    const adsWizzUrl = '^https://demo.adswizz.com';
    const doubleClickUrl = '^https://ad.doubleclick.net';
    /** @type {Recommendation} */
    let recStationId;
    /** @type {Recommendation} */
    let recNewscast;
    /** @type {Recommendation} */
    let recStoryA;
    /** @type {Recommendation} */
    let recAd;
    /** @type {Recommendation} */
    let recPromo;
    /** @type {Recommendation} */
    let recStoryB;

    const setupMockery = () => {
        mockery.registerMock('fetch', fetchMock
            .mock(adsWizzUrl, 'GET')
            .mock(doubleClickUrl, 'GET')
            .getMock());
    };

    beforeEach(() => {
        setupMockery();

        recStationId = new Recommendation(response.items[0]);
        recNewscast = new Recommendation(response.items[1]);
        recStoryA = new Recommendation(response.items[2]);
        recAd = new Recommendation(response.items[3]);
        recPromo = new Recommendation(response.items[4]);
        recStoryB = new Recommendation(response.items[5]);
    });

    afterEach(() => {
        fetchMock.restore();
        mockery.deregisterMock('fetch');
    });

    /** @test {Recommendation#constructor} */
    describe('constructor', () => {
        let responseClone;

        beforeEach(() => {
            responseClone = JSON.parse(JSON.stringify(response.items[0]));
        });


        it('should throw an error if audio doesn\'t exist', () => {
            delete responseClone.links.audio;
            chai.expect(() => {
                new Recommendation(responseClone);
            }).to.throw('Audio must exist within links.');
        });

        it('should throw an error if recommendations doesn\'t exist', () => {
            delete responseClone.links.recommendations;
            chai.expect(() => {
                new Recommendation(responseClone);
            }).to.throw('Recommendation (contains URL) must exist within links.');
        });

        it('should throw an error if attributes.rating doesn\'t exist', () => {
            delete responseClone.attributes.rating;
            chai.expect(() => {
                new Recommendation(responseClone);
            }).to.throw('Attributes must contain a rating object.');
        });
    });

    /** @test {Recommendation#getImages} */
    describe('getImages', () => {
        it('should match the API response', () => {
            recAd.getImages().should.equal(response.items[3].links.image);
        });
    });

    /** @test {Recommendation#getAudio} */
    describe('getAudio', () => {
        it('should match the API response', () => {
            recStoryA.getAudio().should.equal(response.items[2].links.audio);
        });
    });

    /** @test {Recommendation#getWeb} */
    describe('getWeb', () => {
        it('should match the API response', () => {
            recStoryA.getWeb().should.equal(response.items[2].links.web);
        });
    });

    /** @test {Recommendation#getOnRamps} */
    describe('getOnRamps', () => {
        it('should match the API response', () => {
            recStoryA.getOnRamps().should.equal(response.items[2].links.onramps);
        });
    });

    /** @test {Recommendation#getImpressions} */
    describe('getImpressions', () => {
        it('should match the API response', () => {
            recAd.getImpressions().should.equal(response.items[3].links.impression);
        });
    });

    /** @test {Recommendation#getCallsToAction} */
    describe('getCallsToAction', () => {
        it('should match the API response', () => {
            recPromo.getCallsToAction().should.equal(response.items[4].links.action);
        });
    });

    /** @test {Recommendation#getRelateds} */
    describe('getRelateds', () => {
        it('should match the API response', () => {
            recAd.getRelateds().should.equal(response.items[3].links.related);
        });
    });

    /** @test {Recommendation#getRelatedImpressions} */
    describe('getRelatedImpressions', () => {
        it('should match the API response', () => {
            recAd.getRelatedImpressions().should.equal(response.items[3].links['related-impression']);
        });
    });

    /** @test {Recommendation#getRatings} */
    describe('getRatings', () => {
        it('should return a ratings object', () => {
            recStationId.getRatings().should.be.ok;
        });
    });

    /** @test {Recommendation#getRecommendationUrl} */
    describe('getRecommendationUrl', () => {
        it('should match the API response', () => {
            recStationId.getRecommendationUrl().should.equal(response.items[0].links.recommendations[0].href);
        });
    });

    /** @test {Recommendation#getActionRecommendationUrl} */
    describe('getActionRecommendationUrl', () => {
        const actionRecUrl = 'https://api.npr.org/listening/v2/ratings?sharedMediaId=458726244%3A458726246&flow=5&channel=npr&prevStories=1&recommend=true';

        it('should match the API response', () => {
            recPromo.getActionRecommendationUrl().should.not.equal(response.items[4].links.action[0].href);
            recPromo.getActionRecommendationUrl().should.equal(actionRecUrl);
        });

        it('should only use urls that start with nprone://', () => {
            const promoClone = JSON.parse(JSON.stringify(response.items[4]));
            promoClone.links.action.unshift({ 'href': 'nprtwo://should-not?be-used' });
            const promo = new Recommendation(promoClone);
            promo.getActionRecommendationUrl().should.equal(actionRecUrl);
        });
    });

    /** @test {Recommendation#isSponsorship} */
    describe('isSponsorship', () => {
        it('should be true for an ad', () => {
            recAd.isSponsorship().should.be.true;
        });
        it('should be false for non ads', () => {
            recStationId.isSponsorship().should.be.false;
            recNewscast.isSponsorship().should.be.false;
            recStoryA.isSponsorship().should.be.false;
            recPromo.isSponsorship().should.be.false;
            recStoryB.isSponsorship().should.be.false;
        });
    });

    /** @test {Recommendation#isShareable} */
    describe('isShareable', () => {
        it('should be true for recommendations with onramps', () => {
            recStoryA.isShareable().should.be.true;
            recPromo.isShareable().should.be.true;
            recStoryB.isShareable().should.be.true;
        });
        it('should be false for recommendations without onramps', () => {
            recStationId.isShareable().should.be.false;
            recNewscast.isShareable().should.be.false;
            recAd.isShareable().should.be.false;
        });
    });

    /** @test {Recommendation#toString} */
    describe('toString', () => {
        it('should match the format specified', () => {
            recStoryA.toString().should.equal('[UID=466898631:466898632, R=]');
        });
    });

    /** @test {Recommendation#recordAction} */
    describe('recordAction', () => {
        it('should only allow valid ratings', () => {
            recNewscast.setRatingReceivedCallback(() => {});

            recNewscast.recordAction(NprOne.Action.START, 0);
            recNewscast.getRatings()[0].rating.should.equal('START');
            recNewscast.recordAction(NprOne.Action.COMPLETED, 10);
            recNewscast.getRatings()[1].rating.should.equal('COMPLETED');

            chai.expect(() => {
                recNewscast.recordAction('BAD_VALUE', 0);
            }).to.throw('BAD_VALUE action is invalid. See Action class for valid actions.');
        });

        it('should require elapsed time to be an integer', () => {
            recStationId.setRatingReceivedCallback(() => {});

            chai.expect(() => {
                recStationId.recordAction(NprOne.Action.START);
            }).to.throw('Elapsed time must be supplied and be a positive integer value.');

            chai.expect(() => {
                recStationId.recordAction(NprOne.Action.SKIP, 'bad value');
            }).to.throw('Elapsed time must be supplied and be a positive integer value.');
        });

        it('should auto-correct bad elapsed time values', () => {
            recStationId.setRatingReceivedCallback(() => {});

            recStationId.recordAction(NprOne.Action.START, -10);
            recStationId.getRatings()[0].elapsed.should.equal(0);
            recStationId.recordAction(NprOne.Action.START, 99999);
            recStationId.getRatings()[1].elapsed.should.equal(recStationId.attributes.duration);
        });

        it('should auto-correct bad elapsed time values but only if duration is greater than 0', () => {
            const clone = JSON.parse(JSON.stringify(response.items[0]));
            clone.attributes.duration = 0;

            const rec = new Recommendation(clone);

            rec.setRatingReceivedCallback(() => {});

            const largeDuration = 10000;

            rec.recordAction(NprOne.Action.COMPLETED, largeDuration);
            rec.getRatings()[0].elapsed.should.equal(largeDuration);
        });

        it('should warn developers when a zero elapsed time is given for a COMPLETED or SKIP', () => {
            recStationId.recordAction(NprOne.Action.COMPLETED, 0);
        });

        it('should warn developers when a non-START rating is received before START', () => {
            const clone = JSON.parse(JSON.stringify(response.items[0]));
            clone.attributes.duration = 0;

            const rec = new Recommendation(clone);

            rec.setRatingReceivedCallback(() => {});
            rec.recordAction(NprOne.Action.COMPLETED, 30);
        });

        it('should auto-correct bad elapsed time values if the difference is more than 30', () => {
            recStoryA.setRatingReceivedCallback(() => {});

            const moderatelyWrongDuration = recStoryA.attributes.duration + 20;

            recStoryA.recordAction(NprOne.Action.COMPLETED, moderatelyWrongDuration);
            recStoryA.getRatings()[0].elapsed.should.equal(recStoryA.attributes.duration);
        });

        it('should execute a GET request against all impression URLs', () => {
            recAd.setRatingReceivedCallback(() => {});

            recAd.recordAction(NprOne.Action.START, 0);

            fetchMock.called(adsWizzUrl).should.be.true;
            fetchMock.called(doubleClickUrl).should.be.true;
            fetchMock.calls().unmatched.length.should.equal(0);
        });

        it('but only on the first START rating and not subsequent STARTs', () => {
            recAd.setRatingReceivedCallback(() => {});
            recAd.recordAction(NprOne.Action.START, 0);

            fetchMock.restore();
            mockery.deregisterMock('fetch');
            setupMockery();

            recAd.recordAction(NprOne.Action.START, 0);

            fetchMock.called(adsWizzUrl).should.be.false;
            fetchMock.called(doubleClickUrl).should.be.false;
        });

        it('should call the callback set via setRatingReceivedCallback', done => {
            recStationId.setRatingReceivedCallback(() => {
                done();
            });
            recStationId.recordAction(NprOne.Action.START, 0);
        });
    });

    /** @test {Recommendation#hasAction} */
    describe('hasAction', () => {
        it('should be true when a recommendation actually has that rating', () => {
            recStoryA.setRatingReceivedCallback(() => {});
            recStoryA.recordAction(NprOne.Action.START, 0);
            recStoryA.hasAction(NprOne.Action.START).should.be.true;
        });

        it('should be false when a recommendation does not have that rating', () => {
            recStoryA.setRatingReceivedCallback(() => {});
            recStoryA.recordAction(NprOne.Action.COMPLETED, 0);

            recStoryA.hasAction(NprOne.Action.START).should.be.false;
        });
    });

    /** @test {Recommendation#hasEndAction} */
    describe('hasEndAction', () => {
        it('should be true when a recommendation has a finished rating', () => {
            recStoryA.setRatingReceivedCallback(() => {});
            recStoryA.recordAction(NprOne.Action.START, 0);
            recStoryA.recordAction(NprOne.Action.SHARE, 0);

            recStoryA.hasEndAction().should.be.false;

            recStoryA.recordAction(NprOne.Action.COMPLETED, 0);

            recStoryA.hasEndAction().should.be.true;
        });
    });
});
