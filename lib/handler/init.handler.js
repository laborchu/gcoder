'use strict';
var Handler = require('./handler');
let fs = require('fs');
let path = require('path');
var Logger = require('../logger');
var ncp = require('ncp').ncp;
let copyFile = function (src, dist) {
    if (!fs.existsSync(dist)) {
        var sourceFile = path.join(src);
        var readStream = fs.createReadStream(sourceFile);
        var writeStream = fs.createWriteStream(dist, { mode: 0o777 });
        readStream.pipe(writeStream);
    }
};

var InitHandler = module.exports = Handler.extend({
    constructor: function (op) {
        this.op = op;
    }
});

InitHandler.prototype.do = function () {
    InitHandler.__super__.do();
    if(this.op=="json"){
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
    }else if(this.op=="coder"){
        let gcoderPath = path.join(require('os').homedir(), ".gcoder");
        let targetPath = path.join(__dirname, "../../.gcoder");
        if (fs.existsSync(gcoderPath)) {
            ncp(gcoderPath, targetPath, function (err) {
            });
        }
    }
    

};
