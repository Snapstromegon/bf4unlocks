const Cache = require("@11ty/eleventy-cache-assets");
const { URLSearchParams } = require("url");

const loadPlayer = async (playerName) => {
  const params = new URLSearchParams();
  params.append("query", playerName);
  console.log(`Searching for player ${playerName}`)
  const response = await Cache(
    "https://battlelog.battlefield.com/bf4/search/query",
    {
      duration: "0m",
      type: "json",
      fetchOptions: { method: "POST", body: params },
    }
  );
  console.log(`Found Player ${response.data[0]}`);
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
  const response = await Cache(
    `https://battlelog.battlefield.com/bf4/warsawWeaponsPopulateStats/${player.personaId}/1/unlocks/`,
    {
      duration: "0m",
      type: "json",
    }
  );
  console.log(`Progress loaded for ${data.playerName}`)
  const result = [];
  for (const weapon of response.data.mainWeaponStats) {
    const unlockWeapon = data.weaponUnlocks[weapon.guid];
    if (unlockWeapon) {
      const nextUnlock = unlockWeapon.unlocks.find(
        (unlock) => unlock.valueNeeded > weapon.kills
      );
      if (nextUnlock) {
        result.push({
          guid: weapon.guid,
          category: weapon.category,
          slug: weapon.slug,
          kills: weapon.kills,
          nextUnlockKills:  nextUnlock.valueNeeded - weapon.kills,
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
