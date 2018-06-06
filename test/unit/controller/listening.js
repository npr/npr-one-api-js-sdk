import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { testConfig } from '../../test';
import mockery from 'mockery';
import fetchMock from 'fetch-mock';
import { LISTENING_V2_RECOMMENDATIONS_RESPONSE, ACCESS_TOKEN_RESPONSE } from './../../test-data';
import Listening from './../../../src/controller/listening';
import NprOne from './../../../src/index';

const should = chai.should();
chai.use(chaiAsPromised);

/** @test {Listening} */
describe('Listening', () => {
    const recommendUrl = `^${NprOne.getServiceUrl('listening')}/recommendations`;
    // This hostname is set in TEST_DATA output
    const ratingUrl = `^${NprOne.getServiceUrl('listening')}/ratings`;
    const adsWizzUrl = '^https://demo.adswizz.com';
    const adsWizzWwwUrl = 'https://adswizz.com';
    const adsWizzCdnUrl = '^https://delivery-s3.adswizz.com';
    const doubleClickUrl = '^https://ad.doubleclick.net';
    const historyUrl = `^${NprOne.getServiceUrl('listening')}/history`;

    let testDataClone = {};
    let listening;
    let refreshTokenUrl;

    const advance = (recommendation, rating) => {
        testDataClone.items.shift();
        recommendation.recordAction(NprOne.Action.START, 0);

        return new Promise((resolve) => {
            setTimeout(() => {
                recommendation.recordAction(rating, recommendation.attributes.duration);
                resolve(listening.getRecommendation());
            }, 5);
        });
    };

    const skip = recommendation => {
        return advance(recommendation, NprOne.Action.SKIP);
    };

    const complete = recommendation => {
        return advance(recommendation, NprOne.Action.COMPLETED);
    };

    const tapthru = recommendation => {
        return advance(recommendation, NprOne.Action.TAPTHRU);
    };

    beforeEach(() => {
        testDataClone = JSON.parse(JSON.stringify(LISTENING_V2_RECOMMENDATIONS_RESPONSE));

        mockery.registerMock('fetch', fetchMock
            .mock(recommendUrl, 'GET', testDataClone)
            .mock(ratingUrl, 'POST', testDataClone)
            .mock(adsWizzUrl, 'GET')
            .mock(adsWizzWwwUrl, 'GET', 200)
            .mock(adsWizzCdnUrl, 'GET', 200)
            .mock(doubleClickUrl, 'GET')
            .mock(historyUrl, 'GET', LISTENING_V2_RECOMMENDATIONS_RESPONSE)
            .getMock());

        listening = new Listening();
        NprOne.config = testConfig;

        refreshTokenUrl = `^${testConfig.authProxyBaseUrl}${NprOne.config.refreshTokenPath}`;
    });

    afterEach(() => {
        fetchMock.restore();
        mockery.deregisterMock('fetch');
    });

    /** @test {Listening#getRecommendation} */
    describe('getRecommendation', () => {
        let firstRecommendation = null;

        const sendSingleAction = (action) => {
            return listening.getRecommendation()
                .then(recommendation => {
                    firstRecommendation = recommendation;
                    testDataClone.items.shift();
                    firstRecommendation.recordAction(action, 0);
                    return listening.getRecommendation();
                });
        };


        beforeEach(() => {
            firstRecommendation = null;
        });


        it('should throw an exception if access token is not supplied', () => {
            NprOne.config = { accessToken: '' };

            chai.expect(() => {
                listening.getRecommendation();
            }).to.throw('An Access Token must set before making API requests.');
        });

        it('should make a request to /recommendations with channel npr if a bad channel is passed in', done => {
            listening.getRecommendation('', { 'bad': 'channel' })
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a request to /recommendations when no queued ratings exist', done => {
            listening.getRecommendation()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should return the currently executing promise if called again before first promise has resolved', done => {
            const p1 = listening.getRecommendation();
            const p2 = listening.getRecommendation();

            Promise.all([p1, p2])
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls(recommendUrl).length.should.equal(1); // most important check
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a request to /recommendations with a custom channel when no queued ratings exist and a channel is specified', done => {
            listening.getRecommendation(null, 'my_channel')
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    /channel=my_channel/.test(fetchMock.lastUrl()).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should include x- headers if supplied in config when making API requests', done => {
            NprOne.config = Object.assign({}, testConfig, {
                advertisingId: 'test_ad_id',
                advertisingTarget: 'test_ad_target',
            });

            listening.getRecommendation()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    const lastCall = fetchMock.lastCall(recommendUrl);
                    lastCall[1].headers._headers['x-advertising-id'][0].should.equal('test_ad_id');
                    lastCall[1].headers._headers['x-advertising-target'][0].should.equal('test_ad_target');
                    done();
                })
                .catch(done);
        });

        it('should make /recommendations request with sharedMediaId when a UID is given', done => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');

            const url = `^${NprOne.getServiceUrl('listening')}/recommendations?channel=npr&sharedMediaId=123`;

            mockery.registerMock('fetch', fetchMock
                .mock(url, 'GET', LISTENING_V2_RECOMMENDATIONS_RESPONSE)
                .mock(adsWizzWwwUrl, 'GET', 200)
                .mock(adsWizzCdnUrl, 'GET', 200)
                .getMock());

            listening.getRecommendation('123')
                .then(() => {
                    fetchMock.called(url).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a request to /ratings when a rating is queued', done => {
            listening.getRecommendation()
                .then(complete)
                .then(() => {
                    fetchMock.called(ratingUrl).should.be.true;
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a request to /ratings and not send duplicate ratings if an action was record twice', done => {
            listening.getRecommendation()
                .then(recommendation => {
                    // COMPLETED before START is not correct, but needed for this test
                    recommendation.recordAction(NprOne.Action.COMPLETED, recommendation.attributes.duration);
                    recommendation.recordAction(NprOne.Action.COMPLETED, recommendation.attributes.duration);
                    recommendation.recordAction(NprOne.Action.START, 0);
                })
                .then(() => {
                    fetchMock.called(ratingUrl).should.be.true;
                    fetchMock.called(recommendUrl).should.be.true;
                    JSON.parse(fetchMock.lastOptions(ratingUrl).body).length.should.be.equal(2); // 2 ratings, not 3!
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should return the same recommendation when no START rating has been received', done => {
            listening.getRecommendation()
                .then(recommendation => {
                    firstRecommendation = recommendation;
                    return listening.getRecommendation();
                })
                .then((nextRecommendation) => {
                    firstRecommendation.should.deep.equal(nextRecommendation);
                    done();
                })
                .catch(done);
        });

        it('should return a different recommendation when a START rating has been received', done => {
            sendSingleAction(NprOne.Action.START)
                .then(nextRecommendation => {
                    firstRecommendation.should.not.equal(nextRecommendation);
                    done();
                })
                .catch(done);
        });

        it('should return a different recommendation when a TIMEOUT rating has been received', done => {
            sendSingleAction(NprOne.Action.TIMEOUT)
                .then(nextRecommendation => {
                    firstRecommendation.should.not.equal(nextRecommendation);
                    done();
                })
                .catch(done);
        });

        it('should return a different recommendation when a TAPTHRU rating has been received', done => {
            sendSingleAction(NprOne.Action.TAPTHRU)
                .then(nextRecommendation => {
                    firstRecommendation.should.not.equal(nextRecommendation);
                    done();
                })
                .catch(done);
        });

        it('should fire impression url GET requests for sponsorship when a START happens', done => {
            testDataClone.items.splice(0, 3); // remove stationId, newscast, story

            listening.getRecommendation()
                .then(recommendation => { // start ad
                    recommendation.attributes.uid.should.equal('299999:AdswizzAd13460|2016-02-17-12-42');
                    return complete(recommendation);
                })
                .then(recommendation => { // start promo
                    recommendation.attributes.uid.should.equal('458726244:458726246-P');
                    fetchMock.called(adsWizzUrl).should.be.true;
                    fetchMock.called(doubleClickUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should disable ads when an adblocker is present', done => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');

            mockery.registerMock('fetch', fetchMock
                .mock(recommendUrl, 'GET', testDataClone)
                .mock(ratingUrl, 'POST', testDataClone)
                .mock(adsWizzWwwUrl, 'GET', { 'throws': new Error('TypeError: Failed to fetch') })
                .mock(adsWizzCdnUrl, 'GET', { 'throws': new Error('TypeError: Failed to fetch') })
                .getMock());

            testDataClone.items.splice(0, 2); // remove stationId, newscast,

            NprOne.config = testConfig;
            listening = new NprOne();


            listening.getRecommendation()
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('466898631:466898632');
                    return complete(recommendation);
                })
                .then(recommendation => {
                    // normally sponsorship would be next
                    recommendation.attributes.uid.should.equal('458726244:458726246-P');
                    done();
                })
                .catch(done);
        });

        it('should progress through the flow normally', done => {
            listening.getRecommendation()
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('300305:idWAMU2016-02-16-09-37');
                    return complete(recommendation);
                })
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('999900001:2016-02-16T09:00:00-0500|short');
                    return skip(recommendation);
                })
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('466898631:466898632');
                    return complete(recommendation);
                })
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('299999:AdswizzAd13460|2016-02-17-12-42');
                    return complete(recommendation);
                })
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('458726244:458726246-P');
                    done();
                })
                .catch(done);
        });

        it('should go to sponsored channel on TAPTHRU to sponsorship [tests related]', done => {
            let actionUrl = '';

            testDataClone.items.splice(0, 3); // remove stationId, newscast, story

            listening.getRecommendation()
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('299999:AdswizzAd13460|2016-02-17-12-42');
                    actionUrl = recommendation.getActionRecommendationUrl();
                    actionUrl.should.not.be.empty;
                    return tapthru(recommendation);
                })
                .then(() => {
                    /*
                     * All bets are off here as to what the recommendation would be - I'm not going to mock
                     * the sponsored channel API behavior. It's sufficient to see that we made a ratings call to
                     * the sponsored channel URL.
                     */
                    fetchMock.lastUrl().should.equal(actionUrl);
                    done();
                })
                .catch(done);
        });

        it('should go to action URL on TAPTHRU of promo [tests action, or callsToAction]', done => {
            let actionUrl = '';

            testDataClone.items.splice(0, 4); // remove stationId, newscast, story, ad

            listening.getRecommendation()
                .then(recommendation => {
                    recommendation.attributes.uid.should.equal('458726244:458726246-P');
                    actionUrl = recommendation.getActionRecommendationUrl();
                    actionUrl.should.not.be.empty;
                    return tapthru(recommendation);
                })
                .then(() => {
                    /*
                     * All bets are off here as to what the recommendation would be - I'm not going to mock
                     * the promo behavior. It's sufficient to see that we made a ratings call to
                     * the promo channel URL.
                     */
                    fetchMock.lastUrl().should.equal(actionUrl);
                    done();
                })
                .catch(done);
        });

        it('should throw when no API recommendations are returned and no previous exist', done => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');

            const url = `^${NprOne.getServiceUrl('listening')}/recommendations`;

            testDataClone.items = [];

            mockery.registerMock('fetch', fetchMock
                .mock(url, 'GET', testDataClone)
                .mock(adsWizzWwwUrl, 'GET', 200)
                .mock(adsWizzCdnUrl, 'GET', 200)
                .getMock());

            listening.getRecommendation().should.be.rejectedWith('Error: All recommendations exhausted!').notify(done);
        });

        it('should call the refresh token endpoint in the auth proxy if the getRecommendations call returns a 401, and then retry the request', done => {
            let numTries = 0;

            const responses = () => {
                numTries += 1;

                if (numTries === 1) {
                    return 401;
                } else {
                    return testDataClone;
                }
            };

            fetchMock.restore();
            mockery.deregisterMock('fetch');
            mockery.registerMock('fetch', fetchMock
                .mock(recommendUrl, 'GET', responses)
                .mock(refreshTokenUrl, 'POST', ACCESS_TOKEN_RESPONSE)
                .getMock());

            const originalAccessToken = NprOne.accessToken;

            listening.getRecommendation()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.called(refreshTokenUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    NprOne.accessToken.should.not.equal(originalAccessToken);
                    done();
                })
                .catch(done);
        });

        describe('if queueRecommendationFromChannel() was previously called and the recommendation with the given UID was already added to flowRecommendations', () => {
            const badUid = '1234:5678';
            const goodUid = '466898631:466898632';

            beforeEach(() => {
                listening._flowRecommendations = testDataClone.items;
            });

            it('should NOT make a new API call if the UID is present in the cached list, and return that item', done => {
                listening.getRecommendation(goodUid)
                    .then((recommendation) => {
                        fetchMock.called(recommendUrl).should.be.false;
                        fetchMock.called(ratingUrl).should.be.false;
                        fetchMock.calls().unmatched.length.should.equal(0);
                        recommendation.attributes.uid.should.equal(goodUid);
                        done();
                    })
                    .catch(done);
            });

            it('should make a new API call if the UID is not found in the list', done => {
                listening.getRecommendation(badUid)
                    .then(() => {
                        fetchMock.called(recommendUrl).should.be.true;
                        fetchMock.calls().unmatched.length.should.equal(0);
                        done();
                    })
                    .catch(done);
            });
        });
    });

    /** @test {Listening#getUpcomingFlowRecommendations} */
    describe('getUpcomingFlowRecommendations', () => {
        it('should make a GET request when no flow recommendations are present', done => {
            listening.getUpcomingFlowRecommendations()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    /channel=npr/.test(fetchMock.lastUrl()).should.be.true;
                    done();
                })
                .catch(done);
        });

        it('should NOT make a GET request when flow recommendations are present', done => {
            listening._flowRecommendations = [1, 2, 3, 4]; // technically doesn't even matter what's in the array...

            listening.getUpcomingFlowRecommendations()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.false;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a GET request with a custom channel when no flow recommendations are present and a channel is specified', done => {
            listening.getUpcomingFlowRecommendations('newscasts')
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    /channel=newscasts/.test(fetchMock.lastUrl()).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });
    });

    /** @test {Listening#getRecommendationsFromChannel} */
    describe('getRecommendationsFromChannel', () => {
        it('should make a GET request to the default channel ("recommended") if no channel is specified', done => {
            listening.getRecommendationsFromChannel()
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    /channel=recommended$/.test(fetchMock.lastUrl()).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a GET request to the specified channel if a channel is specified', done => {
            listening.getRecommendationsFromChannel('notrecommended')
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    /channel=notrecommended$/.test(fetchMock.lastUrl()).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should make a GET request to the default channel ("recommended") if an invalid channel format is supplied', done => {
            listening.getRecommendationsFromChannel(null)
                .then(() => {
                    fetchMock.called(recommendUrl).should.be.true;
                    /channel=recommended$/.test(fetchMock.lastUrl()).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                })
                .catch(done);
        });

        it('should flush any pending ratings before returning channel recommendations', done => {
            const sendRatingsSpy = sinon.spy(listening, '_sendRatings');
            listening.getRecommendation()
                .then(recommendation => {
                    recommendation.recordAction(NprOne.Action.COMPLETED, recommendation.attributes.duration);
                })
                .then(() => {
                    listening.getRecommendationsFromChannel()
                        .then(() => {
                            fetchMock.called(ratingUrl).should.be.true;
                            fetchMock.called(recommendUrl).should.be.true;
                            /channel=recommended$/.test(fetchMock.lastUrl()).should.be.true;
                            fetchMock.calls().unmatched.length.should.equal(0);
                            sinon.assert.calledOnce(sendRatingsSpy);
                            done();
                        })
                        .catch(done);
                })
                .catch(done);
        });
    });

    /** @test {Listening#queueRecommendationFromChannel} */
    describe('queueRecommendationFromChannel', () => {
        const channel = 'my_channel';
        const badUid = '1234:5678';
        const goodUid = '466898631:466898632';

        it('should throw a TypeError if no channel is specified', () => {
            chai.expect(() => {
                listening.queueRecommendationFromChannel();
            }).to.throw('Must pass in a valid channel to queueRecommendationFromChannel()');
        });

        it('should throw a TypeError if a channel is specified but is not a valid string', () => {
            chai.expect(() => {
                listening.queueRecommendationFromChannel(1234);
            }).to.throw('Must pass in a valid channel to queueRecommendationFromChannel()');
        });

        it('should throw a TypeError if no UID is specified', () => {
            chai.expect(() => {
                listening.queueRecommendationFromChannel(channel);
            }).to.throw('Must pass in a valid uid to queueRecommendationFromChannel()');
        });

        it('should throw a TypeError if a channel is specified but is not a valid string', () => {
            chai.expect(() => {
                listening.queueRecommendationFromChannel(channel, 1234);
            }).to.throw('Must pass in a valid uid to queueRecommendationFromChannel()');
        });

        it('should throw an Error if getRecommendationsFromChannel() was not previously called', () => {
            chai.expect(() => {
                listening.queueRecommendationFromChannel(channel, badUid);
            }).to.throw('Results from channel "my_channel" are not cached. You must call getRecommendationsFromChannel() first.');
        });


        describe('if getRecommendationsFromChannel() was previously called but the cached list of recommendations is empty', () => {
            beforeEach(() => {
                listening._channelRecommendations[channel] = [];
            });

            it('should throw an Error', () => {
                chai.expect(() => {
                    listening.queueRecommendationFromChannel(channel, badUid);
                }).to.throw('Results from channel "my_channel" are not cached. You must call getRecommendationsFromChannel() first.');
            });
        });


        describe('if getRecommendationsFromChannel() was previously called and the cached list of recommendations is not empty', () => {
            beforeEach(() => {
                listening._channelRecommendations[channel] = testDataClone.items;
            });

            it('should throw an Error if the uid is not found in the list', () => {
                chai.expect(() => {
                    listening.queueRecommendationFromChannel(channel, badUid);
                }).to.throw('Unable to find story with uid ' + badUid + ' in cached list of recommendations from channel "' + channel + '".');
            });

            it('should return the found recommendation if the UID is present in the cached list', () => {
                const result = listening.queueRecommendationFromChannel(channel, goodUid);

                result.attributes.uid.should.equal(goodUid);
            });

            it('should put the found recommendation at the top of the flow recommendations if the UID is present in the cached list', () => {
                listening.queueRecommendationFromChannel(channel, goodUid);

                listening._flowRecommendations[0].attributes.uid.should.equal(goodUid);
            });
        });
    });

    /** @test {Listening#getHistory} */
    describe('getHistory', () => {
        it('should make a request to /history when getHistory is called', done => {
            listening.getHistory()
                .then(recommendations => {
                    fetchMock.called(historyUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    recommendations.should.not.be.undefined;
                    recommendations.length.should.be.equal(6);
                    done();
                })
                .catch(done);
        });
    });

    /** @test {Listening#resetFlow} */
    describe('resetFlow', () => {
        describe('no recommendations have been requested yet', () => {
            it('should return a fulfilled promise', done => {
                listening.resetFlow().should.eventually.be.ok.notify(done);
            });
        });
        describe('if recommendations have already been requested', () => {
            describe('and no queued ratings are present', () => {
                it('should reset internal variables to allow the flow to reset', done => {
                    listening.getRecommendation()
                        .then(() => {
                            listening.resetFlow()
                                .then(() => {
                                    listening._flowRecommendations.length.should.equal(0);
                                    chai.expect(listening._flowPromise).to.be.null;
                                    done();
                                })
                                .catch(done);
                        })
                        .catch(done);
                });
            });
            describe('and queued ratings are present', () => {
                it('should send the queued ratings first, then reset', done => {
                    listening.getRecommendation()
                        .then(recommendation => {
                            recommendation.recordAction(NprOne.Action.COMPLETED, recommendation.attributes.duration);
                            return listening.resetFlow();
                        })
                        .then(() => {
                            fetchMock.called(ratingUrl).should.be.true;
                            fetchMock.calls().unmatched.length.should.equal(0);
                            listening._flowRecommendations.length.should.equal(0);
                            done();
                        })
                        .catch(done);
                });
            });
        });
    });

    /** @test {Listening#resumeFlowFromRecommendation} */
    describe('resumeFlowFromRecommendation', () => {
        describe('no recommendations have been requested yet', () => {
            it('should set the recommendations to the active recommendation ' +
               'and the flow should advance as normal when actions are received', done => {
                testDataClone.items.splice(0, 1); // remove stationId, should be newscast

                const rec = listening.resumeFlowFromRecommendation(testDataClone);
                rec.recordAction(NprOne.Action.START, 0);

                listening.getRecommendation()
                    .then(recommendation => {
                        fetchMock.called(ratingUrl).should.be.true;
                        fetchMock.calls().unmatched.length.should.equal(0);
                        listening._flowRecommendations.length.should.equal(5);  // testDataClone
                        recommendation.attributes.uid !== testDataClone.items[0].attributes.uid;
                        done();
                    })
                    .catch(done);
            });
        });
    });
});
