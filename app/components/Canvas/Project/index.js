import { map, each } from 'lodash';

import Media from './Media';

export default class Project {
  constructor({ scene, viewport, screen, geometry, transition }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;
    this.transition = transition;

    this.mediaElements = document.querySelectorAll('.project__wrapper media');

    this.createGallery();

    this.onResize({ viewport, screen });
    this.show();
  }

  createGallery() {
    this.medias = map(
      this.mediaElements,
      (element) =>
        new Media({
          element: element,
          scene: this.scene,
          viewport: this.viewport,
          screen: this.screen,
          geometry: this.geometry,
        })
    );
  }

  /**
   * Animations.
   */
  show() {
    if (this.transition) {
      this.transition.animate(this.medias[0].mesh, () => {
        each(this.medias, (media) => {
          if (media && media.show) {
            media.show();
          }
        });
      });
    } else {
      each(this.medias, (media) => {
        if (media && media.show) {
          media.show();
        }
      });
    }
  }

  hide() {
    each(this.medias, (media) => {
      if (media && media.hide) {
        media.hide();
      }
    });
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    this.viewport = viewport;
    this.screen = screen;

    each(this.medias, (media) => {
      if (media && media.onResize) {
        media.onResize({ viewport, screen });
      }
    });
  }

  /**
   * Loop.
   */
  update({ scroll }) {
    each(this.medias, (media) => {
      if (media && media.update) {
        media.update({ scroll });
      }
    });
  }

  /**
   * Destroy.
   */
  destroy() {
    each(this.medias, (media) => {
      if (media) {
        media.mesh.removeFromParent();
      }
    });
  }
}
