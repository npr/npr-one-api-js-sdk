import chai from 'chai';
import { ACCESS_TOKEN_RESPONSE, IDENTITY_V2_USER_RESPONSE } from '../../test-data';
import mockery from 'mockery';
import fetchMock from 'fetch-mock';
import Identity from './../../../src/controller/identity';
import NprOne from './../../../src/index';
import { testConfig } from '../../test';


const should = chai.should();


/** @test {Identity} */
describe('Identity', () => {
    let identity;


    beforeEach(() => {
        identity = new Identity();
        NprOne.config = testConfig;
    });

    afterEach(() => {
        fetchMock.restore();
        mockery.deregisterMock('fetch');
    });


    /** @test {Identity#getUser} */
    describe('getUser', () => {
        const userUrl = `^${testConfig.apiBaseUrl}/identity/${testConfig.apiVersion}/user`;
        let userClone;

        beforeEach(() => {
            userClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));

            mockery.registerMock('fetch', fetchMock
                .mock(userUrl, 'GET', userClone)
                .getMock());
        });

        it('should make a request to /user', (done) => {
            identity.getUser()
                .then((user) => {
                    fetchMock.called(userUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    user.isTemporary().should.equal(false);
                    done();
                })
                .catch(done);
        });
    });


    /** @test {Identity#setUserStation} */
    describe('setUserStation', () => {
        const identityUrl = `^${testConfig.apiBaseUrl}/identity/${testConfig.apiVersion}/stations`;
        const stationFinderUrl = `^${testConfig.apiBaseUrl}/stationfinder/${testConfig.apiVersion}/organizations`;
        const stationId = 305;

        it('should validate the station, and then make a PUT request to identity/stations', (done) => {
            const userClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));

            mockery.registerMock('fetch', fetchMock
                .mock(stationFinderUrl, 'GET', '[]')
                .mock(identityUrl, 'PUT', userClone)
                .getMock());

            identity.setUserStation(stationId)
                .then(user => {
                    fetchMock.called(stationFinderUrl).should.be.true;
                    fetchMock.called(identityUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    user.isTemporary().should.equal(false);
                    done();
                })
                .catch(done);
        });

        it('should fail if a non-numeric station ID is passed in', (done) => {
            const error = 'Error: Station ID must be an integer greater than 0';
            identity.setUserStation('bad-station-id').should.be.rejectedWith(error).notify(done);
        });

        it('should reject the promise if station finder returns a 404', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(stationFinderUrl, 'GET', 404)
                .getMock());

            identity.setUserStation(241452).should.be.rejected.notify(() => {
                fetchMock.called(stationFinderUrl).should.be.true;
                fetchMock.calls().unmatched.length.should.equal(0);
                done();
            });
        });
    });


    /** @test {Identity#followShow} */
    describe('followShow', () => {
        const identityUrl = `^${testConfig.apiBaseUrl}/identity/${testConfig.apiVersion}/following`;
        const aggregationId = 123;

        it('should validate the aggregation, and then make a POST request to identity/following', (done) => {
            const userClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));

            mockery.registerMock('fetch', fetchMock
                .mock(identityUrl, 'POST', userClone)
                .getMock());

            identity.followShow(aggregationId)
                .then(() => {
                    fetchMock.called(identityUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    JSON.parse(fetchMock.lastOptions(identityUrl).body).should.deep.equal({
                        id: aggregationId,
                        following: true,
                    });
                    done();
                })
                .catch(done);
        });

        it('should throw a TypeError if a non-numeric aggregation ID is passed in', () => {
            chai.expect(() => {
                identity.followShow('bad-aggregation-id');
            }).to.throw('Aggregation (show) ID must be an integer greater than 0');
        });
    });


    /** @test {Identity#unfollowShow} */
    describe('unfollowShow', () => {
        const identityUrl = `^${testConfig.apiBaseUrl}/identity/${testConfig.apiVersion}/following`;
        const aggregationId = 456;

        it('should validate the aggregation, and then make a POST request to identity/following', (done) => {
            const userClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));

            mockery.registerMock('fetch', fetchMock
                .mock(identityUrl, 'POST', userClone)
                .getMock());

            identity.unfollowShow(aggregationId)
                .then(() => {
                    fetchMock.called(identityUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    JSON.parse(fetchMock.lastOptions(identityUrl).body).should.deep.equal({
                        id: aggregationId,
                        following: false,
                    });
                    done();
                })
                .catch(done);
        });

        it('should throw a TypeError if a non-numeric aggregation ID is passed in', () => {
            chai.expect(() => {
                identity.unfollowShow('bad-aggregation-id');
            }).to.throw('Aggregation (show) ID must be an integer greater than 0');
        });
    });


    /** @test {Identity#createTemporaryUser} */
    describe('createTemporaryUser', () => {
        let tempUrl;

        beforeEach(() => {
            tempUrl = `^${NprOne.config.authProxyBaseUrl}${NprOne.config.tempUserPath}`;

            mockery.registerMock('fetch', fetchMock
                .mock(tempUrl, 'GET', ACCESS_TOKEN_RESPONSE)
                .getMock());
        });

        it('should make a request to NPR proxy when called', (done) => {
            identity.createTemporaryUser()
                .then(() => {
                    fetchMock.called(tempUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    done();
                })
                .catch(done);
        });

        it('should make a request to NPR proxy when called using the correct query param character', (done) => {
            NprOne.config.tempUserPath = `${NprOne.config.tempUserPath}?test=true`;

            identity.createTemporaryUser()
                .then(() => {
                    fetchMock.called(tempUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    done();
                })
                .catch(done);
        });

        describe('if no client ID is set', () => {
            beforeEach(() => {
                NprOne.config = { clientId: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    identity.createTemporaryUser();
                }).to.throw('A client ID must be set for temporary user requests.');
            });
        });


        describe('if no auth proxy URL is set', () => {
            beforeEach(() => {
                NprOne.config = { authProxyBaseUrl: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    identity.createTemporaryUser();
                }).to.throw('OAuth proxy not configured. Unable to create temporary users.');
            });
        });
    });
});
