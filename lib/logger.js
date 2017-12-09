'use strict';
var chalk = require('chalk');

module.exports = {
	error:function(msg){
  		console.log('  ERROR : %s', chalk.red(msg));
	},

	debug:function(msg){
  		console.log('  DEBUG : %s', chalk.gray(msg));
	},

	info:function(msg){
  		console.log('  INFO : %s', chalk.cyan(msg));
	},

	success:function(msg){
  		console.log('  SUCCESS : %s', chalk.green(msg));
	}
};