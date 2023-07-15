import { gsap } from 'gsap';

import Animation from 'classes/Animation';

export default class Paragraph extends Animation {
  constructor({ element, elements }) {
    super({ element, elements });

    this.element = element;

    const delayAttribute = this.element.getAttribute('data-delay');
    this.delay = delayAttribute ? delayAttribute / 1000 : 0;
  }

  animateIn() {
    gsap.fromTo(
      this.element,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 1, delay: this.delay }
    );
  }

  animateOut() {
    gsap.set(this.element, { autoAlpha: 0 });
  }

  onResize() {}
}
