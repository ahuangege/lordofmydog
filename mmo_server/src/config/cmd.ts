export const enum cmd {
	/**
	 * 获取角色列表
	 */
	connector_role_getRoleList = 0,
	/**
	 * 创建角色
	 */
	connector_role_createRole = 1,
	/**
	 * 删除角色
	 */
	connector_role_deleteRole = 2,
	/**
	 * 选定角色进入游戏
	 */
	connector_main_enter = 3,
	/**
	 * 客户端加载场景完了，请求进入地图
	 */
	map_main_enterMap = 4,
	/**
	 * 移动
	 */
	map_main_move = 5,
	/**
	 * 通知，移动
	 */
	onMove = 6,
	/**
	 * 点击玩家查看信息
	 */
	map_main_getPlayerInfo = 7,
	/**
	 * 新增或移除实体
	 */
	onEntityChange = 8,
	/**
	 * 视野内聊天
	 */
	onChatAOI = 9,
	/**
	 * 本地图聊天
	 */
	onChatMap = 10,
	/**
	 * 昵称修改
	 */
	onNicknameChanged = 11,
	/**
	 * 金币变化
	 */
	onGoldChanged = 12,
	/**
	 * 被踢
	 */
	onKicked = 13,
	onAskFriend = 14,
	onAddFriend = 15,
	onDelFriend = 16,
	onFriendInfoChange = 17,
	info_bag_delItem = 18,
	info_bag_dropItem = 19,
	onItemChanged = 20,
	info_bag_changePos = 21,
	/**
	 * 装备道具
	 */
	info_bag_equipItem = 22,
	/**
	 * 通知 装备改变
	 */
	onEquipChanged = 23,
	/**
	 * hp mp 快速使用栏变化
	 */
	onHpMpPosChanged = 24,
	/**
	 * gm命令
	 */
	info_main_gmCommit = 25,
	/**
	 * 学习技能
	 */
	info_main_learnSkill = 26,
	/**
	 * 装备技能
	 */
	info_main_equipSkill = 27,
	/**
	 * 等级经验发生变化
	 */
	onLvExpChanged = 28,
}