"use strict";
// This file is copied from RLBotJS by SuperVK. It is translated into typescript and some minor changes were made to make it compatible with this codebase.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.Color = exports.RenderManager = void 0;
var crypto_1 = __importDefault(require("crypto"));
var flatbuffers_1 = require("flatbuffers");
var utils = __importStar(require("./utils"));
var rlbot_generated_1 = require("./flat/rlbot_generated");
var flat = rlbot_generated_1.rlbot.flat;
var RenderMessage = flat.RenderMessage, RenderType = flat.RenderType, RenderGroup = flat.RenderGroup;
var defaultGroupId = "default";
var maxInt = 1337;
var Color = /** @class */ (function () {
    function Color(alpha, red, green, blue) {
        this.alpha = alpha;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    Color.prototype.convertToFlat = function (builder) {
        flat.Color.startColor(builder);
        flat.Color.addA(builder, this.alpha);
        flat.Color.addR(builder, this.red);
        flat.Color.addG(builder, this.green);
        flat.Color.addB(builder, this.blue);
        return flat.Color.endColor(builder);
    };
    return Color;
}());
exports.Color = Color;
var RenderManager = /** @class */ (function () {
    function RenderManager(botClient) {
        this.client = botClient;
        this.builder = null;
        this.index = this.client.botIndex;
        this.Color = Color;
        this.renderList = [];
        this.groupID = "";
    }
    RenderManager.prototype.beginRendering = function (groupID) {
        this.builder = new flatbuffers_1.flatbuffers.Builder(0);
        this.renderList = [];
        if (groupID)
            this.groupID = groupID;
    };
    RenderManager.prototype.endRendering = function () {
        if (this.groupID == undefined)
            this.groupID = "default";
        var hash = crypto_1["default"].createHash("sha256");
        hash.update(this.groupID + this.client.botIndex);
        var groupIDHashed = parseInt(hash.digest("hex"), 16) % maxInt;
        if (this.builder == null)
            return;
        var messages = RenderGroup.createRenderMessagesVector(this.builder, this.renderList);
        RenderGroup.startRenderGroup(this.builder);
        RenderGroup.addId(this.builder, groupIDHashed);
        RenderGroup.addRenderMessages(this.builder, messages);
        var result = RenderGroup.endRenderGroup(this.builder);
        this.builder.finish(result);
        var buf = this.builder.asUint8Array();
        this.client.ws.write(utils.encodeFlat(8, buf));
    };
    RenderManager.prototype.drawString2D = function (x, y, scaleX, scaleY, text, color) {
        if (this.builder == null)
            return;
        var textFlat = this.builder.createString(text);
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, RenderType.DrawString2D);
        RenderMessage.addColor(this.builder, colorFlat);
        RenderMessage.addStart(this.builder, flat.Vector3.createVector3(this.builder, x, y, 0));
        RenderMessage.addScaleX(this.builder, scaleX);
        RenderMessage.addScaleY(this.builder, scaleY);
        RenderMessage.addText(this.builder, textFlat);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.drawString3D = function (vector, scaleX, scaleY, text, color) {
        var _a;
        if (this.builder == null)
            return;
        var textFlat = this.builder.createString(text);
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, RenderType.DrawString3D);
        RenderMessage.addColor(this.builder, colorFlat);
        RenderMessage.addStart(this.builder, (_a = vector.convertToFlat(this.builder)) !== null && _a !== void 0 ? _a : 0);
        RenderMessage.addScaleX(this.builder, scaleX);
        RenderMessage.addScaleY(this.builder, scaleY);
        RenderMessage.addText(this.builder, textFlat);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.drawLine2D_3D = function (x, y, end, color) {
        var _a;
        if (this.builder == null)
            return;
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, RenderType.DrawLine2D_3D);
        RenderMessage.addStart(this.builder, flat.Vector3.createVector3(this.builder, x, y, 0));
        RenderMessage.addEnd(this.builder, (_a = end.convertToFlat(this.builder)) !== null && _a !== void 0 ? _a : 0);
        RenderMessage.addColor(this.builder, colorFlat !== null && colorFlat !== void 0 ? colorFlat : 0);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.drawLine3D = function (start, end, color) {
        var _a, _b;
        if (this.builder == null)
            return;
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, RenderType.DrawLine3D);
        RenderMessage.addStart(this.builder, (_a = start.convertToFlat(this.builder)) !== null && _a !== void 0 ? _a : 0);
        RenderMessage.addEnd(this.builder, (_b = end.convertToFlat(this.builder)) !== null && _b !== void 0 ? _b : 0);
        RenderMessage.addColor(this.builder, colorFlat);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.drawRect2D = function (x, y, width, height, filled, color) {
        if (this.builder == null)
            return;
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, RenderType.DrawRect2D);
        RenderMessage.addStart(this.builder, flat.Vector3.createVector3(this.builder, x, y, 0));
        RenderMessage.addScaleX(this.builder, width);
        RenderMessage.addScaleY(this.builder, height);
        RenderMessage.addIsFilled(this.builder, filled);
        RenderMessage.addColor(this.builder, colorFlat);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.drawRect3D = function (vector, width, height, filled, color, centered) {
        var _a;
        if (this.builder == null)
            return;
        var colorFlat = color.convertToFlat(this.builder);
        RenderMessage.startRenderMessage(this.builder);
        RenderMessage.addRenderType(this.builder, centered ? RenderType.DrawCenteredRect3D : RenderType.DrawRect3D);
        RenderMessage.addStart(this.builder, (_a = vector.convertToFlat(this.builder)) !== null && _a !== void 0 ? _a : 0);
        RenderMessage.addScaleX(this.builder, width);
        RenderMessage.addScaleY(this.builder, height);
        RenderMessage.addIsFilled(this.builder, filled);
        RenderMessage.addColor(this.builder, colorFlat);
        this.renderList.push(RenderMessage.endRenderMessage(this.builder));
    };
    RenderManager.prototype.black = function () {
        return new this.Color(255, 0, 0, 0);
    };
    RenderManager.prototype.white = function () {
        return new this.Color(255, 255, 255, 255);
    };
    RenderManager.prototype.gray = function () {
        return new this.Color(255, 128, 128, 128);
    };
    RenderManager.prototype.blue = function () {
        return new this.Color(255, 0, 0, 255);
    };
    RenderManager.prototype.red = function () {
        return new this.Color(255, 255, 0, 0);
    };
    RenderManager.prototype.green = function () {
        return new this.Color(255, 0, 128, 0);
    };
    RenderManager.prototype.lime = function () {
        return new this.Color(255, 0, 255, 0);
    };
    RenderManager.prototype.yellow = function () {
        return new this.Color(255, 255, 255, 0);
    };
    RenderManager.prototype.orange = function () {
        return new this.Color(255, 225, 128, 0);
    };
    RenderManager.prototype.cyan = function () {
        return new this.Color(255, 0, 255, 255);
    };
    RenderManager.prototype.pink = function () {
        return new this.Color(255, 255, 0, 255);
    };
    RenderManager.prototype.purple = function () {
        return new this.Color(255, 128, 0, 128);
    };
    RenderManager.prototype.teal = function () {
        return new this.Color(255, 0, 128, 128);
    };
    return RenderManager;
}());
exports.RenderManager = RenderManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVuZGVyTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9SZW5kZXJNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwySkFBMko7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFM0osa0RBQTRCO0FBQzVCLDJDQUEwQztBQUUxQyw2Q0FBaUM7QUFDakMsMERBQStDO0FBRS9DLElBQU0sSUFBSSxHQUFHLHVCQUFLLENBQUMsSUFBSSxDQUFDO0FBQ2hCLElBQUEsYUFBYSxHQUE4QixJQUFJLGNBQWxDLEVBQUUsVUFBVSxHQUFrQixJQUFJLFdBQXRCLEVBQUUsV0FBVyxHQUFLLElBQUksWUFBVCxDQUFVO0FBQ3hELElBQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQztBQUNqQyxJQUFNLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFFcEI7SUFLRSxlQUFZLEtBQWEsRUFBRSxHQUFXLEVBQUUsS0FBYSxFQUFFLElBQVk7UUFDakUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNuQixDQUFDO0lBQ0QsNkJBQWEsR0FBYixVQUFjLE9BQTRCO1FBQ3hDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JD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LE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCw0QkFBSSxHQUFKO1FBQ0UsT0FBTyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELDhCQUFNLEdBQU47UUFDRSxPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsNEJBQUksR0FBSjtRQUNFLE9BQU8sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUE1TkQsSUE0TkM7QUFFUSxzQ0FBYSJ9