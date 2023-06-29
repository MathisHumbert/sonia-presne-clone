import { gsap } from 'gsap';
import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import { map, each, filter } from 'lodash';

import Media from './Media';
import GalleryDom from '../../GalleryDom';

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
    this.buttonViewElement = document.querySelector(
      '.home__footer__view__button'
    );

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
    this.createDomGallery();

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

  createDomGallery() {
    this.galleryItems = map(
      this.galleryItemElements,
      (element, index) =>
        new GalleryDom({
          element,
          index,
          screen: this.screen,
          media: this.medias[index],
        })
    );

    this.galleryItemsFiltered = filter(
      this.galleryItems,
      (item) => item.isMain === true
    );
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

    this.mainGalleryItemSizes = {
      width: this.screen.height * 0.42,
      margin: this.screen.height * 0.33,
    };

    this.allGalleryItemSizes = {
      width: this.screen.height * 0.42 * 0.7,
      margin: this.screen.height * 0.126,
    };

    if (this.view === 'main') {
      this.scroll.limit =
        (this.galleryItemsFiltered.length - 1) *
        (this.mainGalleryItemSizes.width + this.mainGalleryItemSizes.margin);
    } else {
      this.scroll.limit =
        (this.galleryItemsFiltered.length - 1) *
        (this.allGalleryItemSizes.width + this.allGalleryItemSizes.margin);
    }

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    each(this.galleryItemsFiltered, (galleryItem, index) => {
      if (galleryItem && galleryItem.onResize) {
        galleryItem.onResize({
          screen,
          mainGalleryItemSizes: this.mainGalleryItemSizes,
          allGalleryItemSizes: this.allGalleryItemSizes,
          view: this.view,
          index,
        });
      }
    });

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

  onViewClick() {
    this.isAnimating = true;

    if (this.view === 'main') {
      this.onShowAll();
    } else {
      this.onShowMain();
    }
  }

  onShowMain() {
    const startWidth =
      this.mainGalleryItemSizes.width +
      this.mainGalleryItemSizes.margin -
      this.mainGalleryItemSizes.width / 2;

    const endWidth =
      this.allGalleryItemSizes.width +
      this.allGalleryItemSizes.margin -
      this.allGalleryItemSizes.width / 2;

    this.scroll.current = this.scroll.target =
      this.scroll.current * (startWidth / endWidth);

    each(this.galleryItemsFiltered, (element, index) => {
      element.changeSizeFromAllToMain({
        scroll: this.scroll.current,
        lastMainIndex: this.galleryItemsFiltered.length - 1,
        index,
      });
    });

    gsap.delayedCall(1, () => {
      this.onFilterClickEnd('main');
    });
  }

  onShowAll() {
    const startWidth =
      this.mainGalleryItemSizes.width +
      this.mainGalleryItemSizes.margin -
      this.mainGalleryItemSizes.width / 2;

    const endWidth =
      this.allGalleryItemSizes.width +
      this.allGalleryItemSizes.margin -
      this.allGalleryItemSizes.width / 2;

    this.scroll.current = this.scroll.target =
      this.scroll.current * (endWidth / startWidth);

    each(this.galleryItemsFiltered, (element, index) => {
      element.changeSizeFromMainToAll({
        scroll: this.scroll.current,
        index,
      });
    });

    gsap.delayedCall(0.5, () => {
      this.onFilterClickEnd('all');
    });
  }

  onFilterClickEnd(newView) {
    this.isAnimating = false;

    this.view = newView;

    if (this.view === 'main') {
      this.scroll.limit =
        (this.galleryItemsFiltered.length - 1) *
        (this.mainGalleryItemSizes.width + this.mainGalleryItemSizes.margin);
    } else {
      this.scroll.limit =
        (this.galleryItemsFiltered.length - 1) *
        (this.allGalleryItemSizes.width + this.allGalleryItemSizes.margin);
    }

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);
  }

  addEventListeners() {
    this.buttonViewElement.addEventListener(
      'click',
      this.onViewClick.bind(this)
    );
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

    each(this.galleryItemsFiltered, (galleryItem) => {
      if (galleryItem && galleryItem.update) {
        galleryItem.update({
          scroll: this.scroll.current,
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
