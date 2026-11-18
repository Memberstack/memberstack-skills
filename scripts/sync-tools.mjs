#!/usr/bin/env node
// Keeps the skill's tool list equal to what the Memberstack MCP server advertises.
//
//   node scripts/sync-tools.mjs           rewrite skills/memberstack/references/tools.md
//   node scripts/sync-tools.mjs --check   exit 1 if tools.md is out of date, or if a skill file
//                                         names a tool the server does not have
//
// The server answers `tools/list` without a sign-in, so this needs no credentials.
// Needs Node 18 or later (built-in fetch). No dependencies.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SERVER_URL = process.env.MEMBERSTACK_MCP_URL ?? 'https://mcp.memberstack.com/mcp';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const SKILL_DIR = join(SKILLS_DIR, 'memberstack');
const TOOLS_FILE = join(SKILL_DIR, 'references', 'tools.md');

// The server has no categories, so the grouping lives here. A tool the server adds must be
// given a group before this script passes: that is the reminder to update the skill.
const GROUPS = [
  ['App and environment', ['listApps', 'switchApp', 'createApp', 'currentApp', 'currentUser', 'getMemberstackEnvironment', 'switchMemberstackEnvironment']],
  ['Members', ['getMember', 'getMembers', 'getMembersCount', 'getMemberEvents', 'getSentEmails', 'createMemberEmailPassword', 'updateMember', 'updateMemberAuth', 'updateMemberNote', 'deleteMember', 'generateMemberPassword', 'addFreePlan', 'removeFreePlan', 'removeOneTimePlan', 'createStripeCustomer', 'importMembers', 'exportMembers']],
  ['Plans and prices', ['getPlans', 'getPlan', 'createPlan', 'updatePlan', 'deletePlan', 'updatePlanLogic', 'createPrice', 'updatePrice', 'importStripeProduct']],
  ['Gated content', ['getContentGroups', 'getContentGroup', 'createRestrictedUrlGroup', 'updateRestrictedUrlGroup', 'deleteRestrictedUrlGroup', 'createRestrictedUrl', 'updateRestrictedUrl', 'deleteRestrictedUrl', 'linkRestrictedUrlsToRestrictedUrlGroup', 'detachRestrictedUrlsFromRestrictedUrlGroup', 'linkPlansToRestrictedUrlGroup', 'detachPlansFromRestrictedUrlGroup', 'createCustomContent', 'updateCustomContent', 'deleteCustomContent']],
  ['Data tables', ['getDataTables', 'getDataTable', 'getDataTableField', 'createDataTable', 'updateDataTable', 'deleteDataTable', 'createDataTableField', 'updateDataTableField', 'deleteDataTableField', 'getDataRecords', 'getDataRecord', 'createDataRecord', 'updateDataRecord', 'deleteDataRecord']],
  ['Custom fields', ['getCustomFields', 'createCustomField', 'updateCustomField', 'deleteCustomField']],
  ['Teams', ['getTeam', 'getTeamMembers', 'removeTeamMember', 'regenerateTeamInviteToken']],
  ['Conversion testing', ['getExperiments']],
];

// Tool names that were removed from the server. They must never come back into the skill.
const REMOVED_TOOLS = ['memberstackKnowledgeSearch', 'explore_tools', 'get_tool_schema'];

// Every markdown file in every skill is checked for removed tools and mcp__ prefixes.
const allSkillFiles = (dir = SKILLS_DIR) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return allSkillFiles(path);
    return name.endsWith('.md') && path !== TOOLS_FILE ? [path] : [];
  });

// Files that name MCP tools in backticks: each SKILL.md and the MCP workflows. Words there that
// look like a tool name must be real tools. The package reference files are left out, because
// they are full of @memberstack/dom methods that look the same.
const namesMcpTools = (path) => path.endsWith('SKILL.md') || path === join(SKILL_DIR, 'references', 'workflows.md');
const TOOL_LIKE = /^(get|list|current|switch|create|update|delete|remove|detach|link|add|import|export|generate|regenerate)[A-Z][A-Za-z]*$/;
// Words that match the pattern above but are @memberstack/dom methods, not MCP tools.
const NOT_TOOLS = new Set(['getCurrentMember', 'getMemberCookie', 'getMemberJSON', 'updateMemberJSON']);

// The server may answer with plain JSON or with a stream of server-sent events. A stream can
// carry notifications before the reply, so each event is parsed on its own and the one that
// answers this request (same id) is returned.
function parseReply(text, id) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const messages = trimmed
    .split(/\r?\n\r?\n/)
    .map((event) => event.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n'))
    .filter(Boolean)
    .map((data) => JSON.parse(data));
  return messages.find((message) => message.id === id) ?? null;
}

