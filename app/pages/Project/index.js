import Page from 'classes/Page';
import { ScrollTrigger } from 'gsap/all';

export default class Project extends Page {
  constructor() {
    super({
      id: 'project',
      element: '.project',
      elements: {
        wrapper: '.project__wrapper',
        logoOne: '.logo__one',
        logoThree: '.logo__three',
        space: '.project__space',
        gallery: '.gallery',
        galleryItems: '.gallery__item',
      },
    });
  }

  show() {
    this.elements.gallery.classList.add('active');
    this.elements.logoThree.classList.add('active');
    this.elements.logoOne.classList.remove('active');

    ScrollTrigger.create({
      trigger: this.elements.space,
      start: '49% center',
      onEnter: () => (this.isScrollable = false),
    });

    super.show();
  }

  hide() {
    super.hide();
  }
}
