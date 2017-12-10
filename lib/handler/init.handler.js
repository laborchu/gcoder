'use strict';
var Handler = require('./handler');
let fs = require('fs');
let path = require('path');
var Logger = require('../logger');

let projectStruct = {
    "src": {
        "handler": true,
        "uc": true
    },
    "plugins": {
        "path": true,
        "checker": true
    },
    "test": true
};

let createFolder = function (parentFolder, folderObject) {
    for (let key of Object.keys(folderObject)) {
        let curPath = path.join(parentFolder, key);
        Logger.info('create folder ' + curPath.replace(process.cwd(), ""));
        fs.mkdirSync(curPath);
        if (typeof folderObject[key] === 'object') {
            createFolder(curPath, folderObject[key]);
        }
    }
};

let copyFile = function (src, dist) {
    if (!fs.existsSync(dist)) {
        var sourceFile = path.join(src);
        var readStream = fs.createReadStream(sourceFile);
        var writeStream = fs.createWriteStream(dist, { mode: 0o777 });
        readStream.pipe(writeStream);
    }
};

var InitHandler = module.exports = Handler.extend({
    constructor: function (platform) {
        this.platform = platform;
    }
});

InitHandler.prototype.do = function () {
    InitHandler.__super__.do();
    let rootFolder = process.cwd();
    let gcodeJson = path.join(rootFolder, ".gcoder.json");
    if (fs.existsSync(gcodeJson)) {
        Logger.info(".gcoder.json has exsits");
        return;
    }
    //复制模板
    let tplGcodeJson = path.join(__dirname, "../../", "tpl", ".gcoder.tpl.json");
    copyFile(tplGcodeJson, gcodeJson);
    Logger.success(`create .gcoder.json`);

};
