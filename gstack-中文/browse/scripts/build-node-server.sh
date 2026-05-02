#!/usr/bin/env bash
# 为 Windows 构建兼容 Node.js 的服务端打包文件。
#
# 在 Windows 上，Bun 无法正常启动或连接 Playwright 的 Chromium
#（oven-sh/bun#4253, #9911）。这个脚本会生成一个运行在 Node.js
# 下、并带有 Bun API polyfill 的服务端打包文件。

set -e

GSTACK_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SRC_DIR="$GSTACK_DIR/browse/src"
DIST_DIR="$GSTACK_DIR/browse/dist"

echo "正在构建兼容 Node.js 的服务端打包文件..."

# 第 1 步：把 server.ts 转译成单个 .mjs bundle（运行时依赖改为 external）
#
# 带原生 addon、动态导入或运行时解析的包，需要在这里 externalize。
# 如果你新增了使用 `await import()` 或带 `.node` addon 的依赖，
# 也要加到这里。否则 `bun build --outfile` 会报错：
# "cannot write multiple output files without an output directory"。
bun build "$SRC_DIR/server.ts" \
  --target=node \
  --outfile "$DIST_DIR/server-node.mjs" \
  --external playwright \
  --external playwright-core \
  --external diff \
  --external "bun:sqlite" \
  --external "@ngrok/ngrok"

# 第 2 步：后处理
# 把 import.meta.dir 替换成可解析的引用
perl -pi -e 's/import\.meta\.dir/__browseNodeSrcDir/g' "$DIST_DIR/server-node.mjs"
# 把 bun:sqlite 替换为 stub（仅 macOS 的 cookie 导入会用到，Windows 不需要）
perl -pi -e 's|import { Database } from "bun:sqlite";|const Database = null; // bun:sqlite stubbed on Node|g' "$DIST_DIR/server-node.mjs"

# 第 3 步：生成最终文件，在首行后注入 polyfill 头部
{
  head -1 "$DIST_DIR/server-node.mjs"
  echo '// Windows Node.js 兼容层（自动生成）'
  echo 'import { fileURLToPath as _ftp } from "node:url";'
  echo 'import { dirname as _dn } from "node:path";'
  echo 'const __browseNodeSrcDir = _dn(_dn(_ftp(import.meta.url))) + "/src";'
  echo '{ const _r = createRequire(import.meta.url); _r("./bun-polyfill.cjs"); }'
  echo '// 兼容层结束'
  tail -n +2 "$DIST_DIR/server-node.mjs"
} > "$DIST_DIR/server-node.tmp.mjs"

mv "$DIST_DIR/server-node.tmp.mjs" "$DIST_DIR/server-node.mjs"

# 第 4 步：把 polyfill 复制到 dist/
cp "$SRC_DIR/bun-polyfill.cjs" "$DIST_DIR/bun-polyfill.cjs"

echo "Node 服务端打包已就绪：$DIST_DIR/server-node.mjs"
