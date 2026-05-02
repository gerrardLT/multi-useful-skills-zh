# Skill 缂栧啓鏈€浣冲疄璺?
> 瀛︿範濡備綍缂栧啓鑳借 Claude 绋冲畾鍙戠幇銆佹纭悊瑙ｅ苟楂樻晥浣跨敤鐨?Skills銆?
濂界殑 Skill 搴旇绠€娲併€佺粨鏋勬竻鏅般€佷究浜庡鑸紝骞朵笖缁忓彈杩囩湡瀹炲満鏅祴璇曘€傛湰鎸囧崡鑱氱劍鏈€閲嶈鐨勫啓娉曞師鍒欙紝甯姪浣犲啓鍑烘洿瀹规槗琚唬鐞嗘纭Е鍙戠殑 Skills銆?
濡傛灉浣犳兂鍏堜簡瑙?Skill 鐨勫熀纭€姒傚康锛岃鍙傝€?[Skills overview](/en/docs/agents-and-tools/agent-skills/overview)銆?
## 鏍稿績鍘熷垯

### 绠€娲佷紭鍏?
涓婁笅鏂囩獥鍙ｆ槸鍏变韩璧勬簮銆備綘鐨?Skill 闇€瑕佸拰 system prompt銆佸璇濆巻鍙层€佸叾浠?Skills 鍏冩暟鎹互鍙婄敤鎴峰綋鍓嶈姹傚叡鍚屼簤澶轰笂涓嬫枃绌洪棿銆?
铏界劧绯荤粺鍚姩鏃跺彧浼氶鍔犺浇 `name` 鍜?`description`锛屼絾涓€鏃?Claude 璁ゅ畾鏌愪釜 Skill 鐩稿叧锛屽畠灏变細鎶?`SKILL.md` 璇昏繘涓婁笅鏂囥€傛墍浠ワ細

- `SKILL.md` 鏈綋瑕佸敖閲忕煭
- 鍙啓 Claude 鏈韩涓嶇煡閬撱€佷絾瀹屾垚浠诲姟鍙堝繀椤荤煡閬撶殑鍐呭
- 澶ф鑳屾櫙鐭ヨ瘑銆侀暱绀轰緥銆佸弬鑰冭祫鏂欏簲鎷嗗埌鍗曠嫭鏂囦欢

鍏堥棶鑷繁涓変欢浜嬶細

- Claude 鐪熺殑闇€瑕佽繖涓€娈佃В閲婂悧锛?- 杩欎欢浜嬫垜鑳介粯璁?Claude 宸茬粡鐭ラ亾鍚楋紵
- 杩欐鍐呭鍊煎緱娑堣€楄繖浜?token 鍚楋紵

### 缁欒冻鑷敱锛屼絾鍒斁浠?
鎸囦护鍏蜂綋鍒颁粈涔堢▼搴︼紝瑕佸拰浠诲姟鐨勮剢寮辨€с€侀闄╁拰鍙樺寲绌洪棿鍖归厤銆?
**楂樿嚜鐢卞害**

閫傚悎锛?
- 鏈夊绉嶆湁鏁堝仛娉?- 鍒ゆ柇楂樺害渚濊禆涓婁笅鏂?- 鏇撮€傚悎鐢ㄥ惎鍙戝紡鍘熷垯鎸囧

绀轰緥锛?
```markdown
## Code review process

1. Analyze the code structure and organization
2. Check for potential bugs or edge cases
3. Suggest improvements for readability and maintainability
4. Verify adherence to project conventions
```

**涓瓑鑷敱搴?*

閫傚悎锛?
- 宸茬粡鏈夋帹鑽愭ā寮?- 鍏佽涓€瀹氬彉浣?- 琛屼负鍙楅厤缃垨杈撳叆褰卞搷

绀轰緥锛?
```python
def generate_report(data, format="markdown", include_charts=True):
    # Process data
    # Generate output in specified format
    # Optionally include visualizations
```

