-- C-PEP-3 发展 + 病理领域完整描述
-- 在 Supabase SQL Editor 粘贴执行
-- 前提：已执行 011_c_pep3_schema.sql

-- ============================================================
-- AI IEP Platform - C-PEP-3 评估内容完整描述更新脚本
-- 将"参见C-PEP-3评估手册"替换为真实的评估操作定义
-- 用法：在 Supabase SQL Editor 中运行（在 assessment_schema.sql 之后）
-- ============================================================

-- ============================================================
-- 第一部分：C-PEP-3 发展领域项目完整描述（97项）
-- 7大领域：模仿(10) 感知(13) 精细动作(10) 粗大动作(11) 手眼协调(14) 认知表现(20) 口语认知(19)
-- ============================================================

-- ────────────────────────────────────────────────
-- 领域1：模仿 (Imitation) - 10项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = 
'【简单动作模仿】能模仿评估者的简单手部动作（如拍手、挥手、指物、握拳、张开手掌等）。测试时评估者面对儿童示范动作，儿童需在5秒内做出相同或近似动作。每个动作示范2次。【评分】P=8/10以上通过；E=4-7个部分完成；F=少于4个' 
WHERE domain='imitation' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = 
'【口腔面部模仿】能模仿简单的口部-面部动作（如嘟嘴、伸舌头、吹气、眨眼、微笑等）。对语言发展前期的儿童特别重要，因为口部模仿是语音发展的基础。每个动作示范2次，观察肌肉运动的准确性。【评分】P=8/10通过；E=4-7；F=4以下' 
WHERE domain='imitation' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = 
'【使用物件的动作模仿】能模仿评估者用物品做出的简单功能性动作（如用杯子假装喝水、用梳子梳头、用笔在纸上画线、把积木放进盒子里）。物品先递给儿童再示范。共测10个物件操作模仿。【评分】P=8/10通过；E=4-7；F=4以下' 
WHERE domain='imitation' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = 
'【两步连锁动作模仿】能模仿包含两个有序步骤的动作序列（如拿起杯子→放到嘴边→说"啊"；拿起球→扔出去→说"走"）。两个步骤之间有逻辑关系。共测8组两步序列。【评分】P=6/8以上两步均完成；E=3-5组完成一步或两步均有尝试；F=2组以下' 
WHERE domain='imitation' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = 
'【粗大动作模仿】能模仿简单的大肢体运动（如跺脚、拍腿、摸头、转圈、站起来、坐下等）。评估者站在儿童面前示范，儿童需用整个身体来模仿。共测8个大动作。【评分】P=6/8以上通过；E=3-5；F=3以下' 
WHERE domain='imitation' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = 
'【精细动作模仿】能模仿需要手指精细控制的手部动作（如OK手势、数字手势1-5、竖大拇指、用手指"走路"、捏合动作）。这些动作对手指分化和精细运动规划有较高要求。共测8个精细动作。【评分】P=6/8以上通过；E=3-5；F=3以下' 
WHERE domain='imitation' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = 
'【声音/语音模仿】能模仿评估者发出的简单声音和单音节词。包括元音（啊、哦、咿）、叠音（妈妈、爸爸、奶奶）、常见拟声词（喵喵、汪汪、嘀嘀）。每个声音示范3次，记录最接近的一次。【评分】P=8/10声音模仿可接受（允许近似音）；E=4-7；F=4以下' 
WHERE domain='imitation' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = 
'【节奏模式模仿】能模仿简单的节律性动作模式（如有节奏地拍手——慢-慢-快-快-快；或敲鼓打出固定节拍）。先示范完整的节奏模式2遍，然后让儿童模仿。测试4种不同的节奏模式。【评分】P=3/4以上节奏基本准确；E=1-2/4大致能跟上但不够准确；F=0-1/4' 
WHERE domain='imitation' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = 
'【延迟模仿】能在示范结束后5-10秒仍然记得并模仿刚才看到的动作（工作记忆的初级形式）。示范一个动作后插入一个简短干扰活动（数1-5），然后让儿童模仿。测试6个延迟模仿任务。【评分】P=4/6以上正确；E=2-3/6；F=2以下' 
WHERE domain='imitation' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = 
'【自发模仿/观察学习】在日常活动中观察到别人做一个有用的动作后，自己在类似情境中也做同样的动作（不需要教学）。通过自然观察和家长报告评估两周内的自发模仿事件数量。【评分】P=观察到≥5次自发功能性模仿；E=2-4次；F=1次或以下' 
WHERE domain='imitation' AND item_number=10;

-- ────────────────────────────────────────────────
-- 领域2：感知 (Perception) - 13项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【视觉追踪】能用眼睛跟随移动的目标物体（如移动的手电筒光点、摇摆的铃铛、移动的球），追踪弧度至少180度（从一侧到另一侧）。分别测试水平方向、垂直方向和圆弧方向的运动追踪。【评分】P=3/3方向均能顺利追踪；E=1-2/3方向可以；F=3/3都困难或有异常眼球运动' WHERE domain='perception' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【视觉辨别-形状】能区分并匹配基本的几何形状（圆形、正方形、三角形）。给出一个目标形状作为样本，从3个选项中找出相同的。共测9组（3种形状各3次）。【评分】P=8/9以上正确；E=5-7/9；F=5以下' WHERE domain='perception' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【视觉辨别-大小】能区分"大的"和"小的"两组物品。呈现一对大小明显不同的同类物品（如一大一小两个球），让儿童指出"大的"或按指令拿"大的"。共测6对不同大小的配对。【评分】P=5/6以上正确；E=3-4/6；F=3以下' WHERE domain='perception' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【视觉辨别-颜色】能将相同颜色的物品进行分类或配对。提供红、蓝、黄三色各2件共6件物品，让儿童按颜色分组或进行同色配对。【评分】P=所有颜色都能正确归类/配对；E=1-2种颜色混淆；F=大部分无法正确区分颜色' WHERE domain='perception' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【图形-背景知觉】能从复杂背景中找到隐藏的目标图形（如在杂乱的线条图中找到特定形状、在一堆玩具中找到指定物品）。测试3个不同难度的图形-背景搜索任务。【评分】P=3/3均能找到；E=1-2/3能找到但耗时较长；F=0-1/3找到' WHERE domain='perception' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【空间位置感知】能理解基本的方位概念："上面/下面""里面/外面""前面/后面"。通过实物操作（把积木放在盒子上面/里面）和图片指认两种方式测试。共测12个空间概念任务。【评分】P=10/12以上正确；E=6-9/12；F=6以下' WHERE domain='perception' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【听觉定位】能转向声源的方向。当声音（铃声、叫名字、拍手）从儿童的左/右/后方发出时，能否准确地将头/身体转向声音来源。测试6个不同位置的声源定向。【评分】P=5/6以上准确定位；E=3-4/6大致方向对但不精确；F=3以下' WHERE domain='perception' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【听觉辨别】能区分不同的声音（动物叫声：猫vs狗；交通工具：车vs飞机；乐器：鼓vs铃；人声：妈妈vs爸爸的声音）。播放或现场发出成对的声音让儿童指出不同或说出是什么。共测10对声音辨别。【评分】P=8/10以上正确区分；E=5-7/10；F=5以下' WHERE domain='perception' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【触觉辨别】能仅通过触摸（不看）识别常见的物品质地和属性。让儿童闭眼或用遮挡板遮住视线，用手摸：（1）分辨粗糙/光滑（2）分辨软/硬（3）识别3种日常物品（梳子、杯子、勺子）。【评分】P=5/5触觉任务正确；E=3-4/5；F=3以下' WHERE domain='perception' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【本体觉 awareness】能感知自己身体在空间中的位置和身体各部位的相对关系。测试：（1）模仿触碰自己的身体部位（摸鼻子、摸耳朵）（2）判断自己肢体的位置（手臂是举起还是放下）（3）在不看的情况下将物品放到指定身体部位附近。【评分】P=4/5任务表现出良好的本体觉；E=2-3/5；F=2以下' WHERE domain='perception' AND item_number=10;

