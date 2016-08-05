import chai from 'chai';
import User from '../../../src/model/user';
import { IDENTITY_V2_USER_RESPONSE } from '../../test-data';

const should = chai.should();

/** @test {User} */
describe('User', () => {
    /** @type User */
    let user;
    let responseClone;

    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(IDENTITY_V2_USER_RESPONSE));
        user = new User(responseClone);
    });

    /** @test {User#constructor} */
    describe('constructor', () => {
        it('should hydrate the model', () => {
            user.attributes.cohort.should.exist;
            user.attributes.affiliations.length.should.equal(3);
            user.attributes.organizations.length.should.equal(3);
            user.collectionDoc.should.equal(responseClone);
        });
    });

    /** @test {User#isTemporary} */
    describe('isTemporary', () => {
        it('should be true for a temporary user', () => {
            user.attributes.id = 1020170792;

            user.isTemporary().should.be.true;
        });

        it('should be false for a non-temporary user', () => {
            user.isTemporary().should.be.false;
        });
    });

    /** @test {User#getCohort} */
    describe('getCohort', () => {
        it('should match the API response', () => {
            user.getCohort().should.equal(responseClone.attributes.cohort);
        });
    });

    /** @test {User#getOrganizations} */
    describe('getOrganizations', () => {
        it('should match the API response', () => {
            user.getOrganizations().should.equal(responseClone.attributes.organizations);
        });

        it('should return an array even if the API data is undefined', () => {
            user.attributes.organizations = undefined;

            user.getOrganizations().should.be.instanceof(Array);
            user.getOrganizations().length.should.equal(0);
        });
    });

    /** @test {User#getPrimaryOrganization} */
    describe('getPrimaryOrganization', () => {
        it('should match the API response', () => {
            user.getPrimaryOrganization().should.equal(responseClone.attributes.organizations[0]);
        });

        it('should return an array even if the API data is undefined', () => {
            user.attributes.organizations = undefined;

            should.not.exist(user.getPrimaryOrganization());
        });
    });

    /** @test {User#getAffiliations} */
    describe('getAffiliations', () => {
        it('should match the API response', () => {
            user.getAffiliations().should.equal(responseClone.attributes.affiliations);
        });
    });

    /** @test {User#toString} */
    describe('toString', () => {
        it('should match the "id" value from the API response', () => {
            user.toString().should.equal(responseClone.attributes.id);
        });
    });
});
