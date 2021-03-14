"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.MainWindowLoader = void 0;
var cgf_cameracontrol_main_core_1 = require("cgf.cameracontrol.main.core");
var cgf_cameracontrol_main_gamepad_1 = require("cgf.cameracontrol.main.gamepad");
var electron_1 = require("electron");
var fs = require("fs");
var MainWindowLoader = /** @class */ (function () {
    function MainWindowLoader() {
        this.logger = {
            log: function (toLog) {
                console.log(toLog);
            },
            error: function (toLog) {
                console.error(toLog);
            }
        };
    }
    MainWindowLoader.prototype.createWindow = function (mainWindowLocation) {
        var _this = this;
        // Create the browser window.
        this.mainWindow = new electron_1.BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                contextIsolation: true
            }
        });
        // and load the index.html of the app.
        this.mainWindow.loadURL(mainWindowLocation);
        // Emitted when the window is closed.
        this.mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            _this.disposeCurrentCoreInstane().then(function () { return (_this.mainWindow = undefined); });
        });
        this.mainWindow.setMenu(this.createMenu());
    };
    MainWindowLoader.prototype.createMenu = function () {
        var _this = this;
        return electron_1.Menu.buildFromTemplate([
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Load Configuration',
                        click: function () { return _this.showLoadConfigDialog(); }
                    },
                    { role: 'forceReload' },
                    { role: 'toggleDevTools' },
                    { role: 'quit' },
                ]
            },
        ]);
    };
    MainWindowLoader.prototype.showLoadConfigDialog = function () {
        return __awaiter(this, void 0, void 0, function () {
            var openComplete, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, electron_1.dialog.showOpenDialog(this.mainWindow, {
                                properties: ['openFile'],
                                filters: [{ name: 'JSON Files', extensions: ['json'] }]
                            })];
                    case 1:
                        openComplete = _a.sent();
                        if (!openComplete.canceled) {
                            this.loadConfig(openComplete.filePaths[0]);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MainWindowLoader.prototype.disposeCurrentCoreInstane = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ((_a = this.core) === null || _a === void 0 ? void 0 : _a.dispose())];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.log('dispose error:');
                        console.log(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MainWindowLoader.prototype.loadConfig = function (filepath) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.disposeCurrentCoreInstane()];
                    case 1:
                        _a.sent();
                        this.core = new cgf_cameracontrol_main_core_1.Core();
                        this.core.HmiFactory.builderAdd(new cgf_cameracontrol_main_gamepad_1.Fx10Builder(this.logger, this.core.MixerFactory));
                        this.core.HmiFactory.builderAdd(new cgf_cameracontrol_main_gamepad_1.Rumblepad2Builder(this.logger, this.core.MixerFactory));
                        config = JSON.parse(fs.readFileSync(filepath).toString());
                        this.core.bootstrap(this.logger, config);
                        return [2 /*return*/];
                }
            });
        });
    };
    return MainWindowLoader;
}());
exports.MainWindowLoader = MainWindowLoader;
//# sourceMappingURL=MainWindowLoader.js.map