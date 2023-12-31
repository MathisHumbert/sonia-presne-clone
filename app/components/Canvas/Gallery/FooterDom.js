import { gsap } from 'gsap';
import each from 'lodash/each';

import Component from 'classes/Component';

export default class FooterDom extends Component {
  constructor({ onButtonViewClick, onButtonFilterClick, cursor }) {
    super({
      element: '.gallery__footer',
      elements: {
        buttonView: '.gallery__footer__view__button',
        counterCurrent: '.gallery__footer__counter__current',
        counterTotal: '.gallery__footer__counter__total',
        infoTitle: '.gallery__footer__info__title',
        infoCategory: '.gallery__footer__info__category',
        filterItems: '.gallery__footer__filters__item',
      },
    });

    this.onButtonViewClick = onButtonViewClick;
    this.onButtonFilterClick = onButtonFilterClick;
    this.cursor = cursor;

    this.isFilterOpen = false;

    this.addEventListeners();
  }

  onChangeIndex({ activeMediaElement, activeIndex, view }) {
    if (this.animateMainInfos) {
      this.animateMainInfos.kill();
    }

    this.animateMainInfos = gsap.timeline({ defaults: { ease: 'linear' } });

    if (view === 'main') {
      this.animateMainInfos
        .to(
          [
            this.elements.counterCurrent,
            this.elements.infoCategory,
            this.elements.infoTitle,
          ],
          {
            opacity: 0,
          }
        )
        .call(() => {
          this.elements.counterCurrent.innerHTML = activeIndex + 1;
          this.elements.infoCategory.innerHTML =
            activeMediaElement.getAttribute('data-title');
          this.elements.infoTitle.innerHTML =
            activeMediaElement.getAttribute('data-brand');
        })
        .to([this.elements.counterCurrent, this.elements.infoTitle], {
          opacity: 1,
        })
        .to(this.elements.infoCategory, { opacity: 1 }, '-=0.25');
    } else {
      this.animateMainInfos
        .to(this.elements.counterCurrent, { opacity: 0 })
        .call(() => {
          this.elements.counterCurrent.innerHTML = activeIndex + 1;
        })
        .to(this.elements.counterCurrent, { opacity: 1 });
    }
  }

  onViewClick({ view, totalMediaElements }) {
    each(this.elements.filterItems, (el, i) => {
      if (i === 0) {
        el.classList.add('gallery__footer__filters__item--active');
      } else {
        el.classList.remove('gallery__footer__filters__item--active');
      }
    });

    if (view === 'main') {
      this.elements.buttonView.classList.add(
        'gallery__footer__view__button--active'
      );

      this.onChangeCounterTotal({ total: totalMediaElements });
    } else {
      this.elements.buttonView.classList.remove(
        'gallery__footer__view__button--active'
      );

      this.onChangeCounterTotal({ total: totalMediaElements });
    }
  }

  onFilterClick({ filterElement, index }) {
    this.isFilterOpen = !this.isFilterOpen;

    const filter = filterElement.getAttribute('data-filter');

    this.onButtonFilterClick({
      filter,
    });

    each(this.elements.filterItems, (el, i) => {
      if (i === index) {
        el.classList.add('gallery__footer__filters__item--active');
      } else {
        el.classList.remove('gallery__footer__filters__item--active');
      }
    });
  }

  onChangeCounterTotal({ total }) {
    const tl = gsap.timeline({ defaults: { ease: 'linear' } });

    tl.to(this.elements.counterTotal, {
      opacity: 0,
      onComplete: () => (this.elements.counterTotal.innerHTML = total),
    }).to(this.elements.counterTotal, { opacity: 1 });
  }

  addEventListeners() {
    this.elements.buttonView.addEventListener('click', () =>
      this.onButtonViewClick()
    );

    this.elements.buttonView.addEventListener('mouseenter', () =>
      this.cursor.onEnter()
    );

    this.elements.buttonView.addEventListener('mouseleave', () =>
      this.cursor.onLeave()
    );

    each(this.elements.filterItems, (element, index) => {
      element.addEventListener('click', () =>
        this.onFilterClick({ filterElement: element, index: index })
      );
    });
  }

  show() {
    this.element.classList.add('visible');
  }

  hide() {
    this.element.classList.remove('visible');
  }
}
