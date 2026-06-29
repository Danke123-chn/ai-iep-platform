-- VB-MAPP 170 项里程碑完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 010_vb_mapp_schema.sql

-- ============================================================
-- AI IEP Platform - 评估内容完整描述更新脚本
-- 将所有"参见评估手册"占位符替换为真实的评估操作定义
-- 用法：在 Supabase SQL Editor 中运行此文件
-- 注意：先运行 assessment_schema.sql 创建表结构后再运行本文件
-- ============================================================

-- ============================================================
-- 第一部分：VB-MAPP 里程碑 - 真实评估内容（170项）
-- ============================================================

-- ────────────────────────────────────────────────
-- 领域1：提要求 (Mand) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'在无辅助的情况下，儿童能通过任何沟通方式（语音、手势、图片交换、拉大人的手等）主动提出2个或以上不同的要求。
【测试方法】设置动机操作（MO）：展示偏好的食物/玩具但放在拿不到的位置，等待儿童自发地以任何方式表达"想要"。记录3次不同场景中的反应。可接受的形式：说出物品名称、发出近似音、伸手并看向目标物、用手指、拉大人手去拿等。
【评分标准】1分=在至少2种不同MO情境下独立提出不同要求；1/2分=需要弱辅助（如轻微手势提示）；0分=无自发性要求或需强辅助' 
WHERE domain='mand' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'儿童能在自然环境中，对10种不同的强化物（食物、玩具、活动）提出要求。
【测试方法】准备10种已知偏好的物品/活动，逐一呈现在儿童面前但延迟给予（约3-5秒），观察是否自发提要求。每种物品测试2-3次机会。注意区分"命名"和"提要求"——提要求必须有明确的动机操作（想要得到某物），而非仅仅说出名称。
【评分标准】1分=10种均能独立提要求；1/2分=5-9种能独立；0分=少于5种或完全依赖辅助' 
WHERE domain='mand' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能用单个词（语音、手势或图片）对不在眼前的缺失物品/事件提要求（即"缺失提要求"）。
【测试方法】当儿童正在玩的玩具突然被拿走或藏起来时，观察是否自发要求该玩具回来。或在日常活动中故意不提供某个必需品（如吃零食时不给勺子），看儿童是否要求缺失的物品。测试至少5个不同情境。
【评分标准】1分=5个情境中均能独立对缺失物品/事件提出要求；1/2分=2-4个情境中能做到；0分=1个或以下能做到' 
WHERE domain='mand' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在自然环境中频繁地自发提出各种类型的要求（包括信息要求和注意力要求），每天至少25次自发性提要求。
【测试方法】通过日常观察（至少2小时）或家长/老师报告来统计。要求类型应包括：物品要求、动作要求（"抱抱"、"打开"）、移除要求（"不要"、"走开"）、信息要求（"这是什么？"、"在哪里？"）、注意力要求（"妈妈看！"）。注意排除刻板性/重复性要求。
【评分标准】1分=观察期内≥25次自发性提要求且类型多样；1/2分=10-24次或类型单一；0分=少于10次' 
WHERE domain='mand' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能用简单短语（2-3个词）提出要求，如"要饼干"、"给我车车"、"打开门"等。
【测试方法】在自然环境中创造需求情境，等待儿童用短语而非单词来表达。例如：把饼干放在密封罐里（诱导"打开"+"饼干"），递给孩子一件穿错的衣服（诱导"不要"+"这个"）。测试至少10种不同情境。
【评分标准】1分=8/10及以上情境使用短语提要求；1/2分=4-7/10使用短语；0分=主要使用单词或无法独立提要求' 
WHERE domain='mand' AND level=1 AND milestone_number=5;

-- Level 2: 提要求 (18-30个月)
UPDATE public.vb_mapp_milestones SET description = 
'能在多种社交情境中自发提要求，包括向同伴提要求和在不同环境（家、学校、社区）中向不同的人提要求。每天自发提要求50次以上。
【测试方法】通过跨环境观察（家庭+学校各至少1.5小时）和家长/教师问卷收集数据。重点关注：是否能根据对话对象调整提要求方式？是否能向不太熟悉的成人提要求？是否能拒绝不需要的东西？
【评分标准】1分=所有环境和对象均能自发提要求，总量≥50次/天；1/2分=部分环境受限或20-49次/天；0分=仅在高度结构化环境中提要求或少于20次' 
WHERE domain='mand' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能正确使用各种提要求的辅助动词和修饰语，包括"要"、"可以"、"帮我"、"想要"、"请"等礼貌用语。
【测试方法】在日常交流中观察儿童提要求时的语言形式。创设需要使用特定辅助词的情境——如东西够不着时说"帮帮我"、选择活动时说"我可以...吗"。测试10个不同情境。
【评分标准】1分=8/10以上情境正确使用辅助动词；1/2分=4-7/10正确使用；0分=很少或不使用辅助词' 
WHERE domain='mand' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能针对缺失的信息自发提问（"什么"、"谁"、"哪里"、"什么时候"类的问题）以获取所需信息。
【测试方法】在自然互动中制造信息差——如故意用神秘语气说"今天有个人要来看你..."然后停顿，观察儿童是否问"谁？"；或在收拾书包时故意遗漏某样东西看孩子是否注意到并提问。测试至少8个信息差情境。
【评分标准】1分=6/8以上情境自发提问；1/2分=3-5/8情境提问；0分=几乎不自发提问获取信息' 
WHERE domain='mand' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能用完整的句子（主语+谓语+宾语）提要求，句子长度平均4-6个词，语法基本正确。
【测试方法】记录儿童在自然环境中的提要求语言样本（录音或现场记录至少20个提要求实例）。分析句子的完整性、语法正确性和平均长度。重点观察是否遗漏功能词（如"的"、"了"、介词等）。
【评分标准】1分=80%以上的提要求是完整句子，语法错误<20%；1/2分=50-80%为完整句子或有较多语法省略；0分=主要使用单词/短语' 
WHERE domain='mand' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能根据听话者的反应调整提要求策略——如果第一次未被满足，能换一种方式重新表达或补充理由。
【测试方法】有意忽略儿童的第一次提要求（假装没听见），观察其反应。预期行为：换一个说法、重复并加大音量、给出理由（"因为我饿了"）、换一个人问等。测试5次"首次被忽略"情境。同时记录在真实生活中遇到类似情况的表现。
【评分标准】1分=4/5以上情境能恰当调整策略重新尝试；1/2分=2-3/5情境能做到或策略单一（只重复）；0分=放弃或出现问题行为' 
WHERE domain='mand' AND level=2 AND milestone_number=5;

-- Level 3: 提要求 (30-48个月)
UPDATE public.vb_mapp_milestones SET description = 
'能就复杂的需求进行多轮对话式提要求，包括协商、说服、解释原因和条件交换。
【测试方法】创设需要协商的情境——如"吃完蔬菜才能吃甜点"，观察儿童是否能进行多轮讨价还价（"就吃一口行吗？"、"那吃一半？"、"可是我想吃巧克力..."）。测试至少5个需要多步骤交涉的场景。
【评分标准】1分=4/5以上情境能进行3轮以上有效协商；1/2分=2-3/5情境能进行简单协商；0分=无法协商或直接发脾气/放弃' 
WHERE domain='mand' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能使用复杂的疑问词结构提问，包括"为什么"、"怎么做"、"如果...会怎样"等抽象程度更高的问句来获取信息或满足需求。
【测试方法】在日常学习活动和阅读绘本过程中，鼓励并观察儿童的提问。也可以通过开放式的任务引发提问："我们来做实验吧，你需要问我一些问题才能继续。"记录提问的质量和复杂度。
【评分标准】1分=能自发使用5种以上不同类型的复杂疑问句；1/2分=能使用2-4种；0分=仅使用简单的什么/谁/哪里' 
WHERE domain='mand' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能就内心状态（感受、想法、梦想）进行提要求和表达，而不仅限于物质需求和即时需求。
【测试方法】通过访谈和情境观察了解儿童是否能表达"我感到难过"、"我希望..."、"我担心..."、"我在想..."等关于内在体验的内容。可通过情绪卡片、绘画讨论等方式辅助。询问家长孩子在日常生活中是否分享内心想法。
【评分标准】1分=能经常自发表达至少3种不同的内心状态；1/2分=偶尔表达或在明确提示下才能表达；0分=几乎不表达内在感受' 
WHERE domain='mand' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能根据社交语境恰当地调整提要求的方式和强度——知道什么时候可以直接要求、什么时候需要委婉、什么时候不该提要求（抑制不当要求）。
【测试方法】设计一系列社交情境来判断儿童的社交判断力：（1）对陌生人提适当的要求（2）在别人忙碌时等待合适时机（3）在公共场合控制音量（4）面对权威人物（老师）调整表达方式（5）理解某些场合不适合提某些要求。
【评分标准】1分=4/5以上情境表现出恰当的社交调整；1/2分=2-3/5情境恰当；0分=大多数情境缺乏社交意识' 
WHERE domain='mand' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能为他人代为提要求或帮助他人表达需求（即"替代提要求"或"倡导"行为），展现出同理心和利他性。
【测试方法】观察当同伴或家人有明显需求但自己无法有效表达时，儿童是否会主动帮忙传达。也可设计情境：让另一个孩子（或成人扮演）明显需要某物但说不出来，看目标儿童是否会介入帮助。测试至少3个此类情境。
【评分标准】1分=在2/3以上情境中主动帮助他人表达需求；1/2分=1/3情境中能做到或在提示下能做到；0分=从不关注他人的未表达需求' 
WHERE domain='mand' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域2：命名 (Tact) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'在无辅助的情况下，当物品/图片呈现时，儿童能说出或用其他方式（图片/手势）标记至少2个常见物品的名称。
【测试方法】将2个常见物品（如球、杯子）逐一放在儿童面前，指着物品问"这是什么？"等待自发反应。每个物品给3次机会。可接受的反应：准确的发音/近似音、正确的手势标签、正确的图片指认。注意与"提要求"的区别——这里没有动机操作，纯粹是命名。
【评分标准】1分=2个物品均能正确命名；1/2分=1个能正确命名；0分=两个都无法正确命名' 
WHERE domain='tact' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能命名至少10种不同的常见物品（涵盖食物、玩具、日用品、动物等多个类别）。
【测试方法】逐一呈现10种不同类别的物品或清晰图片，每件物品问"这是什么？"不给任何示范或提示。物品选择应来自儿童的日常生活环境。每次呈现后等待3-5秒的自发反应。
【评分标准】1分=10个全部正确命名；1/2分=5-9个正确；0分=少于5个正确' 
WHERE domain='tact' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能命名至少25种物品/图片，覆盖更多类别（包含衣物、家具、身体部位、交通工具、水果/蔬菜等）。
【测试方法】逐一呈现25种不同类别物品的高清图片（或实物），问"这是什么？"不给辅助。记录正确率。注意：近似发音（如"泡泡"说成"波波")可计为1/2分。
【评分标准】1分=22/25以上正确；1/2分=12-21/25正确；0分=少于12/25正确' 
WHERE domain='tact' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能命名常见的动作和正在进行的事件（如"睡觉"、"跑步"、"喝水"、"吃饭"），至少5种不同动作。
【测试方法】（1）做动作让孩子命名：做"睡觉"姿势问"我在做什么？" （2）播放动作视频或翻看动作绘本让孩子命名（3）在日常生活中看到别人做动作时自发命名。共测10个常见动作。
【评分标准】1分=8/10以上正确命名；1/2分=4-7/10正确；0分=少于4/10正确' 
WHERE domain='tact' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在自然环境（非测试情境）中自发命名看到的物品、人和事件，每天至少有20次自发性命名行为。
【测试方法】通过日常观察（散步、购物、看书、玩耍等场景，累计至少2小时）和家长报告统计自发性命名的频率。自发性命名是指没有人问"这是什么"的情况下儿童主动说出的标签。如看到狗主动说"狗狗！"
【评分标准】1分=观察期内≥20次自发性命名；1/2分=10-19次；0分=少于10次或几乎没有自发命名' 
WHERE domain='tact' AND level=1 AND milestone_number=5;

