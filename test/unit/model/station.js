import chai from 'chai';
import Station from '../../../src/model/station';
import { STATION_FINDER_RESPONSE } from '../../test-data';


const should = chai.should();
const STATION_FINDER_SINGLE_ORG_RESPONSE = STATION_FINDER_RESPONSE.items[0];


/** @test {Station} */
describe('Station', () => {
    /** @type Station */
    let station;
    let responseClone;


    beforeEach(() => {
        responseClone = JSON.parse(JSON.stringify(STATION_FINDER_SINGLE_ORG_RESPONSE));
        station = new Station(responseClone);
    });


    /** @test {Station.id} */
    describe('id', () => {
        it('should exist and equal the value from the test data', () => {
            station.id.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.orgId);
        });
    });


    /** @test {Station.displayName} */
    describe('displayName', () => {
        it('should equal name from the test data', () => {
            station.displayName.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.brand.name);
        });
    });


    /** @test {Station.logo} */
    describe('logo', () => {
        it('should equal rel="logo" brand link if it exists', () => {
            station.logo.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.brand[1].href);
        });

        it('should equal rel="small-logo" brand link if equal rel="logo" brand link does not exist', () => {
            responseClone.links.brand.shift(); // homepage
            responseClone.links.brand.shift(); // logo
            station.logo.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.brand[2].href);
        });

        it('should be null if none of the above exist', () => {
            delete responseClone.links.brand;
            chai.expect(station.logo).to.not.be.ok;
        });
    });


    /** @test {Station.tagline} */
    describe('tagline', () => {
        it('should exist on test data', () => {
            station.tagline.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.brand.tagline);
        });

        it('should be an empty string if it does not exist', () => {
            delete responseClone.attributes.brand.tagline;
            station = new Station(responseClone);
            chai.expect(station.tagline).to.not.be.ok;
        });
    });


    /** @test {Station.callSignAndFrequency} */
    describe('callSignAndFrequency', () => {
        it('should exist on test data', () => {
            station.callSignAndFrequency.should.equal('WBUR FM 90.9');
        });

        it('should omit call if it does not exist on test data', () => {
            delete responseClone.attributes.brand.call;
            station.callSignAndFrequency.should.equal('FM 90.9');
        });

        it('should omit band if it does not exist on test data', () => {
            delete responseClone.attributes.brand.band;
            station.callSignAndFrequency.should.equal('WBUR 90.9');
        });

        it('should omit frequency if it does not exist on test data', () => {
            delete responseClone.attributes.brand.frequency;
            station.callSignAndFrequency.should.equal('WBUR FM');
        });

        it('should return null if all attempted data is missing', () => {
            delete responseClone.attributes.brand.call;
            delete responseClone.attributes.brand.band;
            delete responseClone.attributes.brand.frequency;
            chai.expect(station.callSignAndFrequency).to.be.null;
        });
    });


    /** @test {Station.location} */
    describe('location', () => {
        it('should exist on test data', () => {
            station.location.should.be.ok;
        });
    });


    /** @test {Station.homepageUrl} */
    describe('homepageUrl', () => {
        it('should exist on test data', () => {
            station.homepageUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.brand[0].href);
        });

        it('should be null if only non-rel="homepage" links exist', () => {
            responseClone.links.brand.shift();
            chai.expect(station.homepageUrl).to.not.be.ok;
        });

        it('should be null if none of the above exist', () => {
            delete responseClone.links.brand;
            chai.expect(station.homepageUrl).to.not.be.ok;
        });
    });


    /** @test {Station.donationUrl} */
    describe('donationUrl', () => {
        it('should equal type 27 donation link if it exists', () => {
            station.donationUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.donation[1].href);
        });

        it('should equal type 4 donation link if type 27 donation does not exist', () => {
            const donationAudio = responseClone.links.donation.pop(); // donation audio
            responseClone.links.donation.pop(); // type 27
            responseClone.links.donation.push(donationAudio);
            station.donationUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.donation[0].href);
        });

        it('should be null if none of the above exist', () => {
            delete responseClone.links.donation;
            chai.expect(station.donationUrl).to.not.be.ok;
        });
    });


    /** @test {Station.attributes} */
    describe('attributes', () => {
        it('should exist on test data', () => {
            station.attributes.should.be.ok;
        });
    });


    /** @test {Station#toString} */
    describe('toString', () => {
        it('should exist on test data', () => {
            station.toString().should.be.ok;
        });
    });
});
