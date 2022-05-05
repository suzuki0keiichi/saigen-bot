import { App } from "@slack/bolt";
import { config } from "dotenv";
import { parseCommand } from "./parse";

const env = config().parsed;

const app = new App({
    token: env?.SLACK_BOT_TOKEN,
    signingSecret: env?.SLACK_SIGNING_SECRET,
    // logLevel: LogLevel.DEBUG,
})

async function start() {
    const port: number = parseInt(env?.PORT || "3000");

    await app.start(port);

    // app.event("app_mention", async (context) => {
    //     console.log(context.event);
    // });

    // app.message(async (context) => {
    //     console.log(context);
    // });

    app.command("/saigen", async (context) => {
        console.log(context.command);

        await context.ack();

        let range = parseCommand(context.command.text);
        if (range) {
            app.client.conversations.history({
                channel: range[0],
                oldest: range[1].toString(),
                latest: range[2].toString(),
                inclusive: true,
            }).then((res) => {
                if (res.messages) {
                    for (let i = 0; i < res.messages.length; i++) {
                        if (res.messages[i].ts) {
                            console.log(
                                res.messages[i].user + " : " +
                                (new Date(Number(res.messages[i].ts) * 1000)).toLocaleString("ja-JP") + " " +
                                res.messages[i].text);
                        }
                    }
                }
            }).catch((error) => {
                console.log("error");
                console.log(error);
            });
        }
    });
};

start();
