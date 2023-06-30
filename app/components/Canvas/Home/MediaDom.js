import { gsap } from 'gsap';

export default class MediaDom {
  constructor({ element, screen, media }) {
    this.element = element;
    this.screen = screen;
    this.media = media;

    this.scroll = 0;
    this.mainIndex = Number(element.getAttribute('data-main-index'));
    this.isMain = element.getAttribute('data-main') === 'true';
  }

  onResize({
    screen,
    mainMediaElementSizes,
    allMediaElementSizes,
    view,
    index,
  }) {
    this.screen = screen;
    this.mainMediaElementSizes = mainMediaElementSizes;
    this.allMediaElementSizes = allMediaElementSizes;

    if (view === 'main') {
      this.width =
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin) *
          index -
        this.mainMediaElementSizes.width / 2;

      gsap.set(this.element, {
        width: screen.height * 0.42,
        height: screen.height * 0.6,
        scale: 1,
        translateX: -this.scroll + this.width,
        translateY: '-50%',
      });
    } else {
      this.width =
        (this.allMediaElementSizes.width + this.allMediaElementSizes.margin) *
          index -
        this.allMediaElementSizes.width / 2;

      gsap.set(this.element, {
        width: screen.height * 0.42,
        height: screen.height * 0.6,
        scale: 0.7,
        translateX: -this.scroll + this.width,
        translateY: '-50%',
      });
    }
  }

  changeSizeFromMainToAll({ scroll, startX, allMediaElementSizes, index }) {
    if (!this.isMain) {
      this.allMediaElementSizes = allMediaElementSizes;

      gsap.set(this.element, {
        width: this.screen.height * 0.42,
        height: this.screen.height * 0.6,
        scale: 1,
        translateX: startX,
        translateY: '-50%',
        autoAlpha: 0,
        onComplete: () => this.media.setSize({ scroll, uAlpha: 0 }),
      });
    }

    this.width =
      (this.allMediaElementSizes.width + this.allMediaElementSizes.margin) *
        index -
      this.allMediaElementSizes.width / 2;

    gsap.set(this.element, {
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
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin) *
          this.mainIndex -
        this.mainMediaElementSizes.width / 2;

      gsap.set(this.element, {
        scale: 1,
        translateX: -scroll + this.width,
        translateY: '-50%',
        onComplete: () => this.media.changeSize({ scroll, uAlpha: 1 }),
      });
    } else {
      gsap.set(this.element, {
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
