# Development guide

## Environment

- Node.js >= 20 (CI uses 22), npm.
- A DSH profile with `dsh-purge-community` installed for manual verification.
- The Harness-installed `cordis-plugin-development` skill is the API reference. Do not
  infer Service, Event or Slot signatures from memory; use `cordis_inspect_query`.

## Commands

| Command                                   | Purpose                                              |
| ----------------------------------------- | ---------------------------------------------------- |
| `npm ci`                                  | Install dev dependencies from the committed lockfile |
| `npm run lint`                            | ESLint flat config over all JS                       |
| `npm run format` / `npm run format:check` | Prettier write / verify                              |
| `npm test`                                | `node:test` contract tests                           |
| `npm run check`                           | lint + format check + tests (CI gate)                |
| `npm run pack:check`                      | Verify the actual packed file list                   |

## Repository conventions

- `main` is the integration branch. Each change lands as a focused commit; no force push.
- Conventional Commits, English, imperative, <= 72 characters, e.g.
  `feat: anchor rewind menu above its button`.
- Keep commits reviewable: manifest/resource changes separate from behavioural changes.
- Never commit `node_modules/`, `coverage/`, `*.tgz`, logs, `.dsh/`, editor directories or
  `.env` files. `.gitignore` is the source of truth.
- Versioning: semver in `package.json`. This bundle is `private: true`; bump the version for
  every shipped change even though it is not published to npm.

## Bundle contract checklist

1. `package.json` `name` equals the `cordis.patch.yml` row `name` and the Client factory `id`.
2. `exports` exposes `.`, `./client`, `./locale/*.json`, `./icon`.
3. `files` lists `index.js`, `client.js`, `cordis.patch.yml`, `locale/*.json`, `icon.svg`
   plus any new runtime module. `npm run pack:check` must show them.
4. `locale/en.json` and `locale/zh.json` both carry meaningful `meta.title` and
   `meta.description` in sentence case for English.
5. `icon.svg` is original, renders, and is <= 256 KiB.
6. `index.js` exports `apply`; the Client module registers everything through slots.

## Installation and verification

- Install with `plugin_manager` `action: install_bundle`, `target` = absolute path to this
  directory. Do not reproduce package installation with shell commands in a profile.
  The `desktop` profile is Electron-managed exclusively: `dsh --profile desktop ...`
  returns `error: profile "desktop" is managed exclusively by the Electron application`,
  and `dsh plugin --profile desktop ...` is not a valid substitute for `install_bundle`.
  Follow `INSTALL-WALKTHROUGH.md` instead.
- Read `application` and `warnings` from the installation result. `restart-required` means
  the new Client module generation is not live yet.
- Confirm the row with `cordis_inspect_query`, not `list_plugins`.
- Visual verification: open the composer rewind menu in light and dark themes; confirm it
  sits above the button; exercise 回退一次 / 回退上一轮. Without a connected page, report
  that visual verification is unavailable — syntax checks are not sufficient.
- After any `dsh-purge-community` upgrade, repeat the visual check. The CSS selector is a
  deliberate dependency on Purge's private class names (see `AGENTS.md` §5).

## Rollback

Remove the bundle through `plugin_manager` `remove_bundle`. No user data, session logs,
profile configuration or Purge files are modified by this plugin, so removal is complete
and leaves no state behind.

## Design decisions record

- **Why a separate bundle:** Purge's updater overwrites `client.js` on every update, so any
  in-place edit is lost. A separate bundle is never in Purge's `COPY_NAMES` list.
- **Why CSS-only:** `references/ui-plugin.md` forbids reading another plugin's DOM or
  writing DOM outside the component. A declarative, component-local stylesheet is the
  weakest mechanism that fixes positioning; a `MutationObserver`/geometry solution was
  considered and rejected.
- **Why not reimplement rewind:** the rewind RPC, draft/arm state, session reopen and
  subagent handling are not part of the defect. Copying them would create a second source
  of truth and drift on every Purge release.
