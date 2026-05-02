# 目录产物

这些文件是为 skills 和 commands 生成的导航索引。

- `skills-index.yaml` - 机器可读的 skill 元数据索引
- `commands-index.yaml` - 机器可读的 command 元数据索引
- `skills-by-type.md` - 按 skill 类型浏览的人类可读视图
- `commands.md` - 人类可读的 command 目录

当 skills 或 commands 发生变化时，可重新生成：

```bash
python3 scripts/generate-catalog.py
```