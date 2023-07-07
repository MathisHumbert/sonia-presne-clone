import { gsap } from 'gsap';
import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import { map, each, filter, findIndex } from 'lodash';

import Media from './Media';
import MediaDom from './MediaDom';
import FooterDom from './FooterDom';
import Logo from './Logo';

export default class Gallery {
  constructor({ scene, viewport, screen, geometry, template }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;
    this.template = template;

    this.galleryElement = document.querySelector('.gallery');
    this.galleryItemElements = document.querySelectorAll('.gallery__item');
    this.logoElement = document.querySelector('.logo__one');

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

    this.infinite = {
      current: 0,
      target: 0,
      speed: 0.5,
      last: 0,
      velocity: 0,
      direction: 'up',
      ease: 0.1,
    };

    this.itemWidth = this.screen.height * 0.75;

    this.isDown = false;
    this.isAnimating = false;
    this.view = 'main';
    this.filter = 'all';
    this.activeIndex = 0;
    this.time = 0;

    this.transformPrefix = Prefix('transform');

    this.createGallery();
    this.createDomGallery();

    this.onResize({ viewport, screen });
    this.show();

    this.footerDom = new FooterDom({
      onButtonViewClick: this.onViewClick.bind(this),
      onButtonFilterClick: this.onFilterClick.bind(this),
    });
  }

  createDomGallery() {
    this.mediaElements = map(
      this.galleryItemElements,
      (element, index) =>
        new MediaDom({
          element,
          index,
          screen: this.screen,
          media: this.medias[index],
          template: this.template,
        })
    );

    this.mediaElementsFiltered = filter(
      this.mediaElements,
      (item) => item.isMain === true
    );
  }

  createGallery() {
    this.medias = map(
      this.galleryItemElements,
      (element, index) =>
        new Media({
          element,
          index,
          scene: this.scene,
          viewport: this.viewport,
          screen: this.screen,
          geometry: this.geometry,
          template: this.template,
        })
    );
  }

  // createLogo() {
  //   this.logo = new Logo({
  //     element: this.logoElement,
  //     scene: this.scene,
  //     viewport: this.viewport,
  //     screen: this.screen,
  //     geometry: this.geometry,
  //   });
  // }

  /**
   * Animations.
   */
  show() {
    each(this.medias, (media) => {
      if (media && media.show) {
        media.show();
      }
    });

    // if (this.logo && this.logo.show) {
    //   this.logo.show();
    // }
  }