**浣庤嚜鐢卞害**

閫傚悎锛?
- 鎿嶄綔鑴嗗急銆佸鏄撳嚭閿?- 涓€鑷存€ц姹傚緢楂?- 蹇呴』鎸変弗鏍奸『搴忔墽琛?
绀轰緥锛?
```bash
python scripts/migrate.py --verify --backup
```

濡傛灉浠诲姟鍍忊€滄偓宕栬竟鐨勫皬璺€濓紝灏辩粰娓呮櫚鎶ゆ爮锛涘鏋滀换鍔″儚鈥滃紑闃斿湴甯︹€濓紝灏辩粰鐩爣鍜屾柟鍚戙€?
### 鐢ㄥ疄闄呬細鎼厤鐨勬ā鍨嬫祴璇?
Skill 鐨勬晥鏋滀細鍙楀簳灞傛ā鍨嬪奖鍝嶃€傝嚦灏戣鑰冭檻锛?
- **Haiku**锛氭槸鍚︾粰浜嗚冻澶熸槑纭殑鎸囦护
- **Sonnet**锛氭槸鍚﹁冻澶熸竻鏅伴珮鏁?- **Opus**锛氭槸鍚﹂伩鍏嶈繃搴﹁В閲婂拰鍟板棪

涓€浠藉 Opus 寰堣垝鏈嶇殑 Skill锛屾湭蹇呭 Haiku 瓒冲鍙嬪ソ銆傝法妯″瀷浣跨敤鏃讹紝灏介噺鍙栦笁鑰呴兘椤烘墜鐨勪腑闂村€笺€?
## Skill 缁撴瀯

### YAML frontmatter