-- Level 2: 命名
UPDATE public.vb_mapp_milestones SET description = 
'能命名物品的功能和特性（形容词），如"大的/小的"、"红颜色的"、"软软的"、"圆圆的"等，至少能使用10个不同的形容词来描述物品。
【测试方法】呈现物品配对（如一大一小两个球），问"哪个是大的？"或"描述一下这个"。也可以用"告诉我关于[物品]的事情"这种开放式提问。测试至少15组对比/描述情境。
【评分标准】1分=12/15以上情境正确使用形容词命名；1/2分=7-11/15；0分=少于7/15' 
WHERE domain='tact' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能命名物品所属的类别/范畴（如"这是水果"、"这是动物"、"这是交通工具"），至少能正确分类命名10种类别。
【测试方法】呈现多个混合物品（如苹果、汽车、狗、椅子、衬衫混在一起），问"这些里面哪些是食物？""哪个是动物？"等。测试10个不同类别的分类命名能力。
【评分标准】1分=9/10以上类别能正确识别和命名；1/2分=5-8/10；0分=少于5/10' 
WHERE domain='tact' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能命名含有两个以上特征的复合名词短语，如"红色的大球"、"小黑狗"、"长长的铅笔"等。
【测试方法】呈现具有多重特征的物品，要求儿童完整描述。例如拿出一只小的红色塑料卡车，期望听到"小红卡车"或至少包含两个特征。测试10个复合特征物品。
【评分标准】1分=8/10以上物品能说出包含两个以上特征的命名；1/2分=4-7/10只能说出一个特征；0分=只能说出简单名称或无法命名' 
WHERE domain='tact' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能命名动作的细节特征（副词/方式词），如"跑得快/慢""轻轻地放""高兴地跳"等，以及命名简单的关系概念（"在上面/下面/里面"）。
【测试方法】（1）演示同一个动作的不同方式让孩子区分命名（快跑 vs 慢跑）（2）展示物体间的位置关系让孩子命名（杯子在桌子上面 vs 下面）（3）描述图片中人物的感受和动作方式。共测试15个情境。
【评分标准】1分=12/15以上正确命名细节特征或关系；1/2分=7-11/15；0分=少于7/15' 
WHERE domain='tact' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能对不在当前视野内的物品/事件进行命名（回忆性/远距命名），如描述刚才看到的事物、之前发生的事、熟悉但此刻不在场的人。
【测试方法】（1）拿走刚玩过的玩具问"刚才我们玩了什么？"（2）问"今天早上你吃了什么？"（3）问"你的老师叫什么名字？"（不在场时）（4）翻开之前看过的书的一页问"这一页有什么？"共测试10个回忆性命名情境。
【评分标准】1分=8/10以上能正确回忆命名；1/2分=4-7/10；0分=少于4/10' 
WHERE domain='tact' AND level=2 AND milestone_number=5;

-- Level 3: 命名
UPDATE public.vb_mapp_milestones SET description = 
'能使用隐喻、明喻等修辞手法或抽象概念进行高级命名和描述，如"太阳像个大火球""他像老虎一样凶"。
【测试方法】通过阅读含有比喻/拟人的绘本、观察自然现象后的讨论、创意写作/绘画活动来评估。也可以直接要求"用一句话描述X，要用像...这样的方式"。测试8个适合使用比喻描述的对象/情境。
【评分标准】1分=6/8以上情境能产生恰当的比喻/明喻描述；1/2分=3-5/8能产生简单比喻；0分=仅能做字面描述或无法完成' 
WHERE domain='tact' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能对复杂的场景/画面进行全面的叙述性命名——不只是单个标签，而是用一段话描述整个场景中的人物、动作、关系、背景等要素。
【测试方法】出示一幅内容丰富的场景画（如公园里孩子们玩耍的画面），要求儿童尽可能详细地描述看到的一切。评估维度：人物识别、动作描述、空间关系、情感解读、背景元素、整体叙事连贯性。
【评分标准】1分=能描述出8个以上不同要素且组织有条理；1/2分=能描述4-7个要素但组织较松散；0分=只能说出零星标签' 
WHERE domain='tact' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能命名和区分细微的情感/心理状态词汇（如"沮丧""失望""骄傲""焦虑""兴奋""困惑"等），至少15种不同的高级情感词。
【测试方法】使用情绪表情卡（展示不同面部表情）、情境故事（"小明努力练习了很久但比赛还是输了，他感觉怎么样？"）、以及回顾自身经历（"上次你...的时候你是什么感觉？"）。测试20个情感识别/命名情境。
【评分标准】1分=17/20以上能正确命名情感；1/2分=10-16/20；0分=少于10/20或仅能命名基础情感（开心/难过/生气）' 
WHERE domain='tact' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能命名抽象概念和非物理实体（如时间概念"昨天/明天"、社会概念"公平/规则"、数概念"很多/一点"等）。
【测试方法】通过以下方式测试：（1）日历活动——"今天是星期几？昨天呢？"（2）社会规则讨论——"什么是公平？"（3）数学概念命名——"多一些/少一些"（4）故事理解中的抽象概念提取。测试15个抽象概念命名情境。
【评分标准】1分=12/15以上正确命名抽象概念；1/2分=7-11/15；0分=少于7/15' 
WHERE domain='tact' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能进行"多重触"命名——同时对同一物品从多个角度进行特征描述（颜色+形状+功能+材质+联想等），展现思维的灵活性和多维性。
【测试方法】选一件常见物品（如一个苹果），要求儿童"用尽可能多的方式描述这个东西"。评估是否能从：外观（红、圆、光滑）、功能（吃、健康）、类别（水果）、联想（白雪公主、教师节礼物）、感官（甜甜的、脆脆的）等多维度进行命名。
【评分标准】1分=能从5个以上维度描述同一物品；1/2分=能从2-4个维度描述；0分=只能说出单一标签（"这是一个苹果"）' 
WHERE domain='tact' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域3：听者技能 (Listener Responding) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'当叫自己的名字时，能有反应（转头、停下手头动作、看向说话者、口头回应"哎"等）。
【测试方法】在儿童正专注于某项活动（如玩玩具、看电视）时，从约2米处轻声叫他的名字（不用夸张的语气或额外线索）。记录反应类型和反应速度。测试5次不同情境（不同活动、不同距离）。
【评分标准】1分=4/5以上情境有明确反应（1-2秒内）；1/2分=2-3/5有反应但较慢（>3秒）或需要大声呼唤；0分=1次或以下有反应' 
WHERE domain='listener_responding' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能根据一步指令完成简单动作（约10种不同的指令），如"过来""坐下""把手给我""拍手""站起来"。
【测试方法】逐一发出10种常用的一步指令，不给手势提示。每条指令后等待3-5秒观察执行情况。指令应涵盖：身体动作、物品操作、位置移动三类。
【评分标准】1分=9/10以上指令能正确执行；1/2分=5-8/10正确；0分=少于5/10正确' 
WHERE domain='listener_responding' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在3-5个物品/图片的组合中，根据名称（听者反应）正确指出对应的物品，至少10种不同物品。
【测试方法】桌上摆放3-5件物品（或对应图片），发出"给我[物品名]"或"指一指[物品名]"的指令。每轮更换物品组合以防位置记忆。共测试10种不同物品。
【评分标准】1分=9/10以上正确指认；1/2分=5-8/10正确；0分=少于5/10正确' 
WHERE domain='listener_responding' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能执行两步连锁指令（如"拿起球然后放到篮子里"），至少5种不同的两步指令。
【测试方法】发出包含两个连续动作的指令，中间不加停顿。确保两步之间有逻辑顺序关系。测试5组不同的两步指令。注意排除"分别执行两个独立单步指令"的情况——必须是作为一个整体的两步链。
【评分标准】1分=4/5以上两步指令完整执行；1/2分=2-3/5完整执行或部分完成；0分=无法执行两步指令' 
WHERE domain='listener_responding' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能从8-10个物品/图片的大组合中正确指认物品，并能根据物品的一个特征（如颜色/形状）来辨别。
【测试方法】桌上摆8-10件物品，发出两种类型的听者反应指令：（1）"给我[X]"精确指认（2）"给我红色的/圆形的..."按特征指认。共测试20次（10次精确+10次特征）。
【评分标准】1分=18/20以上正确；1/2分=12-17/20正确；0分=少于12/20正确' 
WHERE domain='listener_responding' AND level=1 AND milestone_number=5;

-- Level 2: 听者技能
UPDATE public.vb_mapp_milestones SET description = 
'能从10个以上物品组合中根据物品的功能、特性和类别进行听者辨别反应（LRFFC），如"给你写字用的东西""指一指会飞动的动物""哪个是用来喝水的？"。
【测试方法】桌面上摆放10个不同类别/功能的物品，发出基于功能/特性/类别的指认指令。共测试25个不同类型的LRFFC指令，包括功能（"哪个用来坐？"）、特性（"哪个是红色的/圆的？"）、类别（"哪个是水果/动物？"）。
【评分标准】1分=22/25以上正确；1/2分=12-21/25正确；0分=少于12/25正确' 
WHERE domain='listener_responding' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能执行含有时空概念的三步及以上复杂指令，如"先把红色的书放到桌子上，再去拿蓝色的笔，最后坐到椅子上"。
【测试方法】发出3-5步的连锁指令，涉及多个物品、多个动作、空间位置变化。指令只说一次，不能重复。测试5组不同的复杂指令。
【评分标准】1分=4/5以上完整准确执行；1/2分=2-3/5完整执行或漏掉中间步骤；0分=最多只能执行两步指令' 
WHERE domain='listener_responding' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能回答"什么""谁""哪里"三种类型的简单问句，涉及周围环境中的具体事物和人。
【测试方法】在自然互动中提出以下类型的问句各若干：（1）"这是什么？"（2）"这是谁？"（3）"[物品]在哪里？"（4）"你在做什么？"（5）"[人]在做什么？"。共测试25个问题。
【评分标准】1分=22/25以上正确回答（语言或指认均可）；1/2分=12-21/25正确；0分=少于12/25正确' 
WHERE domain='listener_responding' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在听者反应任务中，同时完成指认和简单命名（即边指认边说出名称），至少50%的任务中出现这种双重反应。
【测试方法】在常规的听者指认任务中，观察是否在指认目标物品的同时或紧接着自发说出该物品的名称。例如，当说"指一指狗"时，孩子不但指向狗，还可能说"狗！"。测试50个听者反应机会。
【评分标准】1分=50%以上任务中出现伴随命名；1/2分=20-49%出现；0分=低于20%出现' 
WHERE domain='listener_responding' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能跟随集体指令（面向多人发出的同一指令）并正确执行，如在小组活动中响应"大家一起..."、"每个人都..."这类集体性语言指示。
【测试方法】在小组环境（至少3个儿童）中发出集体指令："大家都站起来""每个人拿一支笔""我们一起拍手"。测试10个不同的集体指令，观察目标儿童是否能跟随集体行动。
【评分标准】1分=8/10以上集体指令能正确跟随；1/2分=4-7/10能跟随；0分=少于4/10或需要单独点名才能执行' 
WHERE domain='listener_responding' AND level=2 AND milestone_number=5;

