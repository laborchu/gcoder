'use strict';
let path = require('path');
let fs = require('fs');
let chalk = require('chalk');
let _ = require('lodash');
var template = require('es6-template-string');

let Handler = require('./handler');
let Logger = require('./logger');
let Utils = require('./utils');
let Dialect = require('./dialect/dialect');

let GenHandler = module.exports = Handler.extend({
	constructor: function (options) {
		this.options = options;
	}
});
GenHandler.prototype.do = function () {
	GenHandler.__super__.do();

	this.rootFolder = process.cwd();
	let gcodeJson = path.join(this.rootFolder, ".gcoder.json");
	if (!fs.existsSync(gcodeJson)) {
		Logger.error(".gcoder.json not exsits, please exe [init] command");
		return;
	}
	let templatePath = path.join(this.rootFolder, ".gcoder", "template", this.options.template);
	if (!fs.existsSync(templatePath)) {
		Logger.error(`template ${chalk.cyan(this.options.template)} not exsits`);
		return;
	}

	this.gcodeConfig = require(gcodeJson);
	let dialect = Dialect.create(this.gcodeConfig);
	try {
		dialect.getTables().then((tableArray) => {
			if (this.gcodeConfig.plugins) {
				for (let pluginName of this.gcodeConfig.plugins) {
					let Plugin = null;
					try{
						Plugin = require(`./plugins/${pluginName}.plugin`);
					}catch(e){}
					try{
						let pluginPath = path.join(this.rootFolder, ".gcoder", "plugins");
						Plugin = require(`${pluginPath}/${pluginName}.plugin`);
					}catch(e){}
					if(Plugin==null){
						Logger.error(`插件[${pluginName}]不存在`);
						process.exit(1);
					}
					let plugin = new Plugin();
					plugin.do(tableArray, this.gcodeConfig);
				}
			}
			this.tableArray = tableArray;
			this.genTemplate(templatePath,"");
		});
	} catch (e) {
		Logger.error(e.message);
	}
};

GenHandler.prototype.genTemplate = function (folder, relativePath) {
	fs.readdirSync(folder).forEach((file) => {
		let filePath = path.join(folder, file);
		let stat = fs.lstatSync(filePath);
		if (stat.isDirectory()) {
			this.genTemplate(filePath, `${relativePath}/${file}`);
		} else {
			let index = file.search(/\${\w*}/);
			let content = fs.readFileSync(filePath, 'utf8');
			var compiled = _.template(content);
			let distPath = path.join(this.rootFolder, ".gcoder", "dist", relativePath);
			Utils.createFolder(distPath);
			if (index != -1) {//文件名有变量，则每个表生成一个
				this.tableArray.forEach((table) => {
					let fileName = template(file, table);
					let distFile = path.join(distPath, fileName);
					let fileContent = compiled({
						table: table,
						config: this.gcodeConfig
					});
					fs.writeFileSync(distFile,fileContent);
					Logger.success(`生成:${distFile}`);
				})
			} else {//只生成一个
				let distFile = path.join(distPath, file);
				let fileContent = compiled({
					tables: this.tableArray,
					config: this.gcodeConfig
				});
				fs.writeFileSync(distFile,fileContent);				
				Logger.success(`生成:${distFile}`);
			}
		}
	});
}