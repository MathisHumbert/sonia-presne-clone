import { gsap } from 'gsap';
import normalizeWheel from 'normalize-wheel';
import Prefix from 'prefix';
import { map, each, filter } from 'lodash';

import Media from './Media';
import MediaDom from './MediaDom';
import FooterDom from './FooterDom';

export default class Home {
  constructor({ scene, viewport, screen, geometry }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.wrapperElement = document.getElementById('wrapper');
    this.galleryItemElements = document.querySelectorAll(
      '.home__gallery__item'
    );
    this.mediaElements = document.querySelectorAll('.home__gallery__media');

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
    this.filter = 'all';
    this.activeIndex = 0;

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
          screen: this.screen,
          media: this.medias[index],
        })
    );

    this.mediaElementsFiltered = filter(
      this.mediaElements,
      (item) => item.isMain === true
    );
  }

  createGallery() {
    this.medias = map(
      this.mediaElements,
      (element, index) =>
        new Media({
          element,
          index,
          scene: this.scene,
          viewport: this.viewport,
          screen: this.screen,
          geometry: this.geometry,
          isMain:
            this.galleryItemElements[index].getAttribute('data-main') ===
            'true',
        })
    );
  }

  /**
   * Animations.
   */
  show() {
    each(this.medias, (media) => {
      if (media && media.show) {
        media.show();
      }
    });
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

    this.scroll.target += pixelY;
  }

  onViewClick() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    if (this.view === 'main') {
      this.wrapperElement.classList.add('is-overview');

      this.footerDom.onViewClick({
        view: this.view,
        totalMediaElements: 19,
      });

      this.onShowAll();
    } else {
      this.wrapperElement.classList.remove('is-overview');

      this.footerDom.onViewClick({
        view: this.view,
        totalMediaElements: 12,
      });

      this.onShowMain();
    }
  }

  onFilterClick({ filter }) {
    if (filter === this.filter) return;

    this.filter = filter;

    if (this.filter == 'all') {
      this.onShowAll();
    } else if (this.filter === 'film') {
      // this.onShowFilm()
    } else {
      // this.onShowPrint()
    }
  }

  onShowMain() {
    this.mediaElementsFiltered = filter(
      this.mediaElements,
      (item) => item.isMain === true
    );

    const startWidth =
      (this.allMediaElementSizes.total - this.allMediaElementSizes.width / 2) *
      this.mediaElementsFiltered.length;

    const endWidth =
      (this.mainMediaElementSizes.total -
        this.mainMediaElementSizes.width / 2) *
      (this.mediaElementsFiltered.length - 1);

    this.scroll.current = this.scroll.target =
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
      this.onViewClickEnd('main');
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

    this.scroll.current = this.scroll.target =
      this.scroll.current * (endWidth / startWidth);

    this.mediaElementsFiltered = this.mediaElements;

    each(this.mediaElementsFiltered, (element, index) => {
      element.changeSizeFromMainToAll({
        scroll: this.scroll.current,
        startX,
        allMediaElementSizes: this.allMediaElementSizes,
        index,
      });
    });

    gsap.delayedCall(1, () => {
      this.onViewClickEnd('all');
    });
  }

  onViewClickEnd(newView) {
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

  /**
   * Destroy.
   */
  destroy() {
    if (this.media) {
      this.media.mesh.removeFromParent();
    }
  }
}