-- Level 3: 听者技能
UPDATE public.vb_mapp_milestones SET description = 
'能理解和使用复杂的空间关系语言（如"在...旁边""在...之间""穿过""绕过"等）及方向指示来完成多步导航类任务。
【测试方法】设计一个需要按照复杂空间指令操作的寻宝游戏或任务流程："走到书架旁边的蓝色椅子那里，从椅子下面的盒子里拿出红色的积木，把它放到两张桌子中间的篮子里"。测试5组复杂的空间导航指令。
【评分标准】1分=4/5以上准确完成全程；1/2分=2-3/5完成大部分但出错；0分=无法理解复杂空间语言' 
WHERE domain='listener_responding' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能听懂并执行含条件关系的复杂指令，如"如果你完成了作业就可以出去玩""如果下雨我们就带伞否则不带"。
【测试方法】发出含条件关系的语言指令，观察儿童是否能根据条件做出正确的行为决策。测试5个不同的条件指令，检查是否能正确理解"如果...就..."的逻辑关系。
【评分标准】1分=4/5以上正确理解和执行条件指令；1/2分=2-3/5正确；0分=难以理解条件关系' 
WHERE domain='listener_responding' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能回答抽象程度较高的"为什么""怎么"类问题，对事件的原因和过程进行解释性回答。
【测试方法】基于日常生活事件或简单故事情境提问：（1）"他为什么要这样做？"（2）"你是怎么做到的？"（3）"为什么天会下雨？"（4）"这个机器是怎么工作的？"。测试15个"为什么/怎么"类问题。
【评分标准】1分=12/15以上能给出合理（虽不一定完全准确但有逻辑）的解释；1/2分=7-11/15能给出部分解释；0分=无法回答或答非所问' 
WHERE domain='listener_responding' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在嘈杂或干扰环境中筛选性地关注目标说话者的信息（鸡尾酒会效应），过滤无关背景噪音。
【测试方法】在有适度背景噪音（电视开着、有人在聊天）的环境中与儿童对话，发出指令和提问。测试其在干扰条件下能否保持关注和正确回应。共测试10个需要在干扰下完成的听者反应任务。
【评分标准】1分=8/10以上干扰环境下仍能正确回应；1/2分=4-7/10正确但需要重复或更慢的语速；0分=在干扰下几乎无法完成任务' 
WHERE domain='listener_responding' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能理解言外之意、反讽、幽默和间接请求等高级语用含义，不仅仅是字面意思。
【测试方法】设计情境测试对非字面语言的理解：（1）间接请求——"这房间里有点冷啊"（实际意思是关窗/调空调）（2）反讽/幽默——在明显好的情况下说"太糟糕了"看孩子反应（3）善意的玩笑。测试5个语用理解情境。
【评分标准】1分=4/5以上能理解言外之意或至少表现出适当的困惑并追问；1/2分=2-3/5能理解明显的语用情境；0分=完全按字面理解所有语言' 
WHERE domain='listener_responding' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域4：视觉感知与配对 (VP/MTS) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'在6件物品（或图片）的组合中，能将完全相同的物品/图片进行配对（相同配对/Identity Matching）。
【测试方法】桌上放置3对相同的物品（共6件），打乱顺序。给儿童其中一件作为样本（sample），让他/她从剩余5件中找出完全一样的配对。共测试25次配对不同组合（循环使用不同的物品对）。
【评分标准】1分=25次配对全部正确；1/2分=15-24次正确；0分=少于15次正确' 
WHERE domain='vp_mts' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能按范例对10种不同的颜色和形状进行配对（颜色配对和形状配对）。
【测试方法】（1）颜色配对：给一个红色色块，从5个不同颜色中选出同样的红色（2）形状配对：给一个圆形，从5个不同形状中选出圆形。共测试10种颜色/形状配对。
【评分标准】1分=10/10全部正确；1/2分=5-9/10正确；0分=少于5/10正确' 
WHERE domain='vp_mts' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'在8件物品的组合中（含3个相似刺激物/distractors），能从相似但不相同的干扰项中选出完全匹配的目标（相同配对+抗干扰）。
【测试方法】桌上放一组物品，包含目标物的相同配对以及外形相似的干扰项（如目标是狗的图片，干扰项中有猫、马、牛等四足动物图片）。从8件中选出完全相同的配对。共测试25次。
【评分标准】1分=25/25正确；1/2分=10-24/25正确；0分=少于10/25正确' 
WHERE domain='vp_mts' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'在10件物品组合中（含3个相似类别的刺激物），能对不同样但同类的物品进行配对（类比配对/Class-to-Class Matching）。
【测试方法】给一张红色汽车的图片作为样本，选项中包含：另一张红色汽车的图片（正确答案，但不同款）、一辆红色消防车（相似类别干扰）、一辆白色汽车（相同类别不同属性干扰）、一个红色球（相同颜色不同类别干扰）。共测试25个类比配对。
【评分标准】1分=25/25正确；1/2分=10-24/25正确；0分=少于10/25正确' 
WHERE domain='vp_mts' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能进行实物到图片（或图片到实物）的跨模态配对，即将三维实物与其二维图片表征进行匹配。
【测试方法】给一个实物（如一个真实的小苹果），从4-5张图片中选出对应的苹果照片；反之亦然——给一张图片从几个实物中选出匹配的真实物品。共测试25次跨模态配对。
【评分标准】1分=25/25正确；1/2分=10-24/25正确；0分=少于10/25正确' 
WHERE domain='vp_mts' AND level=1 AND milestone_number=5;

-- Level 2 & 3 的 VP/MTS（简化版——核心是增加难度）
UPDATE public.vb_mapp_milestones SET description = 
'能完成复杂的序列配对和模式排序任务——将打乱顺序的图片/物品按正确的事件顺序排列（如早餐活动的先后顺序：穿衣→刷牙→吃饭→背书包）。
【测试方法】提供一套3-5张的事件顺序图片（已打乱），要求儿童按逻辑顺序排列。测试5套不同的序列排序任务（日常生活事件、简单故事情节等）。
【评分标准】1分=4/5以上序列完全排对；1/2分=2-3/5大部分正确但有小错；0分=无法理解排序概念' 
WHERE domain='vp_mts' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能根据多个维度的联合特征（颜色+形状+大小）进行复合配对，如"找红色的圆形的那个"。
【测试方法】呈现一组具有多重特征变化的物品，发出含两个以上特征的配对指令。测试15个复合特征配对任务。
【评分标准】1分=13/15以上正确；1/2分=8-12/15正确；0分=少于8/15正确' 
WHERE domain='vp_mts' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在视觉记忆任务中记住并复现简单的图案/模型（如搭积木模仿图案、记忆图片位置等）。
【测试方法】（1）展示一个由4-6块积木组成的图案10秒钟，然后移开让儿童凭记忆复制（2）展示一张有5-6个物品位置的图片30秒后遮住让儿童回忆摆放。测试5个视觉记忆任务。
【评分标准】1分=4/5以上能准确复现；1/2分=2-3/5基本复现但有偏差；0分=无法完成视觉记忆任务' 
WHERE domain='vp_mts' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能完成图形旋转和空间想象的视觉推理任务（心理旋转），如判断两个图形是否相同（只是旋转了角度）。
【测试方法】使用简化的瑞文推理矩阵风格的图形题目或专门的视觉推理卡片。测试10道图形旋转/空间推理题。
【评分标准】1分=8/10以上正确；1/2分=4-7/10正确；0分=少于4/10正确' 
WHERE domain='vp_mts' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能进行整体与部分的视觉分析——既可以从整体中识别组成部分，也能从部分推断整体（如看到轮子推断是车子的一部分）。
【测试方法】（1）给完整图片让其找出缺少的部分（2）给部分图片猜整体是什么（3）拼图任务（6-8块）。测试8个整体-部分分析任务。
【评分标准】1分=6/8以上正确完成；1/2分=3-5/8部分完成；0分=难以理解整体-部分关系' 
WHERE domain='vp_mts' AND level=2 AND milestone_number=5;

-- Level 3 VP/MTS
UPDATE public.vb_mapp_milestones SET description = 
'能处理抽象符号系统（如地图、图表、时间表、乐谱）的视觉信息的读取和理解。
【测试方法】（1）看简单的地图找到路线（2）读懂柱状图/饼图的基本信息（3）理解课程表/日程安排（4）识读简单的乐谱符号。测试8种抽象符号系统的视觉理解任务。
【评分标准】1分=6/8以上能正确解读；1/2分=3-5/8能部分解读；0分=无法理解抽象符号' 
WHERE domain='vp_mts' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能进行复杂的视觉类比推理（A:B :: C:D格式），发现两组图形之间的相同关系规律。
【测试方法】使用标准的视觉类比推理测验材料（简化版），每组呈现"A和B的关系是什么？那么C应该和哪个D配对？"的关系推理题。测试10道视觉类比题。
【评分标准】1分=8/10以上正确；1/2分=4-7/10正确；0分=少于4/10正确' 
WHERE domain='vp_mts' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能从大量视觉信息中快速筛选和定位关键信息（视觉搜索能力），如在密集的文字/图画中找到指定目标。
【测试方法】设计"找不同"/"找隐藏物品"/"文字搜索"类的任务，测量视觉搜索的速度和准确性。测试5种不同类型的视觉搜索任务。
【评分标准】1分=4/5以上能在合理时间内准确找到目标；1/2分=2-3/5能找到但耗时较长；0分=视觉搜索困难或经常遗漏' 
WHERE domain='vp_mts' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能够理解和使用视觉支架工具（如视觉日程表、流程图、思维导图、社交故事图文卡）来组织和规划自己的行为。
【测试方法】（1）给一个视觉日程表让儿童按顺序完成一天的活动（2）用简单的流程图指导完成一个多步骤任务（3）使用思维导图整理一个主题的相关信息。测试5个使用视觉支架的情境。
【评分标准】1分=4/5以上能独立参照视觉支架完成任务；1/2分=2-3/5需要一定引导；0分=不理解或不会使用视觉支架' 
WHERE domain='vp_mts' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能欣赏和运用基本的美术/设计原则（对称、平衡、色彩搭配、构图）进行创作性的视觉表达。
【测试方法】通过美术活动观察：（1）画画时是否有意识地使用颜色搭配（2）手工制作时是否考虑平衡和对称（3）能否描述自己喜欢的视觉风格。不追求艺术技巧，而是考察审美意识和视觉表达能力。
【评分标准】1分=展现出明确的审美选择和意图；1/2分=有一些审美意识但不稳定；0分=创作完全是随机/无意识的' 
WHERE domain='vp_mts' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域5：独立游戏 (Independent Play) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'能寻找5个或5套玩具中被藏起来或遗失的部分/配件（如找回丢失的拼图块、给玩具车装上车轮）。
【测试方法】在儿童开始玩某个玩具前，事先藏起一个关键部件，观察儿童是否主动寻找缺失的部分。测试5种不同玩具/游戏材料的情境。
【评分标准】1分=5/5情境都能主动寻找缺失部件；1/2分=2-4/5能做到；0分=1/0或完全不找就直接放弃/玩别的' 
WHERE domain='independent_play' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能独立地按物品的固有功能使用5件玩具或日常用品进行功能性游戏（如用梳子梳头、用杯子喝水、推小车走）。
【测试方法】逐一呈现5件不同功能的物品，观察儿童是否能自发地以符合其功能的方式使用（而非只是拿着敲、咬或摇晃）。每件物品观察60秒。
【评分标准】1分=5/5物品均能正确功能性使用；1/2分=3-4/5正确使用；0分=少于3/5或主要表现为感知觉探索性行为' 
WHERE domain='independent_play' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能用同一件物品创造出2种以上不同的玩法（符号性/假装游戏的萌芽），如把长木棍当作马骑又当作剑挥舞。
【测试方法】提供一件中性物品（如一块布、一根棍子、一个纸箱），观察儿童在3分钟内能产生几种不同的玩法。测试5种不同的中性物品。
【评分标准】1分=每件物品至少产生2种不同玩法；1/2分=部分物品有1-2种玩法；0分=所有物品只有单一的感知运动性玩法（敲、摇、咬等）' 
WHERE domain='independent_play' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在操场/游乐场的设备上独立持续玩耍5分钟（观察窗口30分钟内），不需要成人持续陪伴或引导。
【测试方法】带儿童到一个安全的户外游乐场，站在不远但不参与的位置观察。记录儿童在各类游乐设施上的自主玩耍时长和安全性。
【评分标准】1分=能在某一设备上持续玩耍≥5分钟且安全；1/2分=能玩2-4分钟或偶尔需要提醒安全事项；0分=无法独立持续游玩或一直黏着成人' 
WHERE domain='independent_play' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能独立组装5种不同的多部件玩具（如拼图、积木、嵌套玩具、形状配对盒子、简单乐高模型）。
【测试方法】逐一提供5种需要组装的多部件玩具，不给示范和指导，只告诉"你可以玩这个"。观察是否能独立完成组装。每种给5分钟时间。
【评分标准】1分=5/5能基本独立完成组装；1/2分=2-4/5能完成或需要少量帮助；0分=1/0或完全无法开始' 
WHERE domain='independent_play' AND level=1 AND milestone_number=5;

