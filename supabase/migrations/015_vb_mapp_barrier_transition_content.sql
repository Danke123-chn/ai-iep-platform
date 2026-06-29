-- VB-MAPP 障碍 + 过渡评估完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql

-- ============================================================
-- AI IEP Platform - VB-MAPP 障碍评估 + 过渡评估 详细内容
-- 将简短的名称扩展为完整的评估操作定义
-- 用法：在 Supabase SQL Editor 中运行
-- ============================================================

-- ────────────────────────────────────────────────
-- VB-MAPP 障碍评估 24项 - 完整描述
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_barriers SET barrier_name_zh = '负面行为（攻击/发脾气/自伤）',
category = '行为问题' WHERE barrier_name = 'negative_behavior';
UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '提示依赖——过度依赖成人/环境的辅助才能完成任务，无法独立发起或完成行为。表现为：总是等待别人告诉下一步做什么、没有明确指令就不知所措、撤除辅助后行为立刻崩塌。',
category = '学习障碍' WHERE barrier_name = 'prompt_dependency';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '反应延迟过长——从接收指令到开始执行之间的时间间隔显著长于正常（>5-10秒），影响学习和日常效率。可能伴随注意力分散或信息处理速度慢。',
category = '学习障碍' WHERE barrier_name = 'long_delays';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '滚动行为（Scrolling）——连续无效应答的行为模式，即反复发出大量无目标/无功能的声音或词语，像在"翻阅"自己的语言库但不做有效沟通。常见于高功能自闭症儿童。',
category = '学习障碍' WHERE barrier_name = 'scrolling';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '游走行为——无法安坐于一个活动/位置，持续地无目的地移动/走动，影响课堂参与和学习效率。与多动不同之处在于缺乏目的性的探索性移动。',
category = '行为问题' WHERE barrier_name = 'roaming';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '回应要求过高——面对复杂或多步骤的要求时立即出现逃避/问题行为（扔东西/发脾气/跑开），因为要求的难度超出了当前能力范围。',
category = '学习障碍' WHERE barrier_name = 'response_requirements';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '感觉缺陷——存在视觉/听觉/触觉等感觉通道的感知损伤或处理异常，影响从环境中的学习输入。需要医学/专业评估确认。',
category = '生理障碍' WHERE barrier_name = 'sensory_deficits';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '触觉防御——对触摸（特别是非预期的轻触/特定材质的接触）产生过度敏感的反应（躲避/尖叫/攻击），严重影响日常生活接触和社交互动。',
category = '感觉障碍' WHERE barrier_name = 'tactile_defensiveness';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '提要求能力缺陷——缺乏用任何方式表达需求和愿望的能力（语言/手势/图片均不足），导致需求只能通过行为问题（哭闹/抢夺）来表达。',
category = '语言障碍' WHERE barrier_name = 'defective_mand';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '命名能力缺陷——无法对看到的物品/事件进行标签化命名，导致词汇量严重受限和概念发展滞后。',
category = '语言障碍' WHERE barrier_name = 'defective_tact';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '对话能力缺陷——无法进行一来一往的对话交流，回答问题时只能给最简短的回应或完全离题，难以维持话题。',
category = '语言障碍' WHERE barrier_name = 'defective_intraverbal';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '配对能力缺陷（ defective MTS）——无法进行视觉配对/分类任务（相同配对/类比配对/形状颜色配对），影响认知和学术技能的基础建立。',
category = '学习障碍' WHERE barrier_name = 'defective_mts';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '听者功能特征类别缺陷（ defective LRFFC）——无法根据功能/特性/类别来辨别物品，只能通过具体名称来识别，限制了语言的灵活运用。',
category = '语言障碍' WHERE barrier_name = 'defective_lrffc';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '仿说/提要求缺陷（ defective Echoic/Mand ）——仿说和提要求两个关键语言操作均有显著缺陷，是最核心的语言学习障碍之一。',
category = '语言障碍' WHERE barrier_name = 'defective_echoic_mand';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '模仿能力缺陷——不能或极困难地模仿他人的动作/声音/表情，严重阻碍了观察学习（社会学习理论的核心机制）的进行。',
category = '学习障碍' WHERE barrier_name = 'defective_imitation';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '自我刺激行为——重复性的、无外在强化目的的感觉寻求行为（晃手/转圈/凝视灯光/发出重复声音），占据大量时间并干扰学习和社会参与。',
category = '行为问题' WHERE barrier_name = 'self_stimulation';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '听者技能缺陷——无法理解或执行基本的语言指令，导致日常沟通和课堂学习的根本性障碍。',
category = '语言障碍' WHERE barrier_name = 'defective_listener_responding';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '发音/构音问题——存在发音器官的运动协调障碍导致语音清晰度低，或存在特定音位的系统性遗漏/替代/扭曲。',
category = '语言障碍' WHERE barrier_name = 'articulation_problems';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '强迫行为——固着于特定的仪式/顺序/排列方式，被打乱时会出现强烈的焦虑或情绪崩溃。包括整理/排列/检查/计数等强迫性行为。',
category = '行为问题' WHERE barrier_name = 'obsessive_compulsive';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '过度活跃——活动水平持续显著高于同龄儿童正常范围，无法在任何情境下保持安静/坐稳超过短时间。',
category = '行为问题' WHERE barrier_name = 'hyperactivity';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '视觉自我刺激——对视觉刺激有异常强烈和持久的兴趣（盯着旋转的东西/手指在眼前晃动/长时间凝视光线），占据注意力资源。',
category = '行为问题' WHERE barrier_name = 'visual_stimulation';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '能力散碎不连贯——已掌握的技能之间缺乏关联性（如能数到10但不会一一对应；能命名很多词但不能用在句子中），呈现"岛屿状"的能力分布。',
category = '学习障碍' WHERE barrier_name = 'scattered_skills';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '泛化失败——学会的技能只能在原始教学情境中使用，换个人/换个地方/换套材料就不会了，严重影响技能的实际效用。',
category = '学习障碍' WHERE barrier_name = 'failure_to_generalize';