UPDATE public.c_pep3_developmental_items SET description = '【时间感知（顺序）】能理解事件的先后顺序——"先...后..."的基本时间关系。通过日常生活活动顺序图片（穿衣：先穿内衣→再穿外衣→最后穿鞋；吃饭：先洗手→再吃饭→最后擦嘴）测试。共测3套事件顺序。【评分】P=3/3顺序排列正确；E=1-2/3部分正确；F=0-1/3' WHERE domain='perception' AND item_number=11;

UPDATE public.c_pep3_developmental_items SET description = '【部分-整体知觉】能识别整体中缺少的部分（如人脸图缺少眼睛、拼图缺了一块）以及理解部分与整体的关系（车轮是汽车的一部分）。测试6个部分-整体知觉任务。【评分】P=5/6正确识别缺失部分或部分-整体关系；E=3-4/6；F=3以下' WHERE domain='perception' AND item_number=12;

UPDATE public.c_pep3_developmental_items SET description = '【恒常性知觉】能理解物体的大小/形状/颜色不会因观察角度或距离变化而改变的本质属性。如：同一辆车无论近看还是远看都是车；同一个圆无论是正面还是倾斜都是圆。测试4种恒常性情境。【评分】P=3/4以上展现出恒常性理解；E=1-2/4；F=0-1/4' WHERE domain='perception' AND item_number=13;

-- ────────────────────────────────────────────────
-- 领域3：精细动作 (Fine Motor) - 10项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【全掌抓握】能用手掌整体抓握住一个中等大小的物品（如乒乓球大小的积木），并维持抓握至少3秒。测试5次抓握不同物品的机会。【评分】P=5/5成功抓握并保持；E=3-4/5；F=3以下' WHERE domain='fine_motor' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【拇指-食指对捏（二指捏）】能用拇指和食指指尖捏起小物品（如葡萄干、小珠子、小饼干碎屑），展现精细的指尖分化能力。测试5个小物品的二指捏取。【评分】P=5/5成功用二指捏起；E=3-4/5用全掌或其他方式凑合；F=3以下' WHERE domain='fine_motor' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【释放/放下】能有意识地松开手中的物品将其放到指定位置（不是扔掉而是"放"下）。给儿童一个物品让其放到桌子上/篮子里。测试5次放置动作。【评分】P=5/5能主动控制性地放开；E=3-4/5有时需要帮助张开手指；F=3以下（紧握不放或只能甩脱）' WHERE domain='fine_motor' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【双手协作】能双手配合使用（一手固定、一手操作），如：一手扶着纸一手画画、一手拿着瓶子一手拧盖子、双手一起撕纸。测试5种双手协作任务。【评分】P=4/5以上双手能有效配合；E=2-3/5有配合意识但不熟练；F=2以下主要用单手' WHERE domain='fine_motor' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【串珠/穿绳】能将绳子穿过直径约1.5cm的珠子孔，连续穿3颗以上珠子不脱落。测试用粗绳和大孔珠子开始，记录30秒内能穿的珠子数量。【评分】P=30秒内穿≥3颗珠子；E=穿1-2颗或需要大量辅助；F=0颗或无法对准孔眼' WHERE domain='fine_motor' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【翻书】能用手指（通常是食指和拇指）一页一页地翻书，而不是一次翻好几页或只能用手掌扒拉。给一本每页稍厚的图画书，观察翻页的方式和质量。【评分】P=能逐页用手指翻阅≥5页；E=偶尔能做到但常多页一起翻；F=无法一页一页翻' WHERE domain='fine_motor' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【使用剪刀】能正确持剪刀并沿直线剪开纸张（偏差不超过1cm），剪出一段约10cm长的切口。提供安全剪刀和画有直线的纸。【评分】P=基本沿直线剪切且偏差<1cm；E=能操作剪刀但偏离较大或断续剪；F=不会用剪刀或只能戳破纸' WHERE domain='fine_motor' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【涂色/填色】能在给定边界内（不超过边界2mm）对一个约5cm大小的简单图形（圆形/正方形）进行涂色。涂色覆盖面积应达到图形区域的70%以上。【评分】P=涂色基本在边界内且覆盖率≥70%；E=部分出界或覆盖率50-69%；F=严重出界或覆盖率<50%' WHERE domain='fine_motor' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【画图形】能临摹或画出基本的几何图形——至少能画出一个圆形和一个十字形（两条相交的直线）。不给手把手指导，只提供范例。【评分】P=两个图形均可辨认；E=一个可辨认另一个有雏形；F=两个都无法辨认或拒绝画' WHERE domain='fine_motor' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【书写前技能/描红】能沿着虚线/点线轨迹描画字母或简单图案（如描画自己的名字的大写首字母、描画波浪线）。测试3个描红任务。【评分】P=2/3以上描红基本在线上；E=1/3或偏离较大；F=完全无法沿线描画' WHERE domain='fine_motor' AND item_number=10;

-- ────────────────────────────────────────────────
-- 领域4：粗大动作 (Gross Motor) - 11项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【头部控制】俯卧位时能抬起头部并保持至少30秒（Tummy time head lift）；仰卧位时能抬起头部看脚的方向。对婴儿/低功能儿童尤其重要。【评分】P=两种体位都能抬头保持≥30秒；E=一种体位能做到或时间较短；F=两种体位都难以做到' WHERE domain='gross_motor' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【翻身】能独立地从仰卧位翻到侧卧位再到俯卧位（及反方向翻身）。测试两个方向的翻身各1次。【评分】P=两个方向都能独立完成；E=一个方向独立另一个需轻微帮助；F=两个方向都需要显著辅助或无法完成' WHERE domain='gross_motor' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【坐姿】能独立维持坐姿（无靠背支撑）至少30秒不倒。坐姿可以是地板坐（印度式坐/长坐）也可以是椅子上坐。观察躯干控制的稳定性。【评分】P=坐姿稳定维持≥30秒；E=10-29秒或偶有倾倒但能自我纠正；F=<10秒或持续倾倒' WHERE domain='gross_motor' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【爬行】能用手膝交替协调地向前爬行至少3米远。观察爬行的协调性和效率——是同侧手脚还是对侧交替？是否拖腹部？【评分】P=协调的对侧交替爬行≥3米；E=能爬但协调性差（同侧/拖腹）/距离不足3米；F=不会爬或只用腹部蠕动' WHERE domain='gross_motor' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【站立】能从其他姿势（坐/蹲）独立站起来并在无支撑的情况下维持站立姿势≥10秒。测试从地面站起和维持站立两部分。【评分】P=能独立站起且站立维持≥10秒；E=能站起但维持<10秒或需轻微支撑；F=无法独立站起或站立维持<3秒' WHERE domain='gross_motor' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【行走】能独立行走至少10步远不摔倒，步态基本稳定。观察行走时的平衡性、步幅均匀性、是否踮脚或脚尖着地等异常步态。【评分】P=行走10步以上步态基本正常；E=能走但步态不稳/踮脚/易摔倒；F=不能独立行走或≤3步即倒' WHERE domain='gross_motor' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【跑跳】能双脚同时离地跳跃（原地跳）至少3次；能以跑步方式移动（非快速行走而是真正的双腾空期跑动）。分别测试跳和跑。【评分】P=跳和跑都能完成；E=只能完成其中一种；F=两者都不能完成' WHERE domain='gross_motor' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【上下楼梯】能交替双脚上下楼梯（而非双脚同阶蹦）。一手扶栏杆辅助也可接受。测试上行和下行各一段（5-8级台阶）。【评分】P=上下楼梯均为交替脚步（可扶栏）；E=双脚同阶但能完成/或只有单向能交替脚；F=无法上下楼梯或需成人牵领' WHERE domain='gross_motor' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【接球】能伸出双手接住从约2米处轻轻抛过来的大球（直径约20cm的沙滩球或海绵球）。测试5次抛接机会。【评分】P=3/5以上能用手接住；E=1-2/5能接住或用身体抱住；F=0/5或躲避/不伸手' WHERE domain='gross_motor' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【踢球】能助跑后用脚踢出一个静止的球（使球前进至少1米）。不需要精准度，只要有明显的踢的动作和球的位移即可。测试3次踢球机会。【评分】P=2/3以上有明显踢球动作且球有位移；E=1/3或踢的动作不明显；F=0/3或完全不知道用脚踢' WHERE domain='gross_motor' AND item_number=10;

