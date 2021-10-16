"use strict";
exports.__esModule = true;
var xlsx = require("node-xlsx");
var fs = require("fs");
var path = require("path");
console.log("\n");
var config = require("./config.json");
var inputfiles = fs.readdirSync(config.input);
inputfiles.forEach(function (filename) {
    if (filename[0] === "~") {
        return;
    }
    if (!filename.endsWith(".xlsx")) {
        return;
    }
    var intputfilepath = path.join(config.input, filename);
    var buff = fs.readFileSync(intputfilepath);
    parseBuffToJson(buff, config.output_server, config.output_client, path.basename(filename, '.xlsx'));
    console.log("---->>>", filename);
});
console.log("\n");
function parseBuffToJson(buff, outputDir, outputClientDir, filename) {
    var sheets = xlsx.parse(buff, { "raw": false });
    var lists = sheets[0].data;
    if (lists.length <= 3) {
        return;
    }
    var keyarr = lists[1];
    var typearr = lists[2];
    for (var i = 0; i < typearr.length; i++) {
        typearr[i] = typearr[i].trim().toLowerCase();
    }
    var csArr = lists[3];
    for (var i = 0; i < csArr.length; i++) {
        csArr[i] = csArr[i].trim().toLowerCase();
    }
    var objS = {};
    var objC = {};
    for (var i = 4; i < lists.length; i++) {
        var indexId = lists[i][0];
        if (indexId === undefined) {
            continue;
        }
        var s_obj = createObj(indexId, keyarr, typearr, csArr, lists[i], true);
        objS[indexId] = s_obj;
        var c_obj = createObj(indexId, keyarr, typearr, csArr, lists[i], false);
        objC[indexId] = c_obj;
    }
    var spaceNum = 4;
    fs.writeFileSync(path.join(outputDir, filename + ".json"), JSON.stringify(objS, null, spaceNum));
    fs.writeFileSync(path.join(outputClientDir, filename + ".json"), JSON.stringify(objC, null, spaceNum));
}
function createObj(indexId, keyarr, typearr, csArr, dataarr, isSvr) {
    var obj = {};
    for (var i = 0; i < keyarr.length; i++) {
        var can = true;
        if (isSvr) {
            can = csArr[i] === "cs" || csArr[i] === "s";
        }
        else {
            can = csArr[i] === "cs" || csArr[i] === "c";
        }
        if (can) {
            obj[keyarr[i]] = changeValue(indexId, keyarr[i], dataarr[i], typearr[i].trim());
        }
    }
    return obj;
}
function changeValue(indexId, key, value, type) {
    if (value === undefined) {
        value = "";
    }
    if (type === "bool") {
        value = value.trim().toLowerCase();
        if (value === "0" || value == "" || value === "false") {
            return false;
        }
        else {
            return true;
        }
    }
    else if (type === "string") {
        return value;
    }
    else if (type === "float" || type === "number") {
        return Number(value) || 0;
    }
    else if (type === "int") {
        return Math.floor(Number(value) || 0);
    }
    else if (type === "json") {
        var data = void 0;
        try {
            data = JSON.parse(value.trim());
        }
        catch (e) {
            throw Error("not json:" + indexId + "," + key);
        }
        return data;
    }
    else {
        return value;
    }
}
