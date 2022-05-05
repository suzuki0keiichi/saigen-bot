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

export function parseCommand(text: string): [string, number, number] | undefined {
    let texts = text.split(/ +/);
    if (texts.length < 2) {
        return;
    }

    let now = new Date();

    switch (texts.length) {
        case 2: // 1個しかない場合は指定時刻～現在
            return [
                texts[0],
                Date.parse("" + parseDay(now, "") + "T" + parseHour(now, texts[1]) + "+0900") / 1000,
                Date.now() / 1000];

        case 3: // 2個の場合は当日の指定時刻1～指定時刻2
            return [
                texts[0],
                Date.parse(parseDay(now, "") + "T" + parseHour(now, texts[1]) + "+0900") / 1000,
                Date.parse(parseDay(now, "") + "T" + parseHour(now, texts[2]) + "+0900") / 1000];

        case 4: // 3個の場合は指定日の指定時刻1～指定時刻2
            return [
                texts[0],
                Date.parse(parseDay(now, texts[1]) + "T" + parseHour(now, texts[2]) + "+0900") / 1000,
                Date.parse(parseDay(now, texts[1]) + "T" + parseHour(now, texts[3]) + "+0900") / 1000];

        case 5: // 4個の場合は指定日1の指定時刻1～指定日2の指定時刻2
            return [
                texts[0],
                Date.parse(parseDay(now, texts[1]) + "T" + parseHour(now, texts[2]) + "+0900") / 1000,
                Date.parse(parseDay(now, texts[3]) + "T" + parseHour(now, texts[4]) + "+0900") / 1000];
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
// console.log(Date.parse("2022-05-05T10:00:00+09:00"));
// console.log((new Date(1651649258.866469 * 1000).toLocaleString("ja-JP")));
// console.log(Date.now());
