This folder holds repo automation metadata. **GitHub Pages** for this user site is configured in the repository settings (legacy publish): branch `main`, site root `/`. A copy of the last exported Pages + repo fields lives in `gh-pages-and-repo.metadata.yaml` for documentation and agent context.

To move to **GitHub Actions**–based Pages later, you would change the Pages “Build and deployment” source to GitHub Actions and add a workflow that uploads a `pages` artifact; that is not required for the static `/blog` build committed to `main`.