`SKILL.md` 鑷冲皯瑕佹湁涓や釜鍏抽敭瀛楁锛?
- `name`锛歋kill 鐨勪汉绫诲彲璇诲悕绉?- `description`锛氫竴鍙ヨ瘽璇存槑瀹冨仛浠€涔堛€佷粈涔堟椂鍊欒鐢?
鏇村畬鏁寸殑缁撴瀯璇存槑璇风湅 [Skills overview](/en/docs/agents-and-tools/agent-skills/overview#skill-structure)銆?
### 鍛藉悕寤鸿

鍛藉悕瑕佺ǔ瀹氥€佷竴鑷淬€佸彲璇汇€傛帹鑽愪娇鐢ㄥ姩浣滃鍚戠殑鍚嶅瓧锛屾渶濂借兘涓€鐪肩湅鍑虹敤閫斻€?
濂界殑渚嬪瓙锛?
- `Processing PDFs`
- `Analyzing spreadsheets`
- `Managing databases`
- `Testing code`
- `Writing documentation`

搴旈伩鍏嶏細

- 鍚箟妯＄硦锛歚Helper`銆乣Utils`銆乣Tools`
- 杩囦簬娉涘寲锛歚Documents`銆乣Data`銆乣Files`
- 鍚屼竴浠撳簱鍐呭懡鍚嶉鏍兼贩涔?
### 鍐欏ソ description

`description` 鏄?Skill 琚彂鐜扮殑绗竴鍏ュ彛锛屾墍浠ュ畠鏃㈣璇存槑鈥滃仛浠€涔堚€濓紝涔熻璇存槑鈥滀粈涔堟椂鍊欑敤鈥濄€?
寤鸿锛?
- 濮嬬粓浣跨敤绗笁浜虹О鎴栦腑鎬ч檲杩?- 鍚屾椂鍖呭惈鑳藉姏鎻忚堪鍜岃Е鍙戞潯浠?- 甯︿笂鍏蜂綋鍏抽敭璇嶏紝鏂逛究妫€绱㈠拰鍖归厤

濂戒緥瀛愶細

```yaml
description: 鍙粠 PDF 鏂囦欢涓彁鍙栨枃鏈拰琛ㄦ牸銆佸～鍐欒〃鍗曞苟鍚堝苟鏂囨。銆傞€傜敤浜庡鐞?PDF 鏂囦欢锛屾垨褰撶敤鎴锋彁鍒?PDF銆佽〃鍗曟垨鏂囨。鎻愬彇鐨勬椂鍊欍€?```

宸緥瀛愶細

```yaml
description: ?????????????????
```

```yaml
description: ?????????????????
```

## 娓愯繘寮忔姭闇?
`SKILL.md` 搴旇鍍忎竴涓鑸〉锛岃€屼笉鏄妸鎵€鏈変俊鎭竴娆℃€у婊°€?
鎺ㄨ崘鍋氭硶锛?
- 鍦?`SKILL.md` 閲屽彧鏀炬瑙堛€佹祦绋嬪拰璺宠浆鎻愮ず
- 鎶婅繘闃剁粏鑺傛媶鍒?`reference/`銆乣examples/`銆乣scripts/` 绛夌洰褰?- 璁?Claude 鍙湪闇€瑕佹椂鍐嶈鍙栧搴旀枃浠?
涓€涓悎鐞嗙殑鐩綍缁撴瀯閫氬父鍍忚繖鏍凤細

```text
pdf/
鈹溾攢鈹€ SKILL.md
鈹溾攢鈹€ FORMS.md
鈹溾攢鈹€ REFERENCE.md
鈹溾攢鈹€ EXAMPLES.md
鈹斺攢鈹€ scripts/
    鈹溾攢鈹€ analyze_form.py
    鈹溾攢鈹€ fill_form.py
    鈹斺攢鈹€ validate.py
```

### 妯″紡 1锛氶珮灞傝鏄?+ 寮曠敤鏂囦欢

閫傚悎涓€涓?Skill 鍙湁涓€涓富娴佺▼锛屼絾闄勫甫鑻ュ共涓撻璇存槑銆?
### 妯″紡 2锛氭寜棰嗗煙鎷嗗垎

閫傚悎涓€涓?Skill 瑕嗙洊澶氫釜涓氬姟棰嗗煙锛屼緥濡傝储鍔°€侀攢鍞€佷骇鍝併€佸競鍦恒€傝繖鏍?Claude 鍙互鎸夐渶璇诲彇锛岃€屼笉鏄瘡娆￠兘鎶婃暣濂楄祫鏂欐媺杩涗笂涓嬫枃銆?
## 鑴氭湰涓庤嚜鍔ㄥ寲

濡傛灉鏌愪欢浜嬪彲浠ョ‘瀹氭€ф墽琛岋紝浼樺厛鍐欒剼鏈紝涓嶈姣忔閮借 Claude 涓存椂鐢熸垚浠ｇ爜銆?
鏇村ソ鐨勬柟寮忥細

- 鍐?`validate_form.py`
- 鍐?`extract_metrics.py`
- 鍐?`check_config.sh`

杩欐牱鍋氱殑濂藉锛?
- 鏇寸ǔ瀹?- 鏇村彲澶嶇敤
- 鏇村鏄撻獙璇?- 閿欒淇℃伅鏇磋仛鐒?
### 璁╄剼鏈湡姝ｆ湁鐢?
鑴氭湰涓嶅簲璇ュ彧鏄妸澶辫触鈥滅敥鍥炵粰 Claude鈥濓紝鑰岃鎻愪緵鑳芥帹鍔ㄩ棶棰樿В鍐崇殑鍙嶉銆?
渚嬪锛?
```text
?? `signature_date` ?????????`customer_name`?`order_total`?`signature_date_signed`
```

杩欑被閿欒灏辨瘮涓€鍙?`field missing` 鏇存湁甯姪銆?
## 渚濊禆涓庤繍琛岀幆澧?
涓嶈鍋囪鏌愪釜搴撱€佸懡浠ゆ垨鐜榛樿瀛樺湪銆?
搴旇鏄庣‘鍐欏嚭锛?
- 闇€瑕佸畨瑁呬粈涔?- 鐢ㄤ粈涔堝懡浠ゅ畨瑁?- 瀹夎鍚庡浣曡皟鐢?- 杩欎釜渚濊禆鍦ㄥ摢浜涘钩鍙板彲鐢?
宸緥瀛愶細

```text
Use the pdf library to process the file.
```

濂戒緥瀛愶細

```text
Install required package: `pip install pypdf`
```

```python
from pypdf import PdfReader
reader = PdfReader("file.pdf")
```

## 鏂囦欢缁勭粐寤鸿

- 璺緞缁熶竴鐢ㄦ鏂滄潬
- 鏂囦欢鍚嶈鏈夎涔夛紝涓嶈鍐欐垚 `doc2.md`
- 鐩綍鎸夐鍩熸垨鍔熻兘缁勭粐锛屼笉瑕佸爢鎴?`file1.md`銆乣file2.md`
- 澶у弬鑰冭祫鏂欏彲浠ュぇ鑳嗘斁杩涗粨搴擄紝鍥犱负鍙湁鐪熸璇诲彇鏃舵墠浼氬崰涓婁笅鏂?
渚嬪锛?
```text
reference/
鈹溾攢鈹€ finance.md
鈹溾攢鈹€ sales.md
鈹斺攢鈹€ product.md
```

## MCP 宸ュ叿寮曠敤

濡傛灉 Skill 闇€瑕佷娇鐢?MCP 宸ュ叿锛屽缁堜娇鐢ㄥ畬鏁撮檺瀹氬悕锛?
```text
ServerName:tool_name
```

渚嬪锛?
```markdown
Use the BigQuery:bigquery_schema tool to retrieve table schemas.
Use the GitHub:create_issue tool to create issues.
```

涓嶈鐪佺暐 server 鍓嶇紑锛屽惁鍒欏湪澶?MCP server 鐜涓嬪緢瀹规槗鍑虹幇 鈥渢ool not found鈥濄€?
## 妫€鏌ユ竻鍗?
鍦ㄥ垎浜竴涓?Skill 涔嬪墠锛岃嚦灏戠‘璁や互涓嬪唴瀹癸細

### 鏍稿績璐ㄩ噺

- [ ] `description` 瓒冲鍏蜂綋
- [ ] `description` 鍚屾椂璇存槑浜嗚兘鍔涘拰瑙﹀彂鏃舵満
- [ ] `SKILL.md` 鏈綋灏介噺鐭?- [ ] 澶氫綑缁嗚妭宸茬粡鎷嗗埌鐙珛鏂囦欢
- [ ] 鏈鍓嶅悗涓€鑷?- [ ] 绀轰緥鍏蜂綋锛屼笉绌烘硾
- [ ] 宸ヤ綔娴佹楠ゆ竻鏅?
### 浠ｇ爜涓庤剼鏈?
- [ ] 鑴氭湰鏄湪瑙ｅ喅闂锛屼笉鏄湪鍒堕€犳洿澶氭ā绯婃€?- [ ] 閿欒澶勭悊鏄庣‘涓斿浜烘湁甯姪
- [ ] 鎵€闇€渚濊禆鍐欐竻妤氫簡
- [ ] 鍏抽敭鎿嶄綔甯﹂獙璇佹楠?- [ ] 楂橀闄╁姩浣滄湁鍙嶉闂幆

### 娴嬭瘯

- [ ] 鑷冲皯鍋氳繃澶氫釜鐪熷疄鍦烘櫙娴嬭瘯
- [ ] 涓嶅悓鑳藉姏灞傜骇鐨勬ā鍨嬮兘璇曡繃
- [ ] 濡傞€傜敤锛屽凡鍚告敹鍥㈤槦鍙嶉

## 涓嬩竴姝?
- [Get started with Agent Skills](/en/docs/agents-and-tools/agent-skills/quickstart)
- [Use Skills in Claude Code](/en/docs/claude-code/skills)
- [Use Skills with the API](/en/api/skills-guide)

