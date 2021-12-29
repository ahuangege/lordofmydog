import * as crypto from "crypto";


export interface Dic<T> {
    [key: string]: T
}


export function size(obj: { [key: string]: any }): number {
    let num = 0;
    for (let x in obj) {
        num++;
    }
    return num;
}

export function timeFormat(_date: any, hasTime = true): string {
    let date: Date = typeof _date === "object" ? _date : new Date(_date);
    let timeStr = "";
    let tmp: number;
    timeStr += date.getFullYear() + "-";
    tmp = date.getMonth() + 1;
    timeStr += (tmp > 9 ? tmp : "0" + tmp) + "-";
    tmp = date.getDate();
    timeStr += (tmp > 9 ? tmp : "0" + tmp);
    if (hasTime) {
        tmp = date.getHours();
        timeStr += " " + (tmp > 9 ? tmp : "0" + tmp) + ":";
        tmp = date.getMinutes();
        timeStr += (tmp > 9 ? tmp : "0" + tmp) + ":";
        tmp = date.getSeconds();
        timeStr += tmp > 9 ? tmp : "0" + tmp;
    }
    return timeStr;
}

export function getDiffDays(lastTime: any, nowTime: any, freshHour: number = 0): number {
    lastTime = new Date(lastTime);
    nowTime = new Date(nowTime);
    let date = nowTime.getDate();
    if (nowTime.getHours() < freshHour) {
        nowTime.setDate(date - 1);
    }
    nowTime.setHours(freshHour, 0, 0, 0);
    if (lastTime.getMinutes() === 0 && lastTime.getSeconds() === 0) {
        lastTime.setMinutes(0, 1);
    }
    let diff = Math.floor((nowTime.getTime() - lastTime.getTime()) / (24 * 3600 * 1000)) + 1;
    return diff;
}


export class Countdown {
    private count: number;
    private callback: Function;
    constructor(count: number, callback: Function) {
        this.count = count;
        this.callback = callback;
        if (count <= 0) {
            process.nextTick(this.callback);
        }
    }

    down() {
        this.count--;
        if (this.count === 0) {
            process.nextTick(this.callback);
        }
    }
}

export function createCountdown(count: number, callback: Function): Countdown {
    return new Countdown(count, callback);
};

/**
 * 判断是否是字符串类型
 * @param x 
 */
export function isString(x: any): x is string {
    return typeof x === "string";
}

/**
 * 判断对象是否为空
 * @param obj 
 */
export function isEmptyObj(obj: Object) {
    for (let x in obj) {
        return false;
    }
    return true;
}

/**
 * 随机获取数组下标
 */
export function randIntNum(num: number) {
    return Math.floor(Math.random() * num);
}

/**
 * 随机数组中的一个元素
 * @param arr 
 */
export function randArrElement<T>(arr: T[]) {
    return arr[randIntNum(arr.length)];
}

export function randBetween(min: number, max: number) {
    return min + randIntNum(max - min + 1);
}

export function removeFromArr<T>(arr: T[], one: T) {
    let index = arr.indexOf(one);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}