UPDATE public.c_pep3_developmental_items SET description = '【平衡能力】能在线上（地上贴一条胶带即可）走≥5步不掉下来；或能单脚站立≥3秒。两项任选其一或都测取较好的一项。【评分】P=线上走路≥5步或单脚站立≥3秒；E=线上走2-4步或单脚站1-2秒；F=线上走≤1步或无法单脚站' WHERE domain='gross_motor' AND item_number=11;


-- ────────────────────────────────────────────────
-- 领域5：手眼协调 (Eye-Hand Coordination) - 14项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【伸手够物】看到放在面前的物品（在手臂触及范围内）后能准确地伸手抓住它。测试5个不同位置的物品（中线偏左/右/高/低）。【评分】P=5/5都能准确伸手抓到；E=3-4/5有些偏差但最终能拿到；F=3以下或伸手方向明显偏离' WHERE domain='eye_hand_coordination' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【物体投入】能将物品（如方块/硬币/大珠子）投入对应形状/大小的开口容器中（投币口、形状分类盒）。测试5次投放入任务。【评分】P=4/5以上首次尝试即成功投入；E=2-3/5首次成功或需调整后成功；F=1/0或反复尝试仍难以投入' WHERE domain='eye_hand_coordination' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【套圈/投掷目标】能将套圈套在距离50-100cm远的立柱上，或将沙包投进目标区域（约50cm远处的一个圈/筐内）。测试5次投掷/套圈机会。【评分】P=3/5以上命中目标；E=1-2/5接近目标；F=0/5或方向偏差很大' WHERE domain='eye_hand_coordination' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【形状嵌板】能将3-5个不同形状的嵌块正确放入对应的形状空洞中（木质/塑料形状嵌板）。不给匹配提示，让儿童自己试。限时3分钟。【评分】P=所有嵌块均能正确嵌入；E=部分正确或经尝试后成功；F=多数放错位置或无法完成' WHERE domain='eye_hand_coordination' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【简单拼图（4-6片）】能完成由4-6片组成的简单拼图任务（图案为熟悉的单一物体如苹果/房子/脸）。不给边缘提示或参考图提示。【评分】P=5分钟内独立完成；E=需较长时间或需1-2次提示；F=5分钟内无法完成' WHERE domain='eye_hand_coordination' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【积木搭建-塔】能将10块木制积木叠成一个相对稳定的塔（不倒塌）。一块一块往上搭，观察手眼协调和力度控制。【评分】P=能搭10块不倒；E=能搭5-9块或10块但经常倒；F=搭不到5块就倒或无法叠搭' WHERE domain='eye_hand_coordination' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【积木搭建-桥/阶梯】能按照模型（照片或当面示范）搭建简单的积木结构（如3块搭一座桥、6块搭一个阶梯）。示范后移走模型让儿童复制。【评分】P=结构基本还原且稳固；E=大致像但有明显偏差或不稳；F=无法复制结构' WHERE domain='eye_hand_coordination' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【拧瓶盖】能拧开直径约3-5cm的塑料螺旋瓶盖（不需太紧，成人能轻松拧开的程度）。测试3个不同的瓶子。【评分】P=2/3以上能独立拧开；E=1/3或需要多次尝试/拧得较松才成功；F=0/3或只会拔/拉而不会旋转拧' WHERE domain='eye_hand_coordination' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【折纸-对折】能将一张纸沿中线对齐折叠并压出折痕，两边基本对齐（偏差不超过1cm）。测试2-3次对折操作。【评分】P=对折基本整齐（2/3以上符合标准）；E=能折但对不齐（偏差>1cm）；F=无法完成对折动作' WHERE domain='eye_hand_coordination' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【粘贴】能将贴纸/胶水粘贴物贴在指定区域内（如将圆形贴纸贴在一个画的圆圈内）。测试3次粘贴任务。【评分】P=2/3以上贴在指定区域内；E=1/3或贴偏但沾上了；F=贴不上或粘到别的地方去' WHERE domain='eye_hand_coordination' AND item_number=10;

UPDATE public.c_pep3_developmental_items SET description = '【倒水/倾倒】能将水（或豆子/沙子）从一个容器倒入另一个容器而不洒出太多（洒出量不超过总量的20%）。测试3次倒水任务。【评分】P=2/3以上洒出量<20%；E=1/3或洒出较多但基本完成了；F=大量洒出或无法控制倾倒' WHERE domain='eye_hand_coordination' AND item_number=11;

UPDATE public.c_pep3_developmental_items SET description = '【使用工具-勺子】能正确持勺并将食物（或豆子模拟食物）从碗中送到嘴里而不洒落太多。观察勺子的握法和操作的流畅度。【评分】P=握姿基本正确且能送入口中；E=握姿不对但功能可用或洒落较多；F=无法有效使用勺子' WHERE domain='eye_hand_coordination' AND item_number=12;

UPDATE public.c_pep3_developmental_items SET description = '【使用工具-铅笔】能以 tripod grip（三指捏）或接近成熟的握笔方式握铅笔/蜡笔并进行涂画。重点评估握姿是否有利于后续的书写发展。【评分】P=握姿接近成熟的三指捏；E=全掌握或 fist grip 但能操作；F=握姿明显异常影响操作' WHERE domain='eye_hand_coordination' AND item_number=13;

UPDATE public.c_pep3_developmental_items SET description = '【钉板/插棍】能将钉子/插棍插入钉板上对应的孔中（不一定按图案自由插即可）。测试插入5根钉子的速度和准确性。【评分】P=5根均能顺利插入；E=3-4根能插入但较慢或需要调整角度；F=2根以下或无法对准孔眼' WHERE domain='eye_hand_coordination' AND item_number=14;


