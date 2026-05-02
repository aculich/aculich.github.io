const rssPlugin = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

/** GitHub-style slug: lowercase, strip punctuation, spaces -> hyphens. */
function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** @param {import("@11ty/eleventy").UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);

  // Markdown engine with auto-generated heading IDs (so we can deep-link to sections).
  const md = markdownIt({ html: true, linkify: true, typographer: false }).use(
    markdownItAnchor,
    { slugify, level: [2, 3, 4] }
  );
  eleventyConfig.setLibrary("md", md);

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("isoDate", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString();
  });

  eleventyConfig.addFilter("dateDay", (value) => {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  });

  /** Prefix Eleventy page.url with /blog so links work from site root. */
  eleventyConfig.addFilter("sitePostUrl", (url) => {
    if (!url) return "";
    const u = String(url);
    return u.startsWith("/blog") ? u : `/blog${u.startsWith("/") ? u : `/${u}`}`;
  });

  return {
    dir: {
      input: "content/blog",
      includes: "_includes",
      data: "_data",
      output: "blog",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["md", "njk", "html", "11ty.js"],
  };
};