-- Level 2 独立游戏
UPDATE public.vb_mapp_milestones SET description = 
'能进行持续的象征性/假装游戏——用一个物品代表另一个物品，并围绕一个主题展开至少5分钟的独角戏式游戏。
【测试方法】提供一套娃娃家/角色扮演材料（娃娃、餐具、家具等），不给剧本，观察儿童是否能自发创建一个游戏情境（如"做饭喂宝宝吃饭"）并维持至少5分钟。测试2-3种不同的假装游戏材料组合。
【评分标准】1分=能自发创建并维持≥5分钟的主题性假装游戏；1/2分=有假装游戏但持续时间短（2-4分钟）或主题松散；0分=仅有感知运动性游戏或无法独立开展' 
WHERE domain='independent_play' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能在游戏中遵循自设的游戏规则（即使是自己定的规则也能遵守），并在规则被打破时自我纠正。
【测试方法】观察儿童在独立游戏过程中是否表现出：（1）按固定顺序进行活动（2）自己说了"我要先..."然后真的按此执行（3）游戏中出现"犯规"时能意识到并纠正。记录自然观察和半结构化游戏观察。
【评分标准】1分=在多数独立游戏场景中表现出规则意识和自律；1/2分=偶尔表现但不稳定；0分=游戏行为完全冲动无序' 
WHERE domain='independent_play' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能独立完成需要多步骤规划的建构类游戏（如按图纸搭乐高模型、完成20片以上的拼图、按说明书组装玩具）。
【测试方法】提供一个中等难度的建构任务（如40片的拼图、有搭建指南的乐高套装），不给帮助，观察儿童是否能自行规划并逐步完成。允许一次完整的尝试（最长30分钟）。
【评分标准】1分=能独立规划并基本完成任务（80%以上完成度）；1/2分=能开始并在指导下推进但独立完成度低；0分=无从下手或很快放弃' 
WHERE domain='independent_play' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在独立游戏中自发使用语言进行自言自语/游戏旁白（private speech），用语言来规划和组织自己的游戏行为。
【测试方法】在儿童独立游戏时在附近但不参与，记录其自发言语的频率和内容。关注：（1）游戏过程中的自言自语（"现在我要搭一个大城堡"）（2）赋予玩具声音/对话（3）描述自己的行动计划。
【评分标准】1分=游戏过程中频繁出现有组织的自发言语（≥5次/观察期）；1/2分=偶有自发言语但较少或较简单；0分=游戏中基本没有语言输出' 
WHERE domain='independent_play' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在独立游戏结束后主动收拾整理玩具和材料（不需提醒），表现出良好的游戏后行为习惯。
【测试方法】在自由游戏时间结束前不提前告知（或只提前1分钟通知"马上要结束了"），观察儿童在收到结束信号后的反应——是否主动收拾、如何收拾、是否需要多次提醒。测试3次不同的游戏结束场景。
【评分标准】1分=2/3以上场景能主动或仅需一次提醒就开始收拾且基本收拾完；1/2分=需要多次提醒或只收拾部分；0分=完全不收拾或抗拒收拾' 
WHERE domain='independent_play' AND level=2 AND milestone_number=5;

-- Level 3 独立游戏
UPDATE public.vb_mapp_milestones SET description = 
'能设计和创建原创的游戏/项目——不是照着说明书或模仿他人，而是自己想出一个点子并付诸实施（如发明一种新游戏规则、画一幅有构思的画、写一个小故事）。
【测试方法】给儿童开放性材料（空白纸+彩笔、散装积木、废旧材料等）和自由时间（20分钟），不指定做什么，观察是否能自主发起并完成一个有创意的项目。记录从构想到执行的整个过程。
【评分标准】1分=能独立完成一个有明确构思的原创作品/游戏；1/2分=有初步想法但执行困难或依赖提示；0分=不知道做什么或需要成人全程引导' 
WHERE domain='independent_play' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能独立进行需要持续数天或数周的长期项目型活动（如连载漫画、植物种植日记、模型制作系列），展现出计划和坚持的能力。
【测试方法】设定一个需要多阶段完成的长期项目（如"在一周内完成一本关于你自己的小册子"），提供材料和框架但不每日监督。每周检查进展，评估自主性和持续性。
【评分标准】1分=能基本独立推进项目直至完成；1/2分=需要定期督促和提醒但最终能完成；0分=无法维持兴趣或无法独立规划阶段性目标' 
WHERE domain='independent_play' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在独立游戏/学习中有效地使用时间管理工具（如定时器、日程表、待办清单）来分配和监控自己的活动进度。
【测试方法】给儿童一个包含3个子任务的"任务清单"和一个定时器，要求在规定时间内完成。观察是否能参考清单逐项完成、是否能关注剩余时间、是否能自我监控进度。测试2个不同任务场景。
【评分标准】1分=能有效利用时间管理工具自主完成任务；1/2分=能使用工具但需要较多提醒；0分=无视工具或无法按计划执行' 
WHERE domain='independent_play' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在独立活动中遇到困难时使用有效的自我解决问题策略（如换一种方法试、寻求参考资料、分解问题为小步子），而不是立即放弃或等待成人帮助。
【测试方法】故意给儿童一个稍有挑战的任务（如稍微超龄的拼图、有缺页说明书的组装玩具），观察遇到障碍时的反应。记录使用了什么策略来解决。
【评分标准】1分=能主动尝试2种以上不同的解决策略；1/2分=能尝试1种策略或稍作尝试后求助；0分=立即放弃或第一时间喊人帮忙' 
WHERE domain='independent_play' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在独处时进行有质量的自我导向活动（不是被动消遣而是主动投入），展现出舒适的独处能力和内在动机驱动的学习/娱乐能力。
【测试方法】在一个安全的空间中将儿童独自留下15分钟，提供多种可选的活动材料但不指定做什么。观察其活动质量：是否选择了某种活动？专注程度如何？情绪状态如何？
【评分标准】1分=能舒适地进行有意义的独处活动≥10分钟；1/2分=能独处但活动质量较低或持续时间短（5-9分钟）；0分=无法独处或表现出焦虑/无聊/问题行为' 
WHERE domain='independent_play' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域6：社交行为与社交游戏 (Social) - 15项
-- 注：Level 1 第1-5项已在CSDN来源中获得详细内容
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'能发起与同伴的形体/肢体互动至少2次（如牵手、拥抱、拍肩、击掌等正面肢体接触），观察窗口30分钟。
【测试方法】在有同伴在场的情况下（至少1名同龄或近龄儿童），观察30分钟内目标儿童是否主动发起正面的肢体社交互动。负面行为（推、打、抢）不计入。可以在自然情境（游乐场、小区）或半结构化的游戏中观察。
【评分标准】1分=发起≥2次正面肢体互动；1/2分=发起1次；0分=未观察到任何主动的正面肢体社交' 
WHERE domain='social_behavior' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能自发地向同伴提出要求至少5次（要求物品、要求一起玩、要求注意等），观察窗口60分钟。
【测试方法】在有同伴的自由游戏情境中观察，记录目标儿童向同伴提出的各种要求（"给我那个""我们一起玩吧""你看我做的"）。要求类型不限，关键是主动性。可以通过家长/老师补充报告日常表现。
【评分标准】1分=自发向同伴提要求≥5次；1/2分=2-4次；0分=0-1次' 
WHERE domain='social_behavior' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'在没有成人辅助或外部强化（奖励）的情况下，能与同伴持续进行社会游戏/互动至少3分钟，观察窗口30分钟。
【测试方法】安排与一名同伴在一起游戏的机会（不指定具体玩法），成人退到不参与的距离观察。记录两人持续互动的最长时间段。关键指标：是否需要成人从中协调或促进？
【评分标准】1分=有≥3分钟的持续同伴互动；1/2分=有1.5-2.9分钟的持续互动；0分=所有互动片段均<1.5分钟或完全没有互动' 
WHERE domain='social_behavior' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能自发地回应来自同伴的请求或互动邀请至少5次（日常观察记录）。
【测试方法】通过自然观察和成人报告，记录当同伴主动与目标儿童互动时（叫名字、递东西、邀请一起玩等），目标儿童的反应比例。需要积累至少一周的日常观察数据。
【评分标准】1分=对同伴的互动邀请回应≥5次；1/2分=回应2-4次；0分=回应0-1次或大多回避/忽视同伴' 
WHERE domain='social_behavior' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能自发要求同伴一起参与各种活动和社会互动至少2次（观察窗口60分钟）。
【测试方法】在有同伴在场但各自活动的情况下，观察目标儿童是否主动邀请同伴加入自己的活动（"你来跟我一起玩""我们一起搭房子吧"）。也可以是在新活动开始时主动叫上同伴。
【评分标准】1分=主动邀请同伴≥2次；1/2分=1次；0次=从未主动邀请同伴' 
WHERE domain='social_behavior' AND level=1 AND milestone_number=5;

