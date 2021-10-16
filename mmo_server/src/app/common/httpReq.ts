import * as http from "http";
import * as https from "https";
import * as querystring from "querystring";

export interface I_httpRequestOptions {
    https?: boolean,
    url: string,
    method: "GET" | "POST",
    urlParam?: { [key: string]: any },
    postData?: string | Buffer,
    headers?: { [key: string]: any },
    timeout?: number,
}

export function httpRequest(options: I_httpRequestOptions, cb?: (err: Error | null, data: string) => void) {
    if (options.urlParam) {
        options.url += "?" + querystring.stringify(options.urlParam);
    }
    let httpCon = options.https ? https : http;
    let req = httpCon.request(options.url, { "method": options.method, }, (res) => {
        let msg = "";
        res.on('data', (chunk) => {
            msg += chunk;
        });
        res.on('end', () => {
            cb && cb(null, msg);
        });
    });
    if (options.headers) {
        for (let x in options.headers) {
            req.setHeader(x, options.headers[x]);
        }
    }
    if (options.timeout) {
        req.setTimeout(options.timeout);
    }

    req.on('error', (e) => {
        console.log(e);
        cb && cb(e, "");
    });
    req.on("timeout", () => {
        req.destroy(new Error("timeout"));
    });

    if (options.postData) {
        req.write(options.postData);
    }
    req.end();
}
