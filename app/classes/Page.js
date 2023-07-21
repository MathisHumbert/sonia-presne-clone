import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import Prefix from 'prefix';
import each from 'lodash/each';

import detection from 'classes/Detection';
import Title from 'animations/Title';
import Paragraph from 'animations/Paragraph';

export default class Page {
  constructor({ element, elements, id, isScrollable = true }) {
    this.selector = element;
    this.selectorChildren = {
      ...elements,
      animationsTitles: '[data-animation="title"]',
      animationsParagraphs: '[data-animation="paragraph"]',
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
    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

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
    this.clamp = gsap.utils.clamp(0, this.scroll.limit);

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

  createAnimations() {
    // Titles
    if (this.elements.animationsTitles instanceof window.NodeList) {
      each(this.elements.animationsTitles, (element) => {
        return new Title({ element });
      });
    } else if (this.elements.animationsTitles !== null) {
      new Title({ element: this.elements.animationsTitles });
    }

    // Paragraphs
    if (this.elements.animationsParagraphs instanceof window.NodeList) {
      each(this.elements.animationsParagraphs, (element) => {
        return new Paragraph({ element });
      });
    } else if (this.elements.animationsParagraphs !== null) {
      new Paragraph({ element: this.elements.animationsParagraphs });
    }
  }

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
      this.addEventsListeners();
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
    this.removeEventsListeners();
  }

  /**
   * Events.
   */
  onResize() {
    if (this.elements.wrapper) {
      this.galleryStart =
        this.elements.wrapper.clientHeight - window.innerHeight * 1.33;

      if (this.scroll.limit !== 0 && this.scroll.limit === this.scroll.target) {
        this.scroll.limit = this.scroll.target =
          this.elements.wrapper.clientHeight - window.innerHeight;
      } else {
        this.scroll.limit =
          this.elements.wrapper.clientHeight - window.innerHeight;
      }

      this.clamp = gsap.utils.clamp(0, this.scroll.limit);
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
    if (!this.isVisible) return;

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

    if (this.elements.wrapper) {
      this.elements.wrapper.style[
        this.transformPrefix
      ] = `translateY(-${this.scroll.current}px)`;
    }

    if (this.elements.galleryScroll) {
      each(this.elements.galleryScroll, (item) => {
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
  addEventsListeners() {}

  removeEventsListeners() {}
}
