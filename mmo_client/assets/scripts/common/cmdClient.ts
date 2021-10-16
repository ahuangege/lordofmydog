export const enum cmd {
	/**
	 * 获取角色列表
	 */
	connector_role_getRoleList = "connector.role.getRoleList",
	/**
	 * 创建角色
	 */
	connector_role_createRole = "connector.role.createRole",
	/**
	 * 删除角色
	 */
	connector_role_deleteRole = "connector.role.deleteRole",
	/**
	 * 选定角色进入游戏
	 */
	connector_main_enter = "connector.main.enter",
	/**
	 * 客户端加载场景完了，请求进入地图
	 */
	map_main_enterMap = "map.main.enterMap",
	/**
	 * 移动
	 */
	map_main_move = "map.main.move",
	/**
	 * 通知，移动
	 */
	onMove = "onMove",
	/**
	 * 新增或移除实体
	 */
	onEntityChange = "onEntityChange",
	/**
	 * 视野内聊天
	 */
	onChatAOI = "onChatAOI",
	/**
	 * 本地图聊天
	 */
	onChatMap = "onChatMap",
	/**
	 * 昵称修改
	 */
	onNicknameChanged = "onNicknameChanged",
	/**
	 * 金币变化
	 */
	onGoldChanged = "onGoldChanged",
	/**
	 * 被踢
	 */
	onKicked = "onKicked",
	onAskFriend = "onAskFriend",
	onAddFriend = "onAddFriend",
	onDelFriend = "onDelFriend",
	onFriendInfoChange = "onFriendInfoChange",
	info_bag_delItem = "info.bag.delItem",
	info_bag_dropItem = "info.bag.dropItem",
	onItemChanged = "onItemChanged",
	info_bag_changePos = "info.bag.changePos",
}