-- Level 2 社交
UPDATE public.vb_mapp_milestones SET description = 
'能与同伴进行双向的轮流互动游戏（桌游、传球、接力对话等），遵守轮流规则，持续5分钟以上。
【测试方法】安排一个需要严格轮流的双人游戏（如简单的棋盘游戏、接球游戏），观察是否能：（1）等待轮到自己（2）轮到时及时行动（3）在5分钟内维持轮流结构不被破坏。
【评分标准】1分=能维持5分钟以上的有序轮流游戏；1/2分=能轮流但时常忘记或需提醒；0分=无法理解轮流概念或拒绝等待' 
WHERE domain='social_behavior' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能在社交互动中察觉同伴的情绪变化并做出适当的回应（同伴哭了去安慰、同伴生气了退让一步等）。
【测试方法】通过自然情境观察和情境模拟：（1）在游戏中有意制造一个小"冲突"或情绪事件（2）使用情绪图片/故事讨论"如果是你会怎么做"（3）询问家长孩子在朋友难过时的表现。测试5个情绪回应情境。
【评分标准】1分=4/5以上情境表现出恰当的情绪共情回应；1/2分=2-3/5情境有反应但不总是恰当；0分=几乎不关注同伴情绪或反应不当' 
WHERE domain='social_behavior' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能参与3人以上的小组合作游戏/活动，承担自己在小组中的一个角色并与他人配合。
【测试方法】安排一个需要3-4人协作的活动（如一起完成一幅大画、合力搭建、小组表演），观察目标儿童在小组中的表现：是否知道自己该做什么？是否能与他人协调？是否能等待和妥协？观察至少2次小组活动。
【评分标准】1分=2次小组活动中都能承担角色并良好配合；1/2分=能参与但常游离或需要较多引导；0分=无法融入小组或只在边缘观望' 
WHERE domain='social_behavior' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在社交冲突中使用语言而非行为问题来解决分歧（如"我不喜欢这样""我们可以轮流玩""这是我的先给你玩一会儿"）。
【测试方法】观察自然发生的社交冲突（玩具争抢、意见不合）以及模拟轻度冲突情境。评估儿童的第一反应是语言沟通还是攻击/哭闹/退缩。
【评分标准】1分=多数冲突中使用语言解决（即使不完美）；1/2分=有时用语言有时用行为问题；0分=几乎总是用问题行为应对冲突' 
WHERE domain='social_behavior' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能围绕一个共同话题与同伴进行至少3轮的对话交流（一来一往算一轮），话题不偏离。
【测试方法】创造一个自然的交谈情境（如一起看一本有趣的书后讨论、一起做了手工后聊感受），观察与同伴的对话质量和持续性。记录对话轮数和话题相关性。
【评分标准】1分=能进行≥3轮的有意义对话且话题相关；1/2分=能进行1-2轮对话或容易跑题；0分=无法维持对话轮替或只说自己感兴趣的' 
WHERE domain='social_behavior' AND level=2 AND milestone_number=5;

-- Level 3 社交
UPDATE public.vb_mapp_milestones SET description = 
'能理解并运用基本的社交礼仪和潜规则（打招呼/告别、保持适当距离、不打断别人、尊重私人空间、礼貌用语等）。
【测试方法】通过自然社交情境观察和社交情境判断题：（1）进入房间时的行为（2）对话中的打断行为频率（3）身体距离的适宜性（4）说"请/谢谢/对不起"的频率。结合成人评价综合判断。
【评分标准】1分=在各种情境中都表现出得体的社交礼仪；1/2分=基本得体但在陌生/压力情境中易遗忘；0分=普遍缺乏社交礼仪意识' 
WHERE domain='social_behavior' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能建立并维持至少一个稳定的友谊关系（有固定的玩伴、知道对方的名字和家庭信息、会主动想念/提及对方、愿意为对方做一些事）。
【测试方法】通过访谈儿童和家长了解：（1）有没有"最好的朋友"？（2）多久见一次？（3）见面时做什么？（4）会不会谈论对方在家时？（5）是否关心对方的情况？综合判断友谊的深度和质量。
【评分标准】1分=有至少一个稳定的友谊关系且有互惠性表现；1/2分=有喜欢的玩伴但关系较表面；0分=没有持久的同伴关系' 
WHERE domain='social_behavior' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在社交情境中进行适当的自我主张和边界维护——既能表达自己的想法和需求，又能接受合理的否定而不崩溃。
【测试方法】设计需要自我主张的情境：（1）不想做某件事时能否说"我不想..."（2）自己的东西被拿走时能否要回来（3）当同伴建议自己不同意的事情时能否提出替代方案（4）被拒绝后能否平复情绪。测试5个自我主张情境。
【评分标准】1分=4/5以上情境能恰当自我主张并接受结果；1/2分=2-3/5能做到但有时过激或过于顺从；0分=要么过度攻击要么完全退缩' 
WHERE domain='social_behavior' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能理解他人的观点和感受可能与自己不同（心智理论的初级形式），并在行为上体现出这种理解。
【测试方法】使用经典的"错误信念"任务变体（如"Sally-Anne"任务的简化版）、以及日常情境中的观点采择观察：（1）猜测别人喜欢什么礼物（2）理解为什么有人会和自己有不同的感受（3）在群体活动中考虑他人的需求。测试5个观点采择任务。
【评分标准】1分=4/5以上任务显示出对他人的观点有基本理解；1/2分=2-3/5显示部分理解；0分= consistently assumes others share his/her own perspective' 
WHERE domain='social_behavior' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在社交场合根据对方的社会信号（面部表情、语气、肢体语言）灵活调整自己的行为策略。
【测试方法】设计情境观察儿童对社会信号的敏感性：（1）对方看起来很忙时是否还坚持打扰（2）对方皱眉时是否改变做法（3）对方后退时是否跟上（4）对方笑时是否也放松下来。测试5个需要读取社会信号的情境。
【评分标准】1分=4/5以上能根据对方信号调整行为；1/2分=2-3/5能调整但不敏感或反应滞后；0分=几乎不注意他人的社会信号' 
WHERE domain='social_behavior' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域7：动作模仿 (Motor Imitation) - 15项
-- ────────────────────────────────────────────────

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个简单的大动作（如拍手、跺脚、摸头、转圈、挥手等），每个动作需一次性示范即可引发模仿。
【测试方法】评估者在儿童面前逐一做10个简单的大动作，每个动作示范一次后等待5秒观察是否模仿。不做任何语言提示（不说"你做"之类的话）。动作之间应有短暂间隔。
【评分标准】1分=10个动作均能模仿（允许形态不完全一致但动作意图明确）；1/2分=5-9个能模仿；0分=少于5个能模仿' 
WHERE domain='motor_imitation' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能用物件模仿10个动作——即在有操作物件的情境下模仿成人的动作（如用杯子假装喝水、用梳子梳头、把积木放进盒子里）。
【测试方法】在每个动作中涉及一件具体的物品，评估者先示范使用该物品做一个动作，然后将物品递给儿童看他是否模仿同样动作。共测试10个不同的物件操作模仿。
【评分标准】1分=10/10均能模仿；1/2分=5-9/10；0分=少于5/10' 
WHERE domain='motor_imitation' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个不同的精细动作/手部动作（如手指动作、OK手势、数字手势、简单手影等）。
【测试方法】示范10个主要靠手部完成的精细动作，每个示范一次。观察手指和手部的模仿精度。精细动作比大动作更难模仿，对手眼协调和手指分化能力要求更高。
【评分标准】1分=10/10能模仿（允许近似）；1/2分=5-9/10；0分=少于5/10' 
WHERE domain='motor_imitation' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个由两步组成的连锁动作序列（如先拿起茶杯→再假装喝水；先拿起笔→在纸上画线）。
【测试方法】示范一个包含两个有序步骤的动作序列（中间不停顿），然后把材料交给儿童观察是否按同样顺序执行。共测试10个不同的两步连锁动作。
【评分标准】1分=9/10以上两步连锁动作能按序模仿；1/2分=5-8/10能完成或只能做第二步；0分=少于5/10能完成' 
WHERE domain='motor_imitation' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在自然环境中自发模仿他人的功能性技能（即观察学习），至少模仿5种不同的技能。
【测试方法】在自然环境中（不刻意教学），当儿童看到别人做某个有用的动作时，是否会在类似情境中也做同样的动作。例如看到别人用纸巾擦鼻子后自己也去找纸巾擦。记录至少一周内的自发模仿事件。
【评分标准】1分=观察到≥5种不同的自发功能性模仿；1/2分=2-4种；0分=1种或以下' 
WHERE domain='motor_imitation' AND level=1 AND milestone_number=5;

-- Level 2 & 3 动作模仿
UPDATE public.vb_mapp_milestones SET description = 
'能模仿20个不同的精细动作（包括更复杂的手部操作，如折纸的某个步骤、系扣子的动作、使用剪刀等工具的动作）。
【测试方法】示范20个精细动作，每个示范一次。动作难度高于Level 1，涉及更多的手指协调和工具使用。记录模仿的准确度和独立性。
【评分标准】1分=18/20以上能模仿；1/2分=10-17/20；0分=少于10/20' 
WHERE domain='motor_imitation' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个三步连锁动作（如拿起茶杯→倒水→递给别人；拿起笔→打开本子→写下名字）。
【测试方法】示范三步动作序列（流畅完成不停顿），然后让儿童模仿。三步连锁对工作记忆和顺序记忆要求较高。测试10个不同的三步序列。
【评分标准】1分=9/10以上完整模仿三步序列；1/2分=5-8/10能完成大部分步骤或需多次示范；0分=最多完成两步' 
WHERE domain='motor_imitation' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在延迟3-5秒后仍然记得并模仿刚才看到的动作（延迟模仿），测试10个动作。
【测试方法】示范一个动作后，插入一个干扰活动（如数数1-5、唱一句歌），然后再让儿童模仿刚才看到的动作。测试10个不同动作的延迟模仿能力。
【评分标准】1分=8/10以上延迟模仿正确；1/2分=4-7/10正确；0分=少于4/10正确' 
WHERE domain='motor_imitation' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在自然环境中自发模仿5个以上的新技能（观察学习能力增强），包括看到别人做一次就能学会的技能。
【测试方法】在日常生活中留意儿童的观察学习行为——看到一个新技能（如一种新的玩具玩法、一个新的手势、一种新的使用工具的方法）后是否能较快学会。记录两周内的自发模仿新技能事件。
【评分标准】1分=观察到≥5次自发模仿新技能且成功率较高；1/2分=2-4次或成功率高但数量少；0分=极少自发模仿新技能' 
WHERE domain='motor_imitation' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'当成人示范任何新的动作后（无论是否使用辅助或实物），儿童都能准确或至少近似地模仿出来——展现出泛化的模仿学习 readiness。
【测试方法】在日常教学中随机选取5种全新的、儿童从未见过的动作进行示范，观察其模仿反应。这测试的是"学习的准备度"——即儿童是否处于一种"准备好从模仿中学习"的状态。
【评分标准】1分=5/5新动作都能尝试模仿且近似度可接受；1/2分=3-4/5能尝试模仿；0分=1-2/5能尝试或对新动作完全无反应' 
WHERE domain='motor_imitation' AND level=2 AND milestone_number=5;

