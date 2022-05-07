import { SlackCommandMiddlewareArgs } from "@slack/bolt";
import { Message } from "@slack/web-api/dist/response/ConversationsHistoryResponse";
import { app } from "./app";
import { SaigenCommand } from "./parse";

export function execute(command: SaigenCommand) {
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
                channelId: command.channelId,
                rate,
                firstTs,
                interval,
                usersCache: new Map<string, User>(),
            }, res.messages, 0);
        }
    }).catch((error) => {
        console.error(error);
    });
}

export function toJsTs(message: Message): number {
    return Number(message.ts) * 1000;
}

export interface User {
    name: string;
    iconUrl?: string;
}

interface SaigenContext {
    firstTs: number;
    requestTs: number;
    channelId: string;
    rate: number; // 何倍速で再現するか
    interval?: number; // 何秒間隔で発言させるか(倍速設定や過去の発言タイミングは無視される)
    usersCache: Map<string, User>;
}

export function saigen(context: SaigenContext, messages: Message[], count: number) {
    let msg = messages.pop();
    if (!msg) {
        return;
    }

    let messageTs = toJsTs(msg);

    let call = () => {
        let diffTs = Math.max(0, (messageTs - context.firstTs) / context.rate);

        if (context.interval) {
            diffTs = context.interval * 1000 * count;
        }

        let delay: number = Math.max(0, context.requestTs + diffTs - Date.now());

        setTimeout((context: SaigenContext, message: Message, remainingMessages: Message[]) => {
            let username: string | undefined = message.user;
            let icon_url: string | undefined = undefined;

            if (message.user) {
                let user = context.usersCache.get(message.user);
                if (user) {
                    username = user?.name;
                    icon_url = user?.iconUrl;
                }
            }

            app.client.chat.postMessage({
                channel: context.channelId,
                text: message.text,
                username: username,
                icon_url: icon_url,
            });

            saigen(context, remainingMessages, count + 1);
        },
            delay,
            context, msg, messages);
    };

    if (!msg.user || context.usersCache.has(msg.user)) {
        call();
    } else {
        let userId = msg.user;

        app.client.users.info({
            user: userId,
        }).then((res) => {
            if (res.user && res.user.name && res.user.profile && res.user.profile.image_48) {
                context.usersCache.set(userId,
                    { name: res.user.name, iconUrl: res.user.profile.image_48 });
            }
        }).catch((error) => {
            console.error(error);
        }).finally(() => {
            call();
        });
    }
}
