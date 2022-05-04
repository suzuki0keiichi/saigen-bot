import { App, LogLevel } from "@slack/bolt";
import { config } from "dotenv";

const env = config().parsed;

const app = new App({
    token: env?.SLACK_BOT_TOKEN,
    signingSecret: env?.SLACK_SIGNING_SECRET,
    logLevel: LogLevel.DEBUG,
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

        app.client.conversations.history({
            channel: context.command.channel_id
        }).then((res) => {
            console.log("success");
            console.log(res.messages);
        }).catch((error) => {
            console.log("error");
            console.log(error);
        });
    });
};

start();