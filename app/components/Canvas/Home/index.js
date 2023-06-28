import { gsap } from 'gsap';
import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import { map, each } from 'lodash';

import Media from './Media';

export default class Home {
  constructor({ scene, viewport, screen, geometry }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.galleryElement = document.querySelector('.home__gallery');
    this.galleryWrapperElement = document.querySelector(
      '.home__gallery__wrapper'
    );
    this.galleryItemElements = document.querySelectorAll(
      '.home__gallery__item'
    );
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
    this.itemWidth = this.screen.height * 0.75;

    this.isDown = false;
    this.isAnimating = false;
    this.view = 'main';

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

    this.scroll.limit = this.galleryWrapperElement.clientWidth - this.itemWidth;

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    if (this.isAnimating) return;

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
    // this.isAnimating = true;

    if (this.view === 'main') {
      this.onShowAll();
    } else {
      this.onShowMain();
    }

    return;

    each(this.galleryItemElements, (item, index) => {
      const media = this.medias[index];
      let tempScale = undefined;

      if (this.view === 'main' && item.getAttribute('data-main') !== 'true') {
        gsap.set(item, {
          width: '42vh',
          height: '60vh',
          marginRight: '33vh',
        });

        media.mesh.scale.x =
          (media.viewport.width * media.bounds.width) / media.screen.width;
        media.mesh.scale.y =
          (media.viewport.height * media.bounds.height) / media.screen.height;
      }

      if (this.view === 'all' && item.getAttribute('data-main') !== 'true') {
        gsap.set(item, {
          width: '42vh',
          height: '60vh',
          marginRight: '33vh',
        });

        tempScale = {
          x: (media.viewport.width * media.bounds.width) / media.screen.width,
          y:
            (media.viewport.height * media.bounds.height) / media.screen.height,
        };

        gsap.set(item, { width: 0, marginRight: 0 });
      } else {
        gsap.set(item, {
          width: '42vh',
          height: '60vh',
          marginRight: '33vh',
        });
      }

      if (this.view === 'main') {
        gsap.set(item, {
          width: '29.4vh',
          height: '42vh',
          marginRight: 'calc(29.4vh / 2)',
        });

        media.showAll();
      } else {
        media.showMain(tempScale);
      }
    });

    if (this.view === 'main') {
      // this.itemWidth = this.screen.height * 0.441;

      // const oldScrollLimit = this.scroll.limit;

      // this.scroll.limit =
      //   this.galleryWrapperElement.clientWidth - this.itemWidth;
      // console.log(this.scroll.current);
      // console.log(oldScrollLimit - this.scroll.limit);

      gsap.delayedCall(1, () => {
        this.onFilterClickEnd('all');
      });
    } else {
      gsap.delayedCall(1, () => {
        this.onFilterClickEnd('main');
      });
    }
  }

  onShowMain() {
    console.log('onshowmain');
    each(this.galleryItemElements, (item, index) => {
      const media = this.medias[index];
      const isMain = item.getAttribute('data-main') === 'true';
    });
  }

  onShowAll() {
    each(this.galleryItemElements, (item, index) => {
      const media = this.medias[index];
      const isMain = item.getAttribute('data-main') === 'true';

      if (!isMain) {
        // gsap.set(item, {
        //   width: '42vh',
        //   height: '60vh',
        //   marginRight: '33vh',
        // });
        // media.mesh.scale.x =
        //   (media.viewport.width * media.bounds.width) / media.screen.width;
        // media.mesh.scale.y =
        //   (media.viewport.height * media.bounds.height) / media.screen.height;
      }

      gsap.to(item, {
        width: '29.4vh',
        height: '42vh',
        marginRight: 'calc(29.4vh / 2)',
      });
    });
  }

  onFilterClickEnd(newView) {
    this.isAnimating = false;

    this.view = newView;

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);
  }

  addEventListeners() {
    this.buttonElement.addEventListener('click', this.onFilterClick.bind(this));
  }

  /**
   * Loop.
   */
  update() {
    if (this.isAnimating) return;

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

// TODO
// autoAlpha form 0 to 1 if is not display
// only change width and margin from 0 to vh
// change height from current to next
// block click if is animating
// update limit on click start
// block scroll on isAnimating
