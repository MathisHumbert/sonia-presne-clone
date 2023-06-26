import Media from '../Media';

export default class Home {
  constructor({ scene, viewport, screen, geometry }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.createMedia();
  }

  createMedia() {
    this.media = new Media({
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
    if (this.media && this.media.show) {
      this.media.show();
    }
  }

  hide() {
    if (this.media && this.media.hide) {
      this.media.hide();
    }
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    this.viewport = viewport;
    this.screen = screen;

    if (this.media && this.media.onResize) {
      this.media.onResize({ viewport, screen });
    }
  }

  /**
   * Loop.
   */
  update({ scroll, velocity }) {
    if (this.media && this.media.update) {
      this.media.update({ scroll, velocity });
    }
  }

  /**
   * Destroy.
   */
  destroy() {
    if (this.media) {
      this.media.mesh.removeFromParent();
    }
  }
}
