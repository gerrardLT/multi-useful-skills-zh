# Bun-Native 快速注射分类器 — 研究计划

**状态：** P3 研究/早期原型
**分支：** `garrytan/prompt-injection-guard`
**骨架：** `browse/src/security-bunnative.ts`
**TODOS 锚点：**“Bun-native 5ms DeBERTa 推理（XL、P3 / 研究）”

## 这个解决的问题

已编译的 `browse/dist/browse` 二进制文件无法链接 `onnxruntime-node`
因为 Bun 的 `--compile` 生成一个单文件可执行文件
dlopens 来自临时提取目录的依赖项，并加载本机 .dylib
从该目录失败（记录在烤箱-sh/bun#3574，#18079 +中验证
CEO 计划§实施前门 1)。

今天的缓解措施（branch-2 架构）：ML 分类器仅运行
在 `sidebar-agent.ts` （未编译的bun脚本）中通过
__代码_0__。 Server.ts（已编译）的 ML 为零 — 依赖于
金丝雀 + 架构控制（XML 框架 + 命令白名单）。

branch-2 的问题：分类器只能扫描 sidebar-agent 的内容
看到了。保留在编译的二进制文件中的任何内容路径（直接用户
输出时的输入（仅限金丝雀检查）会错过 ML 层。

一个从头开始的 Bun 原生分类器——没有原生模块，没有 onnxruntime——
将使编译后的二进制文件在任何地方运行完整的机器学习防御。

## 目标数字

|公制|当前（未编译 Bun 中的 WASM）|目标（Bun 原生）|
|---|---|---|
|冷启动|~500ms（WASM 初始化）|<100ms（嵌入映射）|
|稳态 p50|〜10毫秒|〜5毫秒|
|稳态 p95|〜30毫秒|〜15毫秒|
|在编译的二进制文件中工作|不|是（主要目标）|
|macOSarm64|好的（WASM）|目标优先|
|macOS x64|好的（WASM）|拉紧|
|Linux AMD64|好的（WASM）|拉紧|

## 建筑学

三个构建模块，按杠杆排名：

### 1. Tokenizer（完成——在 security-bunnative.ts 中发布）

读取 HuggingFace `tokenizer.json` 的 Pure-TS WordPiece 编码器
直接生成与 Transformers.js 相同的 `input_ids` 序列
对于 BERT-小词汇量。

**为什么原生分词器本身很重要：** 分词器分配一个
Transformers.js 路径中有很多小数组。我们的纯TS版本
跳过张量分配开销。适度加速（约 5 倍分词器
单独），但更重要的是：消除了异步边界，因此冷
路径以零动态导入开始。

**测试覆盖率：** `browse/test/security-bunnative.test.ts` 断言
我们的 `input_ids` 与 Transformers.js 在 20 个夹具字符串上的输出相匹配。

### 2. 前向传递（研究——多周）

困难的部分。 BERT-small 具有：
* 12层变压器
*隐藏尺寸512，注意头8个
* 总共约 30M 参数

每个前向传播是：
  1. 嵌入查找（ids → 512-dim 向量）
  2. 位置编码添加
  3. 12×（自注意力+FFN+LayerNorm）
  4. Pooler（CLS 代币投影）
  5. 分类器头（2路S形）

热路径是每个变压器层 12 个 matmul。每个都是~512×512×{seq_len}。
当 seq_len=128 时，形状为 (128, 512) @ (512, 512) 约 100 个 matmul。

**两种可行的方法：**

**方法 A：使用 Float32Array + SIMD 的 Pure-TS**
* 使用 Bun 的类型化数组支持 + SIMD 内在函数（当它们登陆时）
Bun 稳定版 — 目前仅限 wasm）
* 实现：~2000 LOC 的仔细数字。层范数、GELU、
softmax、缩放点积注意力都是手写的。
* 延迟估计：M 系列上约为 30-50 毫秒（比
使用 WebAssembly SIMD 的 WASM）
* 结论：不值得单独使用。 Pure-TS 在 matmul 上无法击败 WASM。

