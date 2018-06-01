/**
 * Actions that can be recorded for recommendations.
 * For more detail on user rating actions, see our narrative
 * [Listening Service documentation](https://dev.npr.org/guide/services/listening/#Ratings)
 */
export enum Actions {
    COMPLETED = 'COMPLETED',
    PASS = 'PASS',
    SHARE = 'SHARE',
    SKIP = 'SKIP',
    SRCHCOMPL = 'SRCHCOMPL',
    SRCHSTART = 'SRCHSTART',
    START = 'START',
    TAPTHRU = 'TAPTHRU',
    THUMBUP = 'THUMBUP',
    TIMEOUT = 'TIMEOUT',
}

/**
 * Actions which indicate the recommendation is no longer being presented to the user
 */
export enum EndActions {
    COMPLETED = 'COMPLETED',
    PASS = 'PASS',
    SKIP = 'SKIP',
    SRCHCOMPL = 'SRCHCOMPL',
    TIMEOUT = 'TIMEOUT',
}

/**
 * Actions which should result in the flow advancing
 */
export enum FlowAdvancingActions {
    START = 'START',
    TAPTHRU = 'TAPTHRU',
}

export default Actions;