  hide() {
    each(this.medias, (media) => {
      if (media && media.hide) {
        media.hide();
      }
    });

    // if (this.logo && this.logo.hide) {
    //   this.logo.hide();
    // }
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    if (this.isAnimating) return;

    this.viewport = viewport;
    this.screen = screen;

    this.mainMediaElementSizes = {
      width: this.screen.height * 0.42,
      margin: this.screen.height * 0.33,
      total: this.screen.height * 0.42 + this.screen.height * 0.33,
    };

    this.allMediaElementSizes = {
      width: this.screen.height * 0.42 * 0.7,
      margin: this.screen.height * 0.126,
      total: this.screen.height * 0.42 * 0.7 + this.screen.height * 0.126,
    };

    this.aboutMediaElementSizes = {
      width: this.screen.height * 0.42 * 0.7,
      margin: this.screen.height * 0.056,
      total: this.screen.height * 0.42 * 0.7 + this.screen.height * 0.056,
    };

    if (this.template === 'about') {
      this.scroll.current =
        this.scroll.target =
        this.scroll.last =
          (this.aboutMediaElementSizes.width +
            this.aboutMediaElementSizes.margin) *
          5.5;
    }

    if (this.view === 'main') {
      this.scroll.limit =
        (this.mediaElementsFiltered.length - 1) *
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin);
    } else {
      this.scroll.limit =
        (this.mediaElementsFiltered.length - 1) *
        (this.allMediaElementSizes.width + this.allMediaElementSizes.margin);
    }

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    each(this.mediaElementsFiltered, (medialElement, index) => {
      if (medialElement && medialElement.onResize) {
        medialElement.onResize({
          screen,
          mainMediaElementSizes: this.mainMediaElementSizes,
          allMediaElementSizes: this.allMediaElementSizes,
          aboutMediaElementSizes: this.aboutMediaElementSizes,
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

    // if (this.logo && this.logo.onResize) {
    //   this.logo.onResize({
    //     viewport,
    //     screen,
    //   });
    // }
  }

  onTouchDown(event) {
    if (this.isAnimating) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown || this.isAnimating) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = this.start - x;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    if (this.isAnimating) return;

    this.isDown = false;
  }

  onWheel(event) {
    if (this.isAnimating) return;
    const { pixelY } = normalizeWheel(event);

    if (this.template === 'about') {
      this.infinite.target += pixelY * 0.1;

      if (pixelY > 0 && this.infinite.direction !== 'up') {
        this.infinite.direction = 'up';
      } else if (pixelY < 0 && this.infinite.direction !== 'down') {
        this.infinite.direction = 'down';
      }
    } else {
      this.scroll.target += pixelY;
    }
  }

  onViewClick() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    if (this.view === 'main') {
      this.galleryElement.classList.add('is-overview');

      this.footerDom.onViewClick({
        view: this.view,
        totalMediaElements: 19,
      });

      this.onShowAll();
    } else {
      this.galleryElement.classList.remove('is-overview');

      this.footerDom.onViewClick({
        view: this.view,
        totalMediaElements: 12,
      });

      this.filter == 'all';

      this.onShowMain();
    }
  }

  onFilterClick({ filter }) {
    if (filter === this.filter || this.isAnimating) return;

    this.isAnimating = true;

    this.filter = filter;

    if (this.filter == 'all') {
      this.onShowAll();
    } else {
      this.onShowFilter();
    }
  }

  onShowFilter() {
    const startWidth =
      (this.allMediaElementSizes.total - this.allMediaElementSizes.width / 2) *
      this.mediaElementsFiltered.length;

    this.mediaElementsFiltered = filter(
      this.mediaElements,
      (item) => item.category === this.filter
    );

    const endWidth =
      (this.allMediaElementSizes.total - this.allMediaElementSizes.width / 2) *
      (this.mediaElementsFiltered.length - 1);

    this.scroll.current =
      this.scroll.target =
      this.scroll.last =
        this.scroll.current * (endWidth / startWidth);

    this.footerDom.onChangeCounterTotal({
      total: this.mediaElementsFiltered.length,
    });

    let lastFilterIndex = 0;

    each(this.mediaElements, (element, index) => {
      if (element.category !== this.filter) {
        const endX =
          (this.allMediaElementSizes.width + this.allMediaElementSizes.margin) *
            lastFilterIndex -
          this.allMediaElementSizes.width / 2;

        element.changeSizeFromAllToFilter({
          scroll: this.scroll.current,
          category: this.filter,
          index,
          endX,
        });
      } else {
        const elementIndex = findIndex(
          this.mediaElementsFiltered,
          (el) => el.index === element.index
        );

        lastFilterIndex = elementIndex;

        element.changeSizeFromAllToFilter({
          scroll: this.scroll.current,
          category: this.filter,
          index: elementIndex,
        });
      }
    });

    gsap.delayedCall(1, () => {
      this.onShowEnd('all');
    });
  }

  onShowMain() {
    if (this.filter === 'all') {
      this.mediaElementsFiltered = filter(
        this.mediaElements,
        (item) => item.isMain === true
      );
    }

    const startWidth =
      (this.allMediaElementSizes.total - this.allMediaElementSizes.width / 2) *
      this.mediaElementsFiltered.length;

    if (this.filter !== 'all') {
      this.mediaElementsFiltered = filter(
        this.mediaElements,
        (item) => item.isMain === true
      );
    }

    const endWidth =
      (this.mainMediaElementSizes.total -
        this.mainMediaElementSizes.width / 2) *
      (this.mediaElementsFiltered.length - 1);

    this.scroll.current =
      this.scroll.target =
      this.scroll.last =
        this.scroll.current * (endWidth / startWidth);

    const endX =
      -this.scroll.current +
      this.mainMediaElementSizes.total *
        (this.mediaElementsFiltered.length - 1) -
      this.mainMediaElementSizes.width / 2;

    each(this.mediaElements, (element) => {
      element.changeSizeFromAllToMain({
        scroll: this.scroll.current,
        endX,
      });
    });

    gsap.delayedCall(1, () => {
      this.onShowEnd('main');
    });
  }

  onShowAll() {
    const startX =
      -this.scroll.current +
      this.mainMediaElementSizes.total *
        (this.mediaElementsFiltered.length - 1) -
      this.mainMediaElementSizes.width / 2;

    const startWidth =
      (this.mainMediaElementSizes.total -
        this.mainMediaElementSizes.width / 2) *
      (this.mediaElementsFiltered.length - 1);

    const endWidth =
      (this.allMediaElementSizes.total - this.allMediaElementSizes.width / 2) *
      this.mediaElementsFiltered.length;

    this.scroll.current =
      this.scroll.target =
      this.scroll.last =
        this.scroll.current * (endWidth / startWidth);

    this.mediaElementsFiltered = this.mediaElements;

    this.footerDom.onChangeCounterTotal({
      total: this.mediaElementsFiltered.length,
    });

    each(this.mediaElementsFiltered, (element, index) => {
      element.changeSizeFromMainToAll({
        scroll: this.scroll.current,
        startX,
        allMediaElementSizes: this.allMediaElementSizes,
        index,
      });
    });

    gsap.delayedCall(1, () => {
      this.onShowEnd('all');
    });
  }

  onShowEnd(newView) {
    this.view = newView;

    if (this.view === 'main') {
      this.scroll.limit =
        (this.mediaElementsFiltered.length - 1) *
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin);
    } else {
      this.scroll.limit =
        (this.mediaElementsFiltered.length - 1) *
        (this.allMediaElementSizes.width + this.allMediaElementSizes.margin);
    }

    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

    this.isAnimating = false;
  }

  onHomeToAbout() {
    this.template = 'about';

    each(this.medias, (media) => (media.template = 'about'));

    this.scroll.current =
      this.scroll.target =
      this.scroll.last =
        (this.aboutMediaElementSizes.width +
          this.aboutMediaElementSizes.margin) *
        5.5;

    this.infinite = {
      current: 0,
      target: 0,
      last: 0,
      velocity: 0,
      speed: 2,
      ease: 0.1,
      direction: 'up',
    };

    each(this.mediaElements, (element) =>
      element.changeSizeFromHomeToAbout({
        scroll: this.scroll.current,
        aboutMediaElementSizes: this.aboutMediaElementSizes,
      })
    );

    gsap.delayedCall(1, () => {
      this.isAnimating = false;
    });
  }

  onAboutToHome() {
    this.template = 'home';

    each(this.medias, (media) => {
      media.template = 'home';
      media.extra = 0;
    });

    this.mediaElementsFiltered = filter(
      this.mediaElements,
      (item) => item.isMain === true
    );

    this.scroll.current =
      this.scroll.target =
      this.scroll.last =
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin) *
        5.5;

    const endX =
      -this.scroll.current +
      this.mainMediaElementSizes.total *
        (this.mediaElementsFiltered.length - 1) -
      this.mainMediaElementSizes.width / 2;

    each(this.mediaElements, (element) => {
      element.changeSizeFromAboutToHome({
        scroll: this.scroll.current,
        endX,
      });
    });

    gsap.delayedCall(1, () => {
      this.isAnimating = false;
      this.view = 'main';
      this.scroll.limit =
        (this.mediaElementsFiltered.length - 1) *
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin);
    });
  }

  onChangeIndex() {
    if (
      this.isAnimating ||
      this.activeIndex > this.mediaElementsFiltered.length - 1
    )
      return;

    const activeMediaElement =
      this.mediaElementsFiltered[this.activeIndex].element;

    this.footerDom.onChangeIndex({
      activeMediaElement,
      activeIndex: this.activeIndex,
      view: this.view,
    });
  }

  /**
   * Loop.
   */
  update() {
    if (this.isAnimating) return;

    this.time += 0.01;

    if (this.template === 'about') {
      this.aboutUpdate();
    } else {
      this.normalUpdate();
    }
  }

  normalUpdate() {
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

    this.scroll.velocity = Math.abs(
      (this.scroll.current - this.scroll.last) * 0.1
    );

    this.scroll.last = this.scroll.current;

    let index = this.activeIndex;

    if (this.view === 'main') {
      index = Math.round(
        this.scroll.current / this.mainMediaElementSizes.total
      );
    } else {
      index = Math.round(this.scroll.current / this.allMediaElementSizes.total);
    }

    if (index !== this.activeIndex) {
      this.activeIndex = index;

      this.onChangeIndex();
    }

    each(this.medias, (media) => {
      if (media && media.update) {
        media.update({
          scroll: this.scroll.current,
          velocity: this.scroll.velocity,
          time: this.time,
        });
      }
    });

    each(this.mediaElementsFiltered, (mediaElement) => {
      if (mediaElement && mediaElement.update) {
        mediaElement.update({
          scroll: this.scroll.current,
        });
      }
    });
  }

  aboutUpdate() {
    if (this.infinite.direction === 'up') {
      this.infinite.target += this.infinite.speed;
    } else {
      this.infinite.target -= this.infinite.speed;
    }

    this.infinite.current = gsap.utils.interpolate(
      this.infinite.current,
      this.infinite.target,
      this.infinite.ease
    );

    this.infinite.velocity = Math.abs(
      (this.infinite.current - this.infinite.last) * 0.1
    );

    this.infinite.last = this.infinite.current;

    each(this.medias, (media, index) => {
      if (media && media.update) {
        if (index % 2 === 0) {
          media.update({
            scroll: this.scroll.current,
            infinite: -this.infinite.current,
            velocity: 0,
            direction: this.infinite.direction === 'up' ? 'down' : 'up',
            time: this.time,
          });
        } else {
          media.update({
            scroll: this.scroll.current,
            infinite: this.infinite.current,
            velocity: 0,
            direction: this.infinite.direction,
            time: this.time,
          });
        }
      }
    });

    each(this.mediaElementsFiltered, (mediaElement) => {
      if (mediaElement && mediaElement.update) {
        mediaElement.update({
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