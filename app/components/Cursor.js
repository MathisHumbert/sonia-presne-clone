import { gsap } from 'gsap';

import detection from 'classes/Detection';

export default class Cursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    this.cursor.style.opacity = 0;

    this.bounds = this.cursor.getBoundingClientRect();
    this.mouse = { x: 0, y: 0, currentX: 0, currentY: 0 };

    this.isDesktop = detection.checkIsDesktop();

    if (!this.isDesktop) {
      this.cursor.classList.add('hide');
    }

    this.addEvents();
  }

  addEvents() {
    this.initMouseMove();
    this.onMouseMove();
    this.onMouseDown();
    this.onMouseUp();
  }

  initMouseMove() {
    this.onMouseMoveEv = () => {
      this.mouse.currentX = this.mouse.x - this.bounds.width / 2;
      this.mouse.currentY = this.mouse.y - this.bounds.height / 2;

      gsap.to(this.cursor, { opacity: 1, duration: 1 });

      window.removeEventListener('mousemove', this.onMouseMoveEv);
    };

    window.addEventListener('mousemove', this.onMouseMoveEv);
  }

  onMouseMove() {
    window.addEventListener('mousemove', (e) => {
      if (!this.isDesktop) return;

      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  onMouseDown() {
    window.addEventListener('mousedown', this.onEnter.bind(this));
  }

  onMouseUp() {
    window.addEventListener('mouseup', this.onLeave.bind(this));
  }

  onEnter() {
    this.cursor.classList.add('down');
  }

  onLeave() {
    this.cursor.classList.remove('down');
  }

  onResize() {
    if (this.isDesktop) {
      this.cursor.classList.remove('hide');
    } else {
      this.cursor.classList.add('hide');
    }
  }

  update() {
    if (!this.isDesktop) return;

    this.mouse.currentX = this.mouse.x - this.bounds.width / 2;
    this.mouse.currentY = this.mouse.y - this.bounds.height / 2;

    this.cursor.style.transform = `translate(${this.mouse.currentX}px, ${this.mouse.currentY}px)`;
  }
}
