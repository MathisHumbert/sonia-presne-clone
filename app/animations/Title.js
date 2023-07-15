import { gsap } from 'gsap';

import Animation from 'classes/Animation';

export default class Title extends Animation {
  constructor({ element, elements }) {
    super({ element, elements });

    this.element = element;

    this.elementSpan = element.querySelector('span');

    const delayAttribute = this.element.getAttribute('data-delay');
    this.delay = delayAttribute ? delayAttribute / 1000 : 0;
  }

  animateIn() {
    gsap.fromTo(
      this.elementSpan,
      { autoAlpha: 0, translateY: '2rem' },
      {
        autoAlpha: 1,
        translateY: 0,
        duration: 1,
        delay: this.delay,
      }
    );
  }

  animateOut() {
    gsap.set(this.elementSpan, { autoAlpha: 0, translateY: '2rem' });
  }

  onResize() {}
}