-- Level 3 动作模仿
UPDATE public.vb_mapp_milestones SET description = 
'能模仿复杂的节奏模式和动作组合（如舞蹈动作序列、体操组合、打击乐节奏型），包含至少5个步骤。
【测试方法】示范一个包含5步以上的动作/节奏序列（如一段简单的舞蹈动作组合），完整示范1-2遍后让儿童模仿。测试3个不同的复杂动作序列。
【评分标准】1分=2/3以上序列能模仿出70%以上步骤且顺序基本正确；1/2分=能模仿部分步骤但顺序混乱；0分=无法模仿超过2步的序列' 
WHERE domain='motor_imitation' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能根据语言描述来执行动作（而非看着示范），即"听指令做动作"的高级形式——将听觉信息转化为运动执行。
【测试方法】不发动作示范，只用语言描述一个动作让儿童去做："请你这样做：先蹲下，然后用右手摸左脚，最后站起来转一圈"。测试5个纯语言驱动的动作执行任务。
【评分标准】1分=4/5以上语言描述的动作能正确执行；1/2分=2-3/5正确或需要分解执行；0分=无法仅凭语言描述执行多步骤动作' 
WHERE domain='motor_imitation' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含情感表达的面部表情和肢体语言的组合（如"做出一个惊讶的表情同时后退一步"），即非纯粹动作而是带有社交意义的模仿。
【测试方法】示范带有情感色彩的复合行为（表情+动作+可能的发音），观察儿童是否不仅能模仿动作还能捕捉到其中的情感成分。测试5个不同的情感性模仿任务。
【评分标准】1分=4/5以上能模仿出情感+动作的整体效果；1/2分=2-3/5能模仿动作但情感表达较弱；0分=只能模仿纯机械动作' 
WHERE domain='motor_imitation' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在镜像位置（面对面）正确模仿动作——即能理解左右颠倒的映射关系（评估者用右手=儿童用自己的左手）。
【测试方法】与儿童对面坐着，示范需要区分左右/方位的动作（如"用右手摸右耳"、"向左边挥手"、"用脚踢右边"）。由于面对面，左右是相反的。测试5个镜像模仿任务。
【评分标准】1分=4/5以上能正确处理镜像关系；1/2分=2-3/5正确或需要自我纠正；0分=始终用同侧（如都用右手）模仿' 
WHERE domain='motor_imitation' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能将学到的动作/技能迁移应用到新的情境和材料上（模仿的泛化），而不是只在原始教学情境中才会。
【测试方法】教一个新动作（或确认一个最近学会的动作），然后在不同的环境中用不同的材料测试儿童是否能自动迁移模仿能力。例如：学会了用蜡笔画的握笔动作，换成用毛笔时是否能自动调整。
【评分标准】1分=在3种以上新情境/新材料中都能迁移应用；1/2分=1-2种情境能迁移；0分=只在原始情境中会做' 
WHERE domain='motor_imitation' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域8：自发发声行为 (Spontaneous Vocal Behavior) - 15项
-- ────────────────────────────────────────────────

-- Level 1 自发发声
UPDATE public.vb_mapp_milestones SET description = 
'在各种活动情境中能自发地发出各种声音和咿呀语（babbling），声音种类至少5种不同的音。
【测试方法】在不同的日常活动（吃饭、洗澡、玩耍、换尿布等）中观察和记录儿童自发的声音输出。注意声音的多样性和自发性（不是对模仿提示的反应）。
【评分标准】1分=观察到≥5种不同的自发声音/咿呀语；1/2分=2-4种；0分=1种或以下或几乎没有自发发声' 
WHERE domain='spontaneous_vocal' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能自发地对环境中的声音事件做出声音反应（如听到门铃声发出"咚咚"的声音、听到飞机声说"呜——"）。
【测试方法】记录儿童在听到各种环境声音（门铃、电话、动物叫声、交通工具声、音乐等）时的自发声反应。可以通过家长日记补充数据。测试至少10种不同的环境声音情境。
【评分标准】1分=7/10以上声音事件有自发的声音反应；1/2分=3-6/10有反应；0分=少于3/10有反应' 
WHERE domain='spontaneous_vocal' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能使用语音来进行社交互动目的（引起注意、维持互动、表达情感），而非仅仅是自我刺激性的发声。
【测试方法】区分儿童发声的目的：（1）社交性发声（对着人说、在互动中发出声音）（2）非社交性发声（自言自语式、无对象的发声）。观察在社交互动情境中发声的比例。
【评分标准】1分=社交性发声占总体自发发声的50%以上；1/2分=20-49%为社交性；0分=<20%为社交性（大部分是非社交性/自我刺激性发声）' 
WHERE domain='spontaneous_vocal' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能将自发发声与特定的活动/情境关联起来（如在画画时发出"画画画"的声音、在跑步时发出"跑跑"的声音），即有指涉性的前语言沟通。
【测试方法】在不同活动中观察儿童的自发发声是否与当前活动有关联性。记录至少5种不同活动中的发声及其关联性。
【评分标准】1分=4/5以上活动中发声与活动相关联；1/2分=2-3/5相关联；0分=1/0或发声与活动无关' 
WHERE domain='spontaneous_vocal' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'每天有至少50次的自发性发声行为（包括咿呀语、单词、短语等一切有声输出），展现出高频率的 vocalizing 倾向。
【测试方法】通过一整天的观察（或分段累计观察达4-6小时）和家长/老师的日常报告来估算日均自发性发声频次。
【评分标准】1分=日均≥50次自发性发声；1/2分=20-49次；0分=少于20次' 
WHERE domain='spontaneous_vocal' AND level=1 AND milestone_number=5;

-- Level 2 自发发声
UPDATE public.vb_mapp_milestones SET description = 
'能自发使用词语和短语来评论周围环境中的事物（"看！汽车！""好大的狗！""哇，好漂亮"），即非提要求也非单纯命名而是带有感叹/评论性质的自发言语。
【测试方法】在外出、阅读、观看视频等丰富输入的情境中观察自发的评论性言语。区别于命名（回答"这是什么"）和提要求（想要某物），评论是自发的情感/观察表达。记录30分钟观察期的自发评论次数。
【评分标准】1分=30分钟内≥10次自发评论；1/2分=5-9次；0分=少于5次' 
WHERE domain='spontaneous_vocal' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能在独处时进行有内容的自言自语（不是无意义的声音重复），用于自我调节、自我娱乐或计划行为。
【测试方法】观察儿童独处（如在自己房间玩耍）时的自发言语内容。评估其自言是否：（1）有意义的内容（2）服务于某个目的（自我指导、讲故事给自己听）（3）适度的量（不影响他人也不完全沉默）。
【评分标准】1分=有有意义的自言自语且服务于自我调节/娱乐；1/2分=有自言但多为重复性/刻板内容；0分=独处时几乎不出声或仅为无意义发声' 
WHERE domain='spontaneous_vocal' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能根据听众调整自己说话的方式和内容（语码转换的初级形式）——对小朋友说的话和对大人说的话有所不同。
【测试方法】观察儿童与不同对话对象（同龄人vs成人）交流时是否自然调整语言风格（词汇选择、句子长度、语调等）。可以通过对比同一主题与不同对象的对话来分析。
【评分标准】1分=能根据听众明显调整说话方式；1/2分=有些调整但不稳定；0分=对所有对象用完全一样的方式说话' 
WHERE domain='spontaneous_vocal' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在团体情境中自发地贡献自己的观点和想法（举手发言、在讨论中加入意见），而不是只回答别人的问题。
【测试方法】在小组成语课堂（3-6人）或家庭讨论中观察儿童是否主动发言、贡献自己的想法、而不只是在被点名时才说话。观察至少2次团体讨论情境。
【评分标准】1分=2次团体讨论中都有自发贡献；1/2分=1次有或需要较多鼓励；0次=从不主动发言只被动回答' 
WHERE domain='spontaneous_vocal' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能使用多样化的语调和语气来表达不同的意图和情感（疑问、惊讶、兴奋、严肃、开玩笑等），声音富有表现力。
【测试方法】在自然交流和朗读/讲故事时评估儿童的声音表现力：（1）问问题时语调上升（2）讲激动的事情时语速加快音量增大（3）扮演角色时改变声音（4）能区分正式/非正式场合的语气。测试5种需要不同语气的情境。
【评分标准】1分=4/5以上情境使用恰当的语气语调；1/2分=2-3/5恰当；0分=语调单一平板' 
WHERE domain='spontaneous_vocal' AND level=2 AND milestone_number=5;

-- Level 3 自发发声
UPDATE public.vb_mapp_milestones SET description = 
'能进行有逻辑、有条理的独白式表达（如讲述一个完整的经历、解释自己的想法、发表一个观点），持续2分钟以上。
【测试方法】给儿童一个开放式的话题（如"说说你最喜欢的旅行""告诉我你怎么做这个的"），鼓励他自由表达。评估内容的组织性、逻辑性和表达的流畅度。
【评分标准】1分=能进行≥2分钟有条理的独白表达；1/2分=能说1-2分钟但组织较松散；0分=几句话就说完了或无法展开' 
WHERE domain='spontaneous_vocal' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能在书面表达（写作/打字）中展现出自发的创造性表达欲望——不是为了完成作业而写，而是自己想要表达点什么。
【测试方法】观察儿童的自愿写作行为（写日记、写故事、写便签给家人、在电脑/手机上打字表达等）。评估其自发书面表达的频率和动机。
【评分标准】1分=每周有≥2次自发书面表达；1/2分=每周1次或偶尔写写；0周=除非作业要求否则不写' 
WHERE domain='spontaneous_vocal' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能在表达中使用丰富的词汇变化和多样的句式结构，避免单调重复，展现出语言表达的成熟度。
【测试方法】收集儿童的自然语言样本（录音或转录500字以上的连续话语），分析：（1）词汇多样性（type-token ratio）（2）句式多样性（陈述/疑问/感叹/复合句的使用比例）（3）连接词和修饰语的使用。与同龄典型发展儿童对比。
【评分标准】1分=词汇和句式丰富度接近同龄水平；1/2分=有一定多样性但偏简单或重复度高；0分=词汇贫乏句式单一' 
WHERE domain='spontaneous_vocal' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在表达中适当地使用元语言（即关于语言的语言），如"我说错了""你的意思是不是...""这个词怎么说来着？"等。
【测试方法】在日常交流中留意儿童的元语言使用：（1）自我纠正（"不对，我应该说是..."）（2）澄清确认（"你的意思是...?"）（3）反思自己的表达（"我没说清楚"）。记录一周内的元语言使用次数。
【评分标准】1分=观察到≥5次恰当的元语言使用；1/2分=2-4次；0分=1次或以下' 
WHERE domain='spontaneous_vocal' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能在社交媒体或数字平台上有建设性地表达自己（如录制视频分享、写博客/朋友圈、在线聊天中的表达），展现出数字时代的表达能力。
【测试方法】如果年龄和环境适用，观察儿童在数字平台上的表达方式和质量。如果不适用（年龄太小或无接触），则评估其在"表演"或"展示"情境中的公开表达意愿和能力。
【评分标准】1分=能在公共/半公共场合自信地表达自己；1/2分=能表达但较为害羞或需要准备；0分=极度回避在任何形式的公众表达' 
WHERE domain='spontaneous_vocal' AND level=3 AND milestone_number=5;

-- ────────────────────────────────────────────────
-- 领域9：仿说 (Echoic) - 15项
-- ────────────────────────────────────────────────

-- Level 1 仿说
UPDATE public.vb_mapp_milestones SET description = 
'能模仿5个简单的单音或叠音（如"啊""哇""喵喵""滴滴""拜拜"）。
【测试方法】逐一发出5个简单声音，让儿童模仿。每个声音示范2-3次。观察口型和声音的模仿准确度。对于无口语儿童，任何接近的发声尝试都可算1/2分。
【评分标准】1分=5/5声音都能模仿（允许近似音）；1/2分=2-4/5能模仿；0分=0-1/5能模仿' 
WHERE domain='echoic' AND level=1 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个常见的双音/叠词（如"妈妈""爸爸""奶奶""球球""饭饭""灯灯"等）。
【测试方法】发出10个常用的双音节词，让儿童模仿。每个词示范1-2次。记录发音的准确度和清晰度。
【评分标准】1分=9/10以上能模仿；1/2分=5-8/10能模仿；0分=少于5/10' 
WHERE domain='echoic' AND level=1 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个包含不同声母/韵母组合的单音节词（如"猫""狗""车""书""苹果""香蕉"等），覆盖不同的发音位置。
【测试方法】选择覆盖唇音/舌面音/舌根音/鼻音/塞音等不同发音部位的10个单字，让儿童模仿。评估发音器官的运动范围和控制能力。
【评分标准】1分=9/10以上能模仿（发音清晰度可接受）；1/2分=5-8/10能模仿但部分发音不够清晰；0分=少于5/10' 
WHERE domain='echoic' AND level=1 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿10个多音节词/短语（2-4个音节，如"大西瓜""我要吃东西""公交车来了""好朋友一起玩"等）。
【测试方法】发出10个长度为2-4个音节的短语，让儿童模仿。重点评估能否保持音节的顺序和完整性。
【评分标准】1分=9/10以上能完整模仿；1/2分=5-8/10能模仿但常有音节遗漏；0分=少于5/10或只能模仿第一个音节' 
WHERE domain='echoic' AND level=1 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿5个简单的短语或短句（如"我要吃苹果""妈妈回来了""这是我的""打开电视"），句子长度3-5个字。
【测试方法】发出5个短句，让儿童模仿。评估能否保持句子结构和词序。每个句子只示范一次。
【评分标准】1分=4/5以上句子能基本模仿；1/2分=2-3/5能模仿部分内容；0分=最多模仿1-2个孤立的词' 
WHERE domain='echoic' AND level=1 AND milestone_number=5;

