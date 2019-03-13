const { green, gray, yellow } = require("chalk");
const cp = require("child_process");
const debug = require("debug")("wand:findSpells");
const fs = require("fs");
const path = require("path");
const tildify = require("tildify");

/**
 * Meta's custom plugin resolution logic
 *
 * The `cwd` argument must be an absolute path.
 *
 * Returns a `Map` object that maps plugin names to plugin paths.
 */
module.exports = (cwd, searchDir = "node_modules") => {
  debug(`\Looking for plugins: ${cwd}`);

  const rootDir = path.parse(cwd).root;
  const plugins = new Map();
  const onPlugin = (name, filePath, scopeName) => {
    const skipped = plugins.has(name);
    skipped || plugins.set(name, filePath);
    debug(`    ${green('+')} ${scopeName ? scopeName + '/' : ''}${name}${skipped ? gray(' (skip)') : ''}`); // prettier-ignore
  };

  debug(`\nResolving plugins:`);

  // Search relative to `cwd` first, then search every parent directory.
  let baseDir = cwd;
  while (true) {
    findNearbySpells(path.join(baseDir, searchDir), onPlugin);
    if (baseDir !== rootDir) baseDir = path.dirname(baseDir);
    else break;
  }

  // Search relative to every directory in $NODE_PATH.
  const globalRoots = process.env.NODE_PATH || getDefaultGlobalRoot();
  globalRoots.split(":").forEach(cwd => findNearbySpells(cwd, onPlugin));

  return plugins;
};

function getDefaultGlobalRoot() {
  return (cp.execSync("npm root -g") + "").trim();
}

/** Check a directory for potentially-scoped /^meta-/ packages */
function findNearbySpells(cwd, onPlugin) {
  if (isDir(cwd)) {
    debug(`CHECKING inside ${gray(tildify(cwd))}`);

    debug(`  ${yellow(tildify(cwd))}`);
    fs.readdirSync(cwd).forEach(name => {
      const filePath = path.join(cwd, name);
      if (name[0] === "@") {
        const scopeName = name;
        const scopePath = filePath;
        fs.readdirSync(scopePath).forEach(name => {
          if (/^spell-/.test(name)) {
            debug(`FOUND SPELL 1 ${yellow(tildify(name))}`);
            onPlugin(name, path.join(scopePath, name), scopeName);
          } else if (/^@chimpwizard-wand/.test(scopeName)) {
            if (/^spell-/.test(name)) {
              debug(`FOUND SPELL 2 ${yellow(tildify(name))}`);
              onPlugin(name, path.join(scopePath, name), scopeName);
            }
          }
        });
      } else if (/^spell-/.test(name)) {
        onPlugin(name, filePath);
      }
    });
  } else {
    debug(`  ${gray(tildify(cwd))}`);
  }
}

function isDir(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch (e) {}
  return false;
}
