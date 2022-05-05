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
                    saigen(
                        Date.now() - toJsTs(res.messages[res.messages.length - 1]),
                        context.command.channel_id,
                        rate,
                        res.messages);
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

/***
 * @param diffTs 最初の発言と現在のタイムスタンプの差 ミリ秒
 */
function saigen(diffTs: number, channelId: string, rate: number, messages: Message[]) {
    let msg = messages.pop();
    if (msg == undefined) {
        return;
    }

    setTimeout((diffTs: number, channelId: string, message: Message, remainingMessages: Message[]) => {
        app.client.chat.postMessage({
            channel: channelId,
            text: message.text,
            username: message.user
        });

        saigen(diffTs, channelId, rate, remainingMessages);
    },
        Math.max(0, toJsTs(msg) + diffTs - Date.now() / rate),
        diffTs, channelId, msg, messages);
};

start();
