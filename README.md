# NPR One API SDK

A [Universal JavaScript Module](https://github.com/umdjs/umd) for interfacing with the [NPR One API](http://dev.npr.org/api/), suitable for both client-side and server-side projects.

[![npm](https://img.shields.io/npm/v/npr-one-sdk.svg)](https://www.npmjs.com/package/npr-one-sdk) [![Build Status](https://travis-ci.org/npr/npr-one-api-js-sdk.svg?branch=master)](https://travis-ci.org/npr/npr-one-api-js-sdk) [![Coverage Status](https://coveralls.io/repos/github/npr/npr-one-api-js-sdk/badge.svg?branch=master)](https://coveralls.io/github/npr/npr-one-api-js-sdk?branch=master) [![Documentation coverage](https://npr.github.io/npr-one-api-js-sdk/docs/badge.svg)](http://npr.github.io/npr-one-api-js-sdk/docs/) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)


##### Table of Contents

- [Background](#background)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Using NPM](#using-npm)
  - [Using Bower](#using-bower)
  - [Using Downloaded Files](#using-downloaded-files)
- [Setup](#setup)
  - [Client-side](#client-side)
    - [ES6](#es6)
    - [ES5](#es5)
  - [Server-side](#server-side)
- [Usage](#usage)
  - [Managing Access Tokens](#managing-access-tokens)
    - [Using an OAuth Proxy (Recommended)](#using-an-oauth-proxy-recommended)
    - [Do-It-Yourself](#do-it-yourself)
  - [Basic Flow](#basic-flow)
  - [Additional Functionality](#additional-functionality)
- [Examples](#examples)
- [Documentation](#documentation)
- [CHANGELOG](#changelog)
- [Contributing](#contributing)
- [License](#license)


## Background

Listening to NPR One is a simple and engaging experience. Developing your app should be too. That being said, developing an NPR One app requires a fair amount of business logic and a solid understanding of the sequence of API calls necessary to deliver audio to your users. Our API implements the [Collection.Doc+JSON Hypermedia Specification](http://cdoc.io/) and we've received feedback from our partner-developers that there is a learning curve to interacting with our services, especially when it comes to the concepts of "ratings" and "recommendations" that fuel the personalization of the NPR One user experience.

This open-source SDK was designed in part as a companion to the [NPR Developer Center](http://dev.npr.org/develop/), part utility for partner-developers working in JavaScript, and part toy box for the general public. We've made it our goal to abstract away as much of the business logic as possible, leaving an API that's more intuitive and user-friendly. The end result is more time to spend on building a rich UI with delightful user interactions and less time worrying about when and how to send that rating or get the next recommendation.

And this isn't just an experimental project! This very minute, this very same SDK is powering all of the interaction with the NPR One API for the recently-rebuilt [NPR One for the Web](http://one.npr.org).


## Prerequisites

Using this SDK requires a registered developer account with the [NPR One Developer Center](http://dev.npr.org/). If you do not already have a Dev Center account, you can [register for a personal account](http://dev.npr.org/apply/) to get started.

Use of this SDK requires a valid `access_token`. This SDK is unable to talk to the NPR Authorization Service and generate access tokens, for reasons discussed [further below](#managing-access-tokens). If you have a server-side proxy to handle authentication for your app, it can be configured to hook into this SDK. To help with this requirement, we have separately provided [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) as an open-source package that will securely proxy calls to the Authorization Service for your app.


## Installation

Depending on your environment, there are various methods you can use to add this library to your project.

### Using NPM

Assuming a recent version of [node.js](http://nodejs.org) (v0.12.x or newer) and [npm](http://npmjs.org) are installed globally on your system, you can do:

    npm install npr-one-sdk --save

...to add the latest stable version of this SDK to your existing node.js project.

If you do not already have an existing node.js project, you can start one with:

    npm init

...which will ask you some questions and generate a `package.json` for you. You can then run `npm install npr-one-sdk --save` to save the SDK to your new project's list of dependencies.

### Using Bower

For those using [node.js](http://nodejs.org) with [Bower](http://bower.io/) as your frontend package manager, we've also made this SDK available there. Run:

    bower install npr-one-sdk --save

...to add the latest stable version of this SDK to your existing Bower project.

If you do not already have an existing Bower project, you can start one with:

    bower init

...which will ask you some questions and generate a `bower.json` for you. You can then run `bower install npr-one-sdk --save` to save the SDK to your new project's list of dependencies.

**Note:** Bower has been losing considerable market share to [npm](http://npmjs.org) as the JavaScript package manager of choice, so we may cease to support Bower in the future. Unless you plan to integrate this SDK into a project that is already using Bower, we highly recommend using npm.

### Using Downloaded Files

**DISCLAIMER:** We strongly discourage using this method unless using a package manager is not an option.

You can download the project files in a ZIP [here](https://github.com/npr/npr-one-api-js-sdk/archive/master.zip), then unzip and/or copy-paste those files into your project. Note that you should generally only need the contents of the `dist` directory (and more specifically, only `dist/browser` for frontend JS projects, or `dist/node` for server-side JS projects); the `src` directory is included only for reference and in most cases can be safely deleted.

We will consider providing the distribution files for this project via a CDN (for frontend JS projects) if there is demand, but we will hold off on that until we have a chance to see how much traction this library receives.


## Setup

Once you have installed the SDK, how you set it up and incorporate it into your code will vary depending on your dev environment.

### Client-side

Your setup will depend slightly on whether you are using ES5 (the current mainstream version of JavaScript) or ES6 (the next-generation version of JavaScript). The SDK itself is written in ES6, although the distribution files are compiled into syntax that is compatible with ES5. We encourage consumers to use ES6 because we will be able to provide more guidance on that implementation.

**Note:** All of the following `config` settings are offered as examples. In most use cases, you will provide either a proxy base URL or an access token, but likely not both.

#### ES6

If you're using ES6, we are generally assuming that you are already using [npm](http://npmjs.org) as your frontend package manager in combination with a modern JavaScript module bundler such as [Webpack](https://webpack.github.io/), [Browserify](http://browserify.org/) or [jspm](http://jspm.io/). Those tools will typically resolve your dependencies, pulling in our distribution files from the proper location, so all you need to do to import the SDK and use it is:

```javascript
import NprOneSDK from 'npr-one-sdk';
const nprOneSDK = new NprOneSDK();

NprOneSDK.config = {
    authProxyBaseUrl: 'http://one.example.com/oauth2',
    accessToken: 'aaaabbbbcccc12345678'
};
```

#### ES5

The ES5 syntax and process for loading the SDK is a little less pretty. Using a module bundler will help simplify the loading process somewhat, but without a bundler, your setup will likely look/act along the lines of:

```html
<script src="/path/to/npr-one-sdk/dist/browser/npr-one-sdk.min.js"></script>
<script>
    var NprOneSDK = NprOneSDK.default;
    var nprOneSDK = new NprOneSDK();

    NprOneSDK.config = {
        authProxyBaseUrl: 'http://one.example.com/oauth2',
        accessToken: 'aaaabbbbcccc12345678'
    };
</script>
```


### Server-side

Because node.js already takes care of loading dependencies, the only prerequisite to getting the SDK set up is knowing how to instantiate the library. The syntax also varies based on whether you are using ES5 or ES6, but since ES6 is still fairly uncommon in the server-side world, ES5 will be considered canonical here.

In ES5 (most common):

```javascript
var NprOneSDK = require('npr-one-sdk').default;
var nprOneSDK = new NprOneSDK();

NprOneSDK.config = {
    authProxyBaseUrl: 'http://one.example.com/oauth2',
    accessToken: 'aaaabbbbcccc12345678'
};
```

In ES6 (less common):

```javascript
const NprOneSDK = require('npr-one-sdk').default;
const nprOneSDK = new NprOneSDK();

NprOneSDK.config = {
    authProxyBaseUrl: 'http://one.example.com/oauth2',
    accessToken: 'aaaabbbbcccc12345678'
};
```

## Usage

Once you successfully complete the [Setup](#setup) steps relevant to your environment and build process, you are ready to put this SDK to work!

### Managing Access Tokens

As mentioned above, this SDK does not automatically generate access tokens. Third-party developers (such as yourself) have two primary methods for obtaining the OAuth access tokens required to interact with our micro-services:

* `authorization_code` grant
* `device_code` grant (a custom grant based on Google's proposed spec for [OAuth2 for Limited Input Devices](https://developers.google.com/identity/protocols/OAuth2ForDevices))

The `implicit` grant type described in the OAuth2 spec is not currently supported due to security concerns.

Both the `device_code` and `authorization_code` grant types require an OAuth2 `client_secret` to generate an access token. However, since the source code for web applications written in client-side JavaScript cannot be kept private, a server-side proxy is required to safely make calls to the authorization server and ensure the security of your OAuth2 credentials.

While this security restriction isn't an issue for server-side JavaScript apps, we cannot restrict calls from the SDK to the authorization server to server-side JS only, so we had to take a least-common-denominator approach and assume this code will be run client-side. As such, it is left up to the consumer (you) to either provide access to a server-side proxy, or to manage access tokens yourself and tell the SDK which token to use for all calls.

#### Using an OAuth Proxy (Recommended)

The recommended approach (if you are using this SDK in a client-side project) is to use a server-side proxy that talks to the NPR Authorization Service. We have separately provided [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) as an open-source package that will fill this requirement. Even if you do not to use this particular proxy and plan to implement your own, this project can be seen as a template for how to construct calls and securely store the refresh tokens that come paired with access tokens.

In order to configure the SDK to use the proxy, there are a few config variables you need to set:

```javascript
NprOneSDK.config = {
    authProxyBaseUrl: 'http://one.example.com/oauth2',
    refreshTokenPath: '/refresh'
};
```

* `authProxyBaseUrl` represents the root path for your auth proxy.
* `refreshTokenPath` refers to the specific endpoint (or sub-path) corresponding to the `refresh_token` grant type in your auth proxy.

So, if the full path to the `refresh_token` endpoint in your proxy is `http://one.example.com/oauth2/refresh`, then `http://one.example.com/oauth2` is your `authProxyBaseUrl` and `/refresh` is your `refreshTokenPath`.

If you are using the [Authorization Code Grant](http://dev.npr.org/guide/services/authorization/#Auth_Code), this SDK does not offer built-in support for sign-in; there isn't much that this SDK _could_ do for you, and the few implementation decisions that need to be made will vary across apps. Essentially, if you are using [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) or a similar OAuth proxy, if a user clicks on a 'Sign In' link, all your app needs to do is redirect (most likely by setting `window.location.href`) to the same `authProxyBaseUrl` as above, followed by the path that corresponds to your Auth Code grant implementation. Once the proxy has obtained your authorization code, swaps it out for an access token, and is ready to redirect back to your app, it is up to your JavaScript app to figure out how to obtain that new access token. [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) stores it in a cookie which can be read by client-side code (and for security purposes, this cookie should promptly be deleted after it is read and stored in the SDK), but other implementations are possible.

If you are using the [Device Code Grant](http://dev.npr.org/guide/services/authorization/#device_code) instead, this SDK offers additional support. If you add the following endpoints to the config:

```javascript
NprOneSDK.config = {
    authProxyBaseUrl: 'http://one.example.com/oauth2',
    refreshTokenPath: '/refresh',
    newDeviceCodePath: '/device',
    pollDeviceCodePath: '/device/poll',
};
```

...following the same guidance as above, where `newDeviceCodePath` and `pollDeviceCodePath` are existing paths relative to `authProxyBaseUrl`, then you can use the built-in `getDeviceCode()` and `pollDeviceCode()` functions to add login via device code out of the box:

```javascript
function logInViaDeviceCode(scopes) {
    nprOneSDK.getDeviceCode(scopes)
        .then((deviceCodeModel) => {
            displayCodeToUser(deviceCodeModel); // display code to user on the screen
            nprOneSDK.pollDeviceCode()
                .then(() => {
                    startPlayingAudio(); // you're now ready to call `nprOneSDK.getRecommendation()` elsewhere in your app
                }).catch(logInViaDeviceCode.bind(this, scopes)); // recursively call this function until the user logs in
        });
}

logInViaDeviceCode(['identity.readonly', 'identity.write', 'listening.readonly', 'listening.write', 'localactivation']);
```

Note that the above functions have been optimized to work with the [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) package. If you have created a custom OAuth proxy that does not use the same approach to the Device Code Grant, then the above built-in functionality may or may not work.

It is important to note that the **SDK** (and not your app) should be considered the single source of truth as to what the current access token is because the SDK is configured to refresh tokens behind-the-scenes when they expire, allowing the desired API calls to go through uninterrupted. As such, **the access token may change at any time**. If your app is not storing or otherwise consuming access tokens outside of the SDK, you have nothing to worry about. However, if you are persisting access tokens across sessions (which is left entirely up to your app to implement), then we recommend using the callback provided below to notify your app when the access token changes:

```javascript
NprOneSDK.onAccessTokenChanged = function (newToken) {
    console.log('Access token has changed! New token:', newToken);
    // in production, replace console.log() with code to update your token in memory/localStorage/wherever
};
```

The alternative is to check the value of `NprOneSDK.accessToken` after each API call to see whether the token has changed, but the callback approach offers a simpler method.

#### Do-It-Yourself

The DIY approach is only recommended if you are using this SDK in server-side JavaScript. Since a `client_secret` should **never** be included in frontend code, only server-side apps can safely make calls directly to the Authorization Service.

If you do plan to take the DIY approach, the method for obtaining an access token is up to you to design, but you can reference the [npr-one-backend-proxy-php](https://github.com/nprdm/npr-one-backend-proxy-php) project as a template for how to construct your calls.

Once you have obtained your access token, you have two ways of communicating that to the SDK:

...either through the `.config` setting:

```javascript
NprOneSDK.config = {
    accessToken: 'aaaabbbbcccc12345678'
};
```

...or using the `.accessToken` shortcut:

```javascript
NprOneSDK.accessToken = 'aaaabbbbcccc12345678';
```

Neither of these is considered preferable over the other, but if all you are changing is the access token, the second option offers shorter syntax.

### Basic Flow

The basic flow of an NPR One application is as follows:

1. Ask for a list of recommendations; grab the first item in the list and deliver that audio to your user
2. Begin playing the audio associated with the first item; send a `START` rating
3. Finish playing the audio; send a `COMPLETED` rating
4. Play the next item in the recommendation list; rinse & repeat

This SDK abstracts away the logic of when to actually make new API calls. Given the above flow, a simple application might look similar to the following:

```javascript
nprOneSDK.getRecommendation()
    .then(function (recommendation) {
        recommendation.recordAction(NprOneSDK.Action.START, 0);
    
        audioPlayer.play(recommendation.getAudio()[0]); // where "audioPlayer" here is a stand-in for your audio player implementation
    
        // assuming some time passes and the audio player completes playing the audio...
    
        recommendation.recordAction(NprOneSDK.Action.COMPLETED, recommendation.attributes.duration);
    
        nprOneSDK.getRecommendation()
            .then(function (nextRecommendation) {
                // repeat the same steps as above with the new recommendation; repeat ad infinitum
            });
    });
```

There are many opportunities for including reusable callback functions, but we've kept it simple here to give the main overview.

Aside from `START` and `COMPLETED`, here are the other actions (or "ratings") you can send:

Action                       | Usage
---------------------------  | -------------
`NprOneSDK.Action.SKIP`      | To be used when the user has explicitly chosen to move on to the next story; the SDK will automatically advance to the next piece on the next call to `getRecommendation()`.
`NprOneSDK.Action.TIMEOUT`   | To be used when the audio player is unable to play the audio; the SDK will automatically advance to the next piece on the next call to `getRecommendation()`.
`NprOneSDK.Action.THUMBUP`   | If your app has a "Mark as Interesting" button or a similar non-canonical "Like" or "Favorite" mechanism, send this action when the user explicitly presses that button/uses that feedback mechanism.
`NprOneSDK.Action.SHARE`     | If your app has some type of social sharing integration, send this action when the user explicitly chooses to share a piece via social media.
`NprOneSDK.Action.TAPTHRU`   | If a user explicitly interacts with a feature card or taps/clicks on the image for a sponsorship card, send this action.
`NprOneSDK.Action.PASS`      | If your app displays a list of upcoming recommendations and the user explicitly chooses to skip multiple recommendations in favor of one much further down the list, send this action (see [here](http://dev.npr.org/develop/developer-documentation/examples/recommendation-examples/) for more info).
`NprOneSDK.Action.SRCHSTART` | If your app provides search functionality (not yet included in this SDK, but likely coming in a future update), send this action when the user has explicitly initiated search.
`NprOneSDK.Action.SRCHCOMPL` | If your app provides search functionality (not yet included in this SDK, but likely coming in a future update), send this action when the user has finished searching (either by selecting something to listen to, or canceling out of search).

### Additional Functionality

Aside from the basic flow to play audio piece-by-piece, here are the other calls you can make through this SDK:

Call                                            | Usage
----------------------------------------------- | -------------
`getUpcomingFlowRecommendations()`              | Can be used to display a "Coming Up" list in your app; items in this list represent what's queued to play next, assuming no other user interactions occur.
`getRecommendationsFromChannel(channel)`        | Can be used to retrieve a list of stories in a channel other than the regular flow channel of `'npr'`, suitable for displaying in lists or grids of recommended/featured content.
`queueRecommendationFromChannel(channel, uid)`  | Should be used in tandem with `getRecommendationsFromChannel()` after the user has selected a specific piece from that channel to play next, in order to ensure that the correct ratings (actions) will be sent and the flow of audio will continue appropriately with the necessary API calls.
`getHistory()`                                  | Can be used to display a list of items that the user has recently heard, in reverse-chronological order.
`getUser()`                                     | Can be used to retrieve and/or display metadata about the current logged-in user, such as their name, e-mail address, and their localized NPR member station.
`followShow(aggregationId)`                     | Can be used to indicate that the user wishes to follow, or subscribe to, the show, program, or podcast with the given ID. Note that at this time, because we have not yet implemented search in this SDK, there is no way to retrieve a list of aggregation (show) IDs through this SDK.
`unfollowShow(aggregationId)`                   | Can be used to indicate that the user wishes to unfollow, or unsubscribe from, the show, program, or podcast with the given ID; a counter to `followShow()`. The same restrictions apply.
`setUserStation(stationId)`                     | Can be used to manually set a user's NPR station to the station with the given ID. Note that the NPR One API already auto-localizes users to their nearest station, so this particular function should only be used if your app offers the ability to search for and manually select a station.
`searchStations(query)`                         | Can be used to perform a general search of all NPR One stations, using an optional query. If no query is passed in, this function will return a list of one or more stations geographically closest to the client based on the consumer's IP address.
`searchStationsByLatLongCoordinates(lat, long)` | Can be used to perform a geographic search of all NPR One stations using a passed-in pair of lat-long coordinates. In most cases, this means you will need to first use the [HTML5 Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation) or a similar library in order to obtain the lat-long coordinates for the end-user's location.
`searchStationsByCityAndState(city, state)`     | Can be used to perform a geographic search of all NPR One stations using a city name (full) and state (name or abbreviation). While you _can_ pass in a city _or_ state to `searchStations()` as the query, this function will return more accurate results, particularly for common city names such as 'Springfield'.
`getStationDetails(stationId)`                  | Can be used to retrieve additional metadata about the NPR station with the given ID. The most common use case is for a screen that shows the end-user more information about the station they are currently localized to.
`logout()`                                      | Can be used to perform cleanup as part of a logout process if you have a [backend auth proxy](#using-an-oauth-proxy-recommended) configured. If you are using [the DIY approach](#do-it-yourself) instead of a proxy, then you are responsible for your own cleanup.


Search will be implemented at some later date; we don't typically add functionality to the SDK until we have a chance to dogfood our work ourselves, and [NPR One for the Web](http://one.npr.org) does not (yet) offer search functionality.


## Examples

The [examples](https://github.com/npr/npr-one-api-js-sdk/tree/master/examples/) directory contains some examples of the SDK in use, both for client-side and server-side environments.

* [`examples/browser/example.html`](https://github.com/npr/npr-one-api-js-sdk/tree/master/examples/browser/example.html) shows an example of the SDK in use in the browser
* [`examples/node/main.js`](https://github.com/npr/npr-one-api-js-sdk/tree/master/examples/node/main.js) shows an example of the SDK in use in a node.js server-side app

These example files will not run out-of-the-box because they require a valid OAuth access token to be configured. If you would like to try running these, clone or download the repository to your local filesystem, then edit [line 38 of the browser example file](https://github.com/npr/npr-one-api-js-sdk/tree/master/examples/browser/example.html#L38) and [line 9 of the node.js example file](https://github.com/npr/npr-one-api-js-sdk/tree/master/examples/node/main.js#L9), respectively, replacing the fake access token with your own, valid access token.


## Documentation

Further information about the public API of this package can be found [here](http://npr.github.io/npr-one-api-js-sdk/docs/).

For background information about the NPR One API, please see the [developer guide](http://dev.npr.org/develop/) at the [NPR One Developer Center](http://dev.npr.org/).


## CHANGELOG

The changelog can be found on our [GitHub releases](https://github.com/npr/npr-one-api-js-sdk/releases) page.


## Contributing

If you're interested in contributing to this project by submitting bug reports, helping to improve the documentation, or writing actual code, please read [our contribution guidelines](https://github.com/npr/npr-one-api-js-sdk/tree/master/CONTRIBUTING.md).


## License

Copyright (c) 2016 NPR

Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/License-2.0) (the “License”) with the following modification; You may not use this file except in compliance with the License as modified by the addition of Section 10, as follows:

##### 10. Additional Prohibitions

When using the Work, You may not (or allow those acting on Your behalf to):

a.	Perform any action with the intent of introducing to the Work, the NPR One API, the NPR servers or network infrastructure, or any NPR products and services any viruses, worms, defects, Trojan horses, malware or any items of a destructive or malicious nature; or obtaining unauthorized access to the NPR One API, the NPR servers or network infrastructure, or any NPR products or services;

b.	Remove, obscure or alter any NPR terms of service, including the [NPR services Terms of Use](http://www.npr.org/about-npr/179876898/terms-of-use) and the [Developer API Terms of Use](http://dev.npr.org/terms-of-use/), or any links to or notices of those terms; or

c.	Take any other action prohibited by any NPR terms of service, including the [NPR services Terms of Use](http://www.npr.org/about-npr/179876898/terms-of-use) and the [Developer API Terms of Use](http://dev.npr.org/terms-of-use/).

You may obtain a copy of the License at http://www.apache.org/licenses/License-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License with the above modification is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
