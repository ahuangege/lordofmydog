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
	 * 地图中聊天
	 */
	map_main_chatMap = 10,
	/**
	 * 新增或移除实体
	 */
	onEntityChange = 11,
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
	 * 通知，技能持续过程中的数据
	 */
	onSkillAffect = 18,
	/**
	 * 通知，技能结束（持续性技能）
	 */
	onSkillOver = 19,
	/**
	 * 通知，新增buff
	 */
	onAddBuff = 20,
	/**
	 * 通知，buff结束
	 */
	onBuffOver = 21,
	/**
	 * 部分伤害通知
	 */
	onSomeHurt = 22,
	/**
	 * 通知，使用了快速加血栏
	 */
	onUseHpFast = 23,
	/**
	 * 金币变化
	 */
	onGoldChanged = 24,
	/**
	 * 被踢
	 */
	onKicked = 25,
	onAskFriend = 26,
	onAddFriend = 27,
	onDelFriend = 28,
	onFriendInfoChange = 29,
	info_bag_delItem = 30,
	info_bag_dropItem = 31,
	onItemChanged = 32,
	info_bag_changePos = 33,
	/**
	 * 装备道具
	 */
	info_bag_equipItem = 34,
	/**
	 * 通知 装备改变
	 */
	onEquipChanged = 35,
	/**
	 * hp mp 快速使用栏变化
	 */
	onHpMpPosChanged = 36,
	/**
	 * hp mp 快速使用
	 */
	info_bag_useHpMpAdd = 37,
	/**
	 * gm命令
	 */
	info_main_gmCommit = 38,
	/**
	 * 学习技能
	 */
	info_main_learnSkill = 39,
	/**
	 * 装备技能
	 */
	info_main_equipSkill = 40,
	/**
	 * 商店购买
	 */
	info_main_shopBuy = 41,
	/**
	 * 等级经验发生变化
	 */
	onLvExpChanged = 42,
	/**
	 * 副本匹配
	 */
	map_main_copyStartMatch = 43,
	/**
	 * 副本取消匹配
	 */
	map_main_copyCancelMatch = 44,
	/**
	 * 通知副本匹配成功
	 */
	onCopyMatchOk = 45,
	/**
	 * 拾取地图上的道具
	 */
	map_main_pickItem = 46,
}