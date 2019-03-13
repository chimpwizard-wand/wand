const { gray, green } = require("chalk");
const debug = require("debug")("wand");
const fs = require("fs");
const path = require("path");

const wand = require("./package.json");
const findSpells = require("./lib/findSpells");
const registerSpell = require("./lib/registerSpell");

// Plugins depended on by the `meta` package.
const corePlugins = new Map();
Object.keys(wand.dependencies).forEach(name => {
  if (/^meta-/.test(name)) {
    const packagePath = require.resolve(path.join(name, "package.json"));
    corePlugins.set(name, path.dirname(packagePath));
  }
  if (/^@chimpwizard-wand/.test(name)) {
    const packagePath = require.resolve(path.join(name, "package.json"));
    corePlugins.set(name, path.dirname(packagePath));
  }
});

//console.log("VERSION: " + wand.version);
debug("CORE Spells are: " + JSON.stringify(corePlugins));

exports.version = wand.version;

exports.run = (cwd, argv) => {
  const program = require("commander").version(wand.version);

  // Ensure `cwd` is actually the working directory.
  cwd = path.resolve(cwd);
  process.chdir(cwd);

  // Load user plugins.
  const userPlugins = findSpells(cwd);
  debug("INSTALLED Spells are: " + JSON.stringify(userPlugins));

  if (userPlugins.size) {
    debug(`\nLoading plugins:`);
    userPlugins.forEach(pluginPath => registerSpell(program, pluginPath));
  }

  // Load core plugins after, so users can override them.
  debug(`\nLoading core plugins:`);
  corePlugins.forEach((pluginPath, name) => {
    if (userPlugins.has(name)) return debug(`  ${green('+')} ${name} ${gray('(skip)')}`); // prettier-ignore
    registerSpell(program, pluginPath);
  });

  debug(`\nChecking .meta:`);
  if (fs.existsSync(".meta")) {
    const gitPlugin =
      userPlugins.get("@chimpwizard-wand/spell-git") ||
      "@chimpwizard-wand/spell-git";
    debug(`\nLoading into memory @chimpwizard-wand/spell-git`);
    require(gitPlugin).update({ dryRun: true });
  }

  debug("EXECUTING: " + JSON.stringify(argv));
  program.parse(argv);
};
