# Copilot instructions

Guidance for GitHub Copilot code review on this repository.

## What this repository is

This repo hosts the Tomacheese Maven repository (served at
<https://repo.tomacheese.com>). Published Maven artifacts live at the repo root
under `com/` and `dev/`, and `README.md` is auto-generated. The only
hand-written code is the README generator under `.github/generate-readme/`
(TypeScript, pnpm, Node.js).

## Scope of review

- Review changes under `.github/generate-readme/` (TypeScript) and
  `.github/workflows/` (GitHub Actions).
- Do **not** flag machine-generated files: `README.md` and anything under
  `com/` or `dev/` (`maven-metadata.xml`, jars, poms). These are produced by the
  deploy/generate workflows; noting their style or content is noise.

## Conventions enforced by tooling (do not re-flag)

Prettier and ESLint already enforce formatting, so avoid style-only comments:

- No semicolons, single quotes, `printWidth` 80, `es5` trailing commas
  (`.prettierrc.yml`).
- ESLint via `@book000/eslint-config`; TypeScript is strict
  (`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`).
- pnpm is the only allowed package manager (`only-allow pnpm`). Flag additions
  of npm/yarn lockfiles or `npm`/`yarn` invocations in scripts or workflows.

## What to focus on

- **Generator correctness** (`src/main.ts`): the XML parse path from
  `fast-xml-parser` returns a version node that may be a single string or an
  array — verify both shapes stay handled. Check null/undefined handling of
  `versioning.latest`/`release`/`version` (missing values are meant to skip an
  entry, not crash).
- **Filesystem walking**: the recursive `maven-metadata.xml` scan should not
  throw on unexpected entries; watch for unguarded `fs` calls.
- **Workflow security**: the `generate-readme` workflow pushes with an SSH
  deploy key from `secrets.PUSH_DEPLOY_KEY` (pinned `known_hosts`,
  `StrictHostKeyChecking yes`); the Maven deploy workflows
  (`create-repo-maven.yml`, `jsa2-deploy.yml`) open PRs via `hub` using
  `secrets.GITHUB_TOKEN`. Flag any change that would print secrets, weaken
  `StrictHostKeyChecking`, or hard-code credentials. Pinned action SHAs should
  stay pinned.
- **`[skip ci]`** on the generate-readme auto-commit is intentional; do not
  suggest removing it.

Keep comments specific and actionable; skip generic praise or restating the
diff.
