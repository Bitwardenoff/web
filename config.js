function load(envName) {
  return {
    ...require("./config/base.json"),
    ...loadConfig(envName),
    ...loadConfig("local"),
    dev: {
      ...require("./config/base.json").dev,
      ...loadConfig(envName).dev,
      ...loadConfig("local").dev,
    },
  };
}

function log(configObj) {
  const repeatNum = 50;
  console.log(`${"=".repeat(repeatNum)}\nenvConfig`);
  console.log(JSON.stringify(configObj, null, 2));
  console.log(`${"=".repeat(repeatNum)}`);
}

function loadConfig(configName) {
  try {
    return require(`./config/${configName}.json`);
  } catch (e) {
    if (e instanceof Error && e.code === "MODULE_NOT_FOUND") {
      return {};
    } else {
      throw e;
    }
  }
}

function generateSubstitutions(configObj) {
  let result = {};

  Object.keys(configObj.compileFlags ?? {}).forEach(key => {
    result = { ...result, ...generateSubstitutionsForFlag(key) };
  });

  return result;
}

function generateSubstitutionsForFlag(flagName) {
  return {
    "featureFlag: (.*)[\\s\\S]*?\\/\\/ endFeatureFlag": ""
  };
}

module.exports = {
  load,
  log,
  generateSubstitutions,
};