async function rpc(body, sessionId) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  // The server is briefly unavailable when it restarts, so a 5xx or a dropped connection is
  // retried for up to about a minute before the check fails.
  let res;
  for (let attempt = 1; ; attempt += 1) {
    try {
      res = await fetch(SERVER_URL, { method: 'POST', headers, body: JSON.stringify(body) });
      if (res.status < 500) break;
      if (attempt === 5) break;
    } catch (error) {
      if (attempt === 5) throw new Error(`${body.method} failed: ${error.message}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 6000));
  }
  if (!res.ok) throw new Error(`${body.method} failed: HTTP ${res.status}`);
  const json = parseReply(await res.text(), body.id);
  if (json?.error) throw new Error(`${body.method} failed: ${json.error.message}`);
  return { json, sessionId: res.headers.get('mcp-session-id') ?? sessionId };
}

async function fetchTools() {
  const init = await rpc({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'memberstack-skills-sync', version: '1.0.0' } },
  });
  await rpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, init.sessionId);
  const tools = [];
  let cursor;
  do {
    const page = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: cursor ? { cursor } : {} }, init.sessionId);
    tools.push(...page.json.result.tools);
    cursor = page.json.result.nextCursor;
  } while (cursor);
  return tools;
}

function kindOf(tool) {
  const hints = tool.annotations ?? {};
  if (hints.readOnlyHint) return 'Reads';
  return hints.destructiveHint ? 'Changes (can overwrite or remove)' : 'Changes';
}

function confirmationOf(tool) {
  if (!tool.inputSchema?.properties?.confirmationToken) return '';
  return /^(delete|remove|detach)/.test(tool.name) ? 'Always' : 'For risky changes';
}

function summaryOf(tool) {
  const text = tool.description.replace(/\s+/g, ' ').replace(/^Action:\s*/, '').trim();
  const end = text.search(/[.:;](\s|$)/);
  const first = (end === -1 ? text : text.slice(0, end)).trim();
  return first.replace(/\|/g, '\\|');
}

function render(tools) {
  const byName = new Map(tools.map((tool) => [tool.name, tool]));
  const grouped = new Set(GROUPS.flatMap(([, names]) => names));
  const ungrouped = tools.map((tool) => tool.name).filter((name) => !grouped.has(name));
  const gone = [...grouped].filter((name) => !byName.has(name));
  if (ungrouped.length || gone.length) {
    const problems = [];
    if (ungrouped.length) problems.push(`on the server but in no group: ${ungrouped.join(', ')}`);
    if (gone.length) problems.push(`in a group but not on the server: ${gone.join(', ')}`);
    throw new Error(`GROUPS in scripts/sync-tools.mjs needs an update (${problems.join('; ')}). Also check SKILL.md and workflows.md for these names.`);
  }

  const lines = [
    '# Memberstack MCP tools',
    '',
    '<!-- Generated by scripts/sync-tools.mjs from the server\'s own tool list. Do not edit by hand. -->',
    '',
    `The Memberstack MCP server (\`${SERVER_URL}\`) has ${tools.length} tools. This file is the only place the skill lists them.`,
    '',
    '- The server sends the full description and argument schema for every tool. Trust those over anything written here.',
    '- "Reads" tools change nothing. "Changes" tools write to the app.',
    '- "Asks first" tools do not run on the first call. See "Confirmations" in `SKILL.md`.',
    '',
  ];
  for (const [group, names] of GROUPS) {
    lines.push(`## ${group} (${names.length})`, '', '| Tool | Kind | Asks first | What it does |', '|---|---|---|---|');
    for (const name of names) {
      const tool = byName.get(name);
      lines.push(`| \`${name}\` | ${kindOf(tool)} | ${confirmationOf(tool)} | ${summaryOf(tool)} |`);
    }
    lines.push('');
  }
  return `${lines.join('\n').trimEnd()}\n`;
}

function checkSkillFiles(toolNames) {
  const problems = [];
  for (const file of allSkillFiles()) {
    const text = readFileSync(file, 'utf8');
    const short = file.slice(ROOT.length + 1);
    for (const removed of REMOVED_TOOLS) {
      if (text.includes(removed)) problems.push(`${short} mentions the removed tool ${removed}`);
    }
    if (text.includes('mcp__')) problems.push(`${short} uses an mcp__ prefix; name tools without it`);
    if (!namesMcpTools(file)) continue;
    for (const match of text.matchAll(/`([A-Za-z_]+)(?:\([^`]*\))?`/g)) {
      const word = match[1];
      if (TOOL_LIKE.test(word) && !toolNames.has(word) && !NOT_TOOLS.has(word)) {
        problems.push(`${short} names \`${word}\`, which is not a tool on the server`);
      }
    }
  }
  return [...new Set(problems)];
}

const check = process.argv.includes('--check');
try {
  const tools = await fetchTools();
  const expected = render(tools);
  const problems = checkSkillFiles(new Set(tools.map((tool) => tool.name)));
  if (check) {
    let current = '';
    try {
      current = readFileSync(TOOLS_FILE, 'utf8');
    } catch {
      // A missing file is reported as out of date below.
    }
    if (current !== expected) problems.unshift('skills/memberstack/references/tools.md is out of date. Run: node scripts/sync-tools.mjs');
  } else {
    writeFileSync(TOOLS_FILE, expected);
    console.log(`Wrote ${tools.length} tools to skills/memberstack/references/tools.md`);
  }
  if (problems.length) {
    console.error(problems.map((problem) => `- ${problem}`).join('\n'));
    process.exit(1);
  }
  if (check) console.log(`OK: the skill matches the server's ${tools.length} tools.`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
