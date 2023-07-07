import Background from './Background';

export default class About {
  constructor({ scene, viewport, screen, geometry }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.createBackground();

    this.onResize({ viewport, screen });
    this.show();
  }

  createBackground() {
    this.background = new Background({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
    });
  }

  /**
   * Animations.
   */
  show() {
    if (this.background && this.background.show) {
      this.background.show();
    }
  }

  hide() {
    if (this.background && this.background.hide) {
      this.background.hide();
    }
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    this.viewport = viewport;
    this.screen = screen;

    if (this.background && this.background.onResize) {
      this.background.onResize({ viewport, screen });
    }
  }

  /**
   * Loop.
   */
  update() {
    if (this.background && this.background.update) {
      this.background.update();
    }
  }

  /**
   * Destroy.
   */
  destroy() {
    if (this.background) {
      this.background.mesh.removeFromParent();
    }
  }
}
