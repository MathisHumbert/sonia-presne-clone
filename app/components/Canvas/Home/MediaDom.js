import { gsap } from 'gsap';

export default class MediaDom {
  constructor({ element, screen, media, index }) {
    this.element = element;
    this.screen = screen;
    this.media = media;
    this.index = index;

    this.scroll = 0;
    this.mainIndex = Number(element.getAttribute('data-main-index'));
    this.isMain = element.getAttribute('data-main') === 'true';
    this.category = element.getAttribute('data-category');
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
      this.allMediaElementSizes.width * 0.7;

    console.log(this.allMediaElementSizes.total);

    gsap.to(this.element, {
      scale: 0.7,
      translateX: -scroll + this.width,
      translateY: '-50%',
      autoAlpha: 1,
      duration: 1,
      ease: 'expo.inOut',
      onUpdate: () => {
        this.media.setSize({
          scroll,
          uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
        });
      },
    });
  }

  changeSizeFromAllToMain({ scroll, endX }) {
    if (this.isMain) {
      this.width =
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin) *
          this.mainIndex -
        this.mainMediaElementSizes.width / 2;

      gsap.to(this.element, {
        scale: 1,
        translateX: -scroll + this.width,
        translateY: '-50%',
        autoAlpha: 1,
        duration: 1,
        ease: 'expo.inOut',
        onUpdate: () => {
          this.media.setSize({
            scroll,
            uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
          });
        },
      });
    } else {
      gsap.to(this.element, {
        scale: 1,
        translateX: endX,
        translateY: '-50%',
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.inOut',
        onUpdate: () => {
          this.media.setSize({
            scroll,
            uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
          });
        },
      });
    }
  }

  changeSizeFromAllToFilter({ scroll, category, index, endX }) {
    if (this.category === category) {
      this.width =
        (this.allMediaElementSizes.width + this.allMediaElementSizes.margin) *
          index -
        this.allMediaElementSizes.width / 2;

      gsap.to(this.element, {
        translateX: -scroll + this.width,
        autoAlpha: 1,
        duration: 1,
        ease: 'expo.inOut',
        onUpdate: () => {
          this.media.setSize({
            scroll,
            uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
          });
        },
      });
    } else {
      gsap.to(this.element, {
        translateX: endX,
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.inOut',
        onUpdate: () => {
          this.media.setSize({
            scroll,
            uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
          });
        },
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
