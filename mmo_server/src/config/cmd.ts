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
	 * 新增或移除实体
	 */
	onEntityChange = 7,
	/**
	 * 视野内聊天
	 */
	onChatAOI = 8,
	/**
	 * 本地图聊天
	 */
	onChatMap = 9,
	/**
	 * 昵称修改
	 */
	onNicknameChanged = 10,
	/**
	 * 金币变化
	 */
	onGoldChanged = 11,
	/**
	 * 被踢
	 */
	onKicked = 12,
	onAskFriend = 13,
	onAddFriend = 14,
	onDelFriend = 15,
	onFriendInfoChange = 16,
	info_bag_delItem = 17,
	info_bag_dropItem = 18,
	onItemChanged = 19,
	info_bag_changePos = 20,
	/**
	 * 装备道具
	 */
	info_bag_equipItem = 21,
	/**
	 * 通知 装备改变
	 */
	onEquipChanged = 22,
	/**
	 * hp mp 快速使用栏变化
	 */
	onHpMpPosChanged = 23,
	/**
	 * gm命令
	 */
	info_main_gmCommit = 24,
}