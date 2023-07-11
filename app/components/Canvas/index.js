import * as THREE from 'three';

import Gallery from './Gallery';
import Project from './Project';
import About from './About';
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
   * Gallery.
   */
  createGallery(template) {
    this.gallery = new Gallery({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
      template,
    });
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
   * Project.
   */
  createProject() {
    this.project = new Project({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
    });
  }

  destroyProject() {
    if (!this.project) return;

    this.project.destroy();
    this.project = null;
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
    if (this.about) {
      this.about.hide();
    }

    if (this.project) {
      this.project.hide();
    }
  }

  onChangeEnd(template) {
    if (this.about) {
      this.destroyAbout();
    }

    if (this.project) {
      this.destroyProject();
    }

    if (template === 'about') {
      this.createAbout();
    }

    if (template === 'project') {
      this.createProject();
    }

    if (!this.gallery) {
      this.createGallery(template);
    } else {
      if (this.template === 'home' && template === 'about') {
        this.gallery.onHomeToAbout();
      } else if (this.template === 'about' && template === 'home') {
        this.gallery.onAboutToHome();
      }
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

    if (this.gallery && this.gallery.onResize) {
      this.gallery.onResize({ viewport: this.viewport, screen: this.screen });
    }

    if (this.project && this.project.onResize) {
      this.project.onResize({ viewport: this.viewport, screen: this.screen });
    }

    if (this.about && this.about.onResize) {
      this.about.onResize({ viewport: this.viewport, screen: this.screen });
    }
  }

  onTouchDown(event) {
    if (this.gallery && this.gallery.onTouchDown) {
      this.gallery.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.gallery && this.gallery.onTouchMove) {
      this.gallery.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.gallery && this.gallery.onTouchUp) {
      this.gallery.onTouchUp(event);
    }
  }

  onWheel({ pixelY }) {
    if (this.gallery && this.gallery.onWheel) {
      this.gallery.onWheel({ pixelY });
    }
  }

  /**
   * Loop.
   */
  update({ scroll, velocity }) {
    if (this.gallery && this.gallery.update) {
      this.gallery.update({ scroll, velocity });
    }

    if (this.project && this.project.update) {
      this.project.update({ scroll, velocity });
    }

    this.renderer.render(this.scene, this.camera);
  }
}
