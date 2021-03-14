"use strict";
exports.__esModule = true;
exports.DomLogger = void 0;
var tsdom_1 = require("tsdom");
var DomLogger = /** @class */ (function () {
    function DomLogger() {
    }
    DomLogger.prototype.log = function (toLog) {
        throw new Error('Method not implemented.');
    };
    DomLogger.prototype.error = function (toLog) {
        throw new Error('Method not implemented.');
    };
    DomLogger.prototype.AddLog = function (logEntry, elementClasses) {
        var logger = tsdom_1["default"]('.logger');
        var logs = logger.toArray();
        logs = logs.slice(Math.min(logs.length - 10), 0);
        logger.empty();
        logs.forEach(function (element) {
            logger.append(element);
        });
        logger.append("<p class=\"" + elementClasses.join(' ') + "\">" + logEntry + "</p>");
    };
    return DomLogger;
}());
exports.DomLogger = DomLogger;
//# sourceMappingURL=logger.js.map