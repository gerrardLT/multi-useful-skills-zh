# v0.78 - 鍙戝竷鎵撳寘锛氫竴娆′笅杞斤紝鐒跺悗鎶?PM 宸ヤ綔鍋氬緱鏇村ソ

**鍙戝竷鏃ユ湡锛?* 2026 骞?4 鏈?26 鏃?
---

## 鎴戜滑鏂板浜嗕粈涔?
v0.78 璁?Product Manager Skills 浠庘€滀竴涓湁鐢ㄧ殑 repo鈥濓紝鍙樻垚鈥滀汉浠湡鐨勮兘瑁呰捣鏉モ€濈殑涓滆タ锛岃€屼笖涓嶇敤鍏堢悊瑙ｆ暣涓?repo銆?
鎴戜滑涓哄綋涓嬫渶甯歌鐨?AI 宸ュ叿浣跨敤鏂瑰紡琛ヤ笂浜嗗彂甯冩墦鍖咃細

- Claude Desktop/Web 鐢ㄦ埛鍙互涓嬭浇涓€閿紡 ZIP packs锛岄噷闈㈠凡缁忓寘鍚彲涓婁紶鐨勫崟涓?skill ZIP銆?- Claude Code 鐢ㄦ埛浠嶇劧鍙互缁х画浣跨敤鐜版湁 plugin marketplace 璺緞銆?- Codex 鐢ㄦ埛鍙互涓嬭浇甯︽湁 `.agents/skills` 鍜?`AGENTS.md` 鐨勫寘銆?- 缁存姢鑰呭彲浠ョ敤涓€鏉″懡浠ゆ瀯寤烘墍鏈夊彂甯冧骇鐗┿€?- GitHub Actions 鍙互鍦?version tags 涓婅嚜鍔ㄦ瀯寤哄苟闄勫姞 release 鏂囦欢銆?
source of truth 浠嶇劧鏄?`skills/`銆傛柊鐨?`dist/` 鍙槸鍙戝竷浜х墿琚粍瑁呭嚭鏉ョ殑璐ф灦銆?
---

## 涓轰粈涔堣鍔犺繖涓?
杩欎簺 skills 鏃╁氨鏈夌敤浜嗭紝浣嗗畨瑁呮祦绋嬩粛鐒跺お鎶€鏈寲銆?
杩欐濂界粰杩欎釜 repo 鏈€鎯冲府鍔╃殑浜哄埗閫犱簡鎽╂摝锛氶偅浜涙兂瑕佹洿濂界殑 discovery銆佹洿娓呮櫚鐨?strategy銆佹洿寮虹殑 PRD銆佹洿濂界殑 stories銆佹洿閿嬪埄鐨?prioritization锛屼絾鍙堜笉鎯冲厛鎴愪负鎵撳寘涓撳鐨勪骇鍝佺粡鐞嗐€?
杩欎釜鐗堟湰璇曞浘瑙ｅ喅鐨?job to be done 鏄細

> 褰撲竴涓?PM 鎯崇敤杩欎簺 skills 閰嶅悎鑷繁鐨?AI 宸ュ叿鏃讹紝浠栦滑闇€瑕佷竴绉嶇畝鍗曟柟寮忓畨瑁呭鐨勭増鏈紝杩欐牱鎵嶈兘灏藉揩寮€濮嬪仛鏇村ソ鐨勪骇鍝佸伐浣溿€?
杩欎釜鐗堟湰绉婚櫎浜?setup 鐚滆皽杩囩▼锛岃绗竴姝ユ洿灏忎簡銆?
---

## 杩欎釜鐗堟湰閫傚悎璋?
### 浣跨敤 Claude Desktop 鎴?Claude Web 鐨勯潪鎶€鏈瀷 PM

浠栦滑鍙互涓嬭浇 `pm-skills-starter-pack.zip`锛岃В鍘嬪悗鎶婇噷闈㈢殑 skill ZIP 涓婁紶鍒?Claude Skills锛岀劧鍚庣洿鎺ユ嬁鐪熷疄浜у搧闂寮€濮嬬敤銆?
### Claude Code 鐢ㄦ埛

