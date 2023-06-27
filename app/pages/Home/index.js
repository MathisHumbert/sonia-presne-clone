import Page from 'classes/Page';
import { gsap } from 'gsap';
import { each } from 'lodash';

export default class Home extends Page {
  constructor() {
    super({
      id: 'home',
      element: '.home',
      elements: {
        wrapper: '.home__wrapper',
        items: '.home__gallery__item',
        button: '.home__footer__view__button',
      },
    });

    this.view = 'main';
  }

  show() {
    each(this.elements.items, (item) => {
      if (item.getAttribute('data-main') === 'true') {
        gsap.set(item, { width: '42vh', height: '60vh', marginRight: '38vh' });
      }
    });

    super.show();
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    this.elements.button.addEventListener('click', () => {
      each(this.elements.items, (item) => {
        if (this.view === 'main') {
          gsap.set(item, {
            width: '42vh',
            height: '60vh',
            marginRight: '38vh',
          });
        } else if (
          this.view === 'all' &&
          item.getAttribute('data-main') !== 'true'
        ) {
          gsap.set(item, {
            width: '0',
            height: '0',
            marginRight: '0',
          });
        }
      });
    });
  }

  removeEventListeners() {}
}
