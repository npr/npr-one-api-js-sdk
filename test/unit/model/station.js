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
            station.id.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.org_id);
        });
    });


    /** @test {Station.displayName} */
    describe('displayName', () => {
        it('should equal name if name exists', () => {
            station.displayName.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.name);
        });

        it('should equal call if name does not exist', () => {
            delete responseClone.attributes.name;
            station = new Station(responseClone);
            station.displayName.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.call);
        });
    });


    /** @test {Station.logo} */
    describe('logo', () => {
        it('should equal NPR One logo if NPR One logo exists', () => {
            station.logo.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.apps.npr_one.logo);
        });

        it('should attempt to find a logo if NPR One log does not exist', () => {
            delete responseClone.attributes.apps;
            station = new Station(responseClone);
            station.logo.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.image[0].href);

            responseClone.links.image.shift();
            station = new Station(responseClone);
            station.logo.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.image[1].href);
        });

        it('should be null logos exist but not of the correct type_id', () => {
            delete responseClone.attributes.apps;
            responseClone.links.image.shift();
            responseClone.links.image.shift();
            chai.expect(station.logo).to.not.be.ok;
        });

        it('should be null if no logos are found', () => {
            delete responseClone.attributes.apps;
            delete responseClone.links.image;
            chai.expect(station.logo).to.not.be.ok;
        });
    });


    /** @test {Station.tagline} */
    describe('tagline', () => {
        it('should exist on test data', () => {
            station.tagline.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.tagline);
        });

        it('should be an empty string if it does not exist', () => {
            delete responseClone.attributes.tagline;
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
            delete responseClone.attributes.call;
            station.callSignAndFrequency.should.equal('FM 90.9');
        });

        it('should omit band if it does not exist on test data', () => {
            delete responseClone.attributes.band;
            station.callSignAndFrequency.should.equal('WBUR 90.9');
        });

        it('should omit frequency if it does not exist on test data', () => {
            delete responseClone.attributes.frequency;
            station.callSignAndFrequency.should.equal('WBUR FM');
        });

        it('should return null if all attempted data is missing', () => {
            delete responseClone.attributes.call;
            delete responseClone.attributes.band;
            delete responseClone.attributes.frequency;
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
            station.homepageUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.web[0].href);
        });

        it('should be null if only non-type_id 1 web links exist', () => {
            responseClone.links.web.shift();
            chai.expect(station.homepageUrl).to.not.be.ok;
        });

        it('should be null if none of the above exist', () => {
            delete responseClone.links.web;
            chai.expect(station.homepageUrl).to.not.be.ok;
        });
    });


    /** @test {Station.donationUrl} */
    describe('donationUrl', () => {
        it('should equal NPR One donation URL if it exists', () => {
            station.donationUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.attributes.apps.npr_one.donation_url);
        });

        it('should equal type 4 web link if NPR One donation URL does not exist', () => {
            delete responseClone.attributes.apps;
            station.donationUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.web[1].href);
        });

        it('should equal type 27 web link if NPR One donation URL and type 4 web does not exist', () => {
            delete responseClone.attributes.apps;
            responseClone.links.web.shift();
            responseClone.links.web.shift();
            station.donationUrl.should.equal(STATION_FINDER_SINGLE_ORG_RESPONSE.links.web[2].href);
        });

        it('should be null if none of the above exist', () => {
            delete responseClone.attributes.apps;
            delete responseClone.links.web;
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