-- ────────────────────────────────────────────────
-- 领域6：认知表现 (Cognitive Performance) - 20项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【客体永久性】知道被藏起来的物品依然存在（即使看不见了还在那里）。用毛巾盖住正在玩的玩具，观察儿童是否会掀开毛巾找。测试3次藏匿情境。【评分】P=3/3都会主动寻找藏起来的物品；E=1-2/3会找；F=0/3或不感兴趣' WHERE domain='cognitive_performance' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【手段-目的性（工具使用）】为了达到一个目标能使用中介工具/物品（如想拿到高处的玩具时搬椅子踩上去；想喝水时指着杯子示意或自己去拿）。测试3个需要间接手段才能达标的情境。【评分】P=2/3以上能主动使用适当手段；E=1/3或在提示后能做到；F=0/3直接想要或放弃' WHERE domain='cognitive_performance' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【因果关系理解】能理解简单的因果联系（如按开关灯就亮了、推球球就滚了、按按钮玩具就响了）。展示3个因果关系装置让儿童操作并观察其探索行为。【评分】P=3/3都能发现并利用因果关系；E=1-2/3能在引导下发现；F=0/3或只是随机操作' WHERE domain='cognitive_performance' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【配对/相同概念】能找出两个完全相同的物品/图片。桌上摆3-5件物品含一对相同的，让儿童"找出一样的"。共测10组配对。【评分】P=9/10以上正确配对；E=5-8/10；F=5以下' WHERE domain='cognitive_performance' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【分类/归属】能将混合在一起的物品按类别分成两组（如把食物和非食物分开；把动物和交通工具分开）。给一堆混合物品和两个分类框/区域。【评分】P=分类正确率≥80%；E=50-79%正确；F=<50%或随机放置' WHERE domain='cognitive_performance' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【排序（大小/长短）】能将3-5个物品按大小或长短顺序排列（从大到小或从小到大）。给一套排序材料（3-5个渐变的物品）让儿童排好。【评分】P=序列完全正确；E=大部分正确但有1-2处错误；F=随机排列或无法理解排序规则' WHERE domain='cognitive_performance' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【一一对应】能为每组物品配对一个对应物（如给每个娃娃发一只杯子、给每朵花配一片叶子）。给3-5组需要一一对应的材料。【评分】P=所有组都正确一一对应；E=1-2组出错；F=多组出错或无法理解概念' WHERE domain='cognitive_performance' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【数概念（5以内）】能点数5以内的物品集合并说出总数（"一共X个"）。给一组3-5个物品让儿童边数边说。测试3组不同数量的集合。【评分】P=3组均能手口一致点数并报出正确总数；E=能点数但总数常错或手口不一致；F=无法进行有序点数' WHERE domain='cognitive_performance' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【比较概念（多少/一样多）】能看出哪边多/少/一样多。呈现两排物品（一边3个一边5个；或两边各4个），问"哪个多？""一样多吗？"。【评分】P=3/3比较判断正确；E=1-2/3正确；F=0-1/3或随机回答' WHERE domain='cognitive_performance' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【模式/规律识别】能延续一个简单的ABAB规律模式（如红-蓝-红-蓝-?下一个放什么颜色的？；或大-小-大-小-?）。测试3种不同的ABAB模式。【评分】P=3/3都能正确延续模式；E=1-2/3；F=0-3/3或每次都放同样的' WHERE domain='cognitive_performance' AND item_number=10;

UPDATE public.c_pep3_developmental_items SET description = '【问题解决-简单】遇到简单问题时能尝试2种以上的解决方法。如：想要的玩具够不着怎么办？（搬凳子/找人帮忙/用别的东西拨）。设计3个简单的问题情境。【评分】P=2/3以上情境能主动尝试解决方法；E=1/3或在提示下想到办法；F=0/3直接放弃或发脾气' WHERE domain='cognitive_performance' AND item_number=11;

UPDATE public.c_pep3_developmental_items SET description = '【象征游戏/假装游戏的认知成分】在游戏中用一个物品代表另一个物品（如用香蕉当电话、用木块当车子），展现出符号表征能力。提供中性材料观察自发的象征性使用。【评分】P=能自发使用2种以上象征性替代；E=在示范/提示后能使用1-2种；F=仅限于物品的实际功能使用' WHERE domain='cognitive_performance' AND item_number=12;

UPDATE public.c_pep3_developmental_items SET description = '【图画/图片理解】能看懂简单图画的内容——指出图中的人物/物品/动作（如"谁在吃东西？""小狗在哪里？"）。出示3幅情景图画提问。【评分】P=大多数问题回答正确（≥80%）；E=部分正确（50-79%）；F=多数答错或无法关注画面内容' WHERE domain='cognitive_performance' AND item_number=13;

UPDATE public.c_pep3_developmental_items SET description = '【记忆广度（听觉）】能复述3-5位的数字串/词语串（如"我说3-7-5-1你说"或"苹果-香蕉-狗-汽车你重复"）。测试3个长度递增的序列。【评分】P=能复述4位及以上长度的序列；E=能复述2-3位；F=仅1位或无法复述' WHERE domain='cognitive_performance' AND item_number=14;

UPDATE public.c_pep3_developmental_items SET description = '【记忆广度（视觉）】能记住并复现刚才看过的一组物品的位置/顺序（如展示了4张卡片朝下摆放，翻开看一遍后盖上，还记得每张下面是什么）。测试2次视觉记忆任务。【评分】P=2次都能回忆出大部分信息（≥75%）；E=1次较好或回忆率50-74%；F=回忆率<50%' WHERE domain='cognitive_performance' AND item_number=15;

UPDATE public.c_pep3_developmental_items SET description = '【注意力集中】能持续专注于一项有趣的任务（如拼图、看绘本、搭积木）至少10分钟不被无关刺激打断。通过自然观察或半结构化任务测量。【评分】P=专注时长≥10分钟；E=5-9分钟；F=<5分钟或频繁转移注意力' WHERE domain='cognitive_performance' AND item_number=16;

UPDATE public.c_pep3_developmental_items SET description = '【注意分配/切换】能在两个任务之间灵活切换注意力（如听到信号就从搭积木转换到收拾玩具）。测试3个注意切换情境。【评分】P=2/3以上能顺畅切换；E=1/3或切换较慢但最终能转过来；F=0/3卡在前一个任务中无法转换' WHERE domain='cognitive_performance' AND item_number=17;

UPDATE public.c_pep3_developmental_items SET description = '【计划能力】在做一件新事情之前能先观察/思考一会儿而不是立刻动手（显示出初步的计划性行为）。给一个新的中等难度任务（未见过的新拼图/新玩具），观察第一反应。【评分】P=会先观察/思考再动手（≥2/3任务中表现出）；E=偶尔会先看一眼；F=立即动手没有观察阶段' WHERE domain='cognitive_performance' AND item_number=18;

UPDATE public.c_pep3_developmental_items SET description = '【概念学习迁移】学会了一个概念后能在新的材料和情境中应用（如学会了"红色"配对后能认出新看到的红色衣服也是红色的）。测试已习得概念的泛化应用。【评分】P=在2种以上新材料/新情境中能正确应用已学概念；E=仅在1种新情境中能应用或需要提醒；F=只在原教学情境中会用' WHERE domain='cognitive_performance' AND item_number=19;

UPDATE public.c_pep3_developmental_items SET description = '【创造性思维发散】对于开放式问题（如"这块积木可以变成什么？"）能想出2种以上不同的答案/用途。测试2个开放性问题。【评分】P=每个问题能说出≥3种不同想法；E=每个问题能说出1-2种想法；F=只能说1种或说不出' WHERE domain='cognitive_performance' AND item_number=20;


