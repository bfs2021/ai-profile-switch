// What a profile is connected to: MCP servers, plugins and claude.ai connectors, read from
// the files Claude Code keeps in the profile folder. Nothing is written here.
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from './account.mjs';
import { readMeta } from './config.mjs';
import { PROFILES_DIR } from './constants.mjs';
import { readJsonFile } from './json-fs.mjs';

const objectOf = value => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const namesOf = value => (Array.isArray(value) ? value.filter(item => typeof item === 'string') : []);

function readJson(path) {
  try { return objectOf(readJsonFile(path, {})); } catch { return {}; }
}

function modified(path) {
  try { return statSync(path).mtimeMs; } catch { return 0; }
}

// Plugins installed for the whole profile, as { id, marketplace }.
function userPlugins(dir) {
  return Object.entries(objectOf(readJson(join(dir, 'plugins', 'installed_plugins.json')).plugins))
    .filter(([, installs]) => Array.isArray(installs) && installs.some(install => install?.scope === 'user'))
    .map(([id]) => ({ id, marketplace: id.split('@')[1] ?? null }));
}

// owner/repo, a URL or a path, which is what `claude plugin install --marketplace` takes.
function marketplaceSources(dir) {
  return Object.fromEntries(Object.entries(readJson(join(dir, 'plugins', 'known_marketplaces.json')))
    .map(([name, entry]) => [name, entry?.source?.repo ?? entry?.source?.url ?? entry?.source?.path ?? null]));
}

export function connections(name) {
  const dir = join(PROFILES_DIR, name);
  const config = readConfig(dir);
  const userServers = objectOf(config.mcpServers);
  const localServers = Object.values(objectOf(config.projects)).flatMap(project => Object.keys(objectOf(project?.mcpServers)));
  // A sign-in cpf ran counts until Claude Code writes the file again and keeps its own list.
  const changed = modified(join(dir, '.claude.json'));
  const signedIn = objectOf(objectOf(readMeta().mcpLogins)[name]);
  const needsLogin = namesOf(config.mcpNeedsAuthNoticed).filter(server => !(signedIn[server] >= changed));
  const names = [...new Set([...Object.keys(userServers), ...localServers, ...needsLogin])];
  return {
    servers: names.map(server => ({ name: server, needsLogin: needsLogin.includes(server) })),
    needsLogin,
    userServers,
    plugins: userPlugins(dir),
    marketplaces: marketplaceSources(dir),
    claudeAi: namesOf(config.claudeAiMcpEverConnected),
  };
}

// Plugins and user MCP servers other profiles have and this one does not, one entry per
// profile that has any. Plugins that profile turned off in its settings are left out.
export function differences(target, profiles = readMeta().profiles) {
  const mine = connections(target);
  const myPlugins = new Set(mine.plugins.map(plugin => plugin.id));
  return profiles.filter(name => name !== target).map((from) => {
    const theirs = connections(from);
    const enabled = objectOf(readJson(join(PROFILES_DIR, from, 'settings.json')).enabledPlugins);
    return {
      from,
      plugins: theirs.plugins
        .filter(plugin => !myPlugins.has(plugin.id) && enabled[plugin.id] !== false)
        .map(plugin => ({
          ...plugin,
          known: Object.hasOwn(mine.marketplaces, plugin.marketplace),
          source: theirs.marketplaces[plugin.marketplace] ?? null,
        })),
      servers: Object.entries(theirs.userServers)
        .filter(([server]) => !Object.hasOwn(mine.userServers, server))
        .map(([server, definition]) => ({ name: server, definition })),
      claudeAi: theirs.claudeAi.filter(connector => !mine.claudeAi.includes(connector)),
    };
  }).filter(diff => diff.plugins.length || diff.servers.length);
}
