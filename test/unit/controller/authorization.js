import chai from 'chai';
import { ACCESS_TOKEN_RESPONSE, DEVICE_CODE_RESPONSE, DEVICE_CODE_POLL_RESPONSE, DEVICE_CODE_DENIED_RESPONSE, DEVICE_CODE_EXPIRED_RESPONSE } from '../../test-data';
import mockery from 'mockery';
import fetchMock from 'fetch-mock';
import Authorization from './../../../src/controller/authorization';
import NprOne from './../../../src/index';
import { testConfig } from '../../test';

const should = chai.should();


/** @test {Authorization} */
describe('Authorization', () => {
    let authorization;
    let refreshTokenUrl;
    let logoutUrl;
    let newDeviceCodeUrl;
    let deviceCodePollUrl;


    beforeEach(() => {
        authorization = new Authorization();
        NprOne.config = testConfig;

        refreshTokenUrl = `^${testConfig.authProxyBaseUrl}${NprOne.config.refreshTokenPath}`;
        logoutUrl = `^${testConfig.authProxyBaseUrl}${NprOne.config.logoutPath}`;
        newDeviceCodeUrl = `${NprOne.config.authProxyBaseUrl}${NprOne.config.newDeviceCodePath}`;
        deviceCodePollUrl = `${NprOne.config.authProxyBaseUrl}${NprOne.config.pollDeviceCodePath}`;
    });

    afterEach(() => {
        fetchMock.restore();
        mockery.deregisterMock('fetch');
    });


    /** @test {Authorization.refreshExistingAccessToken} */
    describe('refreshExistingAccessToken', function () { // intentionally can't use arrow function here
        // see: https://github.com/mochajs/mocha/issues/1763
        this.timeout(16000);

        it('should call the refresh token endpoint in the auth proxy', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(refreshTokenUrl, 'POST', ACCESS_TOKEN_RESPONSE)
                .getMock());

            Authorization.refreshExistingAccessToken()
                .then(() => {
                    fetchMock.called(refreshTokenUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    done();
                })
                .catch(done);
        });

        it('should retry the call to the refresh token endpoint in the auth proxy if it receives a bad response the first time', (done) => {
            let numTries = 0;

            const responses = () => {
                numTries += 1;

                if (numTries === 1) {
                    return 500;
                } else {
                    return ACCESS_TOKEN_RESPONSE;
                }
            };

            mockery.registerMock('fetch', fetchMock
                .mock(refreshTokenUrl, 'POST', responses)
                .getMock());

            Authorization.refreshExistingAccessToken()
                .then(() => {
                    fetchMock.called(refreshTokenUrl).should.be.true;
                    fetchMock.calls().matched.length.should.be.greaterThan(1);
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    done();
                })
                .catch(done);
        });

        it('should retry the call to the refresh token endpoint in the auth proxy up to 3 times, but then error out', (done) => {
            let numTries = 0;

            const responses = () => {
                numTries += 1;

                if (numTries < 5) {
                    return 500;
                } else {
                    return ACCESS_TOKEN_RESPONSE;
                }
            };

            mockery.registerMock('fetch', fetchMock
                .mock(refreshTokenUrl, 'POST', responses)
                .getMock());

            Authorization.refreshExistingAccessToken()
                .then(() => {
                    done('Should not be here, call should have ended on a throw');
                })
                .catch(() => {
                    fetchMock.called(refreshTokenUrl).should.be.true;
                    fetchMock.calls().matched.length.should.be.greaterThan(1);
                    fetchMock.calls().unmatched.length.should.equal(0);
                    done();
                });
        });

        describe('if no auth proxy URL is set', () => {
            beforeEach(() => {
                NprOne.config = { authProxyBaseUrl: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    Authorization.refreshExistingAccessToken();
                }).to.throw('OAuth proxy not configured. Unable to refresh the access token.');
            });
        });

        describe('if no access token is set', () => {
            beforeEach(() => {
                NprOne.config = { accessToken: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    Authorization.refreshExistingAccessToken();
                }).to.throw('An access token must be set in order to attempt a refresh.');
            });
        });
    });


    /** @test {Authorization#logout} */
    describe('logout', () => {
        it('should call the logout endpoint in the auth proxy', (done) => {
            const oldAccessToken = NprOne.accessToken;

            mockery.registerMock('fetch', fetchMock
                .mock(logoutUrl, 'POST', JSON.stringify(''))
                .getMock());

            authorization.logout()
                .then(() => {
                    fetchMock.called(logoutUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    const options = fetchMock.lastOptions(logoutUrl);
                    options.body.should.equal(`token=${oldAccessToken}`);
                    NprOne.accessToken.should.equal('');
                    done();
                })
                .catch(done);
        });

        it('should throw an error if the response is not \'ok\'', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(logoutUrl, 'POST', 400)
                .getMock());

            authorization.logout().should.be.rejected.notify(() => {
                fetchMock.called(logoutUrl).should.be.true;
                fetchMock.calls().unmatched.length.should.equal(0);
                done();
            });
        });

        describe('if no access token is set', () => {
            beforeEach(() => {
                NprOne.config = { accessToken: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    authorization.logout();
                }).to.throw('An access token must be set in order to attempt a logout.');
            });
        });

        describe('if no auth proxy URL is set', () => {
            beforeEach(() => {
                NprOne.config = { authProxyBaseUrl: '' };
            });

            it('should throw a TypeError', () => {
                chai.expect(() => {
                    authorization.logout();
                }).to.throw('OAuth proxy not configured. Unable to securely log out the user.');
            });
        });
    });


    /** @test {Authorization#getDeviceCode} */
    describe('getDeviceCode', () => {
        it('should throw an error if not configured properly', () => {
            NprOne.config = { authProxyBaseUrl: '' };
            chai.expect(() => {
                authorization.getDeviceCode();
            }).to.throw('OAuth proxy not configured. Unable to use the device code.');
        });

        it('should make a request to authProxyUrl when called', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .getMock());

            authorization.getDeviceCode()
                .then((deviceCode) => {
                    fetchMock.called(newDeviceCodeUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    deviceCode.userCode.should.equal(DEVICE_CODE_RESPONSE.user_code);
                    done();
                })
                .catch(done);
        });

        it('should make a request to authProxyUrl with additional scopes when scopes are passed in', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .getMock());

            authorization.getDeviceCode(['listening.readonly', 'identity.readonly'])
                .then(() => {
                    fetchMock.called(newDeviceCodeUrl).should.be.true;
                    const options = fetchMock.lastOptions(newDeviceCodeUrl);
                    options.body.indexOf('listening.readonly').should.not.equal(-1);
                    options.body.indexOf('identity.readonly').should.not.equal(-1);
                    done();
                })
                .catch(done);
        });
    });


    /** @test {Authorization#pollDeviceCode} */
    describe('pollDeviceCode', function () { // intentionally can't use arrow function here
        // see: https://github.com/mochajs/mocha/issues/1763
        this.timeout(16000);

        it('should throw an error if not configured properly', () => {
            NprOne.config = { authProxyBaseUrl: '' };
            chai.expect(() => {
                authorization.pollDeviceCode();
            }).to.throw('OAuth proxy not configured. Unable to use the device code.');
        });

        it('should throw an error if no active device code exists', () => {
            chai.expect(() => {
                authorization.pollDeviceCode();
            }).to.throw('No active device code set. Please call getDeviceCode() before calling this function.');
        });

        it('should return a Promise that rejects if the active device code is expired', (done) => {
            const deviceCodeClone = JSON.parse(JSON.stringify(DEVICE_CODE_RESPONSE));
            deviceCodeClone.expires_in = 0;

            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', deviceCodeClone)
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    authorization.pollDeviceCode().should.be.rejectedWith('The device code has expired. Please generate a new one before continuing.').notify(done);
                });
        });

        it('should return a Promise that resolves to a valid access token if device code is valid', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .mock(deviceCodePollUrl, 'POST', ACCESS_TOKEN_RESPONSE)
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    return authorization.pollDeviceCode();
                })
                .then((accessToken) => {
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    accessToken.toString().should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                })
                .then(done)
                .catch(done);
        });

        it('should return a Promise that rejects if the active device code is invalid (or possibly expired)', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .mock(deviceCodePollUrl, 'POST', {
                    status: 400,
                    body: DEVICE_CODE_EXPIRED_RESPONSE,
                })
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    authorization.pollDeviceCode().should.be.rejectedWith('Response status: 400 Bad Request').notify(done);
                });
        });

        it('should return a Promise that rejects if the active device code is valid but the user went to log in and denied the app access', (done) => {
            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .mock(deviceCodePollUrl, 'POST', {
                    status: 401,
                    body: DEVICE_CODE_DENIED_RESPONSE,
                })
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    authorization.pollDeviceCode().should.be.rejectedWith('Response status: 401 Unauthorized').notify(done);
                });
        });

        it('should return a Promise that resolves to valid access token after polling a number of times if the user logs in', (done) => {
            let numTries = 0;

            const responses = () => {
                numTries += 1;

                if (numTries < 3) {
                    return {
                        status: 401,
                        body: DEVICE_CODE_POLL_RESPONSE,
                    };
                } else {
                    return ACCESS_TOKEN_RESPONSE; // a.k.a. the user logged in
                }
            };

            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .mock(deviceCodePollUrl, 'POST', responses)
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    return authorization.pollDeviceCode();
                })
                .then((accessToken) => {
                    fetchMock.called(deviceCodePollUrl).should.be.true;
                    fetchMock.calls().matched.length.should.be.greaterThan(1);
                    fetchMock.calls().unmatched.length.should.equal(0);
                    NprOne.accessToken.should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                    accessToken.toString().should.equal(ACCESS_TOKEN_RESPONSE.access_token);
                })
                .then(done)
                .catch(done);
        });

        it('should return a Promise that rejects if the returned access token is invalid', (done) => {
            const accessTokenClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
            delete accessTokenClone.expires_in;

            mockery.registerMock('fetch', fetchMock
                .mock(newDeviceCodeUrl, 'POST', DEVICE_CODE_RESPONSE)
                .mock(deviceCodePollUrl, 'POST', accessTokenClone)
                .getMock());

            authorization.getDeviceCode()
                .then(() => {
                    authorization.pollDeviceCode().should.be.rejectedWith(`TypeError: 'expires_in' is missing and is required. :${JSON.stringify(accessTokenClone)}`).notify(done);
                });
        });
    });
});