-- ────────────────────────────────────────────────
-- 领域7：口语认知 (Verbal Cognition) - 19项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_developmental_items SET description = '【对名字的反应】听到自己的名字时有明确的反应（转头/停下手头动作/看向说话者/口头回应"哎"/走向呼唤者）。在不同活动中测试3次叫名字。【评分】P=3/3都有明确反应；E=1-2/3有反应；F=0-1/3有反应或反应极迟缓' WHERE domain='verbal_cognition' AND item_number=1;

UPDATE public.c_pep3_developmental_items SET description = '【执行简单指令】能执行一步的简单语言指令（过来、坐下、给我、打开、指一指[X]等）。共测10条不同的一步指令。【评分】P=9/10以上正确执行；E=5-8/10；F=5以下' WHERE domain='verbal_cognition' AND item_number=2;

UPDATE public.c_pep3_developmental_items SET description = '【物品指认（选择）】听到物品名称后能从3-5个选项中指出正确的物品。共测15个不同物品的听者指认任务。【评分标准】P=13/15以上正确；E=8-12/15；F=8以下' WHERE domain='verbal_cognition' AND item_number=3;

UPDATE public.c_pep3_developmental_items SET description = '【身体部位指认】听到身体部位名称后能指向自己或他人对应的身体部位（眼、耳、鼻、口、手、脚、肚子、头等）。测试8个常见身体部位。【评分】P=7/8以上正确指认；E=4-6/8；F=4以下' WHERE domain='verbal_cognition' AND item_number=4;

UPDATE public.c_pep3_developmental_items SET description = '【动作理解】听到动作动词后能做出相应动作或指出做该动作的人/图片（如"睡觉"—躺下/"吃"—做吃的动作/"跳舞"—扭动身体）。测试10个常见动作的理解。【评分】P=8/10以上正确理解并执行/指认；E=4-7/10；F=4以下' WHERE domain='verbal_cognition' AND item_number=5;

UPDATE public.c_pep3_developmental_items SET description = '【两步指令】能执行包含两个步骤的语言指令（先把X给我再把Y放进盒子里）。指令只说一次。共测5个不同的两步连锁指令。【评分】P=4/5以上完整执行两步；E=2-3/5能执行大部分；F=最多完成第一步' WHERE domain='verbal_cognition' AND item_number=6;

UPDATE public.c_pep3_developmental_items SET description = '【形容词理解（大小/颜色）】能根据形容词修饰语选出正确的物品（"给我红色的""拿那个大的""我要软的那个"）。测试12个形容词-名词组合的选择任务。【评分】P=10/12以上正确；E=6-9/12；F=6以下' WHERE domain='verbal_cognition' AND item_number=7;

UPDATE public.c_pep3_developmental_items SET description = '【方位词理解】能根据方位指示正确放置或选择物品（"放在桌子上面/下面/里面/旁边""把积木放到红色盒子前面"）。测试8个方位词理解任务。【评分】P=7/8以上正确；E=4-6/8；F=4以下' WHERE domain='verbal_cognition' AND item_number=8;

UPDATE public.c_pep3_developmental_items SET description = '【类别理解】能将物品按类别分组（动物/食物/交通工具/衣物/家具等）。给混合物品让儿童分类或"把所有的[某类]拿出来"。测试5种类别。【评分】P=4/5以上类别分类正确；E=2-3/5；F=2以下' WHERE domain='verbal_cognition' AND item_number=9;

UPDATE public.c_pep3_developmental_items SET description = '【命名/表达性词汇】看到物品/图片能说出名称。测试20个常见物品/图片的自发命名（不给"这是什么"的提示，等待自发命名或用"告诉我关于这个东西的事"引出）。【评分】P=16/20以上能正确命名；E=10-15/20；F=10以下' WHERE domain='verbal_cognition' AND item_number=10;

UPDATE public.c_pep3_developmental_items SET description = '【动作命名】看到动作（示范或视频/图片中的动作）能说出动作名称（跑/跳/吃/睡/哭/笑/抱/亲/扔/推等）。测试10个动作命名。【评分】P=8/10以上正确命名；E=4-7/10；F=4以下' WHERE domain='verbal_cognition' AND item_number=11;

UPDATE public.c_pep3_developmental_items SET description = '【简单问答】能回答关于自身和环境信息的简单问题（你叫什么？几岁了？这是哪里？这是什么颜色？妈妈在哪里？）。测试10个简单问答。【评分】P=8/10以上正确回答；E=4-7/10；F=4以下' WHERE domain='verbal_cognition' AND item_number=12;

UPDATE public.c_pep3_developmental_items SET description = '【句子理解（语法）】能理解比单词/短语更复杂的句子含义并通过行动表现出来。如"先穿袜子再穿鞋子""把红色的给妈妈蓝色的留给自己"这类含有关联词/比较/条件的句子。测试5个复杂句理解。【评分】P=4/5以上正确理解和执行；E=2-3/5部分正确；F=1/0或只能理解最后一个词' WHERE domain='verbal_cognition' AND item_number=13;

UPDATE public.c_pep3_developmental_items SET description = '【故事理解】听完一个简单的故事（3-5句话）后能回答2-3个关于故事内容的理解性问题（主角是谁？发生了什么？后来怎么样了？）。测试2个短故事。【评分】P=2个故事的问题大多答对（≥70%正确率）；E=部分正确（40-69%）；F=答对率<40%或无法回答' WHERE domain='verbal_cognition' AND item_number=14;

UPDATE public.c_pep3_developmental_items SET description = '【自主表达需求】在有动机的情况下能用语言/手势/图片等方式表达自己的需求（要吃/喝/玩/不要/帮忙等）。观察日常情境中的自发沟通行为。【评分】P=每天有≥10次自发性需求表达且方式多样；E=3-9次或方式单一；F=3次以下或几乎不自发表达' WHERE domain='verbal_cognition' AND item_number=15;

UPDATE public.c_pep3_developmental_items SET description = '【对话参与】能与成人进行一来一往的简单对话（至少3个来回轮替），话题保持在相关范围内。通过自然交流或半结构化访谈测试。【评分】P=能维持≥3轮对话且话题相关；E=1-2轮即中断或容易跑题；F=无法形成对话轮替' WHERE domain='verbal_cognition' AND item_number=16;

UPDATE public.c_pep3_developmental_items SET description = '【社交语言使用（打招呼/告别/礼貌用语）】能在适当的时机使用"你好/再见/谢谢/请/对不起"等社交性语言。通过自然情境和角色扮演测试。【评分】P=4/5以上情境能恰当使用；E=2-3/5或在提示后使用；F=1/0或完全不使用' WHERE domain='verbal_cognition' AND item_number=17;

UPDATE public.c_pep3_developmental_items SET description = '【叙述能力】能按顺序描述一个刚刚发生的事件或一幅图画中的场景（包含人物、动作、结果等要素）。测试2个叙述任务（一件经历过的事+一幅画）。【评分】P=2个叙述都包含关键要素且有基本顺序；E=1个较好或要素不完整；F=两个都支离破碎或无法叙述' WHERE domain='verbal_cognition' AND item_number=18;

UPDATE public.c_pep3_developmental_items SET description = '【高级语言推理】能回答"为什么"类问题（对原因的解释）、进行简单的预测（"你觉得接下来会发生什么？"）、表达自己的观点/偏好并说明理由。测试5个高级语言思维任务。【评分】P=4/5以上能给出有理由的回答；E=2-3/5有初步的理由表达；F=0-1/5或无法说明理由' WHERE domain='verbal_cognition' AND item_number=19;


