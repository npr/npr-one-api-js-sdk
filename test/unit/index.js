import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import NprOneSDK from './../../src/index';
import Authorization from './../../src/controller/authorization';
import Action from './../../src/model/action';
import Logger from './../../src/util/logger';


const should = chai.should();
chai.use(sinonChai);


/** @test {NprOneSDK} */
describe('NprOneSDK', () => {
    /** @type {NprOneSDK} */
    let nprOne;

    beforeEach(() => {
        nprOne = new NprOneSDK();
    });


    /** @test {NprOneSDK.config} */
    describe('config', () => {
        describe('getter', () => {
            it('should return an object with config related properties', () => {
                NprOneSDK.config.apiBaseUrl.should.be.ok;
            });
        });

        describe('setter', () => {
            it('should update specific config values when set', () => {
                const previousUrl = NprOneSDK.config.apiBaseUrl;
                NprOneSDK.config = { 'apiBaseUrl': 'https://test' };
                const newUrl = NprOneSDK.config.apiBaseUrl;
                NprOneSDK.config.apiBaseUrl = previousUrl;
                newUrl.should.equal('https://test');
            });

            it('should setup defaults if they haven\'t been set yet', () => {
                NprOneSDK._config = undefined;
                NprOneSDK.config = { 'test': 'value' };
                NprOneSDK.config.test.should.equal('value');
            });
        });
    });


    /** @test {NprOneSDK.accessToken} */
    describe('accessToken', () => {
        describe('getter', () => {
            it('should return the value of the accessToken string in the hidden config object', () => {
                NprOneSDK.accessToken.should.equal(NprOneSDK.config.accessToken);
            });
        });

        describe('setter', () => {
            it('should throw a TypeError if the passed-in value is not a string', () => {
                chai.expect(() => {
                    NprOneSDK.accessToken = 1234;
                }).to.throw('Value for accessToken must be a string');
            });

            it('should set the internal access token to the supplied string', () => {
                NprOneSDK.accessToken = 'abcdefgh123456';

                NprOneSDK.config.accessToken.should.equal('abcdefgh123456');
            });

            it('should call the registered callback if one is set', (done) => {
                NprOneSDK.onAccessTokenChanged = () => {
                    NprOneSDK.config.accessToken.should.equal('abcdefgh123456789abced');
                    done();
                };
                NprOneSDK.accessToken = 'abcdefgh123456789abced';
            });

            it('but only if the new token is different from the old', () => {
                NprOneSDK.onAccessTokenChanged = () => {
                    throw new Error('access token did not actually change, should never get here');
                };
                NprOneSDK.accessToken = NprOneSDK.config.accessToken;
            });
        });
    });


    /** @test {NprOneSDK.onAccessTokenChanged} */
    describe('onAccessTokenChanged', () => {
        describe('setter', () => {
            it('should throw a TypeError if the passed-in value is not a function', () => {
                chai.expect(() => {
                    NprOneSDK.onAccessTokenChanged = 'i_am_not_a_function';
                }).to.throw('Value for onAccessTokenChanged must be a function');
            });
        });
    });


    /** @test {NprOneSDK.Action} */
    describe('Action', () => {
        it('should return the Action class', () => {
            NprOneSDK.Action.should.equal(Action);
        });
    });


    /** @test {NprOneSDK.Logger} */
    describe('Logger', () => {
        it('should return the Logger class', () => {
            NprOneSDK.Logger.should.equal(Logger);
        });
    });


    /** @test {NprOneSDK.refreshExistingAccessToken} */
    describe('refreshExistingAccessToken', () => {
        afterEach(() => {
            Authorization.refreshExistingAccessToken.restore();
        });

        it('should call the correct service controller method', () => {
            const stub = sinon.stub(Authorization, 'refreshExistingAccessToken');
            NprOneSDK.refreshExistingAccessToken();
            stub.should.have.been.calledWith();
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(Authorization, 'refreshExistingAccessToken');
            NprOneSDK.refreshExistingAccessToken(3);
            stub.should.have.been.calledWith(3);
        });
    });


    /** @test {NprOneSDK#logout} */
    describe('logout', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._authorization, 'logout');
            nprOne.logout();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#getDeviceCode} */
    describe('getDeviceCode', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._authorization, 'getDeviceCode');
            nprOne.getDeviceCode();
            stub.should.have.been.calledWith([]);
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._authorization, 'getDeviceCode');
            nprOne.getDeviceCode(['listening.readonly']);
            stub.should.have.been.calledWith(['listening.readonly']);
        });
    });


    /** @test {NprOneSDK#pollDeviceCode} */
    describe('pollDeviceCode', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._authorization, 'pollDeviceCode');
            nprOne.pollDeviceCode();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#getRecommendation} */
    describe('getRecommendation', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'getRecommendation');
            nprOne.getRecommendation();
            stub.should.have.been.calledWith('', 'npr');
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._listening, 'getRecommendation');
            nprOne.getRecommendation('string1');
            stub.should.have.been.calledWith('string1', 'npr');
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._listening, 'getRecommendation');
            nprOne.getRecommendation('', 'string2');
            stub.should.have.been.calledWith('', 'string2');
        });
    });


    /** @test {NprOneSDK#getUpcomingFlowRecommendations} */
    describe('getUpcomingFlowRecommendations', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'getUpcomingFlowRecommendations');
            nprOne.getUpcomingFlowRecommendations();
            stub.should.have.been.calledWith('npr');
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._listening, 'getUpcomingFlowRecommendations');
            nprOne.getUpcomingFlowRecommendations('string1');
            stub.should.have.been.calledWith('string1');
        });
    });


    /** @test {NprOneSDK#getRecommendationsFromChannel} */
    describe('getRecommendationsFromChannel', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'getRecommendationsFromChannel');
            nprOne.getRecommendationsFromChannel();
            stub.should.have.been.calledWith('recommended');
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._listening, 'getRecommendationsFromChannel');
            nprOne.getRecommendationsFromChannel('string1');
            stub.should.have.been.calledWith('string1');
        });
    });


    /** @test {NprOneSDK#queueRecommendationFromChannel} */
    describe('queueRecommendationFromChannel', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'queueRecommendationFromChannel');
            nprOne.queueRecommendationFromChannel();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#getHistory} */
    describe('getHistory', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'getHistory');
            nprOne.getHistory();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#resetFlow} */
    describe('resetFlow', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'resetFlow');
            nprOne.resetFlow();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#resumeFlowFromRecommendation} */
    describe('resumeFlowFromRecommendation', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._listening, 'resumeFlowFromRecommendation');
            nprOne.resumeFlowFromRecommendation();
            stub.should.have.been.calledOnce;
        });
    });

    /** @test {NprOneSDK#getUser} */
    describe('getUser', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._identity, 'getUser');
            nprOne.getUser();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#setUserStation} */
    describe('setUserStation', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._identity, 'setUserStation');
            nprOne.setUserStation('404');
            stub.should.have.been.calledWith('404');
        });
    });


    /** @test {NprOneSDK#followShow} */
    describe('followShow', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._identity, 'followShow');
            nprOne.followShow('123');
            stub.should.have.been.calledWith('123');
        });
    });


    /** @test {NprOneSDK#unfollowShow} */
    describe('unfollowShow', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._identity, 'unfollowShow');
            nprOne.unfollowShow('456');
            stub.should.have.been.calledWith('456');
        });
    });


    /** @test {NprOneSDK#createTemporaryUser} */
    describe('createTemporaryUser', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._identity, 'createTemporaryUser');
            nprOne.createTemporaryUser();
            stub.should.have.been.calledOnce;
        });
    });


    /** @test {NprOneSDK#searchStations} */
    describe('searchStations', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStations');
            nprOne.searchStations();
            stub.should.have.been.calledWith();
        });

        it('should call the correct service controller method with non-default param values', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStations');
            nprOne.searchStations('ohio');
            stub.should.have.been.calledWith('ohio');
        });
    });


    /** @test {NprOneSDK#searchStationsByLatLongCoordinates} */
    describe('searchStationsByLatLongCoordinates', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStationsByLatLongCoordinates');
            nprOne.searchStationsByLatLongCoordinates('37.742', '-77.42');
            stub.should.have.been.calledWith('37.742', '-77.42');
        });
    });


    /** @test {NprOneSDK#searchStationsByCityAndState} */
    describe('searchStationsByCityAndState', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStationsByCityAndState');
            nprOne.searchStationsByCityAndState('fremont', 'ohio');
            stub.should.have.been.calledWith('fremont', 'ohio');
        });
    });


    /** @test {NprOneSDK#searchStationsByCity} */
    describe('searchStationsByCity', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStationsByCity');
            nprOne.searchStationsByCity('Toledo');
            stub.should.have.been.calledWith('Toledo');
        });
    });


    /** @test {NprOneSDK#searchStationsByState} */
    describe('searchStationsByState', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'searchStationsByState');
            nprOne.searchStationsByState('ohio');
            stub.should.have.been.calledWith('ohio');
        });
    });


    /** @test {NprOneSDK#getStationDetails} */
    describe('getStationDetails', () => {
        it('should call the correct service controller method', () => {
            const stub = sinon.stub(nprOne._stationfinder, 'getStationDetails');
            nprOne.getStationDetails(305);
            stub.should.have.been.calledWith(305);
        });
    });


    /** @test {NprOneSDK.getServiceUrl} */
    describe('getServiceUrl', () => {
        it('should return the correct API service url', () => {
            const url = NprOneSDK.getServiceUrl('listening');
            url.should.be.ok;
        });
    });
});
