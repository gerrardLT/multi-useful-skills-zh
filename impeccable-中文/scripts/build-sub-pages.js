/**
 * Generate static HTML files for /docs, /slop, /tutorials, /live-mode,
 * /designing.
 *
 * Called from both scripts/build.js (before buildStaticSite) and
 * server/index.js (at module load), so dev and prod share the same
 * code path and output shape.
 *
 * Output lives under public/docs/, public/slop/, public/tutorials/, all
 * gitignored. Bun's HTML loader picks them up the same way it picks up
 * the hand-authored pages.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  buildSubPageData,
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  COMMAND_RELATIONSHIPS,
  LAYER_LABELS,
  LAYER_DESCRIPTIONS,
  GALLERY_ITEMS,
} from './lib/sub-pages-data.js';
import { renderMarkdown, slugify } from './lib/render-markdown.js';
import { renderPage } from './lib/render-page.js';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CATEGORY_LABELS_ZH = {
  tutorials: '教程',
  create: 'Create',
  evaluate: 'Evaluate',
  refine: 'Refine',
  simplify: 'Simplify',
  harden: 'Harden',
  system: 'System',
};

const CATEGORY_DESCRIPTIONS_ZH = {
  create: '从空白页开始，做出一个真正可运行的新功能。',
  evaluate: '审视你已经有的结果，打分、批评，并找出真正该修的地方。',
  refine: '一次只优化一个维度：字体、布局、颜色、动效。',
  simplify: '剥掉复杂度，移除那些不值得占位置的东西。',
  harden: '把它推进到可上线状态。边界情况、性能、细节打磨都要补齐。',
  system: '初始化与工具能力，包括设计系统整理、提取和组织。',
};

/**
 * Render the before/after split-compare demo block for a skill.
 * Returns '' when the skill has no demo data (e.g. /shape).
 */
function renderSkillDemo(skill) {
  if (!skill.demo) return '';
  const { before, after, caption } = skill.demo;
  return `
<section class="skill-demo" aria-label="Before and after demo">
  <div class="split-comparison" data-demo="skill-${skill.id}">
    <p class="skill-demo-eyebrow">Drag or hover to compare</p>
    <div class="split-container">
      <div class="split-before">
        <div class="split-content">${before}</div>
      </div>
      <div class="split-after">
        <div class="split-content">${after || before}</div>
      </div>
      <div class="split-divider"></div>
    </div>
    <div class="split-labels">
      <span class="split-label-item" data-point="before">Before</span>
      ${caption ? `<p class="skill-demo-caption">${escapeHtml(caption)}</p>` : '<span></span>'}
      <span class="split-label-item" data-point="after">After</span>
    </div>
  </div>
</section>`;
}

function renderCraftCaseCallout() {
  return `
<aside class="craft-case-callout" aria-labelledby="craft-case-title">
  <div class="craft-case-copy">
    <span class="craft-case-eyebrow">Real example</span>
    <h2 id="craft-case-title">Neo Mirai: generated reference to shipped page.</h2>
    <p>A retro-futurist AI design conference moved through the full loop: brand toolkit, hi-fi mock, semantic implementation, regenerated assets, responsive fixes, and browser polish.</p>
    <div class="code-block-wrap craft-case-command">
      <pre class="code-block code-block--bash"><code>npx impeccable craft retro-futurist AI design conference website</code></pre>
      <button class="code-block-copy" type="button" data-copy="npx impeccable craft retro-futurist AI design conference website" aria-label="Copy to clipboard"></button>
    </div>
    <p class="craft-case-link-row">
      <a href="/cases/neo-mirai">Read the case</a>
      <a href="/neo-mirai/">Open the build</a>
    </p>
  </div>
  <div class="craft-case-images" aria-hidden="true">
    <img src="../assets/openai_image_2_hifi.jpg" alt="" loading="lazy" width="864" height="1821" />
    <img src="../assets/cases/neo-mirai/home.png" alt="" loading="lazy" width="1440" height="1100" />
  </div>
</aside>`;
}

/**
 * Render one skill detail page HTML body (without the site shell).
 */
function renderSkillDetail(skill, knownSkillIds) {
  const bodyHtml = renderMarkdown(skill.body, {
    knownSkillIds,
    currentSkillId: skill.id,
  });

  const editorialHtml = skill.editorial
    ? renderMarkdown(skill.editorial.body, { knownSkillIds, currentSkillId: skill.id })
    : '';

  const demoHtml = renderSkillDemo(skill);
  const caseCalloutHtml = skill.id === 'craft' ? renderCraftCaseCallout() : '';

  const tagline = skill.editorial?.frontmatter?.tagline || skill.description;
  const categoryLabel = CATEGORY_LABELS[skill.category] || skill.category;

  // Reference files as collapsible <details> blocks
  let referencesHtml = '';
  if (skill.references && skill.references.length > 0) {
    const refs = skill.references
      .map((ref) => {
        const slug = slugify(ref.name);
        const refBody = renderMarkdown(ref.content, {
          knownSkillIds,
          currentSkillId: skill.id,
        });
        const title = ref.name
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        return `
<details class="skill-reference" id="reference-${slug}">
  <summary><span class="skill-reference-label">Reference</span><span class="skill-reference-title">${escapeHtml(title)}</span></summary>
  <div class="prose skill-reference-body">
${refBody}
  </div>
</details>`;
      })
      .join('\n');
    referencesHtml = `
<section class="skill-references" aria-label="Reference material">
  <h2 class="skill-references-heading">Deeper reference</h2>
  ${refs}
</section>`;
  }

  const metaStrip = `
<div class="skill-meta-strip">
  <span class="skill-meta-chip skill-meta-category" data-category="${skill.category}">${escapeHtml(categoryLabel)}</span>
  <span class="skill-meta-chip">User-invocable</span>
  ${skill.argumentHint ? `<span class="skill-meta-chip skill-meta-args">${escapeHtml(skill.argumentHint)}</span>` : ''}
</div>`;

  const hasDemo = demoHtml.trim().length > 0;

  // Sub-commands are accessed via /impeccable <name>. Show "/impeccable" as
  // a smaller namespace label above the command name, matching the magazine
  // spread treatment so the command name stays at full display size.
  const titleHtml = skill.isSubCommand
    ? `<span class="skill-detail-title-namespace"><span class="skill-detail-title-slash">/</span>impeccable</span>${escapeHtml(skill.id)}`
    : `<span class="skill-detail-title-slash">/</span>${escapeHtml(skill.id)}`;

  return `
<article class="skill-detail">
  <div class="skill-detail-hero${hasDemo ? ' skill-detail-hero--has-demo' : ''}">
    <header class="skill-detail-header">
      <p class="skill-detail-eyebrow"><a href="/docs">Docs</a> / ${escapeHtml(categoryLabel)}</p>
      <h1 class="skill-detail-title">${titleHtml}</h1>
      <p class="skill-detail-tagline">${escapeHtml(tagline)}</p>
      ${metaStrip}
    </header>
    ${demoHtml}
  </div>

  ${editorialHtml ? `<section class="skill-detail-editorial prose">\n${editorialHtml}\n</section>` : ''}

  ${caseCalloutHtml}

  <section class="skill-source-card">
    <header class="skill-source-card-header">
      <span class="skill-source-card-label">${skill.isSubCommand ? 'reference/' + escapeHtml(skill.id) + '.md' : 'SKILL.md'}</span>
      <span class="skill-source-card-subtitle">${skill.isSubCommand ? 'Loaded when the impeccable skill routes to this command.' : 'The canonical skill definition your AI harness loads.'}</span>
    </header>
    <div class="skill-source-card-body prose">
${bodyHtml}
    </div>
  </section>

  ${referencesHtml}
</article>
`;
}

/**
 * Render the unified Docs sidebar used across /skills and /tutorials.
 * Shows every skill grouped by category, then tutorials as a final
 * group. Pass the current page identifier so we can mark it:
 *
 *   { kind: 'skill', id: 'polish' }
 *   { kind: 'tutorial', slug: 'getting-started' }
 *   null (no current page)
 */