-- ============================================================
-- 第二部分：C-PEP-3 病理领域项目完整描述（57项）
-- 5大领域：情感(11) 人际关系(11) 材料游戏(8) 感觉模式(16) 语言(11)
-- ============================================================

-- ────────────────────────────────────────────────
-- 病理领域1：情感 (Affect) - 11项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_pathological_items SET description = 
'【情感表达的恰当性】儿童的情感表达是否与情境相匹配？（如开心的事情表现出高兴、受伤了表现出不适/难过）。评估在各种情绪诱发情境中的情感反应质量。
A=情感表达基本恰当且多样化；M=有些情境反应不当或不敏感；S=普遍情感反应淡漠或反应与情境严重不符' 
WHERE domain='affect' AND item_number=1;

UPDATE public.c_pep3_pathological_items SET description = 
'【情感调节能力】当出现负面情绪（挫折、失望、愤怒）时能否通过适当方式自我调节恢复平静？还是长时间陷入负面状态或爆发？
A=多数情况下能在5-10分钟内自我调节恢复；M=需要较长的时间（15-30分钟）或需要成人协助；S=频繁/长时间的负面情绪爆发且难以安抚' 
WHERE domain='affect' AND item_number=2;

UPDATE public.c_pep3_pathological_items SET description = 
'【情感表达的强度】情感表达的强烈程度是否在适度范围内？是否有过度激烈（如极度兴奋到失控）或过度平淡（几乎没有情绪起伏）？
A=情感强度适中与环境刺激相称；M=偶有过强或过弱的表达但总体尚可；S=情感强度经常失调（过于极端或过于平淡）' 
WHERE domain='affect' AND item_number=3;

UPDATE public.c_pep3_pathological_items SET description = 
'【对他人的情感回应性】当他人（尤其是照顾者/同伴）表现出情感时（哭泣、大笑、害怕），是否能注意到并有相应的情感共鸣/回应？
A=通常能注意到并做出适当的回应性情感反应；M=有时能注意到但回应较弱；S=很少关注他人情感或对他人情感毫无反应' 
WHERE domain='affect' AND item_number=4;

UPDATE public.c_pep3_pathological_items SET description = 
'【焦虑/恐惧反应】是否存在过度或不合理的恐惧和焦虑反应？（如对无害的物体/声音/情境表现出强烈的恐惧回避）
A=恐惧反应在正常年龄范围内且不过度；M=有一些超出年龄的恐惧但可控；S=存在广泛或严重的恐惧/焦虑干扰日常功能' 
WHERE domain='affect' AND item_number=5;

UPDATE public.c_pep3_pathological_items SET description = 
'【愉悦感的体验和表达】是否能体验到快乐/愉悦并能通过表情/笑声/语言表达出来？
A=能经常自然地体验和表达愉悦；M=偶尔有愉悦表达但不频繁；S=极少表现出愉悦感或笑容稀少' 
WHERE domain='affect' AND item_number=6;

UPDATE public.c_pep3_pathological_items SET description = 
'【依恋行为的质量】与主要照顾者之间的依恋关系是否安全？分离时和重聚时的行为表现如何？
A=表现出安全的依恋行为（分离时适度不安、重聚时寻求安慰后又可以去探索）；M=依恋有些不安全但不算严重；S=明显的不安全依恋（回避型/矛盾型/紊乱型特征明显）' 
WHERE domain='affect' AND item_number=7;

UPDATE public.c_pep3_pathological_items SET description = 
'【羞耻/愧疚感的萌芽】当做了不该做的事或犯错后是否表现出任何形式的"不好意思"或意识到"不应该"？（不要求成熟的愧疚感，只需有任何形式的尴尬/回避反应）
A=在一些情境中表现出初步的羞耻意识；M=偶尔有一点点迹象；S=完全没有羞耻/愧疚的意识或反应' 
WHERE domain='affect' AND item_number=8;

UPDATE public.c_pep3_pathological_items SET description = 
'【自尊/自信的表现】在面对新任务或挑战时是否表现出一定程度的自信心？是否敢于尝试未知的活动？
A=在新任务中有适度的尝试意愿和初步的自信心；M=需要较多鼓励才愿意尝试；S=普遍缺乏自信/回避挑战/常说"我不会""我不行"' 
WHERE domain='affect' AND item_number=9;

UPDATE public.c_pep3_pathological_items SET description = 
'【情绪稳定性/波动性】情绪状态是否相对稳定？是否存在频繁的无缘无故的情绪波动（忽喜忽怒无明显诱因）？
A=情绪相对稳定波动在合理范围；M=有一些波动但不过于频繁或剧烈；S=情绪极不稳定频繁剧烈波动' 
WHERE domain='affect' AND item_number=10;

UPDATE public.c_pep3_pathological_items SET description = 
'【特殊兴趣带来的积极情感】是否有某些特定的活动/主题能让儿童产生明显的积极情感投入和愉悦感？（这对了解孩子的强化物很重要）
A=有1个以上明确的特殊兴趣带来积极情感；M=兴趣较分散或强度一般；S=很难找到能带来积极情感的任何活动' 
WHERE domain='affect' AND item_number=11;


-- ────────────────────────────────────────────────
-- 病理领域2：人际关系 (Interpersonal) - 11项
-- （因篇幅限制采用精简格式）
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_pathological_items SET description = '【眼神接触】与他人互动时是否有适当的眼神接触？频率、时长、自发性如何？A=眼神接触在互动中自然出现且时长适当；M=短暂/需提示才有；S=几乎避免眼神接触或极为短暂' WHERE domain='interpersonal' AND item_number=1;
UPDATE public.c_pep3_pathological_items SET description = '【共同注意（Joint Attention）】能否通过眼神/手势与人分享感兴趣的物体/事件（引发式+响应式共同注意）？A=能主动发起和回应共同注意；M=只能回应或只能在提示下发起；S=共同注意严重缺陷' WHERE domain='interpersonal' AND item_number=2;
UPDATE public.c_pep3_pathological_items SET description = '【社交发起主动性】是否主动向同伴/成人发起社交互动（不只是回应他人的发起）？A=经常主动发起社交；M=偶尔发起多在回应；S=极少主动发起社交互动' WHERE domain='interpersonal' AND item_number=3;
UPDATE public.c_pep3_pathological_items SET description = '【对同伴的兴趣】是否对同龄/近龄儿童表现出自然的兴趣和互动意愿？A=对同伴有兴趣并试图互动；M=对同伴存在但互动较少/被动；S=对同龄儿童明显缺乏兴趣或回避' WHERE domain='interpersonal' AND item_number=4;
UPDATE public.c_pep3_pathological_items SET description = '【社交模仿倾向】是否会观察和模仿同伴的行为（穿衣/玩法/说话方式）？A=有一定的社交模仿行为；M=偶尔模仿；S=从不模仿同伴行为' WHERE domain='interpersonal' AND item_number=5;
UPDATE public.c_pep3_pathological_items SET description = '【轮流/等待能力】在社交互动和游戏中能否等待轮到自己？能否容忍短暂的延迟满足？A=基本能等待和轮流；M=需要提醒和辅助；S=完全不能等待/轮流即出现问题行为' WHERE domain='interpersonal' AND item_number=6;
UPDATE public.c_pep3_pathological_items SET description = '【分享行为（物品/体验）】是否会主动与他人分享物品/食物/有趣的发现？A=有一定程度的自发分享行为；M=在提示下能分享；S=从不主动分享或极度抗拒分享' WHERE domain='interpersonal' AND item_number=7;
UPDATE public.c_pep3_pathological_items SET description = '【安慰/关心他人的行为】当他人（同伴/成人）表现出伤心/不舒服时是否有任何形式的安慰行为？A=有时会表现出关心/安慰；M=偶尔在提示下有；S=从未表现出对他人情绪的关心' WHERE domain='interpersonal' AND item_number=8;
UPDATE public.c_pep3_pathological_items SET description = '【对社交规则的意识】是否意识到一些基本的社交规则存在（排队、不打人、不抢东西、不大声喧哗）？A=有基本的社交规则意识；M=规则意识薄弱时常违反；S=几乎无视社交规则' WHERE domain='interpersonal' AND item_number=9;
UPDATE public.c_pep3_pathological_items SET description = '【群体融入能力】在3人以上的小组环境中能否融入并参与？还是游离在外？A=能在小组中一定程度地参与；M=边缘性参与或需较多支持；S=完全无法融入小组活动' WHERE domain='interpersonal' AND item_number=10;
UPDATE public.c_pep3_pathological_items SET description = '【友谊关系的建立】是否有固定的玩伴或朋友？能否维持持续的同伴关系？A=有至少一个较为稳定的同伴关系；M=有玩伴但关系较浅层；S=没有任何持久性的同伴友谊' WHERE domain='interpersonal' AND item_number=11;


