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

export { Logger };
export default Logger;