浠栦滑鍙互缁х画浣跨敤 plugin marketplace銆傝繖涓増鏈繚鐣欎簡杩欐潯璺緞锛岃€屼笉鏄己杩粬浠敼鐢ㄧ粰鍏朵粬浜у搧鍑嗗鐨?ZIP銆?
### 平台：Codex 鐢ㄦ埛

浠栦滑鍙互涓嬭浇 `codex-product-manager-skills.zip`锛岃В鍘嬪埌 repo 涓紝灏辫兘寰楀埌缁撴瀯姝ｇ‘鐨?`.agents/skills` 鍜?`AGENTS.md`銆?
### Maintainers

浠栦滑鍙渶瑕佽繍琛岋細

```bash
./scripts/build-release.sh
```

杩欐潯鍛戒护浼氭牎楠?skills銆佹瀯寤?Claude packs銆佹瀯寤?Codex package銆佸鍒舵湁鐢ㄦ枃妗ｏ紝骞跺垱寤?master release ZIP銆?
---

## 瀹冨浣曡浣跨敤浣撻獙鍙樺緱鏇村ソ

鍦?v0.78 涔嬪墠锛岀敤鎴峰繀椤诲厛鐞嗚В repo 缁撴瀯锛屾墠鑳芥妸 repo 鐢ㄥソ銆?
v0.78 涔嬪悗锛?
- PM 鍙互鐩存帴閫変竴涓?starter pack锛岃€屼笉鏄厛鍏嬮殕 repo銆?- Claude 鐢ㄦ埛鍙互涓嬭浇涓€涓?pack銆佽В鍘嬨€佷笂浼犻噷闈㈢殑 skill ZIP锛岃€屼笉闇€瑕佽嚜宸辨墜宸ユ墦鍖呫€?- Codex 鐢ㄦ埛鍙渶瑙ｅ帇涓€涓枃浠讹紝鑰屼笉鏄嚜宸遍噸寤?`.agents/skills`銆?- Maintainer 鍙互绋冲畾閲嶅鍦板彂甯冿紝鑰屼笉鏄墜宸ユ嫾瑁呬骇鐗┿€?- README 浼氱洿鎺ュ憡璇夌敤鎴疯璧板摢鏉¤矾寰勶紝鑰屼笉鏄浠栦滑鑷繁鐚溿€?
鐞嗘兂涓殑鍙戝竷浣撻獙鐜板湪搴旇鍍忚繖鏍凤細

```text
Download one pack. Unzip it. Upload the skill ZIPs inside. Start asking better product questions.
```

---

## Repo 涓叿浣撴敼浜嗕粈涔?
- 鏂板 `scripts/validate-skills.sh`
- 鏂板 `scripts/build-claude-desktop-packs.sh`
- 鏂板 `scripts/build-codex-skills.sh`
- 鏂板 `scripts/build-release.sh`
- 鏂板 `.github/workflows/build-release.yml`
- 鏂板闈㈠悜 Claude Desktop/Web銆丆laude Code銆丆odex 鍜岀淮鎶よ€呯殑瀹夎鏂囨。
- 鏇存柊 `README.md`锛屽姞鍏ユ洿娓呮櫚鐨?Start Here 璺緞
- 鏇存柊 `AGENTS.md`锛屽姞鍏ラ拡瀵?Codex 鍜?coding agents 鐨?packaging guidance

---

## 閫氫織鏂囨

Product Manager Skills v0.78 璁╂暣涓簱鏇村鏄撳畨瑁咃紝涔熸洿瀹规槗鍒嗕韩銆?
杩欐鐗堟湰涓嶅啀瑕佹眰 PM 鍏堢悊瑙?GitHub 鏂囦欢澶圭粨鏋勫拰鎵撳寘鑴氭湰锛岃€屾槸涓?Claude Desktop/Web 鍜?Codex 鎻愪緵鐜版垚涓嬭浇鍖咃紝淇濈暀 Claude Code marketplace 鏀寔锛屽苟缁欑淮鎶よ€呬竴鏉″懡浠ゆ瀯寤哄叏閮ㄤ骇鐗┿€?
鏍稿績寰堢畝鍗曪細鏇村皯 setup锛屾洿蹇?adoption锛屾洿濂界殑浜у搧宸ヤ綔銆?
---

*鏈鍙戝竷鐢?Dean Peters 涓?Codex 鍏卞悓瀹屾垚銆?


