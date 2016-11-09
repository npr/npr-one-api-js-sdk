import chai from 'chai';
import { STATION_FINDER_RESPONSE } from '../../test-data';
import mockery from 'mockery';
import fetchMock from 'fetch-mock';
import StationFinder from './../../../src/controller/station-finder';
import NprOne from './../../../src/index';
import { testConfig } from '../../test';

const should = chai.should();


/** @test {StationFinder} */
describe('StationFinder', () => {
    let stationFinder;
    let stationResponseClone;
    const searchStationsUrl = `^${testConfig.apiBaseUrl}/stationfinder/v3/stations`;

    beforeEach(() => {
        stationFinder = new StationFinder();
        NprOne.config = testConfig;

        stationResponseClone = JSON.parse(JSON.stringify(STATION_FINDER_RESPONSE));

        mockery.registerMock('fetch', fetchMock
            .mock(searchStationsUrl, 'GET', stationResponseClone)
            .getMock());
    });

    afterEach(() => {
        fetchMock.restore();
        mockery.deregisterMock('fetch');
    });


    /** @test {StationFinder#searchStations} */
    describe('searchStations', () => {
        it('should make a request to /stationfinder/stations and find two stations', (done) => {
            stationFinder.searchStations()
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });

        it('should include the query string in the search if one is given', (done) => {
            stationFinder.searchStations('colorado')
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    /q=colorado/.test(fetchMock.lastUrl()).should.be.true;
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });

        it('should throw an error when given an invalid query string', () => {
            chai.expect(() => {
                stationFinder.searchStations(124);
            }).to.throw('Station search query must be a string');
        });

        it('should return an empty array if no stations results were found', (done) => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');

            mockery.registerMock('fetch', fetchMock
                .mock(searchStationsUrl, 'GET', {})
                .getMock());

            stationFinder.searchStations()
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(0);
                    done();
                })
                .catch(done);
        });
    });


    /** @test {StationFinder#searchStationsByLatLongCoordinates} */
    describe('searchStationsByLatLongCoordinates', () => {
        it('should make a request to /stationfinder/stations and find two stations', (done) => {
            stationFinder.searchStationsByLatLongCoordinates(37.241, -77.1352)
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });

        it('should throw an error when given an invalid values', () => {
            chai.expect(() => {
                stationFinder.searchStationsByLatLongCoordinates('bad', 'values');
            }).to.throw('Latitude and longitude must both be valid numbers (floats)');
        });
    });


    /** @test {StationFinder#searchStationsByCity} */
    describe('searchStationsByCity', () => {
        it('should make a request to /stationfinder/stations and find two stations', (done) => {
            stationFinder.searchStationsByCity('toledo')
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });

        it('should throw an error when given an invalid values', () => {
            chai.expect(() => {
                stationFinder.searchStationsByCity(4134);
            }).to.throw('Station search city name must be a string');
        });
    });


    /** @test {StationFinder#searchStationsByState} */
    describe('searchStationsByState', () => {
        it('should make a request to /stationfinder/stations and find two stations', (done) => {
            stationFinder.searchStationsByState('ohio')
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });

        it('should throw an error when given an invalid values', () => {
            chai.expect(() => {
                stationFinder.searchStationsByState(4134);
            }).to.throw('Station search state name must be a string');
        });
    });


    /** @test {StationFinder#searchStationsByCityAndState} */
    describe('searchStationsByCityAndState', () => {
        it('should make a request to /stationfinder/stations and find two stations', (done) => {
            stationFinder.searchStationsByCityAndState('toledo', 'oh')
                .then((stations) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    stations.length.should.equal(2);
                    done();
                })
                .catch(done);
        });
    });


    /** @test {StationFinder#getStationDetails} */
    describe('getStationDetails', () => {
        it('should make a request to /stationfinder/stations and find the requested station', (done) => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');
            mockery.registerMock('fetch', fetchMock
                .mock(searchStationsUrl, 'GET', JSON.parse(JSON.stringify(STATION_FINDER_RESPONSE.items[0])))
                .getMock());

            const stationId = '330';
            stationFinder.getStationDetails(stationId)
                .then((station) => {
                    fetchMock.called(searchStationsUrl).should.be.true;
                    fetchMock.calls().unmatched.length.should.equal(0);
                    station.id.should.equal(stationId);
                    done();
                })
                .catch(done);
        });

        it('should make a request to /stationfinder/stations and return a promise that rejects if the requested station is a non-NPR One station', (done) => {
            fetchMock.restore();
            mockery.deregisterMock('fetch');
            mockery.registerMock('fetch', fetchMock
                .mock(searchStationsUrl, 'GET', JSON.parse(JSON.stringify(STATION_FINDER_RESPONSE.items[2])))
                .getMock());

            const stationId = '1209';
            const error = `The station ${stationId} is not eligible for NPR One.`;
            stationFinder.getStationDetails(stationId).should.be.rejectedWith(error).notify(done);
        });

        it('should throw an error when given an invalid values', (done) => {
            const error = 'Error: Station ID must be an integer greater than 0';
            stationFinder.getStationDetails('bad_value').should.be.rejectedWith(error).notify(done);
        });
    });
});