export function strdecode(bytes: Buffer) {
    let array: number[] = [];
    let offset = 0;
    let charCode = 0;
    let end = bytes.length;
    while (offset < end) {
        if (bytes[offset] < 128) {
            charCode = bytes[offset];
            offset += 1;
        } else if (bytes[offset] < 224) {
            charCode = ((bytes[offset] & 0x3f) << 6) + (bytes[offset + 1] & 0x3f);
            offset += 2;
        } else if (bytes[offset] < 240) {
            charCode = ((bytes[offset] & 0x0f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
            offset += 3;
        } else {
            charCode = ((bytes[offset] & 0x07) << 18) + ((bytes[offset + 1] & 0x3f) << 12) + ((bytes[offset + 1] & 0x3f) << 6) + (bytes[offset + 2] & 0x3f);
            offset += 4;
        }
        array.push(charCode);
    }
    return String.fromCharCode.apply(null, array);
}


export function strencode(str: string) {
    let codes: number[] = [];
    for (let i = 0, len = str.length; i < len; i++) {
        let charCode = str.charCodeAt(i);
        if (charCode <= 0x7f) {
            codes.push(charCode);
        } else if (charCode <= 0x7ff) {
            codes.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode <= 0xffff) {
            codes.push(0xe0 | (charCode >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
        } else if (charCode <= 0x0010ffff) {
            codes.push(0xf0 | (charCode >> 18), 0x80 | ((charCode & 0x3f000) >> 12), 0x80 | ((charCode & 0xfc0) >> 6), 0x80 | (charCode & 0x3f));
        }
    }
    return Buffer.from(codes);
}



export function ip_str2int(ip: string) {
    if (!ip) {
        return 0;
    }
    let ipInt = 0;
    try {
        let arr = ip.substring(7).split(".");
        ipInt = (parseInt(arr[0]) << 24 |
            parseInt(arr[1]) << 16 |
            parseInt(arr[2]) << 8 |
            parseInt(arr[3])) >>> 0;
    } catch (e) {

    }
    return ipInt;
}

export function ip_int2str(ip: number) {
    return (ip >>> 24) + "." + (ip >> 16 & 0xFF) + "." + (ip >> 8 & 0xFF) + "." + (ip & 0xFF);
}



/**
 * 设置第n位为1或0
 * @param num 
 * @param index 
 * @param is_1 是否置为1
 */
export function setBit(num: number, n: number, is_1 = true) {
    if (is_1) {
        return num | (1 << n);
    } else {
        return num & (~(1 << n));
    }
}
/**
 * 获取第n位
 * @param num 
 * @param n 
 */
export function getBit(num: number, n: number) {
    return (num & (1 << n)) >> n;
}


let charArr: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split("");
export function randStr(len = 8) {
    let str = "";
    for (let i = 0; i < len; i++) {
        str += randArrElement(charArr)
    }
    return str;
}

/**
 * 加密（对称）
 * @param data 
 * @param algorithm 
 * @param key 
 * @param iv 
 * @returns 
 */
export function cipherivEncrypt(data: string, algorithm: string, key: string, iv: string) {
    let cipheriv = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipheriv.update(data, 'utf8', 'hex');
    encrypted += cipheriv.final('hex');
    return encrypted;
}

/**
 * 解密（对称）
 * @param data 
 * @param algorithm 
 * @param key 
 * @param iv 
 * @returns 
 */
export function cipherivDecrypt(data: string, algorithm: string, key: string, iv: string) {
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

/**
 * 加密（不可逆）
 * @param data 
 * @returns 
 */
export function md5(data: string) {
    let cipher = crypto.createHash("md5")
    return cipher.update(data).digest("hex");
}


/**
 * 计算两个坐标之间的距离
 * @param pos1 坐标1
 * @param pos2 坐标2
 */
export function getLen(pos1: { "x": number, "y": number }, pos2: { "x": number, "y": number }) {
    return Math.sqrt(getLen2(pos1, pos2));
}

/**
 * 计算两个坐标之间的距离平方
 * @param pos1 坐标1
 * @param pos2 坐标2
 */
export function getLen2(pos1: { "x": number, "y": number }, pos2: { "x": number, "y": number }) {
    return (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);
}

/**
 * 沿向量移动后的坐标
 * @param start 起始坐标
 * @param end 终点坐标
 * @param moveDis 移动的距离
 * @param length 总长度
 */
export function getLerpPos(start: { "x": number, "y": number }, end: { "x": number, "y": number }, moveDis: number, length?: number) {
    if (!length) {
        length = getLen(start, end);
    }
    var pos = {} as { "x": number, "y": number };

    pos.x = start.x + (end.x - start.x) * (moveDis / length);
    pos.y = start.y + (end.y - start.y) * (moveDis / length);

    return pos;
}