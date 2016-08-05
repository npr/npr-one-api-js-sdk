'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _collectionDoc = require('./collection-doc');

var _collectionDoc2 = _interopRequireDefault(_collectionDoc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

/**
 * Container class for all metadata pertaining to an organization (member station) from the NPR One API
 *
 * @extends {CollectionDoc}
 */
var Station = function (_CollectionDoc) {
    _inherits(Station, _CollectionDoc);

    /**
     * @param {CollectionDocJSON} json    The decoded JSON object that should be used as the basis for this model
     */
    function Station(json) {
        _classCallCheck(this, Station);

        var _this = _possibleConstructorReturn(this, _CollectionDoc.call(this, json));

        _this._validate();
        return _this;
    }

    /**
     * Returns the unique ID that represents this station across NPR's various APIs. The ID is an integer between 1 and
     * 9999, but it will always be returned in string format.
     *
     * @type {string}
     */


    /**
     * A convenience function to cast this object back to a string, generally only used by the {@link Logger} class.
     * In this case, we return the station's display name.
     *
     * @returns {string}
     */
    Station.prototype.toString = function toString() {
        return this.displayName;
    };

    /**
     * @typedef {Object} StationAttributes
     * @property {StationAppsList} apps An associative array of application-specific metadata for this station
     * @property {string} guid The system's internal unique identifier for a station, not typically used by other APIs or consumers
     * @property {string} org_id The system's unique ID for this station, used across NPR One Microservices and NPR's other APIs
     * @property {string} name The display name for the station. In most cases, this will be the same as call letters combined with band. When returning networks, it will return the network name (e.g. Minnesota Public Radio).
     * @property {string} title An alternative display name for the station. Consumers are discouraged from using this and encouraged to use name instead.
     * @property {string} abbreviation An abbreviated name for the station. Consumers are discouraged from using this and encouraged to use name instead.
     * @property {string} call The three-to-four-letter identifying code for this station. Please use this with caution; most stations prefer to be identified by their name in client applications instead of call.
     * @property {string} frequency Where on the radio dial the station can be heard. If the band is AM, the frequency will be between 540 and 1600. If the band is FM, the frequency will be between 87.8 and 108.0.
     * @property {string} band The subsection of the radio spectrum -- 'AM' or 'FM' -- where this station can be heard
     * @property {string} tagline A short text-logo for the station
     * @property {Array<string>} address The address of the station's main office
     * @property {string} market_city The city that the station is most closely associated with. This may or may not be the city the station is licensed in and it may or may not be the city that the station or the station's antenna is located in.
     * @property {string} market_state The state that the station is most closely associated with. This may or may not be the state the station is licensed in and it may or may not be the state that the station or the station's antenna is located in.
     * @property {string} format The format of the programming on this station
     * @property {boolean} music_only Whether or not this station only plays music
     * @property {string} status The status of the station within NPR's system, not typically used by consumers
     * @property {string} status_name The semantic name corresponding to the status ID
     * @property {string} email The station's primary contact e-mail address
     * @property {string} area_code The area code for the station's main office
     * @property {string} phone The phone number for the station's main office
     * @property {string} phone_extension The phone extension for the station's main office
     * @property {string} fax The fax number for the station's main office
     * @property {StationNetwork} network The parent organization, if this station is part of a network
     * @property {boolean} npr_one Whether or not this organization is considered an NPR One station
     */
    /**
     * @typedef {Object} StationAppsList
     * @property {StationNprOneData} npr_one A list of metadata designed for use by NPR One clients
     */
    /**
     * @typedef {Object} StationNprOneData
     * @property {string} name The name to display for this station within NPR One clients
     * @property {string} logo The URL of an image associated with the station
     * @property {string} donation_url The URL to a website where users may make a donation to support the station
     * @property {string} donation_audio The audio to play inviting users to make a donation
     * @property {string} thankyou_audio The audio to play when users have successfully made an in-app donation
     * @property {Array<string>} sonic_id_audio The audio to play when users start a listening session, not typically used directly by consumers
     * @property {Array<string>} hello_id_audio The audio to play when users start a listening session, not typically used directly by consumers
     */
    /**
     * @typedef {Object} StationNetwork
     * @property {string} org_id The system's unique ID for the parent organization (network), used across NPR One Microservices and NPR's other APIs
     * @property {string} name The display name for the parent organization (network)
     */


    _createClass(Station, [{
        key: 'id',
        get: function get() {
            return this._raw.attributes.org_id;
        }

        /**
         * Returns the display name that the station would prefer to use. Please use this anytime you want to display a
         * given station's name, rather than attempting to find the appropriate field inside of {@link Station.attributes}
         * yourself; branding is a sensitive issue for stations and we should all respect how they wish to be identified.
         *
         * @type {string}
         */

    }, {
        key: 'displayName',
        get: function get() {
            return this._raw.attributes.name ? this._raw.attributes.name : this._raw.attributes.call;
        }

        /**
         * Returns the logo for this station, if one can be found. If it exists, the NPR One-specific logo will take
         * precedence, but it will fall back to the regular station logo if not present. If no logo can be found at all,
         * this will return `null`.
         *
         * @type {null|string}
         */

    }, {
        key: 'logo',
        get: function get() {
            if (this._raw.attributes.apps && this._raw.attributes.apps.npr_one && this._raw.attributes.apps.npr_one.logo) {
                return this._raw.attributes.apps.npr_one.logo;
            }
            if (this._raw.links.image) {
                for (var _iterator = this._raw.links.image, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var link = _ref;

                    if (link.type_id === '18' || link.type_id === '23') {
                        return link.href;
                    }
                }
            }
            return null;
        }

        /**
         * Returns the tagline for this station. This should be used as supplemental metadata for a station; it should never
         * be used as the sole identifying information. Note that while the majority of the stations in our system have
         * taglines, it is not guaranteed that each station has one.
         *
         * @type {string}
         */

    }, {
        key: 'tagline',
        get: function get() {
            return this._raw.attributes.tagline || '';
        }

        /**
         * Returns the call sign, brand (AM or FM), and frequency together as one string, e.g. `'WAMU FM 88.5'` or
         * `'KCFR FM 90.1'` or `'KWSU AM 1250'`. Again, this should be treated as supplemental metadata for a station and
         * not the sole identifying information; where possible, stations prefer to be identified primarily by their
         * {@link displayName} and {@link logo}. However, some local stations are members of networks such as Colorado Public Radio
         * and therefore use the same display name and logo; in those cases, the call sign + band + frequency combination is
         * the main way to disambiguate between multiple stations in the same network. This value is guaranteed to be unique.
         *
         * @type {null|string}
         */

    }, {
        key: 'callSignAndFrequency',
        get: function get() {
            var callSignAndFrequency = '';
            if (this._raw.attributes.call) {
                callSignAndFrequency += this._raw.attributes.call;
            }
            if (this._raw.attributes.band) {
                callSignAndFrequency += ' ' + this._raw.attributes.band;
            }
            if (this._raw.attributes.frequency) {
                callSignAndFrequency += ' ' + this._raw.attributes.frequency;
            }
            return callSignAndFrequency.trim() || null;
        }

        /**
         * Returns the location of the station, which always consists of a city and (abbreviated) state, e.g. `'Austin, TX'`
         * or `'Rochester, NY'`. Similarly to {@link callSignAndFrequency}, this is most useful for disambiguating between
         * multiple local stations in a bigger network such as Colorado Public Radio, which use the same {@link displayName}
         * and {@link logo}. Note that this value isn't guaranteed to be unique; some cities (e.g. Boston) have multiple
         * NPR stations.
         *
         * @type {string}
         */

    }, {
        key: 'location',
        get: function get() {
            return this._raw.attributes.market_city + ', ' + this._raw.attributes.market_state;
        }

        /**
         * Returns the URL to the station's website, if available.
         *
         * @type {null|string}
         */

    }, {
        key: 'homepageUrl',
        get: function get() {
            if (this._raw.links.web) {
                for (var _iterator2 = this._raw.links.web, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
                    var _ref2;

                    if (_isArray2) {
                        if (_i2 >= _iterator2.length) break;
                        _ref2 = _iterator2[_i2++];
                    } else {
                        _i2 = _iterator2.next();
                        if (_i2.done) break;
                        _ref2 = _i2.value;
                    }

                    var link = _ref2;

                    if (link.type_id === '1') {
                        return link.href;
                    }
                }
            }
            return null;
        }

        /**
         * Returns the URL to the station's online pledge page, if available.
         *
         * @type {null|string}
         */

    }, {
        key: 'donationUrl',
        get: function get() {
            if (this._raw.attributes.apps && this._raw.attributes.apps.npr_one && this._raw.attributes.apps.npr_one.donation_url) {
                return this._raw.attributes.apps.npr_one.donation_url;
            }
            if (this._raw.links.web) {
                for (var _iterator3 = this._raw.links.web, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                    var _ref3;

                    if (_isArray3) {
                        if (_i3 >= _iterator3.length) break;
                        _ref3 = _iterator3[_i3++];
                    } else {
                        _i3 = _iterator3.next();
                        if (_i3.done) break;
                        _ref3 = _i3.value;
                    }

                    var link = _ref3;

                    if (link.type_id === '4' || link.type_id === '27') {
                        return link.href;
                    }
                }
            }
            return null;
        }

        /**
         * Returns the raw attributes that represent this station. Please use this with caution; the public accessor methods
         * in this class should be sufficient for most use cases, and consumers should rarely need to use this additional
         * metadata. These attributes will also be changing in version 3 of the Station Finder Service, so we are
         * discouraging clients from writing code against these.
         *
         * @type {StationAttributes}
         */

    }, {
        key: 'attributes',
        get: function get() {
            return this._raw.attributes;
        }
    }]);

    return Station;
}(_collectionDoc2.default);

exports.default = Station;