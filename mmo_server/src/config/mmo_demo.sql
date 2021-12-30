/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50733
Source Host           : localhost:3306
Source Database       : mmo_demo

Target Server Type    : MYSQL
Target Server Version : 50733
File Encoding         : 65001

Date: 2021-12-30 23:05:24
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(15) DEFAULT NULL COMMENT '账号名',
  `password` varchar(32) DEFAULT NULL COMMENT '密码',
  `regTime` datetime DEFAULT NULL COMMENT '注册时间',
  `lastUid` int(10) unsigned DEFAULT NULL COMMENT '上次登录的角色id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COMMENT='账号表';

-- ----------------------------
-- Table structure for bag
-- ----------------------------
DROP TABLE IF EXISTS `bag`;
CREATE TABLE `bag` (
  `uid` int(10) unsigned NOT NULL,
  `items` text,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for equipment
-- ----------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment` (
  `uid` int(10) unsigned NOT NULL,
  `weapon` smallint(5) unsigned DEFAULT NULL COMMENT '武器',
  `armor_physical` smallint(5) unsigned DEFAULT NULL COMMENT '物理护甲',
  `armor_magic` smallint(5) unsigned DEFAULT NULL COMMENT '魔法抗性',
  `hp_add` smallint(5) unsigned DEFAULT NULL COMMENT '加血',
  `mp_add` smallint(5) unsigned DEFAULT NULL COMMENT '加蓝',
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `uid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `accId` int(10) unsigned DEFAULT NULL COMMENT '账号id',
  `nickname` varchar(15) DEFAULT NULL COMMENT '昵称',
  `gold` int(10) DEFAULT NULL COMMENT '金币',
  `heroId` tinyint(4) DEFAULT NULL COMMENT '职业id',
  `level` tinyint(4) DEFAULT NULL COMMENT '等级',
  `exp` int(10) DEFAULT NULL COMMENT '经验值',
  `mapId` tinyint(4) DEFAULT NULL COMMENT '地图id',
  `x` int(10) DEFAULT NULL COMMENT '地图坐标x',
  `y` int(10) DEFAULT NULL COMMENT '地图坐标y',
  `hp` int(10) DEFAULT NULL COMMENT '血量',
  `mp` int(10) DEFAULT NULL COMMENT '蓝量',
  `learnedSkill` text COMMENT '已学习技能',
  `skillPos` text COMMENT '使用中的技能栏',
  `hpPos` text COMMENT '快速加血栏',
  `mpPos` text COMMENT '快速加蓝栏',
  `isDelete` tinyint(4) DEFAULT NULL COMMENT '角色是否被删除  0未',
  PRIMARY KEY (`uid`),
  UNIQUE KEY `nickname` (`nickname`),
  KEY `accId` (`accId`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
