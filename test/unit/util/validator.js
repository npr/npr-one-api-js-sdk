import chai from 'chai';
import Validator from '../../../src/util/validator.js';
import { IDENTITY_V2_USER_RESPONSE, ACCESS_TOKEN_RESPONSE, DEVICE_CODE_RESPONSE } from '../../test-data';


const should = chai.should();


/** @test {Validator} */
describe('Validator', () => {
    let responseClone;


    /** @test {Validator.validateCollectionDoc} */
    describe('validateCollectionDoc', () => {
        beforeEach(() => {
            responseClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));
        });

        it('should not throw an error on valid input', () => {
            should.not.exist(Validator.validateCollectionDoc(responseClone));
        });

        it('should throw an error on invalid input', () => {
            delete responseClone.version;
            should.Throw(Validator.validateCollectionDoc.bind(this, responseClone));
        });
    });


    /** @test {Validator.validateAccessToken} */
    describe('validateAccessToken', () => {
        beforeEach(() => {
            responseClone = JSON.parse(JSON.stringify(ACCESS_TOKEN_RESPONSE));
        });

        it('should not throw an error on valid input', () => {
            should.not.exist(Validator.validateAccessToken(responseClone));
        });

        it('should throw an error on invalid input', () => {
            delete responseClone.token_type;
            should.Throw(Validator.validateAccessToken.bind(this, responseClone));
        });
    });


    /** @test {Validator.validateDeviceCode} */
    describe('validateDeviceCode', () => {
        beforeEach(() => {
            responseClone = JSON.parse(JSON.stringify(DEVICE_CODE_RESPONSE));
        });

        it('should not throw an error on valid input', () => {
            should.not.exist(Validator.validateDeviceCode(responseClone));
        });

        it('should throw an error on invalid input', () => {
            delete responseClone.verification_uri;
            should.Throw(Validator.validateDeviceCode.bind(this, responseClone));
        });
    });
});
