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
	 * 点击玩家查看信息
	 */
	map_main_getPlayerInfo = "map.main.getPlayerInfo",
	/**
	 * 使用技能
	 */
	map_main_useSkill = "map.main.useSkill",
	/**
	 * 切换地图
	 */
	map_main_changeMap = "map.main.changeMap",
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
	 * 血上限变化了
	 */
	onHpMaxChanged = "onHpMaxChanged",
	/**
	 * 蓝上限变化了
	 */
	onMpMaxChanged = "onMpMaxChanged",
	/**
	 * 通知，切换地图
	 */
	onChangeMap = "onChangeMap",
	/**
	 * 通知，使用技能
	 */
	onUseSkill = "onUseSkill",
	/**
	 * 通知，技能持续过程中的数据
	 */
	onSkillAffect = "onSkillAffect",
	/**
	 * 通知，技能结束（持续性技能）
	 */
	onSkillOver = "onSkillOver",
	/**
	 * 通知，使用了快速加血栏
	 */
	onUseHpFast = "onUseHpFast",
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
	/**
	 * 装备道具
	 */
	info_bag_equipItem = "info.bag.equipItem",
	/**
	 * 通知 装备改变
	 */
	onEquipChanged = "onEquipChanged",
	/**
	 * hp mp 快速使用栏变化
	 */
	onHpMpPosChanged = "onHpMpPosChanged",
	/**
	 * hp mp 快速使用
	 */
	info_bag_useHpMpAdd = "info.bag.useHpMpAdd",
	/**
	 * gm命令
	 */
	info_main_gmCommit = "info.main.gmCommit",
	/**
	 * 学习技能
	 */
	info_main_learnSkill = "info.main.learnSkill",
	/**
	 * 装备技能
	 */
	info_main_equipSkill = "info.main.equipSkill",
	/**
	 * 等级经验发生变化
	 */
	onLvExpChanged = "onLvExpChanged",
}