import chai from 'chai';
import AccessToken from '../../../src/model/access-token';
import { ACCESS_TOKEN_RESPONSE } from '../../test-data';


const should = chai.should();


/** @test {AccessToken} */
describe('AccessToken', () => {
    /** @type AccessToken */
    let accessToken;
    let responseClone;


    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
        accessToken = new AccessToken(responseClone);
    });


    /** @test {AccessToken#constructor} */
    describe('constructor', () => {
        it('should not set an expiry date if expires_in is NaN', () => {
            responseClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
            responseClone.expires_in = 'bad_value';
            const noExpiryAccessToken = new AccessToken(responseClone);

            chai.expect(noExpiryAccessToken._expiryDate).to.be.null;
        });
    });


    /** @test {AccessToken#validate} */
    describe('validate', () => {
        it('should not throw an error on valid input', () => {
            should.not.exist(accessToken.validate());
        });
    });


    /** @test {AccessToken#isExpired} */
    describe('isExpired', () => {
        it('should not be expired for test data token', () => {
            accessToken.isExpired().should.be.false;
        });

        it('should be expired if the expires_in time is in the past', () => {
            responseClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
            responseClone.expires_in = 0;
            const expiredAccessToken = new AccessToken(responseClone);

            expiredAccessToken.isExpired().should.be.true;
        });
    });


    /** @test {AccessToken.token} */
    describe('token', () => {
        it('should match the "access_token" value from the API response', () => {
            accessToken.token.should.equal(responseClone.access_token);
        });
    });


    /** @test {AccessToken.refreshToken} */
    describe('refreshToken', () => {
        it('should return null if the auth proxy removes the original refresh_token value from the response', () => {
            should.not.exist(accessToken.refreshToken);
        });

        describe('if the auth proxy does not hide it from the response', () => {
            it('should match the "refresh_token" value from the API response', () => {
                responseClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
                responseClone.refresh_token = '1234567890abcdefghij1234567890abcdefghij';
                const nonObfuscatedAccessToken = new AccessToken(responseClone);

                nonObfuscatedAccessToken.refreshToken.should.equal(responseClone.refresh_token);
            });
        });
    });


    /** @test {AccessToken.ttl} */
    describe('ttl', () => {
        it('should convert the "expires_in" value from the API response (which is in seconds) to milliseconds', () => {
            accessToken.ttl.should.equal(responseClone.expires_in * 1000);
        });
    });


    /** @test {AccessToken#toString} */
    describe('toString', () => {
        it('should match the "access_token" value from the API response', () => {
            accessToken.toString().should.equal(responseClone.access_token);
        });
    });
});
