const Cache = require("@11ty/eleventy-cache-assets");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

const CACHE_OPTIONS = {
  duration: "0m",
  type: "json",
};
if (process.env.ELEVENTY_SERVERLESS) {
  // Instead of ".cache" default because files/directories
  // that start with a dot are not bundled by default
  CACHE_OPTIONS.directory = "cache";
}

const loadPlayer = async (playerName) => {
  const params = new URLSearchParams();
  params.append("query", playerName);
  console.log(`Searching for player ${playerName}`);
  const response = await (
    await fetch("https://battlelog.battlefield.com/bf4/search/query", {
      method: "POST",
      body: params,
    })
  ).json();
  console.log(`Found Player`, response.data[0]);
  return response.data[0];
};

const loadPlayerWeaponProgress = async (data) => {
  if (!data.playerName) {
    return;
  }
  const player = await loadPlayer(data.playerName);
  console.log(
    `Loading progress for player ${data.playerName} (${player.personaId})`
  );
  const response = await (
    await fetch(
      `https://battlelog.battlefield.com/bf4/warsawWeaponsPopulateStats/${player.personaId}/1/unlocks/`
    )
  ).json();
  console.log(`Progress loaded for ${data.playerName}`);
  const result = [];
  for (const weapon of response.data.mainWeaponStats) {
    const unlockWeapon = data.weaponUnlocks[weapon.guid];
    if (unlockWeapon) {
      const nextUnlock =
        unlockWeapon.unlocks.find(
          (unlock) => unlock.valueNeeded > weapon.kills
        );
      for (const unlock of unlockWeapon.unlocks) {
        unlock.isBattelpack = unlock.name.startsWith("Battelpack");
      }
      if (nextUnlock) {
        result.push({
          guid: weapon.guid,
          category: weapon.category,
          slug: weapon.slug,
          kills: weapon.kills,
          nextUnlockKills:
            (nextUnlock?.valueNeeded || weapon.kills) - weapon.kills,
          nextUnlock,
          unlockTree: unlockWeapon.unlocks,
        });
      }
    }
  }
  return result;
};

module.exports = {
  eleventyComputed: {
    playerWeaponData: {
      player: async (data) => await loadPlayer(data.playerName),
      weaponProgress: loadPlayerWeaponProgress,
    },
  },
};
