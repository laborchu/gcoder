'use strict';
var Table = require('./models/table.model');
var Dialect = module.exports = function(){
};
Dialect.prototype.getTables = function(){
};
Dialect.extend = require('class-extend').extend;

Dialect.create = function(config){
    if(config.db.dialect=="mysql"){
        var Mysql = require('./mysql');
        return new Mysql(config);
    }
    return null;
}