'use strict';
let fs = require('fs');
let mkdirp = require('mkdirp');

module.exports = {
	createFolder(folder){
        if (!fs.existsSync(folder)) {
            var oldmask = process.umask(0);
            mkdirp.sync(folder);
            process.umask(oldmask);
        } 
    }
};