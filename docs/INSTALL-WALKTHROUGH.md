# Install walkthrough (desktop profile)

## Why installation is a manual step

The `desktop` profile on this machine is owned by the Electron application:

- `dsh --profile desktop --dump-config` returns
  `error: profile "desktop" is managed exclusively by the Electron application`.
- `plugin_manager install_bundle` is a tool of the **DSH in-app agent**, not an external
  CLI or HTTP endpoint. An external assistant has no way to invoke it.
- Hand-editing `~/.dsh/profiles/desktop/package.json` or its `cordis.patch.yml` is
  forbidden by the official plugin skill, and is exactly the class of manual edit that
  corrupted `dsh-purge-community/package.json` in the incident that started this project.

Therefore the last mile must be done inside DSH itself. Everything else is already
prepared: the bundle is packed, validated, committed and pushed.

## Option A — let DSH's own agent install it (recommended)

1. In DSH, create a **new session**. Do not use the session with a turn in progress.
2. Paste this single instruction (Chinese so the in-app agent reads it unambiguously):

```
请调用 plugin_manager 的 install_bundle，target 使用本地目录：
C:\person\code\dsh-dev\plugins\dsh-rewind-anchor
安装后把返回的 application、warnings、bundle、version 原样告诉我。
不要修改任何其他配置，也不要顺带执行别的操作。
```

3. If the agent reports `pendingBuilds`, do **not** approve build scripts automatically;
   report them first. A local-directory bundle normally needs none.

## Option B — Plugin Manager UI

1. Open 插件 (sidebar) → 添加插件 → 选择添加插件方式 → choose the local directory/path option.
2. Enter `C:\person\code\dsh-dev\plugins\dsh-rewind-anchor`.
3. Confirm and wait for the installation result.

## Reading the result

| `application`      | Meaning                                 | Action                                                                                                                                  |
| ------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `applied`          | Live via HMR                            | Proceed to verification                                                                                                                 |
| `restart-required` | New Client module generation not loaded | Fully quit and relaunch DSH **when no turn is running**                                                                                 |
| `overridden`       | A higher layer wins                     | Inspect the profile patch layers                                                                                                        |
| `failed`           | See `error.code`                        | `invalid-spec` = use the absolute path; `not-bundle` = manifest lost `dsh.bundle.patch`; `incompatible-version` = report `incompatible` |
| `cancelled`        | Nothing changed                         | Retry                                                                                                                                   |

Read `warnings` too: pre-existing inactive entries are left alone, not fixed.

## Stage 3 verification (visual, cannot be automated from outside DSH)

1. Open a conversation whose composer shows the Purge 回退 button.
2. Click it: the menu must open **directly above the button**, not at the window bottom.
3. Check both light and dark themes.
4. Click 回退一次 and 回退上一轮: behaviour must match an unmodified Purge install.
5. After any `dsh-purge-community` upgrade, repeat steps 1–4 — this is the whole point of
   the plugin.

Syntax checks, contract tests and slot registration are **not** visual verification.

## Rollback

Ask the DSH agent to call `plugin_manager remove_bundle` with
`@local/dsh-rewind-anchor`. The plugin writes no user data, session logs, profile
configuration or Purge files, so removal leaves nothing behind.

## Expected no-op on the current machine

Purge is currently the locally patched `fix3` build that already positions its menu
correctly through a body portal. The plugin's descendant selector intentionally does not
match that build, so you may observe no visible change right after installation. It takes
effect when a Purge update restores the unpatched, wrapper-local menu.

## Installed on 2026-11-09 (verified)

Result reported by the DSH in-app agent:

| Field                           | Value                                                                      |
| ------------------------------- | -------------------------------------------------------------------------- |
| `application`                   | `applied`                                                                  |
| `warnings`                      | `[]`                                                                       |
| `version`                       | `0.1.0`                                                                    |
| `stage` / `enabled` / `changed` | `enable` / `true` / `true`                                                 |
| pnpm                            | exit code 0, one generic peer-dependency notice (not counted as a warning) |

The displayed `bundle` value contained a transcription artifact (`@//local/...` with a
leading space). The real, on-disk name is **`@local/dsh-rewind-anchor`** everywhere:
`dsh.profile.bundles`, `dependencies`, `pnpm-lock.yaml`, and the linked
`node_modules/@local/dsh-rewind-anchor`. No correction was needed.

Post-install checks performed:

- Startup load path validated: `dsh.bundle.patch` resolves, `cordis.patch.yml` parses as
  YAML with one `insert` row named after the package, `./client`, `locale/*.json` and
  `icon.svg` all resolve.
- Plugin Manager 已安装 list shows the localized entry `回退菜单定位修正` with its
  Chinese description, a 查看 button and an 启用 switch in state `checked`.
- `npm run check` (7 tests) and `npm pack --dry-run` (9 runtime files) still pass.

Not verified, and deliberately not claimed:

- **Menu geometry / visual placement.** The Purge 回退 button was disabled at the time
  (`UIA_E_ELEMENTNOTENABLED`), so the menu could not be opened without creating a new
  session or triggering a model turn; no DOM emulation was used.
- **Whether the stylesheet is currently in effect.** Purge is still the patched `fix3`
  build whose menu is portalled to `body`, so the descendant selector intentionally does
  not match. The real acceptance test is the first Purge update that restores the
  unpatched wrapper-local menu; repeat the Stage 3 checklist then.
- Icon rendering in the Plugin Manager was not captured visually.

`application: applied` means HMR applied the installation, but an unchanged slot id does
not prove a fresh Client module generation was loaded. Refresh the page (or fully restart
DSH when no turn is running) once before relying on the fix.
