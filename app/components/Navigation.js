import each from 'lodash/each';
import { gsap } from 'gsap';

import Component from 'classes/Component';

export default class Navigation extends Component {
  constructor() {
    super({
      element: '.header',
      elements: {
        logo: '.header__logo',
        nav: '.header__nav',
        navItems: '.header__nav__item',
        navDot: '.header__nav__dot',
      },
    });

    this.onChange();
  }

  show() {
    this.elements.nav.classList.add('visible');
  }

  onChange() {
    const url = window.location.pathname;

    if (url.includes('projects')) {
      this.elements.logo.classList.add('header__logo--active');
      this.elements.nav.classList.remove('header__nav--active');
    } else {
      this.elements.nav.classList.add('header__nav--active');
      this.elements.logo.classList.remove('header__logo--active');

      each(this.elements.navItems, (element, index) => {
        if (element.getAttribute('data-page') === url) {
          this.activeElement = element;
          this.activeIndex = index;

          element.classList.add('header__nav__item--active');

          this.elements.navDot.style.transform = `translateX(${
            index === 0
              ? `-${element.clientWidth / 2}px`
              : `${element.clientWidth / 2}px`
          })`;
        } else {
          element.classList.remove('header__nav__item--active');
        }
      });
    }
  }

  onResize() {
    if (this.activeElement) {
      gsap.set(this.elements.navDot, {
        translateX:
          this.activeIndex === 0
            ? -this.activeElement.clientWidth / 2
            : this.activeElement.clientWidth / 2,
      });
    }
  }
}
