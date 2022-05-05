import { App } from "@slack/bolt";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
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

        let command = parseCommand(context.command.text);
        if (command) {
            let rate = command.rate;

            app.client.conversations.history({
                channel: command.channelId,
                oldest: command.oldest.toString(),
                latest: command.latest.toString(),
                inclusive: true,
            }).then((res) => {
                if (res.messages) {
                    let firstTs = toJsTs(res.messages[res.messages.length - 1]);
                    saigen({
                        requestTs: Date.now(),
                        channelId: context.command.channel_id,
                        rate,
                        firstTs,
                    }, res.messages);
                }
            }).catch((error) => {
                console.log("error");
                console.log(error);
            });
        }
    });
};

function toJsTs(message: Message): number {
    return Number(message.ts) * 1000;
}

interface SaigenContext {
    firstTs: number,
    requestTs: number,
    channelId: string,
    rate: number,
}

/***
 * @param diffTs 最初の発言と現在のタイムスタンプの差 ミリ秒
 */
function saigen(context: SaigenContext, messages: Message[]) {
    let msg = messages.pop();
    if (msg == undefined) {
        return;
    }

    let messageTs = toJsTs(msg);
    let diffTs = Math.max(0, (messageTs - context.firstTs) / context.rate);

    setTimeout((context: SaigenContext, message: Message, remainingMessages: Message[]) => {
        app.client.chat.postMessage({
            channel: context.channelId,
            text: message.text,
            username: message.user
        });

        saigen(context, remainingMessages);
    },
        Math.max(0, context.requestTs + diffTs),
        context, msg, messages);
};

start();
