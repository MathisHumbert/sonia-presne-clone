import Page from 'classes/Page';
import { gsap } from 'gsap';

export default class Project extends Page {
  constructor() {
    super({
      id: 'project',
      element: '.project',
      elements: {
        wrapper: '.project__wrapper',
        logoOne: '.logo__one',
        logonOneSvg: '.logo__one svg',
        logoThree: '.logo__three',
        headerProgress: '.header__logo__progress circle',
        space: '.project__space',
        gallery: '.gallery',
        galleryScroll: '.gallery__item',
        galleryItems: '.gallery__items',
        galleryFooter: '.gallery__footer',
      },
    });
  }

  show() {
    this.elements.logoThree.classList.add('active');
    this.elements.logoOne.classList.remove('active');
    this.elements.galleryItems.classList.add('visible');
    this.elements.gallery.classList.remove('is-overview');

    gsap.fromTo(
      this.elements.logonOneSvg,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: this.elements.space,
          start: '25% center',
          end: '49% center',
          scrub: 1,
          onEnter: () => {
            this.elements.logoOne.classList.add('active');
          },
          onLeave: () => {
            this.isScrollable = false;
          },
        },
      }
    );

    gsap.to(this.elements.headerProgress, {
      strokeDashoffset: 0,
      scrollTrigger: {
        trigger: this.elements.wrapper,
        start: 'top top',
        end: () => `+=${this.elements.wrapper.clientHeight}`,
        scrub: 1,
      },
    });

    super.show();
  }

  hide() {
    this.elements.galleryFooter.classList.remove('visible');

    super.hide();
  }
}