UPDATE public.vb_mapp_barriers SET 
barrier_name_zh = '位置偏倚——在学习选择任务中倾向于总是选固定的位置（如永远选左边第一个）而非真正辨别内容，导致测试结果不能反映真实能力。',
category = '学习障碍' WHERE barrier_name = 'position_bias';


-- ────────────────────────────────────────────────
-- VB-MAPP 过渡评估 18项 - 完整描述
-- ────────────────────────────────────────────────
UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'对他人负面行为的频率和强度如何？是否存在打人/咬人/推搡/扔东西等针对他人的伤害行为？这是决定能否进入普通班级的最基本安全指标。',
category = '行为评估' WHERE transition_name = 'negative_behaviors_others';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'是否存在自伤行为（撞头/咬手/抓挠自己/撞击身体部位）？自伤的频率、强度和触发因素是什么？这是安置决策的关键安全因素。',
category = '行为评估' WHERE transition_name = 'self_injurious_behavior';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'独立性水平——在没有成人持续陪伴和辅助的情况下，能独立完成多少日常活动和学习任务？（吃饭/穿衣/如厕/收拾/学习活动等）',
category = '能力评估' WHERE transition_name = 'independence';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'适应日常变化的能力——当常规日程发生改变（换老师/教室调整/活动顺序变化/临时取消计划）时能否适应而不出现严重的情绪/行为反应？',
category = '适应能力' WHERE transition_name = 'change_routines';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'与同伴互动的能力和质量——是否能以适当的方式与同伴交往？互动是单向的还是双向的？是否被同伴接纳？',
category = '社交能力' WHERE transition_name = 'interact_peers';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'遵循集体指令的能力——在小组/集体环境中听到面向全体的指令时能否正确理解和执行？是否需要单独点名才能响应？',
category = '学习能力' WHERE transition_name = 'follow_group_instructions';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有提要求技能库的广度和深度——目前已掌握的所有提要求形式（语言/手势/图片等）覆盖了多少种不同的需求类型？',
category = '技能评估' WHERE transition_name = 'repertoire_mand';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有命名技能库的广度和深度——目前能命名的物品/动作/特征/类别等的数量和范围？是否足以支撑日常交流和课程学习？',
category = '技能评估' WHERE transition_name = 'repertoire_tact';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有听者技能库的广度和深度——能理解和执行的指令类型和复杂程度？听者反应能力是否足以应对课堂环境的需求？',
category = '技能评估' WHERE transition_name = 'repertoire_lr';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有对话技能库——能参与什么程度和类型的对话交流？对话的话题广度和维持能力如何？',
category = '技能评估' WHERE transition_name = 'repertoire_iv';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有游戏技能库——掌握的游戏类型和复杂程度（从功能性游戏到假装游戏到规则游戏）？游戏技能是否足以支持同伴融入？',
category = '技能评估' WHERE transition_name = 'repertoire_play';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'现有社交技能库——已具备的社交行为 repertoire（眼神接触/分享/轮流/安慰/合作/冲突解决等）的范围和质量？',
category = '技能评估' WHERE transition_name = 'repertoire_social';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'技能习得速度——教授一个新技能需要多少次尝试才能达到掌握标准？习得速度是否接近典型发展的速率？这直接决定了在普通班级中能否跟上进度。',
category = '学习效率' WHERE transition_name = 'rate_acquisition';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'适应变化的能力——更广义的变化适应（不只是日程变化还包括环境变化/人员变化/材料变化/规则变化的适应能力）',
category = '适应能力' WHERE transition_name = 'adaptability_change';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'技能保持速度——学会的技能在一段时间不练习后能保留多少？是否容易遗忘已掌握的技能？保持率决定了长期干预效果的可持续性。',
category = '学习效率' WHERE transition_name = 'rate_retention';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'自然环境学习能力——在非结构化的自然环境（不是一对一教学情境）中能否观察、模仿和自发学习新的技能？这对融合教育环境尤为重要。',
category = '学习能力' WHERE transition_name = 'natural_environment_learning';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'可训练性——总体上对教学干预的响应程度如何？是否是一个"好教"的孩子（对强化敏感、动机良好、配合度高）？这决定了干预资源的效率。',
category = '学习效率' WHERE transition_name = 'trainability';

UPDATE public.vb_mapp_transitions SET transition_name_zh = 
'先前学习的潜力——基于已有的技能基础和学习特征，预测其在新的/更高阶的学习环境中取得进步的可能性有多大？综合所有评估数据后的整体判断。',
category = '学习效率' WHERE transition_name = 'potential_prior_learning';


-- ============================================================
-- 完成验证
-- ============================================================
SELECT '✅ VB-MAPP 障碍+过渡评估描述更新完成！' AS status;
SELECT COUNT(*) AS total_barriers FROM public.vb_mapp_barriers
UNION ALL SELECT COUNT(*) FROM public.vb_mapp_transitions;


NOTIFY pgrst, 'reload schema';
