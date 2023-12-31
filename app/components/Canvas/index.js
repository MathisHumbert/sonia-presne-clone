import * as THREE from 'three';
import { gsap } from 'gsap';

import Gallery from './Gallery';
import Project from './Project';
import About from './About';
import Transition from './Transition';
export default class Canvas {
  constructor({ template, page, cursor }) {
    this.template = template;
    this.page = page;
    this.cursor = cursor;

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
  createGallery(template, page) {
    this.gallery = new Gallery({
      scene: this.scene,
      viewport: this.viewport,
      screen: this.screen,
      geometry: this.geometry,
      cursor: this.cursor,
      template,
      page,
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
      transition: this.transition,
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
    this.onChangeEnd(this.template, this.page);
  }

  onLoaded(template, page) {
    this.onChangeEnd(template, page);
  }

  onChangeStart(template, url) {
    if (this.about) {
      this.about.hide();
    }

    if (this.project) {
      this.project.hide();
    }

    if (
      (template === 'home' || template === 'project') &&
      url.includes('project')
    ) {
      if (this.gallery.transitionElement === null) {
        const projectName = url.split('projects/')[1];

        this.gallery.transitionElement = this.gallery.medias.find(
          (media) => media.name === projectName
        );
      }

      this.transition = new Transition({
        element: this.gallery.transitionElement,
        scene: this.scene,
        sizes: this.sizes,
        geometry: this.geometry,
        destroyTransition: () => {
          this.transition = null;
          this.gallery.transitionElement = null;
        },
      });
    }
  }

  onChangeEnd(template, page) {
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
      this.createGallery(template, page);
    } else {
      this.gallery.page = page;

      if (
        (this.template === 'home' || this.template === 'project') &&
        template === 'about'
      ) {
        this.gallery.onPageToAbout();
      } else if (this.template === 'about' && template === 'home') {
        this.gallery.onAboutToHome();
      } else if (this.template === 'project' && template === 'home') {
        this.gallery.onProjectToHome();
      } else if (
        (this.template === 'home' ||
          this.template === 'project' ||
          this.template === 'about') &&
        template === 'project'
      ) {
        this.gallery.isAnimating = true;
        this.gallery.isScrollable = false;

        gsap.delayedCall(1, () => {
          this.gallery.onPageToProject();
        });
      }
    }

    this.template = template;
    this.page = page;
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
  update({ scroll, pageScrollable }) {
    if (this.gallery && this.gallery.update) {
      this.gallery.update({ scroll, pageScrollable });
    }

    if (this.project && this.project.update) {
      this.project.update({ scroll });
    }

    this.renderer.render(this.scene, this.camera);
  }
}
