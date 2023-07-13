import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Prefix from 'prefix';
import { clamp, each } from 'lodash';

import detection from 'classes/Detection';

export default class Page {
  constructor({ element, elements, id, isScrollable = true }) {
    this.selector = element;
    this.selectorChildren = {
      ...elements,
    };
    this.id = id;
    this.isScrollable = isScrollable;

    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      last: 0,
      velocity: 0,
      ease: 0.1,
    };

    this.isDown = false;
    this.isVisible = false;

    this.transformPrefix = Prefix('transform');

    this.isDesktop = detection.checkIsDesktop();
  }

  /**
   * Create.
   */
  create() {
    this.element = document.querySelector(this.selector);
    this.elements = {};

    this.scroll = {
      position: 0,
      current: 0,
      target: 0,
      limit: 0,
      last: 0,
      velocity: 0,
      ease: 0.05,
    };

    each(this.selectorChildren, (entry, key) => {
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList ||
        Array.isArray(entry)
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = document.querySelectorAll(entry);

        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else if (this.elements[key].length === 1) {
          this.elements[key] = document.querySelector(entry);
        }
      }
    });
  }

  createAnimations() {}

  /**
   * Animations.
   */
  show(animation) {
    this.createAnimations();

    if (animation) {
      this.animationIn = animation;
    } else {
      this.animationIn = gsap.timeline();

      this.animationIn.fromTo(this.element, { autoAlpha: 0 }, { autoAlpha: 1 });
    }

    this.animationIn.call(() => {
      this.addEventListeners();
      this.isVisible = true;
    });
  }

  hide() {
    this.destroy();

    this.isVisible = false;

    return new Promise((res) => {
      gsap.to(this.element, {
        autoAlpha: 0,
        onComplete: () => res(),
      });
    });
  }

  /**
   * Destroy.
   */
  destroy() {
    this.removeEventListeners();
  }

  /**
   * Events.
   */
  onResize() {
    if (this.elements.wrapper) {
      this.galleryStart =
        this.elements.wrapper.clientHeight - window.innerHeight * 1.33;

      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    }
  }

  onTouchDown(event) {
    if (this.isDesktop || !this.isVisible || !this.isScrollable) return;

    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientY : event.clientY;
  }

  onTouchMove(event) {
    if (this.isDesktop || !this.isDown || !this.isVisible || !this.isScrollable)
      return;

    const y = event.touches ? event.touches[0].clientY : event.clientY;
    const distance = this.start - y;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    if (this.isDesktop || !this.isVisible || !this.isScrollable) return;

    this.isDown = false;
  }

  onWheel({ pixelY }) {
    if (!this.isVisible || !this.isScrollable) return;

    this.scroll.target += pixelY;
  }

  /**
   * Loop.
   */
  update() {
    if (!this.isVisible || !this.isScrollable) return;

    this.scroll.target = clamp(this.scroll.target, 0, this.scroll.limit);

    this.scroll.current = gsap.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    this.scroll.current = Math.floor(this.scroll.current);

    if (this.scroll.current < 0.01) {
      this.scroll.current = 0;
    }

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current}px)`;
    }

    if (this.elements.galleryItems) {
      each(this.elements.galleryItems, (item) => {
        gsap.set(item, {
          translateY: this.galleryStart - this.scroll.current,
        });
      });
    }

    this.scroll.velocity = (this.scroll.current - this.scroll.last) * 0.05;

    this.scroll.last = this.scroll.current;

    ScrollTrigger.update();
  }

  /**
   * Listeners.
   */
  addEventListeners() {}

  removeEventListeners() {}
}
