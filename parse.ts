interface SaigenCommand {
    channelId: string,
    oldest: number,
    latest: number,
    rate: number,
}

/**
 * 桁を合わせる
 * 小さいのを大きくする事しかしません
 * 既存の関数で無いのか調べてません
 * めんどいので2桁しか対応しませんし、""には対応しません
 */
export function align2(num: number | string): string {
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

const hourPattern = /^\d{1,2}$/;
const hourMinutePattern = /^(\d{1,2}):(\d{2})$/;

export function parseHour(now: Date, text: string): string | undefined {
    let found = hourPattern.exec(text);
    if (found) {
        return align2(found[0]) + ":00:00";
    }

    found = hourMinutePattern.exec(text);
    if (found) {
        return align2(found[1]) + ":" + align2(found[2]) + ":00";
    }

    return align2(now.getHours()) + ":" + align2(now.getMinutes()) + ":00";
}

const dayPattern = /^\d{1,2}$/;
const monthDayPattern = /^(\d{1,2})\/(\d{1,2})$/;
const yearMonthDayPattern = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;

export function parseDay(now: Date, text: string): string | undefined {
    let found = dayPattern.exec(text);
    if (found) {
        return "" + now.getFullYear() + "-" + align2(now.getMonth() + 1) + "-" + align2(found[0]);
    }

    found = monthDayPattern.exec(text);
    if (found) {
        return "" + now.getFullYear() + "-" + align2(found[1]) + "-" + align2(found[2]);
    }

    found = yearMonthDayPattern.exec(text);
    if (found) {
        return align2(found[1]) + "-" + align2(found[2]) + "-" + align2(found[3]);
    } else {
        return "" + now.getFullYear() + "-" + align2(now.getMonth() + 1) + "-" + align2(now.getDate());
    }
}

export function parseCommand(text: string): SaigenCommand | undefined {
    let texts = text.split(/ +/);

    let now = new Date();
    let channelId = texts.shift();
    let rate: number = 1.0;

    if (channelId == undefined) {
        return;
    }

    if (texts.length > 0 && texts[texts.length - 1].match(/\d+\.?\d*x$/)) {
        rate = Number(texts.pop()?.slice(0, -1));
    }

    switch (texts.length) {
        case 1: // 1個しかない場合は指定時刻～現在
            return {
                channelId,
                oldest: Date.parse("" + parseDay(now, "") + "T" + parseHour(now, texts[0]) + "+0900") / 1000,
                latest: Date.now() / 1000,
                rate,
            };

        case 2: // 2個の場合は当日の指定時刻1～指定時刻2
            return {
                channelId,
                oldest: Date.parse(parseDay(now, "") + "T" + parseHour(now, texts[0]) + "+0900") / 1000,
                latest: Date.parse(parseDay(now, "") + "T" + parseHour(now, texts[1]) + "+0900") / 1000,
                rate,
            };

        case 3: // 3個の場合は指定日の指定時刻1～指定時刻2
            return {
                channelId,
                oldest: Date.parse(parseDay(now, texts[0]) + "T" + parseHour(now, texts[1]) + "+0900") / 1000,
                latest: Date.parse(parseDay(now, texts[0]) + "T" + parseHour(now, texts[2]) + "+0900") / 1000,
                rate,
            };

        case 4: // 4個の場合は指定日1の指定時刻1～指定日2の指定時刻2
            return {
                channelId,
                oldest: Date.parse(parseDay(now, texts[0]) + "T" + parseHour(now, texts[1]) + "+0900") / 1000,
                latest: Date.parse(parseDay(now, texts[2]) + "T" + parseHour(now, texts[3]) + "+0900") / 1000,
                rate,
            };

        default:
            return undefined;
    }
}

// console.log(parseCommand("100 5 3.5x"));
// console.log(parseCommand("100 1999/4/30 01:10 10x"));
