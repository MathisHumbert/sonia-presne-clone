import each from 'lodash/each';
import normalizeWheel from 'normalize-wheel';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';

import Home from 'pages/Home';
import About from 'pages/About';
import Project from 'pages/Project';

import Canvas from 'components/Canvas';
import Preloader from 'components/Preloader';
import Navigation from 'components/Navigation';
import Cursor from 'components/Cursor';

gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.createContent();

    this.createPages();
    this.createCursor();
    this.createCanvas();
    this.createNavigation();
    this.createPreloader();

    this.addEventsListeners();
    this.addLinkListeners();

    this.update();
  }

  /**
   * Create.
   */
  createContent() {
    this.content = document.querySelector('.content');
    this.template = this.content.getAttribute('data-template');
  }

  createPages() {
    this.pages = {
      home: new Home(),
      about: new About(),
      project: new Project(),
    };

    this.page = this.pages[this.template];

    this.createScrollTrigger();

    this.page.create(true);
  }

  createCanvas() {
    this.canvas = new Canvas({ template: this.template, page: this.page });
  }

  createNavigation() {
    this.navigation = new Navigation();
  }

  createPreloader() {
    this.preloader = new Preloader();

    this.preloader.preload(this.content, this.onPreloaded.bind(this));
  }

  createLoader() {
    this.preloader.load(this.content, this.onLoaded.bind(this));
  }

  createScrollTrigger() {
    ScrollTrigger.scrollerProxy('#wrapper', {
      scrollTop: (value) => {
        if (arguments.length) {
          this.page.scroll.current = value;
        }
        return this.page.scroll.current;
      },

      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    ScrollTrigger.defaults({ scroller: '#wrapper' });
  }

  createCursor() {
    this.cursor = new Cursor();
  }

  /**
   * Events.
   */
  onPreloaded() {
    this.onResize();

    this.navigation.show();
    this.page.show();
    this.canvas.onPreloaded();
  }

  onLoaded() {
    this.onResize();

    this.page.show();
    this.canvas.onLoaded(this.template, this.page);
  }

  onPopState() {
    this.onChange({
      url: window.location.pathname,
      push: false,
    });
  }

  async onChange({ url, push }) {
    ScrollTrigger.getAll().forEach((t) => t.kill());

    this.canvas.onChangeStart(this.template, url);

    await this.page.hide();

    const request = await window.fetch(url);

    if (request.status === 200) {
      const html = await request.text();
      const div = document.createElement('div');

      div.innerHTML = html;

      if (push) {
        window.history.pushState({}, '', url);
      }

      this.navigation.onChange();

      const divContent = div.querySelector('.content');
      this.template = divContent.getAttribute('data-template');

      this.content.innerHTML = divContent.innerHTML;
      this.content.setAttribute('data-template', this.template);

      this.createScrollTrigger();

      this.page = this.pages[this.template];

      this.page.create();

      if (this.canvas.gallery) {
        this.canvas.gallery.isAnimating = true;
      }

      this.createLoader();

      this.addLinkListeners();
    } else {
      console.log('error');
    }
  }

  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize();
    }

    if (this.canvas && this.canvas.onResize) {
      this.canvas.onResize();
    }

    if (this.navigation && this.navigation.onResize) {
      this.navigation.onResize();
    }
  }

  onTouchDown(event) {
    if (this.page && this.page.onTouchDown) {
      this.page.onTouchDown(event);
    }

    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.page && this.page.onTouchMove) {
      this.page.onTouchMove(event);
    }

    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.page && this.page.onTouchUp) {
      this.page.onTouchUp(event);
    }

    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }
  }

  onWheel(event) {
    const { pixelY } = normalizeWheel(event);

    if (this.page && this.page.onWheel) {
      this.page.onWheel({ pixelY });
    }

    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel({ pixelY });
    }
  }

  /**
   * Loop.
   */
  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }

    if (this.canvas && this.canvas.update) {
      this.canvas.update({
        scroll: this.page.scroll.current,
        pageScrollable: this.page.isScrollable,
      });
    }

    if (this.cursor && this.cursor.update) {
      this.cursor.update();
    }

    window.requestAnimationFrame(this.update.bind(this));
  }

  /**
   * Listeners.
   */
  addEventsListeners() {
    window.addEventListener('resize', this.onResize.bind(this));

    window.addEventListener('popstate', this.onPopState.bind(this));

    window.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));

    window.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));

    window.addEventListener('wheel', this.onWheel.bind(this));
  }

  addLinkListeners() {
    const links = document.querySelectorAll('a');

    each(links, (link) => {
      const isLocal = link.href.indexOf(window.location.origin) > -1;

      const isNotEmail = link.href.indexOf('mailto') === -1;
      const isNotPhone = link.href.indexOf('tel') === -1;

      if (isLocal) {
        link.onclick = (event) => {
          event.preventDefault();

          this.onChange({
            url: link.href,
            push: true,
          });
        };
      } else if (isNotEmail && isNotPhone) {
        link.rel = 'noopener';
        link.target = '_blank';
      }
    });
  }
}

new App();
