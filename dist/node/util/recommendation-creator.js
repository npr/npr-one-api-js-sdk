'use strict';

exports.__esModule = true;
exports.default = createRecommendations;

var _validator = require('./validator');

var _validator2 = _interopRequireDefault(_validator);

var _recommendation = require('./../model/recommendation');

var _recommendation2 = _interopRequireDefault(_recommendation);

var _logger = require('./../util/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates recommendation objects from collection doc ensuring that necessary
 * properties are present
 *
 * @param {CollectionDocJSON} collectionDoc
 * @returns {Array<Recommendation>}
 * @throws {TypeError} if the collectionDoc passed in is not valid
 */
function createRecommendations(collectionDoc) {
    _validator2.default.validateCollectionDoc(collectionDoc);

    var recommendations = [];
    collectionDoc.items.forEach(function (item) {
        try {
            recommendations.push(new _recommendation2.default(item));
        } catch (e) {
            _logger2.default.warn('Recommendation is invalid and has been excluded.', e);
        }
    });

    return recommendations;
}