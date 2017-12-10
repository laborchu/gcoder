'use strict';
var Dialect = require('./dialect');
var mysql = require('mysql');
var Logger = require('../logger');
var Field = require('./models/field.model');
var Table = require('./models/table.model');

var MysqlDialect = module.exports = Dialect.extend({
    constructor: function (config,options) {
        this.config = config;
        this.options = options;
        this.connection = mysql.createConnection({
            host: this.config.db.host,
            port: this.config.db.port,
            user: this.config.db.username,
            password: this.config.db.password,
            database: this.config.db.database
        });
        this.connection.connect();
    }
});
MysqlDialect.prototype.descTables= function (tableName) {
    let self = this;
    return new Promise(function(resolve,reject){
        self.connection.query(`show full columns from ${tableName};`, function (error, results, fields) {
            if (error) throw error;
            let table = new Table();
            table.tableName = tableName;
            results.forEach(function(dbField){
                let field = new Field();
                field.default = dbField.Default;
                field.fieldName = dbField.Field;
                if(dbField.Key=="PRI"){
                    field.isPrimaryKey = true;
                }
                if(dbField.Null=="NO"){
                    field.canNull = false;
                }
                field.comment = dbField.Comment;
                field.fieldType = dbField.Type.replace(/\(\d*\)/,"");
                table.fieldArray.push(field);
            })
            resolve(table);
        });
    })
}
MysqlDialect.prototype.getTables = function () {
    MysqlDialect.__super__.getTables();
    let self = this;
    return new Promise((resolve,reject)=>{
        if(this.options.tables){
            let tablePromiseArray = [];
            let tableNameArray = this.options.tables.split(",");
            tableNameArray.forEach(function(tableName,index){
                tablePromiseArray.push(self.descTables(tableName));
            });
            Logger.info(`get tables : ${tableNameArray.join(",")}`);
            Promise.all(tablePromiseArray).then(function(tableArray){
                self.connection.end();
                resolve(tableArray);
            });
        }else{
            self.connection.query('show tables;', function (error, results, fields) {
                if (error) throw error;
                let tablePromiseArray = [];
                let tableNameArray = [];
                results.forEach(function(data,index){
                    let tableName = data[`Tables_in_${self.config.db.database}`];
                    tableNameArray.push(tableName);
                    tablePromiseArray.push(self.descTables(tableName));
                });
                Logger.info(`get tables : ${tableNameArray.join(",")}`);
                Promise.all(tablePromiseArray).then(function(tableArray){
                    self.connection.end();
                    resolve(tableArray);
                });
                
            });
        }
       
    })
};