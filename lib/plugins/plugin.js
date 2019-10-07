'use strict';
let fs = require('fs');
let path = require('path');
let _ = require('lodash');
let Utils = require('../utils');

var Plugin = module.exports = function(){

};
Plugin.prototype.do = function(tables){
};

Plugin.prototype.createFolder = function(folderPath){
	Utils.createFolder(folderPath);
};

Plugin.prototype.writeFileSync = function(templatePath,distFile,data){
	let content = fs.readFileSync(templatePath, 'utf8');
	var compiled = _.template(content);
	let fileContent = compiled(data);
	fs.writeFileSync(distFile, fileContent);
};

Plugin.extend = require('class-extend').extend;