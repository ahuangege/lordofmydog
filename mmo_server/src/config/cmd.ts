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
	 * 使用技能
	 */
	map_main_useSkill = 8,
	/**
	 * 切换地图
	 */
	map_main_changeMap = 9,
	/**
	 * 新增或移除实体
	 */
	onEntityChange = 10,
	/**
	 * 视野内聊天
	 */
	onChatAOI = 11,
	/**
	 * 本地图聊天
	 */
	onChatMap = 12,
	/**
	 * 昵称修改
	 */
	onNicknameChanged = 13,
	/**
	 * 血上限变化了
	 */
	onHpMaxChanged = 14,
	/**
	 * 蓝上限变化了
	 */
	onMpMaxChanged = 15,
	/**
	 * 通知，切换地图
	 */
	onChangeMap = 16,
	/**
	 * 通知，使用技能
	 */
	onUseSkill = 17,
	/**
	 * 金币变化
	 */
	onGoldChanged = 18,
	/**
	 * 被踢
	 */
	onKicked = 19,
	onAskFriend = 20,
	onAddFriend = 21,
	onDelFriend = 22,
	onFriendInfoChange = 23,
	info_bag_delItem = 24,
	info_bag_dropItem = 25,
	onItemChanged = 26,
	info_bag_changePos = 27,
	/**
	 * 装备道具
	 */
	info_bag_equipItem = 28,
	/**
	 * 通知 装备改变
	 */
	onEquipChanged = 29,
	/**
	 * hp mp 快速使用栏变化
	 */
	onHpMpPosChanged = 30,
	/**
	 * hp mp 快速使用
	 */
	info_bag_useHpMpAdd = 31,
	/**
	 * gm命令
	 */
	info_main_gmCommit = 32,
	/**
	 * 学习技能
	 */
	info_main_learnSkill = 33,
	/**
	 * 装备技能
	 */
	info_main_equipSkill = 34,
	/**
	 * 等级经验发生变化
	 */
	onLvExpChanged = 35,
}