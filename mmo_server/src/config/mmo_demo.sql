/*
 Navicat MySQL Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50733
 Source Host           : localhost:3306
 Source Schema         : mmo_demo

 Target Server Type    : MySQL
 Target Server Version : 50733
 File Encoding         : 65001

 Date: 14/11/2023 22:44:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(15) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '账号名',
  `password` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '密码',
  `regTime` bigint(20) NULL DEFAULT NULL COMMENT '注册时间',
  `lastUid` int(10) UNSIGNED NULL DEFAULT NULL COMMENT '上次登录的角色id',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username`(`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '账号表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for bag
-- ----------------------------
DROP TABLE IF EXISTS `bag`;
CREATE TABLE `bag`  (
  `uid` int(10) UNSIGNED NOT NULL,
  `items` json NULL,
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for equipment
-- ----------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment`  (
  `uid` int(10) UNSIGNED NOT NULL,
  `weapon` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT '武器',
  `armor_physical` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT '物理护甲',
  `armor_magic` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT '魔法抗性',
  `hp_add` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT '加血',
  `mp_add` smallint(5) UNSIGNED NULL DEFAULT NULL COMMENT '加蓝',
  PRIMARY KEY (`uid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player`  (
  `uid` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `accId` int(10) UNSIGNED NULL DEFAULT NULL COMMENT '账号id',
  `nickname` varchar(15) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '昵称',
  `gold` int(10) NULL DEFAULT NULL COMMENT '金币',
  `heroId` tinyint(4) NULL DEFAULT NULL COMMENT '职业id',
  `level` tinyint(4) NULL DEFAULT NULL COMMENT '等级',
  `exp` int(10) NULL DEFAULT NULL COMMENT '经验值',
  `mapId` tinyint(4) NULL DEFAULT NULL COMMENT '地图id',
  `x` int(10) NULL DEFAULT NULL COMMENT '地图坐标x',
  `y` int(10) NULL DEFAULT NULL COMMENT '地图坐标y',
  `hp` int(10) NULL DEFAULT NULL COMMENT '血量',
  `mp` int(10) NULL DEFAULT NULL COMMENT '蓝量',
  `learnedSkill` json NULL COMMENT '已学习技能',
  `skillPos` json NULL COMMENT '使用中的技能栏',
  `hpPos` json NULL COMMENT '快速加血栏',
  `mpPos` json NULL COMMENT '快速加蓝栏',
  `isDelete` tinyint(4) NULL DEFAULT NULL COMMENT '角色是否被删除  0未',
  PRIMARY KEY (`uid`) USING BTREE,
  UNIQUE INDEX `nickname`(`nickname`) USING BTREE,
  INDEX `accId`(`accId`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
