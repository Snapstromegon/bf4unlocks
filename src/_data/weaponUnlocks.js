const Cache = require("@11ty/eleventy-cache-assets");
const unlockNames = require("./unlockNames.json");

const CACHE_OPTIONS = {
  duration: "30d",
  type: "json",
};
if (process.env.ELEVENTY_SERVERLESS) {
  // Infinite duration (until the next build)
  CACHE_OPTIONS.duration = "*";
  // Instead of ".cache" default because files/directories
  // that start with a dot are not bundled by default
  CACHE_OPTIONS.directory = "cache";
}

const loadAllWeapons = async () => {
  const response = await Cache(
    "https://battlelog.battlefield.com/bf4/warsawWeaponsPopulateStats/0/1/unlocks/",
    CACHE_OPTIONS
  );
  const weapons = response.data.mainWeaponStats;
  return weapons.map((w) => {
    return {
      category: w.category,
      slug: w.slug,
      guid: w.guid,
    };
  });
};

const loadWeaponUnlockTree = async (weapon) => {
  const response = await Cache(
    `https://battlelog.battlefield.com/bf4/warsawWeaponAccessoriesPopulateStats/0/1/${weapon.guid}/`,
    CACHE_OPTIONS
  );
  weapon.unlocks = response.data.statsItemUnlocks
    .map((unlock) => {
      return {
        guid: unlock.guid,
        unlockId: unlock.unlockId,
        unlockType: unlock.unlockedBy.unlockType,
        valueNeeded: unlock.unlockedBy.valueNeeded,
        name:
          unlockNames[`WARSAW_${unlock.unlockId}`] ||
          `Battelpack ${unlock.unlockId.split("_").slice(-1)[0]}`,
      };
    })
    .filter((unlock) => unlock.unlockType == "weapon")
    .sort((a, b) => a.valueNeeded - b.valueNeeded);
  return weapon;
};

module.exports = async function () {
  const allWeapons = await loadAllWeapons();
  const res = {}
  for (const weapon of (await Promise.all(allWeapons.map(loadWeaponUnlockTree))).filter(
    (weapon) => weapon.unlocks.length
  )) {
    res[weapon.guid] = weapon;
  }
  return res;
};
