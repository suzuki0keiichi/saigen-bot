import { App, SlackCommandMiddlewareArgs } from "@slack/bolt";
import { config } from "dotenv";
import { parseCommand } from "./parse";
import { execute } from "./saigen";

const env = config().parsed;

export const app = new App({
    token: env?.SLACK_BOT_TOKEN,
    signingSecret: env?.SLACK_SIGNING_SECRET,
    // logLevel: LogLevel.DEBUG,
})

async function start() {
    const port: number = parseInt(env?.PORT || "3000");

    await app.start(port);

    app.event("app_mention", async (context) => {
        console.log("mention");
        console.log(context.event);

        let regex = /^(<@[a-zA-Z0-9]+>)\s*(.*)$/;
        let match = regex.exec(context.event.text);
        if (!match) {
            return;
        }

        let command = parseCommand(match[2]);
        if (!command) {
            return;
        }

        execute(command);
    });

    // app.message(async (context) => {
    //     console.log("any message");
    //     console.log(context);
    // });

    app.command("/saigen", async (context) => {
        console.log(context.command);

        await context.ack();

        let command = parseCommand(context.command.text);
        if (!command) {
            return;
        }

        execute(command);
    });
};

start();