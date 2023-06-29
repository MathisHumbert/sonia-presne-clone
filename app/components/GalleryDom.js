import { gsap } from 'gsap';

export default class GalleryDom {
  constructor({ element, index, screen, media }) {
    this.element = element;
    this.index = index;
    this.screen = screen;
    this.media = media;

    this.scroll = 0;

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
        scale: this.isMain ? 1 : 0,
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
        scale: this.isMain ? 0.7 : 0,
        translateX: -this.scroll + this.width,
        translateY: '-50%',
      });
    }
  }

  changeSizeFromMainToAll({ scroll, index }) {
    // if (!this.isMain) {
    //   gsap.set(this.element, {
    //     scale: 1,
    //     translateX: -scroll + this.width,
    //     translateY: '-50%',
    //     autoAlpha: 0,
    //   });
    // }

    this.width =
      (this.allGalleryItemSizes.width + this.allGalleryItemSizes.margin) *
        index -
      this.allGalleryItemSizes.width / 2;

    gsap.to(this.element, {
      scale: 0.7,
      translateX: -scroll + this.width,
      translateY: '-50%',
      onComplete: () => this.media.changeSize({ scroll }),
    });
  }

  changeSizeFromAllToMain({ scroll, index, lastMainIndex }) {
    this.width =
      (this.mainGalleryItemSizes.width + this.mainGalleryItemSizes.margin) *
        index -
      this.mainGalleryItemSizes.width / 2;

    gsap.to(this.element, {
      scale: 1,
      translateX: -scroll + this.width,
      translateY: '-50%',
      onComplete: () => this.media.changeSize({ scroll }),
    });

    // if (this.isMain) {
    //   gsap.to(this.element, {
    //     scale: 1,
    //     translateX:
    //       -scroll +
    //       this.screen.height * 0.75 * this.index -
    //       (this.screen.height * 0.42) / 2,
    //     translateY: '-50%',
    //   });
    // } else {
    //   gsap.to(this.element, {
    //     width: this.screen.height * 0.42,
    //     height: this.screen.height * 0.6,
    //     translateX:
    //       -scroll +
    //       this.screen.height * 0.75 * lastMainIndex -
    //       (this.screen.height * 0.42) / 2,
    //     translateY: '-50%',
    //     autoAlpha: 0,
    //   });
    // }
  }

  update({ scroll }) {
    this.scroll = scroll;

    gsap.set(this.element, {
      translateX: -scroll + this.width,
      translateY: '-50%',
    });
  }
}