function renderDocsSidebar(skillsByCategory, tutorials, current = null) {
  // Label the toggle button with the current page so mobile users know
  // where they are at a glance, then open the menu to switch.
  let currentLabel = '文档目录';
  if (current?.kind === 'skill') {
    currentLabel = `/${current.id}`;
  } else if (current?.kind === 'tutorial') {
    const t = tutorials.find((x) => x.slug === current.slug);
    if (t) currentLabel = t.title;
  }

  let html = `
<aside class="skills-sidebar" aria-label="文档导航">
  <button class="skills-sidebar-toggle" type="button" aria-expanded="false" aria-controls="skills-sidebar-inner">
    <span class="skills-sidebar-toggle-label">${escapeHtml(currentLabel)}</span>
    <svg class="skills-sidebar-toggle-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <div class="skills-sidebar-inner" id="skills-sidebar-inner">
    <p class="skills-sidebar-label">文档</p>
`;

  // Tutorials first: walk-throughs are the on-ramp, they go at the top.
  if (tutorials && tutorials.length > 0) {
    html += `
    <div class="skills-sidebar-group" data-category="tutorials">
      <p class="skills-sidebar-group-title">教程</p>
      <ul class="skills-sidebar-list">
${tutorials
  .map((t) => {
    const isCurrent = current?.kind === 'tutorial' && current.slug === t.slug;
    const attr = isCurrent ? ' aria-current="page"' : '';
    return `        <li><a href="/tutorials/${t.slug}"${attr}>${escapeHtml(t.title)}</a></li>`;
  })
  .join('\n')}
      </ul>
    </div>
    <hr class="skills-sidebar-divider">
`;
  }

  // Then the skills, grouped by category. The root "/impeccable" entry is
  // shown with its slash; sub-commands are shown as bare names (since the
  // invocation is /impeccable <name>). Within a category the list is
  // alphabetical, except /impeccable always pins to the top of Create.
  for (const category of CATEGORY_ORDER) {
    const raw = skillsByCategory[category] || [];
    if (raw.length === 0) continue;
    const list = [...raw].sort((a, b) => {
      if (a.id === 'impeccable') return -1;
      if (b.id === 'impeccable') return 1;
      return a.id.localeCompare(b.id);
    });
    html += `
    <div class="skills-sidebar-group" data-category="${category}">
      <p class="skills-sidebar-group-title">${escapeHtml(CATEGORY_LABELS_ZH[category] || CATEGORY_LABELS[category])}</p>
      <ul class="skills-sidebar-list">
${list
  .map((s) => {
    const isCurrent = current?.kind === 'skill' && current.id === s.id;
    const attr = isCurrent ? ' aria-current="page"' : '';
    const label = s.id === 'impeccable' ? '/impeccable' : escapeHtml(s.id);
    return `        <li><a href="/docs/${s.id}"${attr}>${label}</a></li>`;
  })
  .join('\n')}
      </ul>
    </div>
`;
  }

  html += `
  </div>
</aside>`;
  return html;
}

/**
 * Render the /skills overview main column content (not the sidebar).
 * This is the orientation piece: what skills are, how to pick one,
 * the six categories explained with inline cross-links to detail pages.
 */
function renderSkillsOverviewMain(skillsByCategory, allSkills) {
  // Build a lookup by id so we can pull taglines/descriptions for the cards.
  const skillsById = Object.fromEntries(allSkills.map((s) => [s.id, s]));
  const commandCount = allSkills.filter((s) => s.id !== 'impeccable').length;

  // Short, clean tagline for the home command card. Fall back to the editorial
  // tagline if set, otherwise use a default.
  const impeccable = skillsById['impeccable'];
  const homeTagline = impeccable?.editorial?.frontmatter?.tagline
    || '每个命令背后的设计智能。';

  // Render a single command as a compact row: name on the left, description
  // and relationship on the right. Matches the original cheatsheet density.
  const renderCommandRow = (skill) => {
    const tagline = skill.editorial?.frontmatter?.tagline || skill.description;
    const shortTagline = tagline.length > 140 ? tagline.slice(0, 137) + '...' : tagline;
    const rel = COMMAND_RELATIONSHIPS[skill.id] || {};
    const isAlpha = skill.id === 'live';

    let metaHtml = '';
    if (rel.pairs) {
      metaHtml = `<div class="command-row-rel">可搭配 <a href="/docs/${rel.pairs}">${rel.pairs}</a></div>`;
    } else if (rel.leadsTo?.length) {
      const links = rel.leadsTo.map((c) => `<a href="/docs/${c}">${c}</a>`).join(', ');
      metaHtml = `<div class="command-row-rel">可继续接 ${links}</div>`;
    } else if (rel.combinesWith?.length) {
      const links = rel.combinesWith.map((c) => `<a href="/docs/${c}">${c}</a>`).join(', ');
      metaHtml = `<div class="command-row-rel">常与 ${links} 组合使用</div>`;
    }

    // Row is a <div> (not an <a>) so the inner relationship links are valid.
    // The name on the left is the primary link target.
    return `
      <div class="command-row">
        <div class="command-row-name">
          <a href="/docs/${skill.id}"><span class="command-row-namespace">/impeccable</span> ${escapeHtml(skill.id)}</a>${isAlpha ? ' <span class="command-row-beta">ALPHA</span>' : ''}
        </div>
        <div class="command-row-info">
          <p class="command-row-desc">${escapeHtml(shortTagline)}</p>
          ${metaHtml}
        </div>
      </div>`;
  };

  // Render category sections, skipping the Create category's /impeccable root
  // (shown as a hero card above) but keeping everything else in place.
  let categoriesHtml = '';
  for (const category of CATEGORY_ORDER) {
    const list = (skillsByCategory[category] || []).filter((s) => s.id !== 'impeccable');
    if (list.length === 0) continue;

    const rowsHtml = list.map(renderCommandRow).join('');

    categoriesHtml += `
    <section class="docs-category" data-category="${category}" id="category-${category}">
      <header class="docs-category-header">
        <div>
          <h2 class="docs-category-title">${escapeHtml(CATEGORY_LABELS_ZH[category] || CATEGORY_LABELS[category])}</h2>
          <p class="docs-category-desc">${escapeHtml(CATEGORY_DESCRIPTIONS_ZH[category] || CATEGORY_DESCRIPTIONS[category])}</p>
        </div>
        <span class="docs-category-count">${list.length} ${list.length === 1 ? 'command' : 'commands'}</span>
      </header>
      <div class="docs-category-rows">
${rowsHtml}
      </div>
    </section>
`;
  }

  return `
<div class="docs-overview">
  <header class="docs-overview-header">
    <p class="sub-page-eyebrow">1 个 skill，${commandCount} 个命令</p>
    <h1 class="sub-page-title">命令</h1>
    <p class="sub-page-lede">Impeccable 会给你和 AI 一套共享设计词汇。${commandCount} 个命令分别封装了明确设计能力，所以你可以精确控制方向。你可以自己选命令，也可以交给 skill 自动路由。</p>
  </header>

  <section class="docs-home-card">
    <div class="docs-home-card-identity">
      <span class="docs-home-card-eyebrow">总入口命令</span>
      <h2 class="docs-home-card-title">/impeccable</h2>
      <p class="docs-home-card-tagline">${escapeHtml(homeTagline)}</p>
      <p class="docs-home-card-desc">直接调用 <code>/impeccable</code>，就能在完整设计手册加载完的前提下做自由设计工作。你也可以直接进入这些专用模式：</p>
    </div>
    <ul class="docs-home-card-modes">
      <li>
        <a href="/docs/teach">
          <span class="docs-home-mode-label"><span class="docs-home-mode-slash">/</span>impeccable teach</span>
          <span class="docs-home-mode-hint">项目的一次性初始化。先写 PRODUCT.md，接着可继续生成 DESIGN.md。</span>
        </a>
      </li>
      <li>
        <a href="/docs/document">
          <span class="docs-home-mode-label"><span class="docs-home-mode-slash">/</span>impeccable document</span>
          <span class="docs-home-mode-hint">生成一份符合规范的 DESIGN.md，把你的视觉系统沉淀下来。</span>
        </a>
      </li>
      <li>
        <a href="/docs/craft">
          <span class="docs-home-mode-label"><span class="docs-home-mode-slash">/</span>impeccable craft</span>
          <span class="docs-home-mode-hint">完整的先 shape 再 build 流程，并包含可视化迭代。</span>
        </a>
      </li>
      <li>
        <a href="/docs/live">
          <span class="docs-home-mode-label"><span class="docs-home-mode-slash">/</span>impeccable live</span>
          <span class="docs-home-mode-hint">选中一个元素，生成 3 个变体，接受其中一个，然后回写到源码。</span>
        </a>
      </li>
    </ul>
  </section>

  <div class="docs-categories">
${categoriesHtml}
  </div>
</div>`;
}

/**
 * Wrap sidebar + main content in the docs-browser layout shell.
 */
function wrapInDocsLayout(sidebarHtml, mainHtml) {
  return `
<div class="skills-layout">
  ${sidebarHtml}
  <div class="skills-main">
${mainHtml}
  </div>
</div>`;
}

/**
 * Group anti-pattern rules by skill section.
 * Rules without a skillSection fall into a 'General quality' bucket.
 */
