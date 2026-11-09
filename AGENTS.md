# AGENTS.md

Read this file before changing any code in this repository. It is the binding engineering
contract for both human and AI contributors.

## 1. Project

`@local/dsh-rewind-anchor` is a DSH UI bundle. It fixes **only the positioning** of the
dsh-purge-community rewind (回退 / Undo) menu by contributing a component-local stylesheet.
It never reimplements, replaces, or wraps the rewind button or its RPC.

## 2. Authoritative sources, in order

1. The Harness-installed plugin-development skill (read it, do not guess):
   - `.../@deepseek-ai/dsh-agent-preset/skills/cordis-plugin-development/SKILL.md`
   - `references/host-plugin.md` — manifest, `files`, locale metadata, icon, Host exports
   - `references/ui-plugin.md` — Client manifest, module loader, slot registration
   - `references/practices.md` — extension points, effects, UI and theme rules
   - `references/verification.md` — what counts as verification
   - `templates/decoration/*` — the canonical bundle skeleton
2. The running DSH deployment. Service methods, Event modes and slot options must be
   confirmed with `cordis_inspect_query`; the installed Harness is the authority.
3. `docs/DEVELOPMENT.md` in this repository (process, scripts, release).

## 3. Layout

| Path                                                    | Responsibility                                                              |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `package.json`                                          | Bundle manifest, `exports`, `files`, `dsh.bundle`, `dsh.client`, scripts    |
| `cordis.patch.yml`                                      | Loader patch: one `insert` row named after the package                      |
| `index.js`                                              | Host half. `export function apply() {}`; no UI logic here                   |
| `client.js`                                             | Browser artifact: `window.__ModuleLoader__.load`, slot registration, styles |
| `locale/*.json`                                         | `meta.title` / `meta.description` for en and zh                             |
| `icon.svg`                                              | Original artwork, SVG, <= 256 KiB                                           |
| `test/*.test.js`                                        | Contract tests (`node:test`) for manifest, resources and boundaries         |
| `eslint.config.js`, `.prettierrc.json`, `.editorconfig` | Code style and code rules                                                   |
| `docs/DEVELOPMENT.md`                                   | Development process                                                         |
| `.github/workflows/ci.yml`                              | `npm ci` + `npm run check` + `npm run pack:check`                           |

## 4. Hard constraints (non-negotiable)

- **Never** hand-edit `~/.dsh/profiles/*/package.json` or the profile `cordis.patch.yml`,
  and never run `pnpm` in a profile directory. Install with `plugin_manager`
  `install_bundle` using this directory as the absolute target.
- **Never** modify any file inside `dsh-purge-community`. A manual repack of that plugin is
  what corrupted its manifest in the incident that motivated this project.
- Keep the original rewind button, menu items, event handlers, locale and
  `/dsh-purge/rewind` call untouched. This plugin changes positioning only.
- The Client module must be a lazy `window.__ModuleLoader__.load({ id, factory })` factory
  whose `id` equals `package.json` `name`. `React` comes from `require('react')` only.
- **Do not** `require()` any `@deepseek-ai/dsh-client-*` package. `dsh.client.inject`
  entries only order activation.
- **Do not** append DOM to `document.body`, replace the app root, or render a second
  application. Register styles, timers and listeners inside `apply` via `ctx.effect` /
  `ctx.on` and return their cleanup. Component-local styles are React elements.
- **Do not** read another plugin's DOM, stylesheet or component source to estimate
  placement. Contribute through slots: `ctx.slots.inject(ownerKey, () => ctx.slots.register(...))`.
- Visible text goes through `ctx.locale`; styling uses `--dsw-alias-*` theme tokens.
  Literal colors are permitted in artwork only.
- Every runtime file must be listed in `package.json` `files` and exported where the
  Plugin Manager needs it. Run `npm run pack:check` after changing that list.
- All registration metadata must be real: localized titles/descriptions and an original
  icon. Never ship template placeholder copy.

## 5. The single controlled exception

The stylesheet selector targets `.dshp-rewind-wrap` / `.dshp-rewind-menu`, which belong to
another plugin. This is the **only** intentional cross-plugin coupling and is permitted
because:

- it does not read or measure the other plugin's DOM; it is a declarative CSS override;
- it does not create DOM, bind events, or intercept RPC calls;
- it degrades to a no-op when the selector does not match, so it cannot break Purge;
- Purge versions that already position the menu correctly (portal-based builds) do not
  match the descendant selector and are left alone.

Boundaries: the override may only set positioning properties (`position`, `top`, `bottom`,
`left`, `right`, `transform`). Never hide, move, restyle content, or change `z-index` beyond
what is needed to stay visible. If Purge renames these classes or moves the menu outside the
wrapper, the fix silently stops applying — record that in the release notes and re-verify
after every Purge upgrade. Do **not** "make it more robust" by adding a `MutationObserver`
or geometric DOM measurement: that violates `references/ui-plugin.md`.

## 6. Style, rules, process

- Code style: `.editorconfig` + Prettier (single quotes, semicolons, 2 spaces, LF, 100 cols).
- Code rules: ESLint flat config; no unused vars, `eqeqeq`, `curly`, `prefer-const`.
- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`),
  imperative subject, English, <= 72 characters.
- Before every commit: `npm run check` and `npm run pack:check` must pass.
- Tests describe **invariants** (manifest, resources, boundaries), not the current stage of
  implementation, so scaffolding and feature commits both pass.
- Do not commit generated output, dependencies, logs, local DSH state, or secrets.

## 7. Stage map

- **Stage 1 — scaffolding (initial commit):** manifest, patch, Host/Client skeletons,
  locale, icon, style/lint/test configuration, documents, remote repository. `client.js`
  registers a slot entry but renders no fix yet.
- **Stage 2 — feature:** render the component-local `<style>` from that slot component.
  Only positioning declarations. Extend tests if new invariants appear.
- **Stage 3 — verification:** install via `install_bundle`, confirm slot registration,
  then visually confirm the menu position in light and dark themes and after a Purge
  upgrade. Syntax checks and slot registration alone are **not** visual verification.

## 8. Definition of done

`npm run check` and `npm run pack:check` pass; the packed file list contains every runtime
file; locale metadata and icon render in the Plugin Manager; the rewind menu opens above its
button in the live DSH UI; rewind actions still behave exactly as before; the behaviour
survives a Purge update. Report any verification you could not perform instead of claiming
success.
