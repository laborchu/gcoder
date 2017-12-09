'use strict';
var Plugin = require('./plugin');

let getCamelCase = function(name,splitChat){
    let lowerCamelCase = "";
    let upperCamelCase = "";
    name.split(splitChat).forEach((item,index)=>{
        if(index==0){
            lowerCamelCase+=item.charAt(0).toLowerCase() + item.slice(1);
        }else{
            lowerCamelCase+=item.charAt(0).toUpperCase() + item.slice(1);                
        }
        upperCamelCase+=item.charAt(0).toUpperCase() + item.slice(1); 
    })
    return [lowerCamelCase,upperCamelCase];
}

var RenamePlugin = module.exports = Plugin.extend({
    constructor: function () {
    }
});

RenamePlugin.prototype.do = function (tables,config) {
    RenamePlugin.__super__.do();
    let splitChat = config.splitChat || "_";
    for(let table of tables){
        [table.lowerCamelName,table.upperCamelName] = getCamelCase(table.tableName,splitChat);
        table.hyphenTableName = table.tableName.replace(new RegExp(splitChat, 'g'),"-");
        table.upperTableName = table.tableName.toUpperCase();
        for(let field of table.fieldArray){
            [field.lowerCamelName,field.upperCamelName] = getCamelCase(field.fieldName,splitChat);
        }
    }
};
