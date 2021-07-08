const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
    name: "serverless", // The serverless function name from your permalink object
    functionsDir: "./netlify/functions/",
    inputDir: "src",
    copy: [
      // files/directories that start with a dot
      // are not bundled by default
      { from: ".cache", to: "cache" },
    ]
  });
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addWatchTarget("./assets/");
  return {
    dir: {
      input: "src",
      ouput: "_site",
    },
  };
};
