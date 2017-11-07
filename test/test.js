import NprOne from '../src/index';
import chai from 'chai';

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = process.env.ENV = 'test';
}

before(() => {
    if (process.env.LOG == 'on') {
        NprOne.Logger.setLevel(NprOne.Logger.DEBUG);
    } else {
        NprOne.Logger.setLevel(NprOne.Logger.OFF);
    }
    chai.should();
    const nprOne = new NprOne();
});

export const testConfig = {
    apiBaseUrl: 'https://api.npr.org',
    apiVersion: 'v2',
    authProxyBaseUrl: 'https://one.example.com/oauth2',
    newDeviceCodePath: '/device',
    pollDeviceCodePath: '/device/poll',
    refreshTokenPath: '/refresh',
    tempUserPath: '/temporary',
    logoutPath: '/logout',
    accessToken: 'aaaabbbbcccc12345678',
    clientId: 'one.example.com',
};

require('./unit/model/access-token.js');
require('./unit/model/action.js');
require('./unit/model/collection-doc.js');
require('./unit/model/device-code.js');
require('./unit/model/rating.js');
require('./unit/model/recommendation.js');
require('./unit/model/station.js');
require('./unit/model/user.js');
require('./unit/util/recommender-creator.js');
require('./unit/util/validator.js');
require('./unit/controller/authorization.js');
require('./unit/controller/identity.js');
require('./unit/controller/station-finder.js');
require('./unit/controller/listening.js');
require('./unit/index.js');
