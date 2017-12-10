# gcoder

gcoder是一款基于数据库结构的可扩展代码生成器。以自定义template和plugin来扩展，两者的合集称为**gcoder**

## 安装

```
$ npm insatll -g gcoder
```

## 如本使用


```
$ gcoder init json #当前目录生成.gcoder.json文件，里面配置数据库，模板和插件信息
$ gcoder add <git-url> #根据gcoder git路径添加gcoder(包含template和plugin)
$ gcoder gen #根据模板在当前目录的.gcoder下产生文件
```

## 命令介绍

### gcoder init json

当前目录生成.gcoder.json文件

```
{
  "gcoder": "使用哪个gcoder",
  "db": {
    "host": "数据库",
    "port": "端口",
    "database": "数据库名称",
    "username": "用户名",
    "password": "密码",
    "dialect": "当前只支持mysql"
  },
  "splitChat": "表名称和字段切分字符，默认_",
  "plugins": [插件列表]
}
```

### gcoder add \<git url\>

根据git地址添加gcoder

### gcoder list

列出当前可用的gcoder

### gcoder gen

根据gcoder生成代码

| 可选参数| 是否必须 | 说明|
| :------| :------ |  :------ | 
| -t | 否 |指定表，只根据这些表产生文件，多表逗号隔开，比如：gcoder gen -t table1,table2|

## 如何创建gcoder

### 1.创建gcoder目录

```bash
gcoder-java
|-plugins  #存放plugins目录
	|- mysql-java-type-map.plugin.js #插件以plugin.js后缀
|-template  #存放模板目录
	|- ${upperCamelName}VO.java #文件名有表达式，每个表都会产生文件
	|- mybatis-config.xml #没有模板则只产生一个
```

### 2.添加 mysql-java-type-map.plugin.js

该插件用于mysql字段类型转java字段类型

```bash
'use strict';
var gcoder = require('gcoder');

var MysqlJavaTypeMapPlugin = module.exports = gcoder.Plugin.extend({
    constructor: function () {
    }
});

MysqlJavaTypeMapPlugin.prototype.do = function (tables,config) {
    MysqlJavaTypeMapPlugin.__super__.do();
    let javaTypeMap = {
        "int":"Long",
        "tinyint":"Integer",
        "varchar":"String",
        "float":"float",
        "double":"double",
        "date":"Date",
        "datetime":"Date",
        "text":"String",
    }
    for(let table of tables){
        for(let field of table.fieldArray){
            field.javaType = javaTypeMap[field.fieldType]
        }
    }
};

```

### 3.添加 ${upperCamelName}Ctrl.java

模板使用lodash template语法，表达式模板可用参数

```
{
	table:"表信息",
	config: ”.gcoder.json配置信息“
}
```

```
public class ${upperCamelName}VO{
	<%table.fieldArray.forEach(function(field){%>
	//${field.comment}
	private ${field.javaType} ${field.lowerCamelName};<%})%>
}
```

如果有一个表是 user(id,name,user_name),则产生如下

```
public class UserVO{
	private Long id;
	private String name;
	private String userName;
}
```

### 4.添加 mybatis-config.xml

表达式模板可用参数

```
{
	tables:"表列表",
	config: ”.gcoder.json配置信息“
}
```


```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <typeAliases>
    <%tables.forEach(function(table){%>
<typeAlias alias="${table.lowerCamelName}" type="com.xxx.${table.upperCamelName}VO"/><%})%>
    </typeAliases>
</configuration>

```

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <typeAliases>
   		<typeAlias alias="userVO" type="com.xxx.UserVO"/>
    </typeAliases>
</configuration>

```

### 5.修改.gcoder.json

```
{
  "gcoder": "gcoder-java",
  "db": {
    "host": "数据库",
    "port": "端口",
    "database": "数据库名称",
    "username": "用户名",
    "password": "密码",
    "dialect": "当前只支持mysql"
  },
  "plugins": ["mysql-java-type-map"]
}
```

## 可用plugin

### rename

对数据库表名称和字段名称重命名为小驼峰，大驼峰,【-】分割风格和大写风格，比如表名称user_activity，

| 表名称| lowerCamelName | upperCamelName | hyphenTableName |upperTableName|
| :------| :------ |  :------ | :------ | :------ | 
| user_activity | userActivity | UserActivity |user-activity|USER-ACTIVITY|

## 数据库模型字段

### table

| 字段| 解释|
| :------| :------ | 
| tableName |表格名称|
| fieldArray |字段列表|


### field

| 字段| 解释|
| :------| :------ | 
| fieldName |字段名称|
| fieldType |字段类型|
| default |默认值|
| isPrimaryKey |是否主键|
| canNull |是否可空|
| comment |字段配置|
