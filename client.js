/**
 * Client half of the bundle.
 *
 * Scaffolding stage: this module registers a single slot entry so the bundle is
 * loadable and its lifecycle is verifiable. The positioning fix is implemented in
 * the feature stage by rendering a component-local <style> element from this
 * component. See AGENTS.md for the constraints that implementation must respect.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-rewind-anchor',
  factory() {
    function AnchorStyles() {
      return null;
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
