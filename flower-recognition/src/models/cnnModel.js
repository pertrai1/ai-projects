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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CNNModel = void 0;
var tf = require("@tensorflow/tfjs-node");
var constants_1 = require("../config/constants");
var CNNModel = /** @class */ (function () {
    function CNNModel() {
        this.model = this.buildModel();
    }
    CNNModel.prototype.buildModel = function () {
        var model = tf.sequential();
        model.add(tf.layers.conv2d({
            inputShape: [constants_1.CONFIG.IMG_SIZE, constants_1.CONFIG.IMG_SIZE, 3],
            filters: 64,
            kernelSize: 5,
            padding: "same",
            activation: "relu",
            name: "conv1",
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2, name: "pool1" }));
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            padding: "same",
            activation: "relu",
            name: "conv2",
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool2" }));
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            padding: "same",
            activation: "relu",
            name: "conv3",
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool3" }));
        model.add(tf.layers.conv2d({
            filters: 64,
            kernelSize: 3,
            padding: "same",
            activation: "relu",
            name: "conv4",
        }));
        model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2, name: "pool4" }));
        model.add(tf.layers.flatten({ name: "flatten" }));
        model.add(tf.layers.dense({ units: 512, activation: "relu", name: "dense1" }));
        model.add(tf.layers.dense({
            units: constants_1.CONFIG.FLOWER_CLASSES.length,
            activation: "softmax",
            name: "output",
        }));
        return model;
    };
    CNNModel.prototype.compile = function () {
        this.model.compile({
            optimizer: tf.train.adam(),
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"],
        });
    };
    CNNModel.prototype.getModel = function () {
        return this.model;
    };
    CNNModel.prototype.printSummary = function () {
        this.model.summary();
    };
    CNNModel.prototype.save = function () {
        return __awaiter(this, arguments, void 0, function (savePath) {
            if (savePath === void 0) { savePath = constants_1.CONFIG.MODEL_SAVE_PATH; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.save("file://".concat(savePath))];
                    case 1:
                        _a.sent();
                        console.log("Model saved to ".concat(savePath));
                        return [2 /*return*/];
                }
            });
        });
    };
    CNNModel.load = function () {
        return __awaiter(this, arguments, void 0, function (loadPath) {
            var loadedModel, cnnModel;
            if (loadPath === void 0) { loadPath = constants_1.CONFIG.MODEL_SAVE_PATH; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tf.loadLayersModel("file://".concat(loadPath, "/model.json"))];
                    case 1:
                        loadedModel = (_a.sent());
                        cnnModel = new CNNModel();
                        cnnModel.model = loadedModel;
                        console.log("Model loaded successfully");
                        return [2 /*return*/, cnnModel];
                }
            });
        });
    };
    return CNNModel;
}());
exports.CNNModel = CNNModel;
