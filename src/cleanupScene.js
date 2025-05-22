export function cleanup() {
  if (window.scene) {
    while (window.scene.children.length > 0) {
      const child = window.scene.children[0];
      window.scene.remove(child);
    }
  }

  if (window.animationId) {
    cancelAnimationFrame(window.animationId);
    window.animationId = null;
  }

}
window.cleanupScene = cleanup;