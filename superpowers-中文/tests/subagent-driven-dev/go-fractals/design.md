# Go Fractals CLI - 设计

## 概览

一个用于生成 ASCII 艺术分形图案的命令行工具。支持两种分形类型，并且输出可配置。

## 用法

```bash
# Sierpinski triangle
fractals sierpinski --size 32 --depth 5

# Mandelbrot set
fractals mandelbrot --width 80 --height 24 --iterations 100

# Custom character
fractals sierpinski --size 16 --char '#'

# Help
fractals --help
fractals sierpinski --help
```

## 命令

### `sierpinski`

使用递归细分生成 Sierpinski 三角形。

Flags:
- `--size` (default: 32) - 三角形底边宽度，单位为字符
- `--depth` (default: 5) - 递归深度
- `--char` (default: '*') - 用于填充点位的字符

输出：打印到 stdout 的三角形，每行对应一行图形。

### `mandelbrot`

将 Mandelbrot 集渲染为 ASCII 艺术，并把迭代次数映射为字符。

Flags:
- `--width` (default: 80) - 输出宽度，单位为字符
- `--height` (default: 24) - 输出高度，单位为字符
- `--iterations` (default: 100) - 逃逸计算的最大迭代次数
- `--char` (default: gradient) - 单个字符，或省略以使用渐变 `" .:-=+*#%@"`

输出：打印到 stdout 的矩形图案。

## 架构

```
cmd/
  fractals/
    main.go           # 入口点，CLI 初始化
internal/
  sierpinski/
    sierpinski.go     # 算法
    sierpinski_test.go
  mandelbrot/
    mandelbrot.go     # 算法
    mandelbrot_test.go
  cli/
    root.go           # 根命令，帮助信息
    sierpinski.go     # Sierpinski 子命令
    mandelbrot.go     # Mandelbrot 子命令
```

## 依赖

- Go 1.21+
- `github.com/spf13/cobra` 用于 CLI

## 验收标准

1. `fractals --help` 能显示用法
2. `fractals sierpinski` 能输出可识别的三角形
3. `fractals mandelbrot` 能输出可识别的 Mandelbrot 图案
4. `--size`、`--width`、`--height`、`--depth`、`--iterations` 等 flags 可正常工作
5. `--char` 能自定义输出字符
6. 非法输入会产生清晰的错误信息
7. 所有测试通过
