/**
 * Client half of the bundle.
 *
 * dsh-purge-community renders its rewind menu with `position: fixed` and a
 * `bottom: 48px` fallback, which places the menu at the bottom of the window.
 * Purge updaters overwrite its client.js, so the correction lives here instead:
 * one component-local <style> element contributed through a Client slot.
 *
 * The selector is deliberately scoped to a menu *inside* the wrapper. Purge
 * builds that already position the menu correctly use a body portal, so they
 * never match and are left alone. See AGENTS.md §5 for this controlled exception.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-rewind-anchor',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const REWIND_ANCHOR_CSS = `
/* Positioning only. Never hide, restyle, or replace Purge's rewind UI. */
.dshp-rewind-wrap > .dshp-rewind-menu {
  position: absolute !important;
  top: auto !important;
  right: 0 !important;
  bottom: calc(100% + 8px) !important;
  left: auto !important;
  transform: none !important;
}
`;

    function AnchorStyles() {
      return h('style', { 'data-dsh-rewind-anchor': '' }, REWIND_ANCHOR_CSS);
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register(
            {
              name: 'conversation.composer.dock',
              id: 'dsh-rewind-anchor',
              order: 900,
            },
            AnchorStyles,
          ),
        );
      },
    };
  },
});
