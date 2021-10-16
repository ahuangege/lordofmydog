import * as xlsx from "node-xlsx";
import * as fs from "fs";
import * as path from "path";
interface I_config {
    "input": string,
    "output_server": string;
    "output_client": string;
}
console.log("\n");

let config: I_config = require("./config.json");
let inputfiles: string[] = fs.readdirSync(config.input);

inputfiles.forEach((filename) => {
    if (filename[0] === "~") {
        return;
    }
    if (!filename.endsWith(".xlsx")) {
        return;
    }
    let intputfilepath = path.join(config.input, filename);
    let buff = fs.readFileSync(intputfilepath);
    parseBuffToJson(buff, config.output_server, config.output_client, path.basename(filename, '.xlsx'));
    console.log("---->>>", filename);
});


console.log("\n");


function parseBuffToJson(buff: Buffer, outputDir: string, outputClientDir: string, filename: string) {
    let sheets = xlsx.parse(buff, { "raw": false });
    let lists: any = sheets[0].data;
    if (lists.length <= 3) {
        return;
    }
    let keyarr = lists[1];
    let typearr: string[] = lists[2];
    for (let i = 0; i < typearr.length; i++) {
        typearr[i] = typearr[i].trim().toLowerCase();
    }
    let csArr: string[] = lists[3];
    for (let i = 0; i < csArr.length; i++) {
        csArr[i] = csArr[i].trim().toLowerCase();
    }

    let objS: any = {};
    let objC: any = {};
    for (let i = 4; i < lists.length; i++) {
        let indexId = lists[i][0];
        if (indexId === undefined) {
            continue;
        }
        let s_obj = createObj(indexId, keyarr, typearr, csArr, lists[i], true);
        objS[indexId] = s_obj;

        let c_obj = createObj(indexId, keyarr, typearr, csArr, lists[i], false);
        objC[indexId] = c_obj;
    }
    let spaceNum = 4;
    fs.writeFileSync(path.join(outputDir, filename + ".json"), JSON.stringify(objS, null, spaceNum));
    fs.writeFileSync(path.join(outputClientDir, filename + ".json"), JSON.stringify(objC, null, spaceNum));
}
function createObj(indexId: number, keyarr: string[], typearr: string[], csArr: string[], dataarr: any[], isSvr: boolean) {
    let obj: any = {};
    for (let i = 0; i < keyarr.length; i++) {
        let can = true;
        if (isSvr) {
            can = csArr[i] === "cs" || csArr[i] === "s";
        } else {
            can = csArr[i] === "cs" || csArr[i] === "c";
        }
        if (can) {
            obj[keyarr[i]] = changeValue(indexId, keyarr[i], dataarr[i], typearr[i].trim());
        }
    }
    return obj;
}

function changeValue(indexId: number, key: string, value: string, type: string) {
    if (value === undefined) {
        value = "";
    }
    if (type === "bool") {
        value = value.trim().toLowerCase();
        if (value === "0" || value == "" || value === "false") {
            return false;
        } else {
            return true;
        }
    } else if (type === "string") {
        return value;
    } else if (type === "float" || type === "number") {
        return Number(value) || 0;
    } else if (type === "int") {
        return Math.floor(Number(value) || 0);
    } else if (type === "json") {
        let data: any
        try {
            data = JSON.parse(value.trim());
        } catch (e) {
            throw Error("not json:" + indexId + "," + key);
        }
        return data;
    } else {
        return value;
    }
}
