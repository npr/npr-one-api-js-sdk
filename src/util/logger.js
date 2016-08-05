import * as Logger from 'js-logger';

/* istanbul ignore next */
Logger.useDefaults({
    formatter(messages, context) {
        messages.unshift('[NPROneSDK]');
        if (context.name) {
            messages.unshift(`[${context.name}]`);
        }
    },
});

/**
 * @typedef {JsLogger} Logger
 */
export default Logger;
