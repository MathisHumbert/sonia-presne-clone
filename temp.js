import { gsap } from 'gsap';

export default class GalleryDom {
  constructor({ element, screen, media }) {
    this.element = element;
    this.screen = screen;
    this.media = media;

    this.scroll = 0;
    this.mainIndex = Number(element.getAttribute('data-main-index'));
    this.isMain = element.getAttribute('data-main') === 'true';
  }

  onResize({ screen, mainGalleryItemSizes, allGalleryItemSizes, view, index }) {
    this.screen = screen;
    this.mainGalleryItemSizes = mainGalleryItemSizes;
    this.allGalleryItemSizes = allGalleryItemSizes;

    if (view === 'main') {
      this.width =
        (this.mainGalleryItemSizes.width + this.mainGalleryItemSizes.margin) *
          index -
        this.mainGalleryItemSizes.width / 2;

      gsap.set(this.element, {
        width: screen.height * 0.42,
        height: screen.height * 0.6,
        scale: 1,
        translateX: -this.scroll + this.width,
        translateY: '-50%',
      });
    } else {
      this.width =
        (this.allGalleryItemSizes.width + this.allGalleryItemSizes.margin) *
          index -
        this.allGalleryItemSizes.width / 2;

      gsap.set(this.element, {
        width: screen.height * 0.42,
        height: screen.height * 0.6,
        scale: 0.7,
        translateX: -this.scroll + this.width,
        translateY: '-50%',
      });
    }
  }

  changeSizeFromMainToAll({ scroll, starX, allGalleryItemSizes, index }) {
    if (!this.isMain) {
      this.allGalleryItemSizes = allGalleryItemSizes;

      gsap.set(this.element, {
        width: this.screen.height * 0.42,
        height: this.screen.height * 0.6,
        scale: 1,
        translateX: starX,
        translateY: '-50%',
        autoAlpha: 0,
        onComplete: () => this.media.setSize({ scroll, uAlpha: 0 }),
      });
    }

    this.width =
      (this.allGalleryItemSizes.width + this.allGalleryItemSizes.margin) *
        index -
      this.allGalleryItemSizes.width / 2;

    gsap.to(this.element, {
      scale: 0.7,
      translateX: -scroll + this.width,
      translateY: '-50%',
      autoAlpha: 1,
      // delay: 0.1,
      onComplete: () => this.media.changeSize({ scroll, uAlpha: 1 }),
    });
  }

  changeSizeFromAllToMain({ scroll, endX }) {
    if (this.isMain) {
      this.width =
        (this.mainGalleryItemSizes.width + this.mainGalleryItemSizes.margin) *
          this.mainIndex -
        this.mainGalleryItemSizes.width / 2;

      gsap.to(this.element, {
        scale: 1,
        translateX: -scroll + this.width,
        translateY: '-50%',
        onComplete: () => this.media.changeSize({ scroll, uAlpha: 1 }),
      });
    } else {
      gsap.to(this.element, {
        scale: 1,
        translateX: endX,
        translateY: '-50%',
        autoAlpha: 0,
        onComplete: () => this.media.changeSize({ scroll, uAlpha: 0 }),
      });
    }
  }

  update({ scroll }) {
    this.scroll = scroll;

    gsap.set(this.element, {
      translateX: -scroll + this.width,
      translateY: '-50%',
    });
  }
}
