Northfield Analytical Services website (Astro). Fictional fixture.

- The host runs `npm run build` (Astro build, then `postbuild`) and deploys on every push to any branch. A failing `postbuild` stops the deploy.
- GitHub Actions runs `npm run verify` in parallel with the deploy.
- From next month the news section is edited through a git-based CMS. Each save commits to `main` and deploys; editors do not open pull requests.
- House rules: British spelling; no em dashes in visitor-facing text; staff mobile numbers, client names and prices are never published.
- `dist/` is the current build. `npm run postbuild` and `npm run verify` both pass on it.