-- ────────────────────────────────────────────────
-- 病理领域3：材料游戏种类与范围 (Material Play) - 8项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_pathological_items SET description = '【游戏材料的多样性】玩耍时使用的材料/玩具类型是否多样还是局限于少数几种？A=能使用多种类型的玩具/材料进行游戏；M=使用的材料类型有限（3-5种）；S=仅对1-2种材料感兴趣其他一律排斥' WHERE domain='material_play' AND item_number=1;
UPDATE public.c_pep3_pathological_items SET description = '【游戏方式的灵活性】同一件物品能否有多种玩法？还是只有刻板的单一玩法？A=同一物品能变换多种玩法；M=玩法有限但在提示下能扩展；S=每件物品只有固定的单一刻板玩法' WHERE domain='material_play' AND item_number=2;
UPDATE public.c_pep3_pathological_items SET description = '【假装/象征性游戏的存在】游戏中是否有假装/象征性的成分？还是全部局限于实物的功能性操作？A=有明显的假装/象征性游戏成分；M=偶尔有或在提示下有；S=完全没有假装游戏全是实物操作' WHERE domain='material_play' AND item_number=3;
UPDATE public.c_pep3_pathological_items SET description = '【游戏的主题性和叙事性】游戏是否有主题/情节/故事线？还是碎片化的无关联动作？A=游戏有一定主题或叙事线索；M=有初步的主题但不连贯；S=游戏完全碎片化无组织' WHERE domain='material_play' AND item_number=4;
UPDATE public.c_pep3_pathological_items SET description = '【游戏的持续时间】每次游戏活动的持续时长如何？是否能沉浸其中一段时间？A=能持续进行游戏活动≥10分钟（有意义的游戏）；M=3-9分钟；S=每次游戏≤2分钟或不断切换无法深入' WHERE domain='material_play' AND item_number=5;
UPDATE public.c_pep3_pathological_items SET description = '【对新玩具/新材料的接纳度】面对没见过的玩具/材料时是否愿意探索和尝试？A=愿意主动探索新玩具/材料；M=需要时间适应或在鼓励下尝试；S=抗拒新玩具/材料只接受熟悉的' WHERE domain='material_play' AND item_number=6;
UPDATE public.c_pep3_pathological_items SET description = '【游戏中的创造性和想象力】游戏中是否展现出创造性/想象力的元素？A=有一定的创造性/想象性游戏表现；M=创造性有限但存在；S=游戏完全重复/模仿无创造性' WHERE domain='material_play' AND item_number=7;
UPDATE public.c_pep3_pathological_items SET description = '【游戏中的问题解决】游戏中遇到问题（塔倒了/找不到配件）时是否能尝试解决？A=通常会尝试解决问题；M=有时尝试有时放弃；S=遇到问题立即放弃或发脾气' WHERE domain='material_play' AND item_number=8;


-- ────────────────────────────────────────────────
-- 病理领域4：感觉模式 (Sensory Modes) - 16项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_pathological_items SET description = '【触觉敏感性】对触摸的反应是否正常？是否对轻触过度敏感（躲避）或对疼痛不敏感（反应不足）？A=触觉反应在正常范围；M=有一些触觉敏感或迟钝但不严重影响；S=明显的触觉防御或触觉漠视' WHERE domain='sensory_modes' AND item_number=1;
UPDATE public.c_pep3_pathological_items SET description = '【前庭觉寻求/回避】对摇晃/旋转/倒立等前庭输入的反应？是喜欢追求（不停地转/摇）还是极度回避（拒绝任何离地活动）？A=前庭觉反应适中；M=有一些偏向但可控；S=明显的前庭寻求或前庭回避' WHERE domain='sensory_modes' AND item_number=2;
UPDATE public.c_pep3_pathological_items SET description = '【本体觉 processing】对身体位置/力度的意识如何？动作是过重（总是撞到东西/用力过大）还是过轻（拿不住东西/动作飘浮）？A=本体觉处理正常；M=有一些力度/位置控制问题；S=明显的本体觉处理障碍' WHERE domain='sensory_modes' AND item_number=3;
UPDATE public.c_pep3_pathological_items SET description = '【听觉过敏/过滤困难】是否对某些声音过度敏感（捂耳朵/尖叫）或无法过滤背景噪音？A=听觉反应正常；M=对个别声音敏感或嘈杂环境有些困难；S=广泛的听觉过敏或显著的听觉过滤问题' WHERE domain='sensory_modes' AND item_number=4;
UPDATE public.c_pep3_pathological_items SET description = '【视觉敏感/追寻】对光线/视觉刺激的反应？是否畏光或反之追逐强光？是否对视觉细节过度专注？A=视觉反应正常；M=有一些视觉偏好但不极端；S=明显的视觉敏感或视觉刺激寻求' WHERE domain='sensory_modes' AND item_number=5;
UPDATE public.c_pep3_pathological_items SET description = '【味觉/嗅觉的特殊偏好/厌恶】是否有极度挑食（基于口感/气味）？对某些味道/气味的反应是否异常强烈？A=饮食偏好在正常范围内；M=有一些挑食但营养不受严重影响；S=极度受限的饮食/味觉嗅觉高度敏感或迟钝' WHERE domain='sensory_modes' AND item_number=6;
UPDATE public.c_pep3_pathological_items SET description = '【感觉寻求行为的频率和强度】是否有大量的感觉寻求行为（不停晃动身体/撞东西/闻东西/舔物品）？A=感觉寻求在正常范围；M=有一些感觉寻求行为但可控；S=频繁/高强度/干扰性的感觉寻求' WHERE domain='sensory_modes' AND item_number=7;
UPDATE public.c_pep3_pathological_items SET description = '【感觉防御行为的频率和触发因素】是否有大量的感觉回避/防御行为（拒绝某种材质的衣服/躲避某些环境/对特定感官输入产生恐惧反应）？A=感觉防御行为很少或轻微；M=有一些特定触发因素的防御；S=广泛的感觉防御严重影响日常功能' WHERE domain='sensory_modes' AND item_number=8;
UPDATE public.c_pep3_pathological_items SET description = '【感觉登记（Sensory Registration）】是否能一致地注册和回应感觉输入？还是有时有反应有时好像"没感觉到"？A=感觉登记一致性良好；M=有些不一致但总体还行；S=明显的感觉登记问题（经常似乎"感觉不到"）' WHERE domain='sensory_modes' AND item_number=9;
UPDATE public.c_pep3_pathological_items SET description = '【感觉调制（Sensory Modulation）】能否根据情境调整对感觉输入的反应强度？还是在所有情境中都过度/不足反应？A=能根据情境适度调整感觉反应；M=调整能力有限；S=感觉调制明显失调' WHERE domain='sensory_modes' AND item_number=10;
UPDATE public.c_pep3_pathological_items SET description = '【多感觉整合】能否同时处理来自多个感觉通道的信息（如边看边摸边听）？A=多感觉整合良好；M=在简单情境中可以但复杂情境困难；S=多感觉整合明显困难倾向于单通道处理' WHERE domain='sensory_modes' AND item_number=11;
UPDATE public.c_pep3_pathological_items SET description = '【感觉运动 planning（Dyspraxia迹象）】计划和组织新动作的能力如何？是否显得笨拙/不协调？A=感觉运动 planning 正常；M=有一些笨拙/不协调；S=明显的运用障碍/dyspraxia 特征' WHERE domain='sensory_modes' AND item_number=12;
UPDATE public.c_pep3_pathological_items SET description = '【口部感觉敏感】口部区域（嘴周/口腔内）的感觉敏感性如何？是否挑食基于口腔感觉？是否有咬物/塞物的口部感觉寻求？A=口部感觉反应正常；M=有一些口部感觉问题（挑食/咬物）；S=显著的口部感觉敏感/寻求问题' WHERE domain='sensory_modes' AND item_number=13;
UPDATE public.c_pep3_pathological_items SET description = '【重力不安全感】是否在脚离开地面时感到极度不安？是否拒绝任何离地的活动？A=能接受正常的离地活动；M=有些犹豫但能克服；S=严重的重力不安全感拒绝任何离地体验' WHERE domain='sensory_modes' AND item_number=14;
UPDATE public.c_pep3_pathological_items SET description = '【对环境中感觉输入的耐受度】在嘈杂/拥挤/灯光强烈的环境中能否保持功能和情绪稳定？A=在大多数环境中功能良好；M=在部分高感觉负荷环境中困难；S=在多数日常环境中都因感觉输入而功能下降' WHERE domain='sensory_modes' AND item_number=15;
UPDATE public.c_pep3_pathological_items SET description = '【感觉偏好/兴趣的独特模式】是否有非常独特/不寻常的感觉偏好模式（如只对旋转的东西感兴趣/只喜欢某种特定材质）？A=感觉偏好基本典型；M=有一些独特偏好但不极端；S=有非常独特且固着的感觉偏好模式' WHERE domain='sensory_modes' AND item_number=16;


