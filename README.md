# dsh-rewind-anchor

A small DSH UI bundle that keeps the **dsh-purge-community rewind menu** anchored above its
button, even after Purge updates overwrite its `client.js`.

## The problem

`dsh-purge-community` renders a "回退 / Undo" button in the conversation composer. In the
unpatched build, its menu is `position: fixed` with a fallback `bottom: 48px`, so the menu
appears at the **bottom of the DSH window** instead of above the button. Fixing the file by
hand works until the next Purge update: the updater's `COPY_NAMES` list includes `client.js`
and overwrites the edit every time.

Manually repacking the Purge bundle also caused a UTF-8 → GBK rewrite of its `package.json`,
which broke the plugin manifest and, in turn, the `unrestricted` agent preset. This plugin
exists so that **no Purge file ever needs to be touched again**.

## What this plugin does

It contributes one component-local `<style>` element through a Client slot. The stylesheet
only overrides the menu's positioning; the button, menu items, event handlers, locale,
`/dsh-purge/rewind` RPC and session-rewind behaviour are left completely untouched.

Consequence: the rewind feature is not "reimplemented" — it is literally the same feature.

## Install

Install through DSH's plugin manager (`install_bundle`) with the absolute path to this
directory as the target. Do **not** hand-edit `~/.dsh/profiles/*/package.json` or
`cordis.patch.yml`, and do not run `pnpm` inside the profile directory; the plugin manager
performs those steps.

On this machine the `desktop` profile is Electron-managed exclusively and the CLI refuses
it, so the last mile happens inside DSH. See `docs/INSTALL-WALKTHROUGH.md` for the exact
one-line instruction to give the in-app agent, the UI alternative and result codes.

After installation, restart DSH if the client module generation is not refreshed by HMR.

## Verify

1. Open a conversation whose composer shows the Purge 回退 button.
2. Click it. The menu must open directly above the button, not at the window bottom.
3. Click 回退一次 / 回退上一轮. Behaviour must be identical to an unmodified Purge install.
4. Repeat after upgrading `dsh-purge-community` — the fix must survive.

If Purge renames `.dshp-rewind-wrap` / `.dshp-rewind-menu` or moves the menu into a portal
outside the wrapper, the selector stops matching. See `docs/DEVELOPMENT.md` for the
post-upgrade check.

## Development

```sh
npm ci
npm run check       # eslint + prettier + node:test
npm run pack:check  # verify the shipped file list
```

See `AGENTS.md` for the binding engineering rules and `docs/DEVELOPMENT.md` for process.

## License

MIT. The placement approach is derived from dsh-purge-community (MIT, YuJunZhiXue); no
source file from that project is vendored here. See `LICENSE`.
