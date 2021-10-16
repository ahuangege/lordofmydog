

export function httpReq(info: { "method"?: "GET" | "POST", "url": string, "msg"?: any }, cb?: (err: any, data: any) => void) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
            let data;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (err) {
                cb && cb("wrong json", null);
                return;
            }
            cb && cb(null, data)
        }
    }
    xhr.open(info.method || "POST", info.url, true);
    xhr.send(JSON.stringify(info.msg || null));
    xhr.addEventListener("error", (err) => {
        cb && cb(err, null);
    });
}