function groupRulesBySection(rules) {
  // Canonical ordering. Additional sections referenced by rules (e.g.
  // 'Interaction', 'Responsive' from LLM-only entries) are appended to
  // the end, before 'General quality', so every rule renders.
  const primaryOrder = [
    'Visual Details',
    'Typography',
    'Color & Contrast',
    'Layout & Space',
    'Motion',
    'Interaction',
    'Responsive',
  ];
  const bySection = {};
  for (const name of primaryOrder) bySection[name] = [];
  bySection['General quality'] = [];

  for (const rule of rules) {
    const section = rule.skillSection || 'General quality';
    if (!bySection[section]) bySection[section] = [];
    bySection[section].push(rule);
  }

  // Sort each bucket: slop first (they're the named tells), then quality.
  for (const name of Object.keys(bySection)) {
    bySection[name].sort((a, b) => {
      if (a.category !== b.category) return a.category === 'slop' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  // Final render order: primary sections first, then any extras that
  // rules introduced, then General quality last.
  const order = [...primaryOrder];
  for (const name of Object.keys(bySection)) {
    if (!order.includes(name) && name !== 'General quality') {
      order.push(name);
    }
  }
  order.push('General quality');

  return { order, bySection };
}

/**
 * Render the /slop sidebar: a table of contents for the four top-level
 * sections (See it / Try it live / The catalog / Run it yourself), with
 * the catalog's per-section anchors nested under "The catalog".
 */
function renderSlopSidebar(grouped, gallerySize) {
  const catalogEntries = grouped.order
    .filter((section) => grouped.bySection[section]?.length > 0)
    .map((section) => {
      const slug = slugify(section);
      const count = grouped.bySection[section].length;
      return `            <li><a href="#section-${slug}"><span>${escapeHtml(section)}</span><span class="anti-patterns-sidebar-count">${count}</span></a></li>`;
    })
    .join('\n');

  const catalogTotal = grouped.order
    .reduce((sum, s) => sum + (grouped.bySection[s]?.length || 0), 0);

  return `
<aside class="skills-sidebar slop-sidebar" aria-label="Slop page sections">
  <button class="skills-sidebar-toggle" type="button" aria-expanded="false" aria-controls="slop-sidebar-inner">
    <span class="skills-sidebar-toggle-label">On this page</span>
    <svg class="skills-sidebar-toggle-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
  </button>
  <div class="skills-sidebar-inner" id="slop-sidebar-inner">
    <p class="skills-sidebar-label">On this page</p>
    <div class="skills-sidebar-group">
      <ul class="skills-sidebar-list anti-patterns-sidebar-list">
        <li><a href="#see-it"><span>See it</span></a></li>
        <li><a href="#try-it-live"><span>Try it live</span><span class="anti-patterns-sidebar-count">${gallerySize}</span></a></li>
        <li>
          <a href="#catalog"><span>The catalog</span><span class="anti-patterns-sidebar-count">${catalogTotal}</span></a>
          <ul class="slop-sidebar-sublist">
${catalogEntries}
          </ul>
        </li>
        <li><a href="#run-it"><span>Run it yourself</span></a></li>
      </ul>
    </div>
  </div>
</aside>`;
}

/**
 * Render one rule card inside the anti-patterns main column.
 */
function renderRuleCard(rule) {
  const categoryLabel = rule.category === 'slop' ? 'AI slop' : 'Quality';
  const layer = rule.layer || 'cli';
  const layerLabel = LAYER_LABELS[layer] || layer;
  const layerTitle = LAYER_DESCRIPTIONS[layer] || '';
  const skillLink = rule.skillSection
    ? `<a class="rule-card-skill-link" href="/docs/impeccable#${slugify(rule.skillSection)}">See in /impeccable</a>`
    : '';
  const visual = rule.visual
    ? `<div class="rule-card-visual" aria-hidden="true"><div class="rule-card-visual-inner">${rule.visual}</div></div>`
    : '';
  return `
    <article class="rule-card" id="rule-${rule.id}" data-layer="${layer}">
      ${visual}
      <div class="rule-card-body">
        <div class="rule-card-head">
          <span class="rule-card-category" data-category="${rule.category}">${categoryLabel}</span>
          <span class="rule-card-layer" data-layer="${layer}" title="${escapeAttr(layerTitle)}">${escapeHtml(layerLabel)}</span>
        </div>
        <h3 class="rule-card-name">${escapeHtml(rule.name)}</h3>
        <p class="rule-card-desc">${escapeHtml(rule.description)}</p>
        ${skillLink}
      </div>
    </article>`;
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;');
}

/**
 * Render the /tutorials index main content.
 */
function renderTutorialsIndexMain(tutorials) {
  const cards = tutorials
    .map(
      (t) => `
    <a class="tutorial-card" href="/tutorials/${t.slug}">
      <span class="tutorial-card-number">${String(t.order).padStart(2, '0')}</span>
      <div class="tutorial-card-body">
        <h2 class="tutorial-card-title">${escapeHtml(t.title)}</h2>
        <p class="tutorial-card-tagline">${escapeHtml(t.tagline || t.description)}</p>
      </div>
      <span class="tutorial-card-arrow">→</span>
    </a>`,
    )
    .join('\n');

  return `
<div class="tutorials-content">
  <header class="sub-page-header">
    <p class="sub-page-eyebrow">${tutorials.length} 条短路径</p>
    <h1 class="sub-page-title">教程</h1>
    <p class="sub-page-lede">这 ${tutorials.length} 条教程都聚焦最有杠杆的工作流。每条大约十分钟，结束时你都会在自己的项目里拿到一个真正跑起来的结果。</p>
  </header>

  <div class="tutorial-cards">
${cards}
  </div>
</div>`;
}

/**
 * Render the /slop page main content.
 *
 * Four numbered sections in one scroll: See it (iframe overlay demo),
 * Try it live (specimen gallery), The catalog (the full rule list), and
 * Run it yourself (three invocation methods). Lives inside the docs
 * layout shell so the slop sidebar (renderSlopSidebar) navigates both
 * the top-level anchors and the per-catalog-section anchors.
 */
function renderSlopMain(grouped, totalRules) {
  // Catalog: rule-card sections, grouped by skillSection.
  let catalogSectionsHtml = '';
  for (const section of grouped.order) {
    const rules = grouped.bySection[section] || [];
    if (rules.length === 0) continue;
    const slug = slugify(section);
    catalogSectionsHtml += `
      <section class="anti-patterns-section" id="section-${slug}">
        <header class="anti-patterns-section-header">
          <h3 class="anti-patterns-section-title">${escapeHtml(section)}</h3>
          <p class="anti-patterns-section-count">${rules.length} ${rules.length === 1 ? 'rule' : 'rules'}</p>
        </header>
        <div class="rule-card-grid">
${rules.map(renderRuleCard).join('\n')}
        </div>
      </section>`;
  }

  const detectedCount = grouped.order
    .flatMap((s) => grouped.bySection[s] || [])
    .filter((r) => r.layer !== 'llm').length;
  const llmCount = totalRules - detectedCount;

  const specimenCards = GALLERY_ITEMS.map(
    (item) => `
      <a class="gallery-card" href="/antipattern-examples/${item.id}.html">
        <div class="gallery-card-thumb">
          <img src="../antipattern-images/${item.id}.png" alt="${escapeAttr(item.title)} specimen" loading="lazy" width="540" height="540">
        </div>
        <div class="gallery-card-body">
          <h3 class="gallery-card-title">${escapeHtml(item.title)}</h3>
          <p class="gallery-card-desc">${escapeHtml(item.desc)}</p>
        </div>
      </a>`,
  ).join('\n');

  return `
<div class="anti-patterns-content slop-content">
  <header class="anti-patterns-header slop-header">
    <p class="sub-page-eyebrow">The visible tells of AI design</p>
    <h1 class="sub-page-title">Slop</h1>
    <p class="sub-page-lede">${totalRules} patterns that mark an interface as AI-generated, and the detection overlay that catches them in place. Watch it flag them live, try it on ${GALLERY_ITEMS.length} synthetic specimens, or browse the full catalog. ${detectedCount} rules run deterministically (<code>npx impeccable detect</code> or the browser extension); ${llmCount} need <a href="/docs/critique">/impeccable critique</a>'s LLM review pass.</p>
  </header>

  <section class="slop-section visual-mode-demo-wrap" id="see-it" aria-label="Detection overlay demo">
    <h2 class="slop-section-heading"><span class="slop-section-num">01</span> See it</h2>
    <div class="visual-mode-preview">
      <div class="visual-mode-preview-header">
        <span class="visual-mode-preview-dot red"></span>
        <span class="visual-mode-preview-dot yellow"></span>
        <span class="visual-mode-preview-dot green"></span>
        <span class="visual-mode-preview-title">Live on a synthetic slop page</span>
      </div>
      <iframe src="/antipattern-examples/visual-mode-demo.html" class="visual-mode-frame" loading="lazy" title="Impeccable overlay running on a demo page"></iframe>
    </div>
    <p class="visual-mode-demo-caption">Hover or tap any outlined element to see which rule fired.</p>
  </section>

  <section class="slop-section visual-mode-gallery" id="try-it-live" aria-label="Try the overlay on synthetic specimens">
    <header class="visual-mode-gallery-header">
      <h2 class="slop-section-heading"><span class="slop-section-num">02</span> Try it live</h2>
      <p class="visual-mode-gallery-lede">These ${GALLERY_ITEMS.length} synthetic slop pages ship with the detector script baked in. Click any to see the overlay running on a real page, then hover the outlined elements.</p>
    </header>
    <div class="gallery-grid">
${specimenCards}
    </div>
  </section>

  <section class="slop-section slop-catalog" id="catalog" aria-label="Rule catalog">
    <header class="slop-catalog-header">
      <h2 class="slop-section-heading"><span class="slop-section-num">03</span> The catalog</h2>
      <p class="slop-catalog-lede">Every pattern <a href="/docs/impeccable">/impeccable</a> teaches against. <strong>AI slop</strong> rules flag the tells of AI-generated UIs; <strong>Quality</strong> rules flag general design mistakes that hurt regardless of who wrote them.</p>
    </header>

    <details class="anti-patterns-legend">
      <summary class="anti-patterns-legend-summary">
        <span class="anti-patterns-legend-title">How to read this</span>
        <svg class="anti-patterns-legend-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </summary>
      <div class="anti-patterns-legend-body">
        <p>Each rule shows how it is detected:</p>
        <dl class="anti-patterns-legend-layers">
          <div><dt><span class="rule-card-layer" data-layer="cli">CLI</span></dt><dd>Deterministic. Runs from <code>npx impeccable detect</code> on files, no browser required.</dd></div>
          <div><dt><span class="rule-card-layer" data-layer="browser">Browser</span></dt><dd>Deterministic, but needs real browser layout. Runs via the browser extension or Puppeteer, not the plain CLI.</dd></div>
          <div><dt><span class="rule-card-layer" data-layer="llm">LLM only</span></dt><dd>No deterministic detector. Caught by <a href="/docs/critique">/impeccable critique</a> during its LLM design review.</dd></div>
        </dl>
      </div>
    </details>

    <div class="anti-patterns-sections">
${catalogSectionsHtml}
    </div>
  </section>

  <section class="slop-section visual-mode-methods" id="run-it" aria-label="Where to run the overlay">
    <h2 class="slop-section-heading"><span class="slop-section-num">04</span> Run it yourself</h2>
    <div class="visual-mode-methods-grid">
      <article class="visual-mode-method">
        <p class="visual-mode-method-label">Inside /impeccable critique</p>
        <h3 class="visual-mode-method-name"><a href="/docs/critique">/impeccable critique</a></h3>
        <p class="visual-mode-method-desc">The design review command opens the overlay automatically during its browser assessment pass. Deterministic findings highlighted in place while the LLM runs its separate heuristic review.</p>
      </article>
      <article class="visual-mode-method">
        <p class="visual-mode-method-label">Standalone CLI</p>
        <h3 class="visual-mode-method-name"><code>npx impeccable live</code></h3>
        <p class="visual-mode-method-desc">Starts a local server that serves the detector script. Inject it into any page via a <code>&lt;script&gt;</code> tag to see the overlay. Works on your own dev server, a staging URL, or anyone's live page.</p>
      </article>
      <article class="visual-mode-method">
        <p class="visual-mode-method-label">Easiest</p>
        <h3 class="visual-mode-method-name">Chrome extension</h3>
        <p class="visual-mode-method-desc">One-click activation on any tab. <a href="https://chromewebstore.google.com/detail/impeccable/bdkgmiklpdmaojlpflclinlofgjfpabf" target="_blank" rel="noopener">Install from Chrome Web Store &rarr;</a></p>
      </article>
    </div>
  </section>
</div>`;
}

/**
 * Render the animated Live Mode demo block. HTML structure matches the
 * homepage #live-demo exactly so public/js/components/live-demo.js can
 * drive it without modification. The CSS (.live-demo-*) lives in
 * public/css/live-mode.css, imported by main.css and also loaded on this
 * page via extraHead.
 */
function renderLiveModeDemo() {
  return `
<div class="live-demo" id="live-demo" aria-label="Live Mode interactive demo loop">
  <div class="live-demo-frame-col"><div class="live-demo-frame">
    <div class="live-demo-chrome">
      <span class="live-demo-dot"></span>
      <span class="live-demo-dot"></span>
      <span class="live-demo-dot"></span>
      <span class="live-demo-url">localhost:3000</span>
    </div>

    <div class="live-demo-stage">
      <div class="live-demo-skeleton" aria-hidden="true">
        <div class="live-demo-skel-nav">
          <span class="live-demo-skel-logo"></span>
          <span class="live-demo-skel-link"></span>
          <span class="live-demo-skel-link"></span>
          <span class="live-demo-skel-link"></span>
          <span class="live-demo-skel-cta"></span>
        </div>
        <div class="live-demo-skel-heading"></div>
        <div class="live-demo-skel-line"></div>
        <div class="live-demo-skel-line live-demo-skel-line--short"></div>
      </div>

      <div class="live-demo-target" data-demo-target>
        <div class="live-demo-variant is-active" data-variant="original">
          <div class="live-demo-card live-demo-card--plain">
            <span class="live-demo-card-kicker">Newsletter</span>
            <h3>Subscribe for updates</h3>
            <p>Monthly-ish design notes.</p>
            <button type="button">Subscribe</button>
          </div>
        </div>
        <div class="live-demo-variant" data-variant="1">
          <div class="live-demo-card live-demo-card--v1">
            <span class="live-demo-card-kicker">No. 04</span>
            <h3>Letters, <em>occasionally</em>.</h3>
            <p>A postcard from the editor, about once a month. No tracking pixels, no "just checking in."</p>
            <button type="button">Send me one</button>
          </div>
        </div>
        <div class="live-demo-variant" data-variant="2">
          <div class="live-demo-card live-demo-card--v2">
            <div class="live-demo-card-stamp">☞</div>
            <span class="live-demo-card-kicker">Dispatch</span>
            <h3>Design&nbsp;notes, <br>every&nbsp;other<br>Thursday.</h3>
            <button type="button">Join the list →</button>
          </div>
        </div>
        <div class="live-demo-variant" data-variant="3">
          <div class="live-demo-card live-demo-card--v3">
            <div class="live-demo-card-sticker"><span>&star;</span><span>&star;</span><span>&star;</span></div>
            <span class="live-demo-card-kicker">Field Notes</span>
            <h3>A monthly letter, for people who still read email for pleasure.</h3>
            <button type="button">Receive the letter <span aria-hidden="true">✺</span></button>
          </div>
        </div>
      </div>

      <div class="live-demo-outline" data-demo-outline aria-hidden="true"></div>

      <div class="live-demo-annotations" data-demo-annotations aria-hidden="true">
        <svg class="live-demo-stroke" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 10,40 Q 60,10 110,38 T 210,32 T 290,20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" pathLength="1"/>
        </svg>
        <div class="live-demo-comment">more playful</div>
      </div>

      <div class="live-demo-ctx" data-demo-ctx data-phase="hidden">
        <div class="live-demo-ctx-row live-demo-ctx-row--configure">
          <button type="button" class="live-demo-ctx-pill" data-demo-ctx-pill>
            <span data-demo-cmd-name>delight</span>
            <span class="live-demo-ctx-pill-caret" aria-hidden="true">▾</span>
          </button>
          <span class="live-demo-ctx-input" data-demo-input>
            <span data-demo-input-text></span><span class="live-demo-ctx-caret"></span>
          </span>
          <button type="button" class="live-demo-ctx-count">×3</button>
          <button type="button" class="live-demo-ctx-go" data-demo-go>Go <span aria-hidden="true">→</span></button>
        </div>
        <div class="live-demo-ctx-row live-demo-ctx-row--generating">
          <span class="live-demo-ctx-spinner" aria-hidden="true"></span>
          <span>Generating variants…</span>
        </div>
        <div class="live-demo-ctx-row live-demo-ctx-row--cycling">
          <button type="button" class="live-demo-ctx-nav" aria-label="Previous variant">‹</button>
          <span class="live-demo-ctx-counter" data-demo-counter>1 / 3</span>
          <button type="button" class="live-demo-ctx-nav" aria-label="Next variant">›</button>
          <span class="live-demo-ctx-divider"></span>
          <button type="button" class="live-demo-ctx-discard" aria-label="Discard">✕</button>
          <button type="button" class="live-demo-ctx-accept" data-demo-accept>Accept</button>
        </div>
        <div class="live-demo-ctx-row live-demo-ctx-row--accepted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>Variant 3 written to source</span>
        </div>
      </div>

      <div class="live-demo-cursor" data-demo-cursor aria-hidden="true">
        <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1 L1 17 L5 13 L8 20 L11 19 L7.5 12 L13 12 Z" fill="#111" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="live-demo-gbar" data-demo-gbar>
      <span class="live-demo-gbar-brand">/</span>
      <button type="button" class="live-demo-gbar-btn is-active" data-demo-gbar-pick>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
        <span>Pick</span>
      </button>
      <button type="button" class="live-demo-gbar-btn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button type="button" class="live-demo-gbar-btn">
        <span class="live-demo-gbar-dmd" aria-hidden="true"><span></span><span></span><span></span><span></span></span>
      </button>
      <span class="live-demo-gbar-divider"></span>
      <button type="button" class="live-demo-gbar-x" aria-label="Exit live mode">✕</button>
    </div>
  </div>
  </div>
</div>`;
}

/**
 * Render the /live-mode page main content.
 *
 * Marketing-style single-column layout mirroring /visual-mode's structure.
 * Surfaces the animated homepage live-demo, a three-stage narrative,
 * pathway cards (tutorial / reference / install), and the supported
 * framework strip.
 */
function renderLiveModeMain() {
  return `
<div class="live-mode-page">
  <header class="live-mode-page-header">
    <p class="live-mode-page-eyebrow">v3.0 新功能 <span class="live-mode-page-eyebrow-badge">Alpha</span></p>
    <h1 class="live-mode-page-title">实时模式</h1>
    <p class="live-mode-page-lede">直接在浏览器里选中任意元素。写一句评论，或者画一笔。你的框架会通过 HMR 换上 3 个高质量变体。选中你要的那个，它就会回写到源码。</p>
    <p class="live-mode-page-alpha-note"><strong>为什么还是 Alpha：</strong>实时模式已经能端到端跑通，也已经可以试用，但还需要继续覆盖真实仓库和各类框架配置。少见环境里请预期还有毛边，哪里坏了请直接反馈。</p>
    <div class="live-mode-start" aria-label="启动实时模式命令">
      <span class="live-mode-start-prompt">$</span>
      <code class="live-mode-start-cmd">/impeccable live</code>
      <button class="live-mode-start-copy" type="button" aria-label="复制命令" data-copy="/impeccable live">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
        </svg>
      </button>
    </div>
  </header>

  <section class="live-mode-demo-wrap" aria-label="实时模式交互演示">
    ${renderLiveModeDemo()}
    <p class="live-mode-demo-caption">点击演示框，或把它滚动到视口里，就会开始循环。遵循 <code>prefers-reduced-motion</code>。</p>
  </section>

  <section class="live-mode-stages" aria-label="实时模式会发生什么">
    <h2 class="live-mode-stages-title">整个过程，分 3 步</h2>
    <div class="live-mode-stages-grid">
      <article class="live-mode-stage">
        <span class="live-mode-stage-num">01 &middot; 选择</span>
        <h3 class="live-mode-stage-name">指给它看哪里不对</h3>
        <p class="live-mode-stage-desc">在正在运行的开发页面里点任意元素。用评论 pin 标出问题点，画一笔圈出你想改的部分，或者直接写一句“更有趣一点”。</p>
        <div class="live-mode-stage-viz">
          <div class="docs-viz-picker-row" style="min-height:72px;padding:10px">
            <div class="docs-viz-picker-target" style="font-size:12px;padding:6px 12px">
              Newsletter card
              <span class="docs-viz-picker-pin" style="width:18px;height:18px;font-size:9px">1</span>
            </div>
          </div>
        </div>
      </article>
      <article class="live-mode-stage">
        <span class="live-mode-stage-num">02 &middot; 生成</span>
        <h3 class="live-mode-stage-name">3 个真的不一样的方向</h3>
        <p class="live-mode-stage-desc">这些变体会锚定到不同原型，而不是只改改颜色。每个方案都会优先探索不同主轴：层级、字体、密度、布局或配色策略。</p>
        <div class="live-mode-stage-viz">
          <div class="docs-viz-variants" style="width:100%;gap:4px">
            <div class="docs-viz-variant docs-viz-variant--v1" style="min-height:44px;padding:6px"><span class="docs-viz-variant-kicker" style="font-size:8px">No.04</span></div>
            <div class="docs-viz-variant docs-viz-variant--v2 is-active" style="min-height:44px;padding:6px"><span class="docs-viz-variant-kicker" style="font-size:8px">Dispatch</span></div>
            <div class="docs-viz-variant docs-viz-variant--v3" style="min-height:44px;padding:6px"><span class="docs-viz-variant-kicker" style="font-size:8px">Field</span></div>
          </div>
        </div>
      </article>
      <article class="live-mode-stage">
        <span class="live-mode-stage-num">03 &middot; 确认</span>
        <h3 class="live-mode-stage-name">真正落回源码</h3>
        <p class="live-mode-stage-desc">被接受的变体会替换掉源文件里的目标元素。CSS 会并回真实样式表，而不是塞成内联。3 个都不要也没关系，原样保留。</p>
        <div class="live-mode-stage-viz">
          <span class="docs-viz-accept-pill">已将 Variant 2 写回源码</span>
        </div>
      </article>
    </div>
  </section>

  <section class="live-mode-pathways" aria-label="下一步去哪里">
    <h2 class="live-mode-pathways-title">接着看这里</h2>
    <div class="live-mode-pathways-grid">
      <a class="live-mode-pathway" href="/tutorials/iterate-live">
        <span class="live-mode-pathway-kind">教程</span>
        <h3 class="live-mode-pathway-title">按步骤走一遍</h3>
        <p class="live-mode-pathway-desc">10 分钟带你从第一次运行走到接受变体。会覆盖 CSP 补丁、picker 操作，以及生成文件的 fallback 流程。</p>
        <span class="live-mode-pathway-cta">打开教程 &rarr;</span>
      </a>
      <a class="live-mode-pathway" href="/docs/live">
        <span class="live-mode-pathway-kind">参考</span>
        <h3 class="live-mode-pathway-title">完整命令参考</h3>
        <p class="live-mode-pathway-desc">这里是 AI harness 在运行 <code>/impeccable live</code> 时会读到的全部内容：轮询循环、wrap/accept 辅助逻辑、CSP 模板，以及所有事件结构。</p>
        <span class="live-mode-pathway-cta">查看参考 &rarr;</span>
      </a>
      <a class="live-mode-pathway" href="/#downloads">
        <span class="live-mode-pathway-kind">安装</span>
        <h3 class="live-mode-pathway-title">先把 Impeccable 装好</h3>
        <p class="live-mode-pathway-desc">先安装一次 skill 和 CLI，然后就在你的 AI harness 里运行 <code>/impeccable live</code>。支持 Claude Code、Cursor、Codex、Gemini 等。</p>
        <span class="live-mode-pathway-cta">查看安装步骤 &rarr;</span>
      </a>
    </div>
  </section>

  <section class="live-mode-frameworks" aria-label="支持的框架">
    <span class="live-mode-frameworks-label">支持的开发服务器</span>
    <ul class="live-mode-frameworks-list">
      <li>Vite</li>
      <li>Next.js（含 monorepo）</li>
      <li>SvelteKit</li>
      <li>Astro</li>
      <li>Nuxt</li>
      <li>Bun</li>
      <li>纯静态 HTML</li>
    </ul>
  </section>
</div>`;
}

/**
/**
 * Render the /designing page.
 *
 * Editorial orientation: four-phase loop (start → iterate → polish →
 * maintain) as the spine, plus three appendix sections (register,
 * interop, avoid) and a CTA climax. Cards are rare: most sections
 * rely on typography, hairline rules, and whitespace for structure.
 */
function renderDesigningMain() {
  const loopNodes = [
    { id: 'start',    num: '01', name: 'Start',    hint: 'From a blank file, through a brief, to a designed feature.' },
    { id: 'iterate',  num: '02', name: 'Iterate',  hint: 'Refine in place. Command line or in the browser.' },
    { id: 'polish',   num: '03', name: 'Polish',   hint: 'The pre-ship gauntlet. Audit, clarify, harden.' },
    { id: 'maintain', num: '04', name: 'Maintain', hint: 'Pay down design debt before it solidifies.' },
  ];
  const nodeHtml = loopNodes.map((n) => `
      <a class="designing-loop-node designing-loop-node--${n.id}" href="#${n.id}">
        <span class="designing-loop-num">${n.num}</span>
        <span class="designing-loop-name">${n.name}</span>
        <span class="designing-loop-hint">${escapeHtml(n.hint)}</span>
      </a>`).join('');

  return `
<div class="designing-page">
  <section class="designing-hero">
    <header class="designing-page-header">
      <span class="designing-page-eyebrow">核心闭环</span>
      <h1 class="designing-page-title">用 <em>Impeccable</em> 做设计</h1>
      <p class="designing-page-lede">真正把界面做出来，本质上就是一个循环。分成 4 个阶段，每个阶段都有一个起点。</p>
    </header>

    <div class="designing-loop-wrap" aria-label="四阶段闭环">
    <span class="designing-loop-wrap-eyebrow">核心闭环</span>
    <div class="designing-loop">
      ${nodeHtml}
      <div class="designing-loop-wheel" aria-hidden="true">
        <svg class="designing-loop-wheel-svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <circle class="designing-loop-wheel-ring" cx="50" cy="50" r="46"/>
          <!-- 12 tick marks at 30° increments. Cardinals (0/90/180/270) stronger. -->
          <line class="designing-loop-wheel-tick designing-loop-wheel-tick--cardinal" x1="50" y1="2.5" x2="50" y2="5.5"/>
          <line class="designing-loop-wheel-tick" x1="73" y1="8.7" x2="72" y2="11.4"/>
          <line class="designing-loop-wheel-tick" x1="91.3" y1="27" x2="88.6" y2="28"/>
          <line class="designing-loop-wheel-tick designing-loop-wheel-tick--cardinal" x1="97.5" y1="50" x2="94.5" y2="50"/>
          <line class="designing-loop-wheel-tick" x1="91.3" y1="73" x2="88.6" y2="72"/>
          <line class="designing-loop-wheel-tick" x1="73" y1="91.3" x2="72" y2="88.6"/>
          <line class="designing-loop-wheel-tick designing-loop-wheel-tick--cardinal" x1="50" y1="97.5" x2="50" y2="94.5"/>
          <line class="designing-loop-wheel-tick" x1="27" y1="91.3" x2="28" y2="88.6"/>
          <line class="designing-loop-wheel-tick" x1="8.7" y1="73" x2="11.4" y2="72"/>
          <line class="designing-loop-wheel-tick designing-loop-wheel-tick--cardinal" x1="2.5" y1="50" x2="5.5" y2="50"/>
          <line class="designing-loop-wheel-tick" x1="8.7" y1="27" x2="11.4" y2="28"/>
          <line class="designing-loop-wheel-tick" x1="27" y1="8.7" x2="28" y2="11.4"/>
          <!-- Clockwise-orbiting accent dot, animates with offset-path. -->
          <circle class="designing-loop-wheel-dot" cx="0" cy="0" r="2.2"/>
        </svg>
        <span class="designing-loop-wheel-arrow designing-loop-wheel-arrow--ne">↘</span>
        <span class="designing-loop-wheel-arrow designing-loop-wheel-arrow--se">↙</span>
        <span class="designing-loop-wheel-arrow designing-loop-wheel-arrow--sw">↖</span>
        <span class="designing-loop-wheel-arrow designing-loop-wheel-arrow--nw">↗</span>
        <div class="designing-loop-wheel-center">
          <span class="designing-loop-wheel-center-label">designing</span>
          <span class="designing-loop-wheel-center-mark">impeccable</span>
        </div>
      </div>
    </div>
    </div>
  </section>

  <section class="designing-phase" id="start">
    <header class="designing-phase-head">
      <span class="designing-phase-num">01 &middot; 起步</span>
      <h2 class="designing-phase-title">从空白文件，到一个真正设计过的功能。</h2>
      <p class="designing-phase-sub">3 个命令，一条完整路径。<code>/impeccable teach</code> 每个项目跑一次，用来写 brief。<code>/impeccable shape</code> 先起一份可视参考。<code>/impeccable craft</code> 再朝着你看得见的目标去写代码。先文字，再图像，最后才是代码。</p>
      <div class="designing-phase-commands">
        <a class="designing-phase-cmd" href="/docs/teach">/impeccable teach</a>
        <a class="designing-phase-cmd" href="/docs/shape">/impeccable shape</a>
        <a class="designing-phase-cmd" href="/docs/craft">/impeccable craft</a>
      </div>
    </header>

    <div class="designing-phase-body designing-start">
      <div class="designing-start-step">
        <span class="designing-start-step-label">teach &middot; 先用文字定方向</span>
        <div class="designing-start-grid">
          <div class="docs-viz-file" style="margin:0">
            <div class="docs-viz-file-header">
              <span class="docs-viz-file-name">PRODUCT.md</span>
              <span class="docs-viz-file-status">Written by teach</span>
            </div>
            <div class="docs-viz-file-body">
              <div class="docs-viz-file-row">
                <span class="docs-viz-file-k">Register</span>
                <span class="docs-viz-file-v">Product. Design serves the task.</span>
              </div>
              <div class="docs-viz-file-row">
                <span class="docs-viz-file-k">Users</span>
                <span class="docs-viz-file-v">SREs on call, reading fast, often in the dark.</span>
              </div>
              <div class="docs-viz-file-row">
                <span class="docs-viz-file-k">Voice</span>
                <span class="docs-viz-file-v">Calm, clinical, no hype.</span>
              </div>
              <div class="docs-viz-file-row">
                <span class="docs-viz-file-k">Anti-references</span>
                <span class="docs-viz-file-v">Purple gradients. Glassmorphism. Hype.</span>
              </div>
            </div>
          </div>
          <div class="designing-start-grid-prose">
            <p>Teach 会运行一段简短的 discovery interview，确认受众、语气、表达风格和反参考。它会写出 <code>PRODUCT.md</code>；如果项目里有代码可分析，还会写出 <code>DESIGN.md</code>。后续所有命令在生成前都会先读取这两个文件。</p>
          </div>
        </div>
      </div>

      <div class="designing-start-step">
        <span class="designing-start-step-label">shape + craft &middot; 再把方向可视化</span>
        <p class="designing-start-step-note">图像生成已经跨过“能拿来当参考”的门槛，所以 <code>shape</code> 可以先起一版品牌工具包，让你一眼评估方向；<code>craft</code> 则不再对着一段抽象描述写代码，而是对着高保真参考落地。Neo Mirai 就是这条完整路径：先生成方向，再实现页面，再进浏览器迭代。</p>

        <div class="designing-visualize-spread">
          <figure class="designing-visualize-plate designing-visualize-plate--brand">
            <a class="designing-visualize-plate-frame" href="/cases/neo-mirai" aria-label="Read the Neo Mirai case study">
              <img src="../assets/openai_image_2_brand.jpg" alt="Auto-generated brand toolkit plate: identity lockups, colour palette, type specimens, icon system, and application mocks for a fictional AI design conference, rendered in warm earth tones." loading="lazy" width="1536" height="1024" />
            </a>
            <figcaption class="designing-visualize-plate-cap">
              <span class="designing-visualize-plate-kind">Shape</span>
              <p class="designing-visualize-plate-note">品牌工具板。身份系统、配色、字体、图标语言、应用示例、社媒物料、UI 方向，都能集中看完。确认下来的决定会写进 <code>DESIGN.md</code>。</p>
            </figcaption>
          </figure>

          <figure class="designing-visualize-plate designing-visualize-plate--hifi">
            <a class="designing-visualize-plate-frame" href="/cases/neo-mirai" aria-label="Read the Neo Mirai case study">
              <img src="../assets/openai_image_2_hifi.jpg" alt="Auto-generated hi-fi landing-page mock: a long vertical editorial comp for a fictional Tokyo AI design conference, in warm earth tones with committed serif display type." loading="lazy" width="864" height="1821" />
            </a>
            <figcaption class="designing-visualize-plate-cap">
              <span class="designing-visualize-plate-kind">Visualize</span>
              <p class="designing-visualize-plate-note">高保真参考。第一行 CSS 出现之前，终点就已经明确了。Craft 是朝着具体图像写代码，而不是朝着抽象 brief 猜方向。这就是质变。</p>
            </figcaption>
          </figure>

          <figure class="designing-visualize-plate designing-visualize-plate--live">
            <a class="designing-visualize-plate-frame" href="/neo-mirai/" aria-label="Open the Neo Mirai live site">
              <img src="../assets/cases/neo-mirai/live-page.png" alt="Full-page screenshot of the implemented Neo Mirai website." loading="lazy" width="1440" height="3013" />
            </a>
            <figcaption class="designing-visualize-plate-cap">
              <span class="designing-visualize-plate-kind">Ship</span>
              <p class="designing-visualize-plate-note">真实落地页。最初的 mock 最终变成了语义化标记、重新生成的素材、响应式修正、导航状态、讲者轮播逻辑，以及经过浏览器验证的打磨。<a href="/neo-mirai/">打开在线页面</a>。</p>
            </figcaption>
          </figure>
        </div>

        <p class="designing-visualize-foot">前两张图由 <strong>OpenAI GPT Image 2</strong> 生成。第三张则是已经实现好的 Neo Mirai 页面。<strong>Gemini Nano Banana Pro</strong>、<strong>Imagen 4 Ultra</strong> 和 <strong>Grok Imagen</strong> 也能用同样方式接进 Codex、Gemini CLI 及兼容 harness。</p>
      </div>
    </div>
  </section>

  <section class="designing-phase" id="iterate">
    <header class="designing-phase-head">
      <span class="designing-phase-num">02 &middot; 迭代</span>
      <h2 class="designing-phase-title">在已有结果上继续收紧。</h2>
      <p class="designing-phase-sub">只要东西已经存在，你做的就是迭代。这里有两条路：一种是针对明确维度下命令，另一种是用实时模式做可视探索。</p>
    </header>

    <div class="designing-phase-body">
      <div class="designing-iterate-split">
        <div class="designing-iterate-col">
          <span class="designing-iterate-kind">命令行</span>
          <h3 class="designing-iterate-name">When the edit has a name.</h3>
          <p class="designing-iterate-when">Type a command and let the skill encode a specific discipline. Best when you know the word: typography, layout, color, motion.</p>
          <div class="designing-iterate-terminal" aria-hidden="true">
            <div class="designing-iterate-terminal-line"><span class="designing-iterate-terminal-prompt">$</span><span>/impeccable polish pricing</span></div>
            <div class="designing-iterate-terminal-line"><span class="designing-iterate-terminal-prompt">$</span><span>/impeccable bolder hero</span></div>
            <div class="designing-iterate-terminal-line"><span class="designing-iterate-terminal-prompt">$</span><span>/impeccable typeset checkout</span></div>
          </div>
        </div>

        <div class="designing-iterate-col">
          <span class="designing-iterate-kind">实时模式</span>
          <h3 class="designing-iterate-name">When the edit is easier to point at.</h3>
          <p class="designing-iterate-when">Pick any element in the browser, draw, type, hit Go. Three production-quality variants. Accept one and it writes to source.</p>
          <div class="designing-iterate-live" aria-hidden="true">
            <div class="docs-viz-live-frame" style="max-width:100%">
              <div class="docs-viz-live-chrome">
                <span class="docs-viz-live-dot"></span>
                <span class="docs-viz-live-dot"></span>
                <span class="docs-viz-live-dot"></span>
                <span class="docs-viz-live-url">localhost:3000</span>
              </div>
              <div class="docs-viz-live-stage">
                <div class="docs-viz-live-target">
                  <span class="docs-viz-live-kicker">No. 04</span>
                  <h4 class="docs-viz-live-title">Letters, <em>occasionally</em>.</h4>
                  <button class="docs-viz-live-btn" type="button">Send me one</button>
                </div>
                <div class="docs-viz-live-outline"></div>
                <div class="docs-viz-live-ctx">
                  <button class="docs-viz-live-ctx-nav" type="button">‹</button>
                  <span class="docs-viz-live-ctx-counter">2 / 3</span>
                  <button class="docs-viz-live-ctx-nav" type="button">›</button>
                  <span class="docs-viz-live-ctx-divider"></span>
                  <button class="docs-viz-live-ctx-accept" type="button">Accept</button>
                </div>
                <div class="docs-viz-live-gbar">
                  <span class="docs-viz-live-gbar-brand">/</span>
                  <span class="docs-viz-live-gbar-btn is-active">Pick</span>
                  <span class="docs-viz-live-gbar-divider"></span>
                  <span class="docs-viz-live-gbar-x">✕</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <table class="designing-iterate-table">
        <caption>When to reach for which</caption>
        <tbody>
          <tr>
            <th scope="row">Fix something "off" that you can't name</th>
            <td><a href="/live-mode">/impeccable live</a></td>
          </tr>
          <tr>
            <th scope="row">Apply a specific discipline: type, layout, color, motion</th>
            <td><a href="/docs/typeset">/typeset</a> &middot; <a href="/docs/layout">/layout</a> &middot; <a href="/docs/colorize">/colorize</a> &middot; <a href="/docs/animate">/animate</a></td>
          </tr>
          <tr>
            <th scope="row">Explore three directions side by side</th>
            <td><a href="/live-mode">/impeccable live</a></td>
          </tr>
          <tr>
            <th scope="row">Ask "is this any good?"</th>
            <td><a href="/docs/critique">/impeccable critique</a></td>
          </tr>
          <tr>
            <th scope="row">Bring a safe design to life, or tone a shouting one down</th>
            <td><a href="/docs/bolder">/bolder</a> &middot; <a href="/docs/quieter">/quieter</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="designing-phase" id="polish">
    <header class="designing-phase-head">
      <span class="designing-phase-num">03 &middot; 打磨</span>
      <h2 class="designing-phase-title">上线前的最后一道关。</h2>
      <p class="designing-phase-sub">任何东西上线前，都应该按顺序跑这 3 个命令。它们不是重做设计，而是把还没收干净的问题找出来。</p>
    </header>

    <div class="designing-phase-body">
      <div class="designing-polish">
        <div class="designing-polish-band">
          <span class="designing-polish-band-label">Pre-ship</span>
          <div class="designing-polish-band-cmds">
            <a href="/docs/audit">audit</a>
            <a href="/docs/clarify">clarify</a>
            <a href="/docs/harden">harden</a>
          </div>
          <span class="designing-polish-band-meta">03 &middot; 04</span>
        </div>
        <div class="designing-polish-grid">
          <div class="designing-polish-col">
            <h3 class="designing-polish-name">Score it.</h3>
            <p class="designing-polish-desc">Five dimensions scored 0 to 4: accessibility, performance, theming, responsive, anti-patterns. Findings tagged P0 to P3.</p>
          </div>
          <div class="designing-polish-col">
            <h3 class="designing-polish-name">Rewrite the copy.</h3>
            <p class="designing-polish-desc">Labels, error messages, empty-state prose, microcopy. Tuned to the audience from PRODUCT.md.</p>
          </div>
          <div class="designing-polish-col">
            <h3 class="designing-polish-name">Stress-test reality.</h3>
            <p class="designing-polish-desc">60-character names, German product titles, prices in the billions, 500s, offline. Production data is messy.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="designing-phase" id="maintain">
    <header class="designing-phase-head">
      <span class="designing-phase-num">04 &middot; 维护</span>
      <h2 class="designing-phase-title">设计债务是真实存在的，要主动偿还。</h2>
      <p class="designing-phase-sub">功能上线后，漂移总会发生。这两个命令会在问题固化前把偏差补回来。</p>
    </header>

    <div class="designing-phase-body">
      <div class="designing-maintain">
        <figure class="designing-maintain-tile">
          <div class="designing-maintain-stage">
            <div class="designing-extract-viz" aria-hidden="true">
              <div class="designing-extract-before">
                <span class="designing-extract-btn">Subscribe</span>
                <span class="designing-extract-btn">Submit</span>
                <span class="designing-extract-btn">Join</span>
                <span class="designing-extract-btn">Send</span>
                <span class="designing-extract-btn">Go</span>
                <span class="designing-extract-btn">OK</span>
              </div>
              <span class="designing-extract-arrow">&rarr;</span>
              <span class="designing-extract-after">Button</span>
            </div>
          </div>
          <figcaption class="designing-maintain-caption">
            <span class="designing-maintain-label"><a href="/docs/extract">/impeccable extract</a></span>
            <h3 class="designing-maintain-name">Consolidate drift.</h3>
            <p class="designing-maintain-desc">Find patterns used three or more times with the same intent. Propose tokens and primitives.</p>
          </figcaption>
        </figure>

        <figure class="designing-maintain-tile">
          <div class="designing-maintain-stage">
            <div class="designing-designmd-preview" aria-hidden="true">
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">01</span><span>Overview</span></div>
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">02</span><span>Colors</span></div>
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">03</span><span>Typography</span></div>
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">04</span><span>Elevation</span></div>
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">05</span><span>Components</span></div>
              <div class="designing-designmd-preview-line"><span class="designing-designmd-preview-num">06</span><span>Do's &amp; Don'ts</span></div>
            </div>
          </div>
          <figcaption class="designing-maintain-caption">
            <span class="designing-maintain-label"><a href="/docs/document">/impeccable document</a></span>
            <h3 class="designing-maintain-name">Re-capture the system.</h3>
            <p class="designing-maintain-desc">Scans tokens, components, and rendered output. Writes a spec-compliant DESIGN.md.</p>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>

  <section class="designing-phase designing-phase--appendix" aria-label="Brand or product lane">
    <header class="designing-phase-head">
      <span class="designing-phase-num">两条路线</span>
      <h2 class="designing-phase-title">品牌，还是产品。</h2>
      <p class="designing-phase-sub">这是两套默认值，也对应两套不同词汇。Impeccable 会在每次运行命令前，根据你的任务提示和 <code>PRODUCT.md</code> 自动判断路线，因此 <code>typeset</code>、<code>animate</code>、<code>colorize</code> 等命令都会自动换成匹配语境的输出。大多数时候你不需要手动指定。</p>
    </header>

    <div class="designing-phase-body">
      <div class="designing-lanes">
        <section class="designing-lane">
          <span class="designing-lane-kind">Brand</span>
          <p class="designing-lane-rule">Design IS the product. Marketing, landing, editorial, long-form, portfolio.</p>
          <div class="designing-lane-mock designing-lane-mock--brand" aria-hidden="true">
            <span class="designing-lane-mock-label">No. 04 &middot; Dispatch</span>
            <span class="designing-lane-mock-title">Letters, occasionally.</span>
          </div>
        </section>
        <section class="designing-lane">
          <span class="designing-lane-kind">Product</span>
          <p class="designing-lane-rule">Design serves the task. App UI, admin, dashboards, tools.</p>
          <div class="designing-lane-mock designing-lane-mock--product" aria-hidden="true">
            <span class="designing-lane-mock-label">Newsletter</span>
            <span class="designing-lane-mock-title">Subscribe to updates</span>
          </div>
        </section>
      </div>
      <a class="designing-lane-link" href="/tutorials/brand-vs-product">查看“品牌 vs 产品”教程 &rarr;</a>
    </div>
  </section>

  <section class="designing-phase designing-phase--appendix" aria-label="What to avoid">
    <header class="designing-phase-head">
      <span class="designing-phase-num">常见误区</span>
      <h2 class="designing-phase-title">哪些做法要避开。</h2>
      <p class="designing-phase-sub">这是一份反模式清单，配合 anti-patterns 工具一起用。</p>
    </header>

    <div class="designing-phase-body">
      <ul class="designing-avoid">
        <li>
          <span class="designing-avoid-x" aria-hidden="true">×</span>
          <div>
            <span class="designing-avoid-title">同时运行 Impeccable 和 Anthropic 的 frontend-design skill</span>
            <p class="designing-avoid-desc">Anthropic 在 Claude Code 里还会继续推荐它，但那套 skill 已经长期无人维护，也落后于现在的推荐模式。两者一起跑会在词汇体系上互相打架，结果相互抵消。二选一即可。</p>
          </div>
        </li>
        <li>
          <span class="designing-avoid-x" aria-hidden="true">×</span>
          <div>
            <span class="designing-avoid-title">把每个命令都 pin 回去</span>
            <p class="designing-avoid-desc">Pin 的作用是把 <code>/audit</code>、<code>/polish</code>、<code>/critique</code> 这类命令重新变成快捷入口。你如果全都 pin 回去，等于又把 v3.0 好不容易收拢过的 <code>/</code> 菜单重新炸开。只 pin 你每天都会用的两三个就够了。</p>
          </div>
        </li>
        <li>
          <span class="designing-avoid-x" aria-hidden="true">×</span>
          <div>
            <span class="designing-avoid-title">跳过 <code>teach</code></span>
            <p class="designing-avoid-desc">没有 PRODUCT.md 和 DESIGN.md，命令当然也能跑，但默认就会往通用 SaaS 模板味道靠。有上下文时，起点会高很多。先跑一次 teach，后面所有命令都会受益。</p>
          </div>
        </li>
        <li>
          <span class="designing-avoid-x" aria-hidden="true">×</span>
          <div>
            <span class="designing-avoid-title">把它当成 linter</span>
            <p class="designing-avoid-desc">Impeccable 是一个有立场的设计搭档，不是纯校验器。它会给出明确判断。你可以带着理由反驳，它会和你协作；但如果没有理由就把这些判断无视掉，结果只会变差，不会变好。</p>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <nav class="designing-cta" aria-label="Where to go next">
    <a class="designing-cta-card" href="/docs/teach">
      <span class="designing-cta-card-kind">New project</span>
      <h2 class="designing-cta-card-title">Start with <em>teach</em></h2>
      <p class="designing-cta-card-desc">五分钟 discovery，一份 PRODUCT.md，一份 DESIGN.md。后面的每个命令都会因此更准确。</p>
    </a>
    <a class="designing-cta-card" href="/tutorials">
      <span class="designing-cta-card-kind">Walk a scenario</span>
      <h2 class="designing-cta-card-title">Open a <em>tutorial</em></h2>
      <p class="designing-cta-card-desc">4 条最有杠杆的短路径：快速上手、实时模式、带 overlay 的 critique，以及品牌 vs 产品。</p>
    </a>
  </nav>
</div>`;
}

/**
 * Render a tutorial detail page main content.
 */
function renderTutorialDetail(tutorial, knownSkillIds) {
  const bodyHtml = renderMarkdown(tutorial.body, { knownSkillIds });
  return `
<article class="tutorial-detail">
  <header class="tutorial-detail-header">
    <p class="skill-detail-eyebrow"><a href="/tutorials">教程</a> / ${String(tutorial.order).padStart(2, '0')}</p>
    <h1 class="tutorial-detail-title">${escapeHtml(tutorial.title)}</h1>
    ${tutorial.tagline ? `<p class="tutorial-detail-tagline">${escapeHtml(tutorial.tagline)}</p>` : ''}
  </header>

  <section class="tutorial-detail-body prose">
${bodyHtml}
  </section>
</article>`;
}

/**
 * Entry point. Generates all sub-page HTML files.
 *
 * @param {string} rootDir
 * @returns {Promise<{ files: string[] }>} list of generated file paths (absolute)
 */
export async function generateSubPages(rootDir) {
  const data = await buildSubPageData(rootDir);
  const outDirs = {
    docs: path.join(rootDir, 'public/docs'),
    slop: path.join(rootDir, 'public/slop'),
    tutorials: path.join(rootDir, 'public/tutorials'),
    liveMode: path.join(rootDir, 'public/live-mode'),
    designing: path.join(rootDir, 'public/designing'),
  };
  // Clean up legacy output dirs from /anti-patterns and /visual-mode,
  // which have been merged into /slop. A stray file in either would
  // otherwise keep getting served by Bun's static handler.
  for (const legacy of ['public/anti-patterns', 'public/visual-mode']) {
    const dir = path.join(rootDir, legacy);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }

  // Fresh output dirs each time so stale files don't linger.
  for (const dir of Object.values(outDirs)) {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  }

  const generated = [];

  // Docs index: the full command reference with rich cards.
  {
    const sidebar = renderDocsSidebar(data.skillsByCategory, data.tutorials, null);
    const main = renderSkillsOverviewMain(data.skillsByCategory, data.skills);
    const html = renderPage({
      title: '文档 | Impeccable',
      description:
        '22 commands that teach your AI harness how to design. Browse by category: create, evaluate, refine, simplify, harden.',
      bodyHtml: wrapInDocsLayout(sidebar, main),
      activeNav: 'docs',
      canonicalPath: '/docs',
      bodyClass: 'sub-page skills-layout-page',
    });
    const out = path.join(outDirs.docs, 'index.html');
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Per-command detail pages: same docs-browser shell as the overview.
  for (const skill of data.skills) {
    const sidebar = renderDocsSidebar(data.skillsByCategory, data.tutorials, { kind: 'skill', id: skill.id });
    const main = renderSkillDetail(skill, data.knownSkillIds);
    const title = skill.isSubCommand
      ? `/impeccable ${skill.id} | Impeccable`
      : `/${skill.id} | Impeccable`;
    const description = skill.editorial?.frontmatter?.tagline || skill.description;
    const html = renderPage({
      title,
      description,
      bodyHtml: wrapInDocsLayout(sidebar, main),
      activeNav: 'docs',
      canonicalPath: `/docs/${skill.id}`,
      bodyClass: 'sub-page skills-layout-page',
    });
    const out = path.join(outDirs.docs, `${skill.id}.html`);
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Slop: merged anti-patterns catalog + visual-mode overlay demo + gallery.
  // Single page, docs-browser shell with a nested TOC sidebar.
  {
    const grouped = groupRulesBySection(data.rules);
    const sidebar = renderSlopSidebar(grouped, GALLERY_ITEMS.length);
    const main = renderSlopMain(grouped, data.rules.length);
    const html = renderPage({
      title: 'Slop | Impeccable',
      description: `${data.rules.length} patterns that mark an interface as AI-generated, plus the live detection overlay that catches them in place. The rule catalog behind npx impeccable detect, the browser extension, and /impeccable critique.`,
      bodyHtml: wrapInDocsLayout(sidebar, main),
      activeNav: 'slop',
      canonicalPath: '/slop',
      bodyClass: 'sub-page skills-layout-page slop-page',
    });
    const out = path.join(outDirs.slop, 'index.html');
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Tutorials index (under the unified Docs umbrella).
  if (data.tutorials.length > 0) {
    const sidebar = renderDocsSidebar(data.skillsByCategory, data.tutorials, null);
    const main = renderTutorialsIndexMain(data.tutorials);
    const html = renderPage({
      title: '教程 | Impeccable',
      description: `${data.tutorials.length} short, opinionated walk-throughs of the highest-leverage Impeccable workflows.`,
      bodyHtml: wrapInDocsLayout(sidebar, main),
      activeNav: 'docs',
      canonicalPath: '/tutorials',
      bodyClass: 'sub-page skills-layout-page tutorials-page',
    });
    const out = path.join(outDirs.tutorials, 'index.html');
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Live Mode: marketing landing mirroring the other single-column pages.
  // Needs live-mode.css (not imported by sub-pages.css to keep the base
  // bundle small) and the live-demo JS module to animate the demo.
  {
    const extraHead = `
    <link rel="stylesheet" href="../css/live-mode.css">
    <script type="module">
      import { initLiveDemo } from "../js/components/live-demo.js";
      document.addEventListener("DOMContentLoaded", initLiveDemo);
    </script>`;
    const html = renderPage({
      title: '实时模式 | Impeccable',
      description:
        'Iterate on UI in the browser. Pick an element, drop a comment, get three production-quality variants, accept one, and it writes back to source. /impeccable live.',
      bodyHtml: renderLiveModeMain(),
      activeNav: 'live',
      canonicalPath: '/live-mode',
      bodyClass: 'sub-page live-mode-page-body',
      extraHead,
    });
    const out = path.join(outDirs.liveMode, 'index.html');
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Designing: orientation page about the core loop.
  {
    const html = renderPage({
      title: '用 Impeccable 做设计',
      description:
        'The core loop: start, iterate, polish, maintain. How to use Impeccable end-to-end, from a blank file to shipped feature to paid-down design debt.',
      bodyHtml: renderDesigningMain(),
      activeNav: 'designing',
      canonicalPath: '/designing',
      bodyClass: 'sub-page designing-page-body',
    });
    const out = path.join(outDirs.designing, 'index.html');
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  // Tutorial detail pages.
  for (const tutorial of data.tutorials) {
    const sidebar = renderDocsSidebar(data.skillsByCategory, data.tutorials, { kind: 'tutorial', slug: tutorial.slug });
    const main = renderTutorialDetail(tutorial, data.knownSkillIds);
    const html = renderPage({
      title: `${tutorial.title} | 教程 | Impeccable`,
      description: tutorial.description || tutorial.tagline || '',
      bodyHtml: wrapInDocsLayout(sidebar, main),
      activeNav: 'docs',
      canonicalPath: `/tutorials/${tutorial.slug}`,
      bodyClass: 'sub-page skills-layout-page tutorials-page',
    });
    const out = path.join(outDirs.tutorials, `${tutorial.slug}.html`);
    fs.writeFileSync(out, html, 'utf-8');
    generated.push(out);
  }

  return { files: generated };
}
