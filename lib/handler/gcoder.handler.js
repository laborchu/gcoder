'use strict';
let path = require('path');
let fs = require('fs');
let chalk = require('chalk');
let _ = require('lodash');
const git = require('simple-git/promise');
var ncp = require('ncp').ncp;

let Handler = require('./handler');
let Logger = require('../logger');
let Utils = require('../utils');

let GCoderHandler = module.exports = Handler.extend({
	constructor: function (options) {
		this.options = options;
	}
});
GCoderHandler.prototype.do = function () {
	if(this.options.op=="add"){
		if(this.options.url.startsWith("https://")){
			let name = this.options.url.substring(this.options.url.lastIndexOf("/")+1,this.options.url.lastIndexOf("."))			
			let homeGcoderPath = path.join(require('os').homedir(), ".gcoder",name);
			let gcodePath = path.join(__dirname, "../../.gcoder");
			if(!fs.existsSync(gcodePath)){
				Utils.createFolder(gcodePath);
			}
			if (fs.existsSync(homeGcoderPath)) {
				git(homeGcoderPath).silent(true)
				.pull()
				.then(() => {
					ncp(homeGcoderPath, path.join(gcodePath,name), function (err) {
						if(err){
							Logger.error(err);
						}
					});
					Logger.success(`update gcoder ${name}`);
				})
				.catch((err) => {
					Logger.error(err);
				});
			}else{
				git().silent(true)
				.clone(this.options.url,homeGcoderPath)
				.then(() => {
					ncp(homeGcoderPath, path.join(gcodePath,name), function (err) {
						if(err){
							Logger.error(err);
						}
					});
					Logger.success(`add gcoder ${name}`);					
				})
				.catch((err) => {
					Logger.error(err);
				});
			}
			
		}
		
	}else if(this.options.op=="list"){
		let gcoderPath = path.join(__dirname, "../../.gcoder");
		if (fs.existsSync(gcoderPath)) {
			fs.readdirSync(gcoderPath).forEach((gcoder) => {
				if(gcoder!="dist"){
					console.log(chalk.green(gcoder));				
				}
			});
		}else{
			console.log(chalk.green("gcode is empty"));
		}
		
	}
};