-- Level 2 仿说
UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含不同语法结构的句子（陈述句、疑问句、感叹句、祈使句），至少10种不同句型。
【测试方法】示范10种不同语法结构的句子让儿童模仿：（1）简单陈述（"他在吃饭"）（2）正在进行（"正在下雨"）（3）一般疑问（"你去吗？"）（4）特殊疑问（"这是什么？"）（5）祈使（"把书拿来"）（6）感叹（"太大了！"）（7）否定（"他不吃"）（8）"的"字结构（"红色的花"）（9）把字句（"把笔给我"）（10）被字句（"被他拿走了"）。
【评分标准】1分=9/10以上句型能正确模仿；1/2分=5-8/10；0分=少于5/10' 
WHERE domain='echoic' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含数词和量词的短语（"三个苹果""两只手""五本书""第一次"等），至少10个数量表达。
【测试方法】示范10个包含数字+量词+名词结构的短语，测试儿童对中文数量表达系统的模仿能力。
【评分标准】1分=9/10以上数量短语能正确模仿；1/2分=5-8/10正确；0分=少于5/10' 
WHERE domain='echoic' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含时间和空间概念的句子（"昨天我去公园了""桌子上面有一本书""我们在家里吃饭""星期六要去超市"等）。
【测试方法】示范10个包含时空概念（昨天/明天/上面/下面/里面/外面/这里/那里/家里/学校等）的句子让儿童模仿。
【评分标准】1分=9/10以上时空句子能正确模仿；1/2分=5-8/10；0分=少于5/10' 
WHERE domain='echoic' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿一段包含3-5个句子的简短对话或叙述（如一个小故事或一段日常事件的描述），保持语句间的连贯性和语调。
【测试方法】讲述一个包含4句话的迷你故事（"有一天，小兔子出门去找胡萝卜。它走啊走，遇到了一只小鸟。小鸟告诉它前面有好多胡萝卜。小兔子很高兴地跑过去了。"），让儿童尽量完整地模仿复述。
【评分标准】1分=能模仿80%以上的句子且基本保持原意和顺序；1/2分=能模仿50-79%；0分=只能模仿零散的词或第一句话' 
WHERE domain='echoic' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含连接词和逻辑关系的复句（"因为...所以...""虽然...但是...""先...然后...最后...""如果...就..."等）。
【测试方法】示范10个包含逻辑连接词的复句让儿童模仿。这对语言的逻辑思维能力要求较高。
【评分标准】1分=9/10以上复句能正确模仿（连接词不遗漏）；1/2分=5-8/10能模仿但常遗漏连接词或简化；0分=少于5/10或只能模仿简单句' 
WHERE domain='echoic' AND level=2 AND milestone_number=5;

-- Level 3 仿说
UPDATE public.vb_mapp_milestones SET description = 
'能模仿包含间接引语和复杂人称转换的长句（如"他说他想回家""老师告诉我们明天不用上学"）。
【测试方法】示范5个包含间接引语/人称转换的句子让儿童模仿。评估是否能正确处理视角和人称的变化。
【评分标准】1分=4/5以上正确处理人称转换；1/2分=2-3/5部分正确；0分=直接按原文模仿不做转换' 
WHERE domain='echoic' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿一首简短的儿歌或韵律诗（4-8句），保持基本的节奏和韵律感。
【测试方法】教唱/读一首新的简单儿歌（4-8句），示范2-3遍后让儿童尝试完整模仿。评估节奏感和韵律感的保持。
【评分标准】1分=能完整模仿且节奏基本准确；1/2分=能模仿大部分但节奏/韵律不稳定；0分=只能模仿零散的词句' 
WHERE domain='echoic' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = 
'能听到一个陌生的多音节新词（3音节以上）后在1-2次示范内准确模仿发音。
【测试方法】选择5个儿童肯定没听过的不常见词（可以是生僻字或编造的无义词），示范1-2次后让儿童模仿。测试其对新颖语音模式的快速学习和模仿能力。
【评分标准】1分=4/5以上新词在1-2次内能较准确地模仿；1/2分=2-3/5能模仿但需要更多次示范；0分=很难模仿全新语音模式' 
WHERE domain='echoic' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = 
'能在听到他人说话后，迅速提取关键词并以简洁的方式复述/转述核心信息（即"摘要性仿说"或paraphrase）。
【测试方法】说一段话（3-4个句子包含一个核心信息），让儿童"用你自己的话说说我刚才讲了什么"。测试5段不同内容的信息转述任务。
【评分标准】1分=4/5以上能抓住核心信息并用相近的意思复述；1/2分=2-3/5能部分提取关键信息；0分=只能逐字逐句地机械模仿' 
WHERE domain='echoic' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = 
'能模仿不同语体/风格的表达（正式与非正式、严肃与幽默、书面语与口语），展现出对语体差异的感知和模仿能力。
【测试方法】用不同的语体风格说出同一意思的内容（如正式："请您将窗户关闭"；非正式："把窗户关上嘛"），让儿童分别模仿这两种风格。测试5组不同语体的对比模仿。
【评分标准】1分=4/5以上能模仿出语体风格的差异；1/2分=2-3/5能部分体现差异；0分=不管用什么风格说的都模仿成一样的' 
WHERE domain='echoic' AND level=3 AND milestone_number=5;


-- ============================================================
-- 以下领域批量更新（因篇幅限制采用精简版格式）
-- 领域10-13 (Level 2 特有): 对话/互动语言, LRFFC, 句法语法, 阅读
-- 领域14 (Level 3 特有): 阅读
-- ============================================================

-- ────────────────────────────────────────────────
-- 领域10：对话/互动语言 (Intraverbal) - 10项 (L2 + L3)
-- ────────────────────────────────────────────────
UPDATE public.vb_mapp_milestones SET description = '能完成10个常见的短语填空（如儿歌"一闪一闪"→"亮晶晶"、"两只老虎"→"两只耳朵""跑得快"）。【测试方法】说出著名儿歌/童谣的前半句，留最后一个词或短语让儿童补全。共10个不同的填空。【评分标准】1分=10/10填空正确；1/2分=5-9/10；0分=少于5/10' WHERE domain='intraverbal' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '当被问到"你叫什么名字？"时，能正确说出自己的全名或日常称呼。扩展：也能回答"你几岁了？""你是男孩还是女孩？"等基本信息问题。【测试方法】在自然对话中提出上述个人信息问题，观察回答的准确性和适当性。共5个基本信息问题。【评分标准】1分=5/5正确回答个人信息；1/2分=3-4/5；0分=少于3/5' WHERE domain='intraverbal' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能完成25个不同的短语/句子填空任务，覆盖日常对话、儿歌、常见问答等多种形式。【测试方法】广泛取样25个填空任务：儿歌补全(5)+日常对话填空(10)+常见问答(5)+简单联想填空(5)。【评分标准】1分=23/25以上正确；1/2分=12-22/25；0分=少于12/25' WHERE domain='intraverbal' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能回答25个不同的"什么"类问题（内容涵盖颜色、形状、功能、特性等，不仅是物品名称）。【测试方法】提出25个"什么"类问题，确保不只问"这是什么"还包括"什么颜色""你在吃什么""什么声音""他在做什么"等多样化提问。【评分标准】1分=23/25以上正确回答；1/2分=12-22/25；0分=少于12/25' WHERE domain='intraverbal' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能回答25个不同的"谁""哪里"类问题（涉及人物识别和位置/地点概念）。【测试方法】提出12个"谁"问题和13个"哪里"问题。问题应在自然对话和图片/情境观察中提出。【评分标准】1分=23/25以上正确回答；1/2分=12-22/25；0分=少于12/25' WHERE domain='intraverbal' AND level=2 AND milestone_number=5;

-- L3 对话
UPDATE public.vb_mapp_milestones SET description = '能就给定话题维持5轮以上的一来一往对话（每人说话算一轮），话题不偏离且有实质性内容交流。【测试方法】选择儿童感兴趣的话题（如最喜欢的动画片、周末活动），尝试进行持续性对话。记录对话轮数和话题相关性。【评分标准】1分=能维持≥5轮有意义对话；1/2分=3-4轮或容易跑题；0分=≤2轮即中断' WHERE domain='intraverbal' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能回答"为什么"类问题，对事件原因给出简单合理的解释（至少10个不同的"为什么"问题）。【测试方法】在日常生活和故事情境中提出"为什么"问题，如"为什么要穿外套？""他为什么哭了？""为什么要刷牙？"。【评分标准】1分=8/10以上给出合理（不必完全准确）的解释；1/2分=4-7/10；0分=少于4/10' WHERE domain='intraverbal' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能回答"怎么/如何"类问题，对过程和方法进行描述（至少10个"怎么"问题）。【测试方法】提问"你怎么知道的？""怎么做蛋糕？""这个怎么玩？""怎么从这里到家？"。评估过程描述的能力。【评分标准】1分=8/10以上能描述基本过程；1/2分=4-7/10能部分描述；0分=少于4/10' WHERE domain='intraverbal' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能在对话中主动发起话题转移（不总是等对方提问），展现出对话的主动性和平等参与意识。【测试方法】在对话中故意留给儿童"话头"（停顿、说完自己的部分后等待），观察是否主动开启新话题或延伸当前话题。测试3段对话情境。【评分标准】1分=2/3以上情境能主动发起话题；1/2分=1/3能或需要明显提示；0分=完全被动等待提问' WHERE domain='intraverbal' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能进行"假设性"对话——讨论尚未发生的、想象中的或反事实的情境（"如果...会怎样？""假如你是他会怎么做？"）。【测试方法】提出5个假设性问题/情境，观察儿童的想象力和推理性回答质量。【评分标准】1分=4/5以上能进行有逻辑的假设性讨论；1/2分=2-3/5能参与但较浅显；0分=难以理解假设性情境' WHERE domain='intraverbal' AND level=3 AND milestone_number=5;


