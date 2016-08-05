'use strict';

exports.__esModule = true;

var _jsLogger = require('js-logger');

var Logger = _interopRequireWildcard(_jsLogger);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/* istanbul ignore next */
Logger.useDefaults({
    formatter: function formatter(messages, context) {
        messages.unshift('[NPROneSDK]');
        if (context.name) {
            messages.unshift('[' + context.name + ']');
        }
    }
});

/**
 * @typedef {JsLogger} Logger
 */
exports.default = Logger;