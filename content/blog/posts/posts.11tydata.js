function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

module.exports = {
  layout: "post.njk",
  tags: ["posts"],
  eleventyComputed: {
    permalink: (data) => {
      const d = data.page.date;
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      const slug = data.slug || slugify(data.title || "untitled");
      return `/${y}/${m}/${day}/${slug}/index.html`;
    },
  },
};
