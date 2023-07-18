import { gsap } from 'gsap';

import Page from 'classes/Page';

export default class About extends Page {
  constructor() {
    super({
      id: 'about',
      isScrollable: false,
      element: '.about',
      elements: {
        wrapper: '.about__wrapper',
        galleryItems: '.gallery__items',
        logoOne: '.logo__one',
        logoTwo: '.logo__two',
        title: '.about__title',
        contentText: '.about__content__text',
        contentLink: '.about__content__link',
      },
    });
  }

  show() {
    this.elements.galleryItems.classList.add('visible');
    this.elements.logoTwo.classList.add('active');
    this.elements.logoOne.classList.remove('active');

    super.show();
  }

  hide() {
    this.elements.logoTwo.classList.remove('active');

    gsap.to(
      [
        this.elements.title,
        this.elements.contentText,
        this.elements.contentLink,
      ],
      {
        opacity: 0,
      }
    );
    super.hide();
  }
}
