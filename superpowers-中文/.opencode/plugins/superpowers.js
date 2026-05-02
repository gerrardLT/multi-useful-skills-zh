/**
 * OpenCode.ai 的 Superpowers 插件
 *
 * 通过消息转换钩子注入 superpowers bootstrap 上下文，
 * 并通过 config hook 自动注册 skills 目录，无需手工创建 symlink。
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 简单 frontmatter 提取逻辑。
// 这里不依赖 skills-core，避免 bootstrap 阶段引入额外依赖。
const extractAndStripFrontmatter = (content) => {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content };

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  }

  return { frontmatter, content: body };
};

// 规范化路径：去空白、展开 ~、再解析成绝对路径
const normalizePath = (p, homeDir) => {
  if (!p || typeof p !== 'string') return null;
  let normalized = p.trim();
  if (!normalized) return null;
  if (normalized.startsWith('~/')) {
    normalized = path.join(homeDir, normalized.slice(2));
  } else if (normalized === '~') {
    normalized = homeDir;
  }
  return path.resolve(normalized);
};

export const SuperpowersPlugin = async ({ client, directory }) => {
  const homeDir = os.homedir();
  const superpowersSkillsDir = path.resolve(__dirname, '../../skills');
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || path.join(homeDir, '.config/opencode');

  // 生成 bootstrap 内容
  const getBootstrapContent = () => {
    // 尝试加载 using-superpowers skill
    const skillPath = path.join(superpowersSkillsDir, 'using-superpowers', 'SKILL.md');
    if (!fs.existsSync(skillPath)) return null;

    const fullContent = fs.readFileSync(skillPath, 'utf8');
    const { content } = extractAndStripFrontmatter(fullContent);

    const toolMapping = `**OpenCode 的工具映射：**
当 skills 提到你没有的工具时，请替换成 OpenCode 对应能力：
- \`TodoWrite\` -> \`todowrite\`
- 带子代理的 \`Task\` 工具 -> 使用 OpenCode 的子代理系统（@mention）
- \`Skill\` 工具 -> OpenCode 原生 \`skill\` 工具
- \`Read\`、\`Write\`、\`Edit\`、\`Bash\` -> 你的原生工具

请使用 OpenCode 原生 \`skill\` 工具来列出并加载 skills。`;

    return `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}
</EXTREMELY_IMPORTANT>`;
  };

  return {
    // 把 skills 路径注入到运行时配置里，
    // 让 OpenCode 能自动发现 superpowers skills，
    // 而无需手工创建 symlink 或改配置文件。
    // 之所以可行，是因为 Config.get() 返回的是缓存单例，
    // 这里的改动会被后续延迟发现 skills 的流程看到。
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(superpowersSkillsDir)) {
        config.skills.paths.push(superpowersSkillsDir);
      }
    },

    // 把 bootstrap 注入到每次会话的第一条用户消息中。
    // 使用用户消息而不是 system message，可以避免：
    //   1. 每轮重复 system message 导致 token 膨胀（#750）
    //   2. 多 system message 导致 Qwen 等模型兼容性问题（#894）
    'experimental.chat.messages.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find(m => m.info.role === 'user');
      if (!firstUser || !firstUser.parts.length) return;
      // 只注入一次
      if (firstUser.parts.some(p => p.type === 'text' && p.text.includes('EXTREMELY_IMPORTANT'))) return;
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: 'text', text: bootstrap });
    }
  };
};
