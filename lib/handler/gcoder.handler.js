'use strict';
let path = require('path');
let fs = require('fs');
let chalk = require('chalk');
let _ = require('lodash');
const git = require('simple-git/promise');

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
			let gcoderPath = path.join(__dirname, "../../.gcoder",name);
			if (fs.existsSync(gcoderPath)) {
				git(gcoderPath).silent(true)
				.pull()
				.then(() => {
					Logger.success(`update gcoder ${name} success`);
				})
				.catch((err) => {
					Logger.error(err);
				});
			}else{
				git().silent(true)
				.clone(this.options.url,gcoderPath)
				.then(() => {
					Logger.success(`add gcoder ${name} success`);
				})
				.catch((err) => {
					Logger.error(err);
				});
			}
			
		}
		
	}else if(this.options.op=="list"){
		let gcoderPath = path.join(__dirname, "../../.gcoder");
		fs.readdirSync(gcoderPath).forEach((gcoder) => {
			if(gcoder!="dist"){
				console.log(chalk.green(gcoder));				
			}
		});
	}
};
