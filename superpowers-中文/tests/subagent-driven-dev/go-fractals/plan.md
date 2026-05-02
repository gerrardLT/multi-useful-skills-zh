# Go Fractals CLI - 实施计划

使用 `superpowers:subagent-driven-development` skill 执行本计划。

## 背景

要构建一个用于生成 ASCII 分形图案的 CLI 工具。完整规格见 `design.md`。

## 任务

### Task 1: 项目初始化

创建 Go module 和目录结构。

**Do:**
- 初始化 `go.mod`，module 名称设为 `github.com/superpowers-test/fractals`
- 创建目录结构：`cmd/fractals/`、`internal/sierpinski/`、`internal/mandelbrot/`、`internal/cli/`
- 创建最小可运行的 `cmd/fractals/main.go`，输出 `"fractals cli"`
- 添加 `github.com/spf13/cobra` 依赖

**Verify:**
- `go build ./cmd/fractals` 成功
- `./fractals` 输出 `"fractals cli"`

---

### Task 2: 带帮助信息的 CLI 框架

用 Cobra 搭建根命令并输出 help。

**Do:**
- 创建 `internal/cli/root.go` 作为根命令
- 配置 help 文本，显示可用子命令
- 在 `main.go` 中接入根命令

**Verify:**
- `./fractals --help` 能显示用法，并列出 `"sierpinski"` 和 `"mandelbrot"`
- `./fractals`（无参数）显示 help

---

### Task 3: Sierpinski 算法

实现 Sierpinski 三角形生成算法。

**Do:**
- 创建 `internal/sierpinski/sierpinski.go`
- 实现 `Generate(size, depth int, char rune) []string`，返回三角形各行
- 使用递归中点细分算法
- 创建 `internal/sierpinski/sierpinski_test.go`，测试包括：
  - 小三角形（size=4, depth=2）匹配预期输出
  - size=1 返回单个字符
  - depth=0 返回填满的三角形

**Verify:**
- `go test ./internal/sierpinski/...` 通过

---

### Task 4: 接入 Sierpinski CLI 子命令

把 Sierpinski 算法接到 CLI 子命令上。

**Do:**
- 创建 `internal/cli/sierpinski.go`，实现 `sierpinski` 子命令
- 添加 flags：`--size`（默认 32）、`--depth`（默认 5）、`--char`（默认 `'*'`）
- 调用 `sierpinski.Generate()` 并把结果打印到 stdout

**Verify:**
- `./fractals sierpinski` 能输出三角形
- `./fractals sierpinski --size 16 --depth 3` 能输出更小的三角形
- `./fractals sierpinski --help` 能显示 flag 文档

---

### Task 5: Mandelbrot 算法

实现 Mandelbrot 集的 ASCII 渲染器。

**Do:**
- 创建 `internal/mandelbrot/mandelbrot.go`
- 实现 `Render(width, height, maxIter int, char string) []string`
- 将复平面区域（实轴 -2.5 到 1.0，虚轴 -1.0 到 1.0）映射到输出尺寸
- 将迭代次数映射到字符渐变 `" .:-=+*#%@"`，如果传入单字符则直接使用单字符
- 创建 `internal/mandelbrot/mandelbrot_test.go`，测试包括：
  - 输出尺寸匹配要求的 width / height
  - 已知集合内点 `(0,0)` 映射到最大迭代字符
  - 已知集合外点 `(2,0)` 映射到低迭代字符

**Verify:**
- `go test ./internal/mandelbrot/...` 通过

---

### Task 6: 接入 Mandelbrot CLI 子命令

把 Mandelbrot 算法接到 CLI 子命令上。

**Do:**
- 创建 `internal/cli/mandelbrot.go`，实现 `mandelbrot` 子命令
- 添加 flags：`--width`（默认 80）、`--height`（默认 24）、`--iterations`（默认 100）、`--char`（默认 `""`）
- 调用 `mandelbrot.Render()` 并把结果打印到 stdout

**Verify:**
- `./fractals mandelbrot` 能输出可识别的 Mandelbrot 图案
- `./fractals mandelbrot --width 40 --height 12` 能输出较小版本
- `./fractals mandelbrot --help` 能显示 flag 文档

---

### Task 7: 字符集配置

确保 `--char` 在两个命令中的行为一致。

**Do:**
- 确认 Sierpinski 的 `--char` 会正确传递给算法
- 对于 Mandelbrot，`--char` 应使用单字符替代渐变
- 为自定义字符输出添加测试

**Verify:**
- `./fractals sierpinski --char '#'` 使用 `'#'`
- `./fractals mandelbrot --char '.'` 对所有填充点使用 `'.'`
- 测试通过

---

### Task 8: 输入校验与错误处理

为非法输入增加校验。

**Do:**
- Sierpinski：size 必须大于 0，depth 必须大于等于 0
- Mandelbrot：width / height 必须大于 0，iterations 必须大于 0
- 对非法输入返回清晰的错误信息
- 为错误情况增加测试

**Verify:**
- `./fractals sierpinski --size 0` 会打印错误并以非零状态退出
- `./fractals mandelbrot --width -1` 会打印错误并以非零状态退出
- 错误信息清晰且有帮助

---

### Task 9: 集成测试

新增会调用 CLI 的集成测试。

**Do:**
- 创建 `cmd/fractals/main_test.go` 或 `test/integration_test.go`
- 测试两个命令的完整 CLI 调用
- 校验输出格式和退出码
- 测试错误场景会返回非零退出码

**Verify:**
- `go test ./...` 通过，包括集成测试

---

### Task 10: README

补充使用说明和示例。

**Do:**
- 创建 `README.md`，包含：
  - 项目说明
  - 安装方式：`go install ./cmd/fractals`
  - 两个命令的使用示例
  - 示例输出（小样本）

**Verify:**
- README 对工具的描述准确
- README 中的示例命令实际可运行
