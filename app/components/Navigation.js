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
    this.elements.logo.classList.add('visible');
  }

  onChange() {
    const url = window.location.pathname;

    if (url.includes('projects')) {
      this.elements.logo.classList.add('active');
      this.elements.nav.classList.remove('active', 'inverted');

      this.elements.navItems[0].classList.add('active');
      this.elements.navDot.style.transform = `translateX(${`-${
        this.elements.navItems[0].clientWidth / 2
      }px`})`;
    } else {
      this.elements.nav.classList.add('active');
      this.elements.logo.classList.remove('active');

      if (url.includes('about')) {
        this.elements.nav.classList.add('inverted');
      } else {
        this.elements.nav.classList.remove('inverted');
      }

      each(this.elements.navItems, (element, index) => {
        if (element.getAttribute('data-page') === url) {
          this.activeElement = element;
          this.activeIndex = index;

          element.classList.add('active');

          this.elements.navDot.style.transform = `translateX(${
            index === 0
              ? `-${element.clientWidth / 2}px`
              : `${element.clientWidth / 2}px`
          })`;
        } else {
          element.classList.remove('active');
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
