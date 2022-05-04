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

let hourPattern = /^\d{1,2}$/;
let hourMinutePattern = /^(\d{1,2}):(\d{2})$/;
let dayPattern = /^\d{1,2}$/;
let monthDayPattern = /^(\d{1,2})\/(\d{1,2})$/;
let yearMonthDayPattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

function parse(text: string): string | undefined {
    let now = new Date();

    console.log(text);

    let texts = text.split(/ +/);
    switch (texts.length) {
        case 1:
            return "" + parseDay(now, "") + "T" +
                parseHour(now, texts[0]) + "+0900";

        case 2:
            return "" + parseDay(now, texts[0]) + "T" +
                parseHour(now, texts[1]) + "+0900";

        case 0:
        default:
            console.log("okashii");
            return undefined;
    }
}

function parseHour(now: Date, text: string): string | undefined {
    let found = hourPattern.exec(text);
    if (found) {
        return align2(found[0]) + "0000";
    }

    found = hourMinutePattern.exec(text);
    if (found) {
        return align2(found[1]) + align2(found[2]) + "00";
    }

    return align2(now.getHours()) + align2(now.getMinutes()) + "00";
}

function parseDay(now: Date, text: string): string | undefined {
    let found = dayPattern.exec(text)
    if (found) {
        return "" + now.getFullYear() + align2(now.getMonth() + 1) + align2(found[0]);
    }

    found = monthDayPattern.exec(text);
    if (found) {
        return "" + now.getFullYear() + align2(found[1]) + align2(found[2]);
    }

    found = yearMonthDayPattern.exec(text);
    if (found) {
        return align2(found[1]) + align2(found[2]) + align2(found[3]);
    } else {
        return "" + now.getFullYear() + align2(now.getMonth() + 1) + align2(now.getDate());
    }
}

/**
 * 桁を合わせる
 * 小さいのを大きくする事しかしません
 * 既存の関数で無いのか調べてません
 * めんどいので2桁しか対応しませんし、""には対応しません
 */
function align2(num: number | string): string {
    if (typeof num === "number") {
        if (num < 10) {
            return "0" + num;
        }

        return "" + num;
    } else {
        if (num.length < 2) {
            return "0" + num;
        }

        return num;
    }
}

// console.log(parse("10"));
// console.log(parse("10:30"));
// console.log(parse("1:10"));
// console.log(parse("24 01:10"));
// console.log(parse("4 01:10"));
// console.log(parse("3/4 01:10"));
// console.log(parse("12/4 01:10"));
// console.log(parse("2020/3/4 01:10"));
// console.log(parse("1999/4/30 01:10"));

// Date.parse("");
// 20220419T140001+0900
