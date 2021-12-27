export default [

    "connector.role.getRoleList", // 获取角色列表
    "connector.role.createRole", // 创建角色
    "connector.role.deleteRole", // 删除角色

    "connector.main.enter", // 选定角色进入游戏

    "map.main.enterMap", // 客户端加载场景完了，请求进入地图
    "map.main.move", // 移动
    "onMove",   // 通知，移动
    "map.main.getPlayerInfo", // 点击玩家查看信息
    "map.main.useSkill",   // 使用技能
    "map.main.changeMap",   // 切换地图
    "map.main.chatMap",   // 地图中聊天

    "onEntityChange",   // 新增或移除实体
    "onChatMap",    // 本地图聊天
    "onNicknameChanged",    // 昵称修改
    "onHpMaxChanged",   // 血上限变化了
    "onMpMaxChanged",   // 蓝上限变化了
    "onChangeMap",  // 通知，切换地图
    "onUseSkill",   // 通知，使用技能
    "onSkillAffect",   // 通知，技能持续过程中的数据
    "onSkillOver",   // 通知，技能结束（持续性技能）
    "onAddBuff",    // 通知，新增buff
    "onBuffOver",   // 通知，buff结束
    "onSomeHurt",   // 部分伤害通知

    "onUseHpFast",  // 通知，使用了快速加血栏

    "onGoldChanged",    // 金币变化
    "onKicked", // 被踢

    "onAskFriend",
    "onAddFriend",
    "onDelFriend",
    "onFriendInfoChange",


    "info.bag.delItem",
    "info.bag.dropItem",
    "onItemChanged",
    "info.bag.changePos",
    "info.bag.equipItem",   // 装备道具
    "onEquipChanged",   // 通知 装备改变
    "onHpMpPosChanged", // hp mp 快速使用栏变化
    "info.bag.useHpMpAdd",  // hp mp 快速使用

    "info.main.gmCommit",   // gm命令
    "info.main.learnSkill",   // 学习技能
    "info.main.equipSkill",   // 装备技能
    "info.main.shopBuy",   // 商店购买

    "onLvExpChanged",   // 等级经验发生变化

    "map.main.copyStartMatch",  // 副本匹配
    "map.main.copyCancelMatch",  // 副本取消匹配
    "onCopyMatchOk",    // 通知副本匹配成功
    "map.main.pickItem",  // 拾取地图上的道具

]