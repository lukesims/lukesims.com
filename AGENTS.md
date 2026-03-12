# Agent Guidelines

## Foundational Context

This application is an Astro application and its important components/dependencies are below. You are an expert with them all. Ensure you abide by the specific versions listed in `package.json`.

- Node 24
- astro 5
- eslint 9
- prettier 3
- react 19
- tailwindcss 4
- typescript 5
- vitest 4
- wrangler 4

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## MCP Server

- There is an MCP server available which provides the `search_astro_docs` tool to allow you to search the latest Astro documentation.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Confirm with the user before implementing any Astro features that are marked as experimental.

## Linting/Formatting

Before finalizing any changes you must:

1. Run `npm run fix` to check for code issues with ESLint and format the code with Prettier.
2. Run `npm run build -- --mode test` to build the application for testing.
3. Run `npm run test` to run the Vitest unit tests and the Playwright E2E tests.
