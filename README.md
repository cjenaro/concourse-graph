# Concourse Graph Interview

This project was created using the react + typescript vite starter. It's live at [concoursegraph.netlify.app](https://concoursegraph.netlify.app)

![Vite _ React _ TS](https://github.com/user-attachments/assets/aad12408-305b-4c64-b520-abc6e450d081)

## How to run

```bash
git clone https://github.com/cjenaro/concourse-graph.git
```

```bash
cd concourse-graph
npm install
npm run dev
```

## Features

- We can filter out by activity level in the bottom right of the graph.
- Clicking any day will provide details of the commits in that day.
- "AI Summary" CTA uses OpenAPI's 4o-mini model to get a summary from the commit messages of that day.

## Decisions

- Vitest for unit testing, much faster than jest and concurrent tests.
- React router for routing with actions and loaders, simplifies components state loading data outside of the react lifecycle and provides caching.
- Zod for parsing api responses and runtime type checking.
- Netlify function to run serverless open api request without exposing API keys.
- Didn't go with Next or Remix with SSR because it was a small project, otherwise I would've picked one of the two, [here's Remix's](https://remix.run/) website, just in case since it's less known than Next.
