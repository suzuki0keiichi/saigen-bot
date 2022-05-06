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
            let interval = command.interval;

            app.client.conversations.history({
                channel: command.channelId,
                oldest: command.oldest.toString(),
                latest: command.latest.toString(),
                inclusive: true,
            }).then((res) => {
                if (res.messages && res.messages.length > 0) {
                    let firstTs = toJsTs(res.messages[res.messages.length - 1]);
                    saigen({
                        requestTs: Date.now(),
                        channelId: context.command.channel_id,
                        rate,
                        firstTs,
                        interval,
                    }, res.messages, 0);
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
    rate: number, // 何倍速で再現するか
    interval?: number, // 何秒間隔で発言させるか(倍速設定や過去の発言タイミングは無視される)
}

function saigen(context: SaigenContext, messages: Message[], count: number) {
    let msg = messages.pop();
    if (msg == undefined) {
        return;
    }

    let messageTs = toJsTs(msg);
    let diffTs = Math.max(0, (messageTs - context.firstTs) / context.rate);

    if (context.interval) {
        diffTs = context.interval * 1000 * count;
    }

    let delay: number = Math.max(0, context.requestTs + diffTs - Date.now());

    setTimeout((context: SaigenContext, message: Message, remainingMessages: Message[]) => {
        app.client.chat.postMessage({
            channel: context.channelId,
            text: message.text,
            username: message.user
        });

        saigen(context, remainingMessages, count + 1);
    },
        delay,
        context, msg, messages);
};

start();
