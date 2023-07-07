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
      },
    });
  }

  show() {
    this.elements.galleryItems.classList.add('visible');
    this.elements.logoOne.classList.remove('active');
    this.elements.logoTwo.classList.add('active');

    super.show();
  }

  hide() {
    super.hide();
  }
}
