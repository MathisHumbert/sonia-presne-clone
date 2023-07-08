import { gsap } from 'gsap';

export default class MediaDom {
  constructor({ element, screen, media, index, template }) {
    this.element = element;
    this.screen = screen;
    this.media = media;
    this.index = index;
    this.template = template;

    this.mainIndex = Number(element.getAttribute('data-main-index'));
    this.isMain = element.getAttribute('data-main') === 'true';
    this.category = element.getAttribute('data-category');

    this.scroll = 0;

    const moduloIndex = this.index % 3;

    if (moduloIndex === 0) {
      this.aboutTranslateY = '25%';
    } else if (moduloIndex === 1) {
      this.aboutTranslateY = '-50%';
    } else {
      this.aboutTranslateY = '-125%';
    }
  }

  onResize({
    screen,
    mainMediaElementSizes,
    allMediaElementSizes,
    aboutMediaElementSizes,
    view,
    index,
  }) {
    this.screen = screen;
    this.mainMediaElementSizes = mainMediaElementSizes;
    this.allMediaElementSizes = allMediaElementSizes;
    this.aboutMediaElementSizes = aboutMediaElementSizes;

    if (this.template === 'about') {
      this.width =
        (this.aboutMediaElementSizes.width +
          this.aboutMediaElementSizes.margin) *
          index -
        this.aboutMediaElementSizes.width * 0.7;

      gsap.set(this.element, {
        width: screen.height * 0.42,
        height: screen.height * 0.6,
        scale: 0.7,
        translateX: -this.scroll + this.width,
        translateY: this.aboutTranslateY,
      });
    } else if (view === 'main') {
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
        this.allMediaElementSizes.width * 0.7;

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

  changeSizeFromHomeToAbout({ scroll, aboutMediaElementSizes }) {
    this.template = 'about';

    if (!this.aboutMediaElementSizes) {
      this.aboutMediaElementSizes = aboutMediaElementSizes;
    }

    if (this.isMain) {
      this.width =
        (this.aboutMediaElementSizes.width +
          this.aboutMediaElementSizes.margin) *
          this.mainIndex -
        this.aboutMediaElementSizes.width * 0.7;
    } else {
      this.width =
        (this.aboutMediaElementSizes.width +
          this.aboutMediaElementSizes.margin) *
          this.index -
        this.aboutMediaElementSizes.width * 0.7;
    }

    gsap.to(this.element, {
      translateX: -scroll + this.width,
      translateY: this.aboutTranslateY,
      autoAlpha: 1,
      duration: 1,
      scale: 0.7,
      autoAlpha: 0.4,
      ease: 'expo.inOut',
      onUpdate: () => {
        this.media.setSize({
          scroll,
          uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
        });
      },
    });
  }

  changeSizeFromAboutToHome({ scroll, endX }) {
    this.template = 'home';
    this.view = 'main';

    if (this.isMain) {
      this.width =
        (this.mainMediaElementSizes.width + this.mainMediaElementSizes.margin) *
          this.mainIndex -
        this.mainMediaElementSizes.width / 2;

      gsap.set(this.element, {
        scale: 1,
        translateX: -scroll + this.width,
        translateY: '-50%',
        autoAlpha: 1,
        onComplete: () => {
          this.media.changeSize({
            scroll,
            uAlpha: gsap.getProperty(this.element, 'autoAlpha'),
          });
        },
      });
    } else {
      gsap.set(this.element, {
        scale: 1,
        translateX: endX,
        translateY: '-50%',
        autoAlpha: 0,
        onComplete: () => {
          this.media.changeSize({
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
    });
  }
}