-- ────────────────────────────────────────────────
-- 病理领域5：语言 (Language) - 11项
-- ────────────────────────────────────────────────
UPDATE public.c_pep3_pathological_items SET description = '【语言的沟通意图】儿童的语言/发声是否具有沟通目的？还是仅为自我刺激性发声？A=大多数语言具有沟通意图；M=部分语言有沟通目的部分为自我刺激；S=绝大多数发声/语言缺乏沟通意图' WHERE domain='language' AND item_number=1;
UPDATE public.c_pep3_pathological_items SET description = '【语言理解的深度】不仅是指令执行，是否能理解更细微的含义（暗示/幽默/反讽/弦外之音）？A=语言理解在预期水平；M=字面理解可以但深层理解有限；S=语言理解明显落后于年龄期望' WHERE domain='language' AND item_number=2;
UPDATE public.c_pep3_pathological_items SET description = '【语言表达的复杂性】表达是否超越单词/短语阶段？能否使用句子和复合句？A=语言表达复杂性接近年龄水平；M=表达偏简单但有一定进步；S=语言表达显著滞后停留在早期阶段' WHERE domain='language' AND item_number=3;
UPDATE public.c_pep3_pathological_items SET description = '【自发言语的频率】日常生活中自发产生的言语频率如何？A=自发言语频率充足；M=偏少但在可接受范围；S=自发言语极少（缄默或少言）' WHERE domain='language' AND item_number=4;
UPDATE public.c_pep3_pathological_items SET description = '【刻板语言/ echolalia】是否存在即时或延时的刻板模仿语言（电视广告词/重复听到的话）？是否影响沟通？A=无明显刻板语言或偶发不影响沟通；M=有一些刻板语言但总体沟通功能尚存；S=广泛/频繁的刻板语言严重干扰有效沟通' WHERE domain='language' AND item_number=5;
UPDATE public.c_pep3_pathological_items SET description = '【代词反转（如存在）】是否在使用代词时出现你我他她混淆的情况？A=代词使用基本正确；M=偶尔有代词混淆但不多；S=频繁的代词反转/混乱' WHERE domain='language' AND item_number=6;
UPDATE public.c_pep3_pathological_items SET description = '【语用/社交语言使用】语言是否适合社交情境？是否知道对不同的人用不同的说话方式？A=语用能力基本适当；M=有一些语用失误但总体可接受；S=语用能力显著落后/社交语言使用明显不当' WHERE domain='language' AND item_number=7;
UPDATE public.c_pep3_pathological_items SET description = '【非口语沟通的使用】除了语言之外是否还使用手势/表情/图片等非口语方式进行补充沟通？A=能综合使用多种沟通渠道；M=主要依赖语言非口语使用有限；S=非口语沟通也严重匮乏' WHERE domain='language' AND item_number=8;
UPDATE public.c_pep3_pathological_items SET description = '【语言流利度/流畅性】说话是否流利？是否有明显的犹豫/重复/阻塞/不正常的语速？A=语言流利度正常；M=有一些不流利但不构成障碍；S=明显的语言流利问题（口吃/语速异常/过多填充词）' WHERE domain='language' AND item_number=9;
UPDATE public.c_pep3_pathological_items SET description = '【阅读和书面语言的前期技能】对文字/书本的兴趣和前期读写能力如何？A=对书本/文字有适当兴趣且有初步的前期 literacy 技能；M=兴趣一般或技能略弱；S=对文字/书本明显缺乏兴趣或前期读写技能严重滞后' WHERE domain='language' AND item_number=10;
UPDATE public.c_pep3_pathological_items SET description = '【语言发展的整体评估】综合考虑语言各方面的发展水平和均衡性——是否在某方面突出而另一些方面严重滞后？A=各方面发展较均衡且总体接近年龄水平；M=有一些不均衡但差距不太大；S=严重不均衡/整体显著落后' WHERE domain='language' AND item_number=11;


-- ============================================================
-- 完成验证
-- ============================================================
SELECT '✅ C-PEP-3 内容更新完成！' AS status;
SELECT 'Developmental:' AS type, COUNT(*) AS total, 
       COUNT(CASE WHEN description NOT LIKE '%参见C-PEP-3评估手册%' THEN 1 END) AS updated
FROM public.c_pep3_developmental_items
UNION ALL
SELECT 'Pathological:', COUNT(*), 
       COUNT(CASE WHEN description NOT LIKE '%参见C-PEP-3评估手册%' THEN 1 END)
FROM public.c_pep3_pathological_items;


NOTIFY pgrst, 'reload schema';
