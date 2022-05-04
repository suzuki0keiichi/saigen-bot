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
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const dotenv_1 = require("dotenv");
const env = (0, dotenv_1.config)().parsed;
const app = new bolt_1.App({
    token: env === null || env === void 0 ? void 0 : env.SLACK_BOT_TOKEN,
    signingSecret: env === null || env === void 0 ? void 0 : env.SLACK_SIGNING_SECRET,
    logLevel: bolt_1.LogLevel.DEBUG,
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        const port = parseInt((env === null || env === void 0 ? void 0 : env.PORT) || "3000");
        yield app.start(port);
        // app.event("app_mention", async (context) => {
        //     console.log(context.event);
        // });
        // app.message(async (context) => {
        //     console.log(context);
        // });
        app.command("/saigen", (context) => __awaiter(this, void 0, void 0, function* () {
            console.log(context.command);
            yield context.ack();
            app.client.conversations.history({
                // channel: context.command.channel_id
                channel: "C03E39VJTEG"
            }).then((res) => {
                console.log("success");
                console.log(res.messages);
            }).catch((error) => {
                console.log("error");
                console.log(error);
            });
        }));
    });
}
;
start();
