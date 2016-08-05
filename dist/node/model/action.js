'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Actions that can be recorded for recommendations.
 * For more detail on user rating actions, see our narrative [Listening Service documentation](http://dev.npr.org/guide/services/listening/#Ratings)
 */
var Action = function () {
    function Action() {
        _classCallCheck(this, Action);
    }

    /**
     * Actions which indicate the recommendation is no longer being presented to the user
     *
     * @returns {Array<string>}
     */
    Action.getEndActions = function getEndActions() {
        return [Action.COMPLETED, Action.SKIP, Action.TIMEOUT, Action.SRCHCOMPL];
    };

    /**
     * Actions which should result in the flow advancing
     *
     * @returns {Array<string>}
     */


    Action.getFlowAdvancingActions = function getFlowAdvancingActions() {
        return [Action.START, Action.TAPTHRU, Action.TIMEOUT];
    };

    /**
     * Returns whether a given action is valid or not
     *
     * @param {string} action
     * @returns {boolean}
     */


    Action.isValidAction = function isValidAction(action) {
        return {}.hasOwnProperty.call(Action, action);
    };

    _createClass(Action, null, [{
        key: 'COMPLETED',

        /** @type {string} */
        get: function get() {
            return 'COMPLETED';
        }

        /** @type {string} */

    }, {
        key: 'PASS',
        get: function get() {
            return 'PASS';
        }

        /** @type {string} */

    }, {
        key: 'SHARE',
        get: function get() {
            return 'SHARE';
        }

        /** @type {string} */

    }, {
        key: 'SKIP',
        get: function get() {
            return 'SKIP';
        }

        /** @type {string} */

    }, {
        key: 'SRCHCOMPL',
        get: function get() {
            return 'SRCHCOMPL';
        }

        /** @type {string} */

    }, {
        key: 'SRCHSTART',
        get: function get() {
            return 'SRCHSTART';
        }

        /** @type {string} */

    }, {
        key: 'START',
        get: function get() {
            return 'START';
        }

        /** @type {string} */

    }, {
        key: 'THUMBUP',
        get: function get() {
            return 'THUMBUP';
        }

        /** @type {string} */

    }, {
        key: 'TIMEOUT',
        get: function get() {
            return 'TIMEOUT';
        }

        /** @type {string} */

    }, {
        key: 'TAPTHRU',
        get: function get() {
            return 'TAPTHRU';
        }
    }]);

    return Action;
}();

exports.default = Action;