**方法 B：Bun FFI + Apple Accelerate**
* 使用`bun:ffi`调用Apple的Accelerate框架（cblas_sgemm）。
在 M 系列上，768×768 matmul 的 cblas_sgemm 约为 0.5ms。
* 权重存储为 Float32Array（从 ONNX 初始值设定项张量加载）
启动时），TS 中的分词器，通过 FFI 的 matmul，纯 TS 中的激活。
* 实施：~1000 LOC。数字是一样的，但是大块
工作被转移到 BLAS。
* 延迟估计：3-6ms p50（达到目标）。
* 风险：仅限 macOS。 Linux 将需要通过 FFI 的 OpenBLAS（不同
符号布局）。 Windows 是一个完全独立的故事。
* VERDICT：适用于 macOS 优先的 gstack。与我们现有的船舶相匹配
姿势（仅为 Darwin arm64 编译二进制文件）。

**方法 C：Bun 中的 WebGPU**
* Bun 在 1.1.x 中获得了 WebGPU 支持。 Transformers.js 已经有一个
WebGPU 后端。我们可以通过它来路由本地包子吗？
* 风险：macOS 上无头服务器上下文中的 WebGPU 需要适当的
显示上下文。不清楚它是否可以从编译的包二进制文件中运行。
* 状态：未开发。可能是获胜之路——值得一试。

### 3. 重量装载（EASY — 已发货）

ONNX 初始化张量可以在构建时提取一次到
`bun:ffi` 可以 `mmap()` 的平面二进制 blob。最终结果：零
运行时解压。骨架还没有这样做（它加载
通过 Transformers.js），但计划很简单，重量
选择方法 B 后，首先要构建 loader。

## 里程碑

1. **Tokenizer + 工作台安全带**（已发货）
分词器通过正确性测试。基准记录当前 WASM
基线为 10ms p50。

2. **Bun FFI 概念验证** — 来自 Apple Accelerate 的 `cblas_sgemm`，
计算 768×768 matmul 的时间。确认延迟<1ms。

3. **FFI 中的单个变压器层** — 为 Q/K/V 调用 cblas_sgemm
投影，在 TS 中实现 LayerNorm + softmax。比较输出
针对相同 input_ids 上的 onnxruntime。必须在 1e-4 范围内匹配
绝对错误。

4. **完整前向传递** — 连接所有 12 层 + 池化器 + 分类器。
100 个固定字符串中 onnxruntime 的正确性。

5. **生产交换** — 替换 `classify()` 主体
安全-bunnative.ts。删除 WASM 回退。

6. **量化** — 通过 Accelerate 的 cblas_sgemv_u8s8 进行 int8 matmul
（如果可用）或回退到 onnxruntime-extensions。 ~50% 内存
减少，边际速度取胜。

## 为什么不直接在 v1 中发布它呢？

正确性是问题。浮点重新实现
预训练变压器是一项为期数周的工程工作，其中每个
op 需要与参考的 epsilon 级协议。获取LayerNorm
epsilon 错误，准确性悄然漂移。获取softmax溢出
处理错误并且分类器在长输入上产生垃圾。

在 P0 安全功能的 PR 下发布该内容是错误的风险
分配。现在发送 WASM 路径（完成），证明接口
（通过 `classify()` 发送），作为后续增量落地原生
PR 拥有自己的正确性回归测试套件。

## 基准

当前基线（来自 `browse/test/security-bunnative.test.ts`
基准测试模式，在 Apple M 系列上测量 — 其他硬件上的 YMMV）：

|后端| p50 | p95 | p99 |笔记|
|---|---|---|---|---|
|Transformer.js (WASM)|〜10毫秒|〜30毫秒|〜80毫秒|热身后|
|Bun-native（存根 - 代表）|与 WASM 相同| | |设计匹配|

当方法 B（加速 FFI）落地时，该行将刷新
新数字和提交消息中标记的增量。
