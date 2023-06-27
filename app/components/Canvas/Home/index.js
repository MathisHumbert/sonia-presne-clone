import { gsap } from 'gsap';
import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import { map, each } from 'lodash';

import Media from './Media';

export default class Home {
  constructor({ scene, viewport, screen, geometry, forceResize }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;
    this.forceResize = forceResize;

    this.galleryElement = document.querySelector('.home__gallery');
    this.galleryWrapperElement = document.querySelector(
      '.home__gallery__wrapper'
    );
    this.galleryItemElements = document.querySelector('.home__gallery__item');
    this.mediaElements = document.querySelectorAll('.home__gallery__media');
    this.buttonElement = document.querySelector('.home__footer__view__button');

    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      last: 0,
      velocity: 0,
      ease: 0.1,
    };
    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    this.isDown = false;
    this.isPlaceChanging = false;
    this.homeView = 'main';

    this.transformPrefix = Prefix('transform');

    this.createGallery();

    this.onResize({ viewport, screen });
    this.show();

    this.addEventListeners();
  }

  createGallery() {
    this.medias = [];

    each(this.mediaElements, (element, index) => {
      const media = new Media({
        element,
        index,
        scene: this.scene,
        viewport: this.viewport,
        screen: this.screen,
        geometry: this.geometry,
      });

      this.medias.push(media);
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

    // this.scroll = {
    //   position: 0,
    //   current: 0,
    //   target: 0,
    //   limit: 0,
    //   last: 0,
    //   velocity: 0,
    //   ease: 0.05,
    // };

    this.scroll.limit =
      this.galleryWrapperElement.clientWidth - this.screen.height * 0.8;

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    if (this.isPlaceChanging) return;

    each(this.medias, (media) => {
      if (media && media.onResize) {
        media.onResize({
          viewport,
          screen,
        });
      }
    });
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = this.start - x;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  onWheel(event) {
    const { pixelY } = normalizeWheel(event);

    this.scroll.target += pixelY;
  }

  onFilterClick() {
    this.isPlaceChanging = true;

    gsap.delayedCall(0.2, () => this.forceResize());

    gsap.delayedCall(0.5, () => {
      each(this.medias, (media) => {
        if (media && media.onPlaceChange) {
          media.onPlaceChange({
            viewport: this.viewport,
            screen: this.screen,
            onComplete: () => (this.isPlaceChanging = false),
          });
        }
      });
    });
  }

  addEventListeners() {
    this.buttonElement.addEventListener('click', this.onFilterClick.bind(this));
  }

  /**
   * Loop.
   */
  update() {
    this.scroll.target = this.clamp(this.scroll.target);

    this.scroll.current = gsap.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0;
    }

    this.galleryElement.style[
      this.transformPrefix
    ] = `translateX(-${this.scroll.current}px)`;

    this.scroll.velocity = (this.scroll.current - this.scroll.last) * 0.05;

    this.scroll.last = this.scroll.current;

    each(this.medias, (media) => {
      if (media && media.update) {
        media.update({
          scroll: this.scroll.current,
          velocity: this.scroll.velocity,
        });
      }
    });
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
