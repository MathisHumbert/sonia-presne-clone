import Page from 'classes/Page';
export default class Home extends Page {
  constructor() {
    super({
      id: 'home',
      isScrollable: false,
      element: '.home',
      elements: {
        wrapper: '.home__wrapper',
        gallery: '.gallery',
        galleryItems: '.gallery__items',
        galleryFooter: '.gallery__footer',
      },
    });
  }

  show() {
    this.elements.gallery.classList.add('active');
    this.elements.galleryItems.classList.add('visible');
    this.elements.galleryFooter.classList.add('visible');

    super.show();
  }

  hide() {
    this.elements.gallery.classList.remove('active', 'is-overview');
    this.elements.galleryItems.classList.remove('visible');
    this.elements.galleryFooter.classList.remove('visible');

    super.hide();
  }
}
