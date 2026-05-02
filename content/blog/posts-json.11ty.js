class PostsJson {
  data() {
    return {
      permalink: "/posts.json",
      eleventyExcludeFromCollections: true,
    };
  }

  /** @param {import("@11ty/eleventy").GlobalData} data */
  render(data) {
    const posts = data.collections.posts.map((p) => ({
      title: p.data.title,
      url: `https://aculich.github.io/blog${p.url}`,
      date: p.date?.toISOString?.() ?? null,
      description: p.data.description || "",
      tags: Array.isArray(p.data.tags) ? p.data.tags.filter((t) => t !== "posts") : [],
    }));
    return JSON.stringify(posts, null, 2);
  }
}

module.exports = PostsJson;
