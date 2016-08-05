/**
 * Actions that can be recorded for recommendations.
 * For more detail on user rating actions, see our narrative [Listening Service documentation](http://dev.npr.org/guide/services/listening/#Ratings)
 */
export default class Action
{
    /** @type {string} */
    static get COMPLETED() {
        return 'COMPLETED';
    }

    /** @type {string} */
    static get PASS() {
        return 'PASS';
    }

    /** @type {string} */
    static get SHARE() {
        return 'SHARE';
    }

    /** @type {string} */
    static get SKIP() {
        return 'SKIP';
    }

    /** @type {string} */
    static get SRCHCOMPL() {
        return 'SRCHCOMPL';
    }

    /** @type {string} */
    static get SRCHSTART() {
        return 'SRCHSTART';
    }

    /** @type {string} */
    static get START() {
        return 'START';
    }

    /** @type {string} */
    static get THUMBUP() {
        return 'THUMBUP';
    }

    /** @type {string} */
    static get TIMEOUT() {
        return 'TIMEOUT';
    }

    /** @type {string} */
    static get TAPTHRU() {
        return 'TAPTHRU';
    }

    /**
     * Actions which indicate the recommendation is no longer being presented to the user
     *
     * @returns {Array<string>}
     */
    static getEndActions() {
        return [
            Action.COMPLETED, Action.SKIP, Action.TIMEOUT, Action.SRCHCOMPL,
        ];
    }

    /**
     * Actions which should result in the flow advancing
     *
     * @returns {Array<string>}
     */
    static getFlowAdvancingActions() {
        return [
            Action.START, Action.TAPTHRU, Action.TIMEOUT,
        ];
    }

    /**
     * Returns whether a given action is valid or not
     *
     * @param {string} action
     * @returns {boolean}
     */
    static isValidAction(action) {
        return {}.hasOwnProperty.call(Action, action);
    }
}
