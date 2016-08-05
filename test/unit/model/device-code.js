import chai from 'chai';
import DeviceCode from '../../../src/model/device-code';
import { DEVICE_CODE_RESPONSE } from '../../test-data';


const should = chai.should();


/** @test {DeviceCode} */
describe('DeviceCode', () => {
    /** @type DeviceCode */
    let deviceCode;
    let responseClone;


    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(DEVICE_CODE_RESPONSE));
        deviceCode = new DeviceCode(responseClone);
    });


    /** @test {DeviceCode#constructor} */
    describe('constructor', () => {
        it('should not set an expiry date if expires_in is NaN', () => {
            responseClone = JSON.parse(JSON.stringify(DEVICE_CODE_RESPONSE));
            responseClone.expires_in = 'bad_value';
            const noExpiryDeviceCode = new DeviceCode(responseClone);

            chai.expect(noExpiryDeviceCode._expiryDate).to.be.null;
        });
    });


    /** @test {DeviceCode#validate} */
    describe('validate', () => {
        it('should not throw an error on valid input', () => {
            should.not.exist(deviceCode.validate());
        });
    });


    /** @test {DeviceCode#isExpired} */
    describe('isExpired', () => {
        it('should not be expired for test data token', () => {
            deviceCode.isExpired().should.be.false;
        });

        it('should be expired if the expires_in time is in the past', () => {
            responseClone = JSON.parse(JSON.stringify(DEVICE_CODE_RESPONSE));
            responseClone.expires_in = 0;
            const expiredDeviceCode = new DeviceCode(responseClone);

            expiredDeviceCode.isExpired().should.be.true;
        });
    });


    /** @test {DeviceCode.userCode} */
    describe('userCode', () => {
        it('should match the "user_code" value from the API response', () => {
            deviceCode.userCode.should.equal(responseClone.user_code);
        });
    });


    /** @test {DeviceCode.verificationUri} */
    describe('verificationUri', () => {
        it('should match the "verification_uri" value from the API response', () => {
            deviceCode.verificationUri.should.equal(responseClone.verification_uri);
        });
    });


    /** @test {DeviceCode.ttl} */
    describe('ttl', () => {
        it('should convert the "expires_in" value from the API response (which is in seconds) to milliseconds', () => {
            deviceCode.ttl.should.equal(responseClone.expires_in * 1000);
        });
    });


    /** @test {DeviceCode.interval} */
    describe('interval', () => {
        it('should convert the "interval" value from the API response (which is in seconds) to milliseconds', () => {
            deviceCode.interval.should.equal(responseClone.interval * 1000);
        });
    });


    /** @test {DeviceCode#toString} */
    describe('toString', () => {
        it('should match the API response', () => {
            deviceCode.toString().should.equal(JSON.stringify(responseClone));
        });
    });
});
