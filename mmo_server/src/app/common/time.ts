import { timeFormat } from "../util/util";

let date = new Date();
let _nowMs = date.getTime();
let _nowSec = Math.floor(_nowMs / 1000);
let _nowStr = timeFormat(new Date());

setInterval(() => {
    date = new Date();
    _nowMs = date.getTime();
    _nowSec = Math.floor(_nowMs / 1000);
    _nowStr = timeFormat(date);
}, 100);

/**
 * 当前时间戳， 毫秒
 */
export function nowMs() {
    return _nowMs;
}

/**
 * 当前时间戳， 秒
 */
export function nowSec() {
    return _nowSec;
}

/**
 * 当前时间戳， 字符串
 */
export function nowStr() {
    return _nowStr;
}