-- ────────────────────────────────────────────────
-- 领域11：听者功能特征类别 (LRFFC) - 10项 (L2 + L3)
-- ────────────────────────────────────────────────
UPDATE public.vb_mapp_milestones SET description = '在5个物件/图片组合中，根据声音从3张图片中正确选择5种动物或物品（如听到猫叫声选择猫的图片、听到救护车声选择救护车）。【测试方法】播放或模仿5种不同的声音（动物叫声+交通工具声），让儿童从每组3张图片中选出对应物。【评分标准】1分=5/5正确选择；1/2分=3-4/5；0分=少于3/5' WHERE domain='lrffc' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '在5个物件/图片组合中，根据功能填空指令"你吃___""你喝___""你坐在___上"选择5种不同的食物/饮料/家具。【测试方法】发出功能填空指令，让儿童从5个选项中选择符合该功能的物品。共15个功能填空任务。【评分标准】1分=14/15以上正确；1/2分=8-13/15；0分=少于8/15' WHERE domain='lrffc' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '从8个物品组合中，根据功能/特性/类别的指令正确选择物品完成25个填空任务（如"你踢___"选球、"红色的___"选对应物品）。【测试方法】发出25个基于功能/特性/类别的听者选择指令，物品组合扩大到8个以增加难度。【评分标准】1分=23/25以上正确；1/2分=12-22/25；0分=少于12/25' WHERE domain='lrffc' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '从10个物品组合中，根据功能/特性/类别回答"什么""哪个""谁"的问题正确选择25件物品。【测试方法】提出25个需要从10个物品中选择的听者反应问题，形式为特殊问句而非填空式。【评分标准】1分=23/25以上正确；1/2分=12-22/25；0分=少于12/25' WHERE domain='lrffc' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '在50%的功能/特性/类别听者反应任务中，能自发命名目标物（如问"你在用什么写字？"时一边指认铅笔一边说"铅笔"）。【测试方法】在进行50个LRFFC听者反应任务时，记录有多少次儿童在正确选择的同时或之后自发命名了目标物品。【评分标准】1分=≥50%任务伴随自发命名；1/2分=25-49%；0分=<25%' WHERE domain='lrffc' AND level=2 AND milestone_number=5;

-- L3 LRFFC
UPDATE public.vb_mapp_milestones SET description = '能根据多重特征（2个以上维度）的复合描述从大量选项中精确定位目标物品（如"给我红色的、圆形的、可以吃的东西"）。【测试方法】发出包含2-3个特征的复合选择指令，从12-15个物品中选择。共15个复合特征选择任务。【评分标准】1分=14/15以上正确；1/2分=8-13/15；0分=少于8/15' WHERE domain='lrffc' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能根据抽象功能/特性描述来选择物品（如"给我用来衡量温度的东西""哪个是用来通讯的？""哪种动物会飞还会生蛋"）。【测试方法】发出15个基于抽象功能和特性的选择指令，测试更高层次的类别推理能力。【评分标准】1分=13/15以上正确；1/2分=7-12/15；0分=少于7/15' WHERE domain='lrffc' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能根据否定性描述来选择物品（如"给我不是红色的""哪个不是水果？""不要圆形的"）。【测试方法】发出10个包含否定词的选择指令，观察儿童是否能理解并执行排除性选择。【评分标准】1分=9/10以上正确执行否定选择；1/2分=5-8/10；0分=少于5/10' WHERE domain='lrffc' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能根据比较关系描述来选择（如"给我更大的那个""哪个最重？""比较长的和比较短的"）。【测试方法】呈现成对的或一组可比的物品，发出10个基于比较关系的选择指令。【评分标准】1分=9/10以上正确选择；1/2分=5-8/10；0分=少于5/10' WHERE domain='lrffc' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能根据类别成员关系进行层级化选择（如"给我一种动物""给我一种哺乳动物""给我一种宠物"——逐步缩小范围）。【测试方法】发出10个涉及类别层级的选择指令，测试对包含关系和外延的理解。【评分标准】1分=9/10以上正确；1/2分=5-8/10；0分=少于5/10' WHERE domain='lrffc' AND level=3 AND milestone_number=5;


-- ────────────────────────────────────────────────
-- 领域12：句法与语法 (Syntax/Grammar) - 10项 (L2 + L3)
-- ────────────────────────────────────────────────
UPDATE public.vb_mapp_milestones SET description = '能使用基本的语法标记词，包括：的（形容词+名词）、了（完成体）、在/正在（进行体）、着（持续体），在自发语言中语法标记的正确使用率≥70%。【测试方法】收集200字以上的自然语言样本，分析语法标记的使用情况。【评分标准】1分=语法标记正确率≥70%；1/2分=40-69%；0分=<40%' WHERE domain='syntax_grammar' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能正确使用常见的介词短语（"在桌子上""从学校到我家里""和朋友一起"）来表达空间、时间、伴随关系。测试10个介词短语使用情境。【评分标准】1分=8/10以上介词使用正确；1/2分=4-7/10；0分=少于4/10' WHERE domain='syntax_grammar' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能使用否定词（"不""没有""别""不要"）正确构成否定句，否定词位置和用法基本正确。测试10个需要使用否定的情境。【评分标准】1分=8/10以上否定句构造正确；1/2分=4-7/10；0分=少于4/10' WHERE domain='syntax_grammar' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能使用"把"字句和"被"字句（或"让"字句）来描述致使和被动语义关系，至少各能造2个正确句子。测试5个需要使用把/被字句的情境。【评分标准】1分=4/5以上句子语法正确；1/2分=2-3/5；0分=少于2/5' WHERE domain='syntax_grammar' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能正确使用常见的量词（个/只/条/头/辆/本/支/把/朵/颗等）与名词搭配，至少15个不同的量词-名词组合。测试20个量词使用情境。【评分标准】1分=18/20量词使用正确；1/2分=10-17/20；0分=少于10/20' WHERE domain='syntax_grammar' AND level=2 AND milestone_number=5;

-- L3 句法语法
UPDATE public.vb_mapp_milestones SET description = '能正确构建和使用包含从句的复杂句（如关系从句"那个穿红衣服的男孩是我同学"、宾语从句"他说他想去动物园"、条件从句"如果不下雨我们就去公园"）。【测试方法】在自然交流或故事复述中观察复杂句的使用。也可通过句子组合/改写任务直接测试。测试10个复杂句构建任务。【评分标准】1分=8/10以上复杂句构建正确；1/2分=4-7/10；0分=少于4/10' WHERE domain='syntax_grammar' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能正确使用多种时态和体貌标记（已经/正在/将要/刚刚/快要/曾经/一直）来表达时间的细微差别。测试10个需要精确时间表达的情境。【评分标准】1分=8/10以上时态/体貌使用精确恰当；1/2分=4-7/10基本正确但有混淆；0分=少于4/10' WHERE domain='syntax_grammar' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能使用间接引语和引用标记（"他说...""我觉得...""妈妈告诉我..."）来报告他人的话语和思想。测试5个间接引语使用情境。【评分标准】1分=4/5以上间接引语结构正确（人称/时态/指示词转换恰当）；1/2分=2-3/5部分正确；0分=1/0或完全用直接引语替代' WHERE domain='syntax_grammar' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能在书面表达中使用规范的标点符号（句号、问号、感叹号、逗号、引号），标点使用正确率≥80%。【测试方法】分析儿童最近的书写样本（至少200字的作文或日记），检查标点符号的使用。【评分标准】1分=标点正确率≥80%；1/2分=50-79%；0分=<50%' WHERE domain='syntax_grammar' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能根据正式程度的需要调整语言风格（口语vs书面语、随意的vs正式的），展现出语体切换的意识。测试5种不同正式度情境下的表达。【评分标准】1分=4/5以上能恰当调整语言风格；1/2分=2-3/5有所调整但不稳定；0分=所有情境使用同一风格' WHERE domain='syntax_grammar' AND level=3 AND milestone_number=5;


-- ────────────────────────────────────────────────
-- 领域13：阅读 (Reading) - 10项 (L2 + L3)
-- ────────────────────────────────────────────────
UPDATE public.vb_mapp_milestones SET description = '能识别10个大写字母（不要求知道字母名，只需能区分/配对不同的字母形状）。【测试方法】呈现10个大写字母卡片，让儿童找出指定的字母或进行相同字母配对。【评分标准】1分=9/10以上正确识别；1/2分=5-8/10；0分=少于5/10' WHERE domain='reading' AND level=2 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能识别10个常见汉字或单词（如自己的名字、常见的标志文字"出口/洗手间/停止"等）。【测试方法】展示10个儿童环境中常见的汉字/词，测试其视觉识别能力。【评分标准】1分=9/10以上能识别；1/2分=5-8/10；0分=少于5/10' WHERE domain='reading' AND level=2 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能将5个字母/汉字与其对应的起始发音联系起来（如看到"苹果"的"苹"字知道发音是/p/或看到字母B知道发/b/音）。【测试方法】测试5个字母/汉字-发音的联结。【评分标准】1分=4/5以上联结正确；1/2分=2-3/5；0分=1/0或无法建立联结' WHERE domain='reading' AND level=2 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能跟读5个熟悉的单词/短句（如标志语、商标名、自己名字），即看到文字后能读出声音。【测试方法】展示5个儿童熟悉其读音的文字，让其读出。【评分标准】1分=4/5以上能正确跟读；1/2分=2-3/5；0分=1/0' WHERE domain='reading' AND level=2 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能从包含图片和文字的材料中，根据文字指令（如"指一指狗"）找到对应的图片，展现初步的文字理解能力。测试5个文字-图片匹配任务。【评分标准】1分=4/5以上正确匹配；1/2分=2-3/5；0分=1/0' WHERE domain='reading' AND level=2 AND milestone_number=5;

-- L3 阅读
UPDATE public.vb_mapp_milestones SET description = '能认读50个以上常见的汉字/单词（涵盖名词、动词、形容词等多种词性），看到文字能正确读出。【测试方法】使用适合年龄的字/词表进行认读测试，随机抽取50个。【评分标准】1分=45/50以上正确认读；1/2分=25-44/50；0分=少于25/50' WHERE domain='reading' AND level=3 AND milestone_number=1;

UPDATE public.vb_mapp_milestones SET description = '能阅读简单的句子（5-8个字）并理解其含义（通过指认图片/执行动作来验证理解）。测试10个句子的阅读理解。【评分标准】1分=8/10以上句子能正确阅读并理解；1/2分=4-7/10；0分=少于4/10' WHERE domain='reading' AND level=3 AND milestone_number=2;

UPDATE public.vb_mapp_milestones SET description = '能阅读一篇100字左右的短文（适龄的绘本/故事片段）并回答3-5个关于文章内容的理解问题。【测试方法】让儿童默读或朗读一篇短文后回答 comprehension questions。【评分标准】1分=80%以上理解问题回答正确；1/2分=50-79%；0分=少于50%' WHERE domain='reading' AND level=3 AND milestone_number=3;

UPDATE public.vb_mapp_milestones SET description = '能运用拼音方案（或其他注音系统）来认读未见过的汉字，展现出拼音解码能力。【测试方法】提供5个标注了拼音的生字，让儿童尝试认读。【评分标准】1分=4/5以上能通过拼音正确认读；1/2分=2-3/5；0分=1/0或不懂拼音' WHERE domain='reading' AND level=3 AND milestone_number=4;

UPDATE public.vb_mapp_milestones SET description = '能为了获取信息或乐趣而自发地进行阅读活动（拿书来看、翻阅杂志、看路牌/菜单等），每天自发阅读≥10分钟。【测试方法】通过家长/教师报告和观察记录儿童的自主阅读行为。【评分标准】1分=每天自发阅读≥10分钟且有一定持续性；1/2分=偶尔翻看但时间短（<10分钟）；0分=几乎不主动碰书/文字材料' WHERE domain='reading' AND level=3 AND milestone_number=5;


-- ============================================================
-- 完成提示
-- ============================================================
SELECT '✅ VB-MAPP 170项里程碑内容更新完成！' AS status;
SELECT COUNT(*) AS total_updated FROM public.vb_mapp_milestones 
WHERE description NOT LIKE '%参见VB-MAPP评估手册%';


NOTIFY pgrst, 'reload schema';
