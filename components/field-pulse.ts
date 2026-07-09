// Shared emitter for the contour field's "field-pulse" interaction.
// Works for mouse and keyboard alike — any event with a currentTarget
// registers the element's center in the field. Decorative; silent no-op
// if nothing is listening.
export function emitFieldPulse(e: { currentTarget: Element }) {
  const r = e.currentTarget.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent("field-pulse", {
      detail: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
    })
  );
}
