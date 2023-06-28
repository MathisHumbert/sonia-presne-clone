import * as THREE from 'three';

import Home from './Home/index';
import About from './About/index';

export default class Canvas {
  constructor({ template }) {
    this.template = template;

    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createGeometry();

    this.onResize();
  }

  /**
   * THREE.
   */
  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.1,
      100
    );
    this.camera.position.z = 5;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(1);

    document.body.appendChild(this.renderer.domElement);
  }

  createGeometry() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
  }

  /**
   * Home.
   */
  createHome() {
    this.home = new Home({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
    });
  }

  destroyHome() {
    if (!this.home) return;

    this.home.destroy();
    this.home = null;
  }

  /**
   * About.
   */
  createAbout() {
    this.about = new About({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
    });
  }

  destroyAbout() {
    if (!this.about) return;

    this.about.destroy();
    this.about = null;
  }

  /**
   * Events.
   */
  onPreloaded() {
    this.onChangeEnd(this.template);
  }

  onLoaded(template) {
    this.onChangeEnd(template);
  }

  onChangeStart(template, url) {
    if (this.home) {
      this.home.hide();
    }

    if (this.about) {
      this.about.hide();
    }
  }

  onChangeEnd(template) {
    if (this.home) {
      this.destroyHome();
    }

    if (this.about) {
      this.destroyAbout();
    }

    if (template === 'home') {
      this.createHome();
    }

    if (template === 'about') {
      this.createAbout();
    }

    this.template = template;

    this.onResize();
  }

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = { width, height };

    if (this.home && this.home.onResize) {
      this.home.onResize({ viewport: this.viewport, screen: this.screen });
    }

    if (this.about && this.about.onResize) {
      this.about.onResize({ viewport: this.viewport, screen: this.screen });
    }
  }

  onTouchDown(event) {
    if (this.home && this.home.onTouchDown) {
      this.home.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.home && this.home.onTouchMove) {
      this.home.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.home && this.home.onTouchUp) {
      this.home.onTouchUp(event);
    }
  }

  onWheel(event) {
    if (this.home && this.home.onWheel) {
      this.home.onWheel(event);
    }
  }

  /**
   * Loop.
   */
  update({ scroll, velocity }) {
    if (this.home && this.home.update) {
      this.home.update({ scroll, velocity });
    }

    if (this.about && this.about.update) {
      this.about.update({ scroll, velocity });
    }

    this.renderer.render(this.scene, this.camera);
  }
}
