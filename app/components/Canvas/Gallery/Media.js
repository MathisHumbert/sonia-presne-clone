import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/gallery-vertex.glsl';
import fragment from 'shaders/gallery-fragment.glsl';

export default class Media {
  constructor({ element, index, scene, viewport, screen, geometry, template }) {
    this.element = element;
    this.index = index;
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;
    this.template = template;

    this.titleElement = element.querySelector('.gallery__title');
    this.categoryElement = element.querySelector('.gallery__category');
    this.mediaWrapperElement = element.querySelector(
      '.gallery__media__wrapper'
    );

    this.scroll = 0;
    this.extra = 0;
    this.speed = Number(element.getAttribute('data-speed'));

    this.createTexture();
    this.createMaterial();
    this.createMesh();

    this.addEventListeners();
  }

  /**
   * Create.
   */
  createTexture() {
    this.imageElement = this.element.querySelector('img');

    const src = this.imageElement.getAttribute('src');

    this.texture = window.TEXTURES[src];
  }

  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      // wireframe: true,
      uniforms: {
        uTexture: { value: this.texture },
        uImageSizes: {
          value: new THREE.Vector2(
            this.imageElement.naturalWidth,
            this.imageElement.naturalHeight
          ),
        },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uAlpha: { value: 0 },
        uTime: { value: 0 },
        uWind: { value: 2 },
        uHover: { value: 1 },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.position.z += this.mesh.position.z + 0.01;

    this.scene.add(this.mesh);
  }

  createBounds() {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top,
      left: rect.left + this.scroll,
      width: rect.width,
      height: rect.height,
    };

    this.updateScale();
    this.updateX();
    this.updateY();
  }

  /**
   * Update.
   */
  updateScale() {
    this.mesh.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.mesh.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;

    this.material.uniforms.uPlaneSizes.value = new THREE.Vector2(
      this.mesh.scale.x,
      this.mesh.scale.y
    );
  }

  updateX(x = 0) {
    this.mesh.position.x =
      -(this.viewport.width / 2) +
      this.mesh.scale.x / 2 +
      ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
  }

  updateY(y = 0) {
    this.mesh.position.y =
      this.viewport.height / 2 -
      this.mesh.scale.y / 2 -
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height +
      this.extra;
  }

  /**
   * Animations.
   */
  show() {
    gsap.fromTo(
      this.material.uniforms.uAlpha,
      { value: 0 },
      { value: this.template === 'about' ? 0.4 : 1 }
    );
  }

  hide() {
    gsap.to(this.material.uniforms.uAlpha, {
      value: 0,
    });
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    this.viewport = viewport;
    this.screen = screen;

    this.extra = 0;

    this.createBounds();
  }

  onMouseEnter() {
    gsap.to(this.material.uniforms.uHover, {
      value: 2,
      ease: 'linear',
    });
  }

  onMouseLeave() {
    gsap.to(this.material.uniforms.uHover, {
      value: 1,
      ease: 'linear',
    });
  }

  setSize({ scroll, uAlpha }) {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top,
      left: rect.left + scroll,
      width: rect.width,
      height: rect.height,
    };

    const scaleX =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    const scaleY =
      (this.viewport.height * this.bounds.height) / this.screen.height;

    gsap.set([this.mesh.scale, this.material.uniforms.uPlaneSizes.value], {
      x: scaleX,
      y: scaleY,
    });

    gsap.set(this.mesh.position, {
      x:
        -(this.viewport.width / 2) +
        scaleX / 2 +
        ((this.bounds.left - scroll) / this.screen.width) * this.viewport.width,
      y:
        this.viewport.height / 2 -
        scaleY / 2 -
        ((this.bounds.top - 0) / this.screen.height) * this.viewport.height,
    });

    gsap.set(this.material.uniforms.uAlpha, { value: uAlpha });
  }

  changeSize({ scroll, uAlpha }) {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top,
      left: rect.left + scroll,
      width: rect.width,
      height: rect.height,
    };

    const tl = gsap.timeline({
      defaults: {
        duration: 1,
        ease: 'expo.inOut',
      },
    });

    const scaleX =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    const scaleY =
      (this.viewport.height * this.bounds.height) / this.screen.height;

    tl.to(
      [this.mesh.scale, this.material.uniforms.uPlaneSizes.value],
      {
        x: scaleX,
        y: scaleY,
      },
      0
    )
      .to(
        this.mesh.position,
        {
          x:
            -(this.viewport.width / 2) +
            scaleX / 2 +
            ((this.bounds.left - scroll) / this.screen.width) *
              this.viewport.width,
          y:
            this.viewport.height / 2 -
            scaleY / 2 -
            ((this.bounds.top - 0) / this.screen.height) * this.viewport.height,
        },
        0
      )
      .to(this.material.uniforms.uAlpha, { value: uAlpha }, 0);
  }

  /**
   * Listeners.
   */
  addEventListeners() {
    this.categoryElement.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );
    this.titleElement.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );
    this.mediaWrapperElement.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );

    this.categoryElement.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );
    this.titleElement.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );
    this.mediaWrapperElement.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );
  }

  /**
   * Loop.
   */
  update({ scroll, infinite, velocity, direction, time }) {
    this.scroll = scroll;

    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uWind.value = 2 + velocity;

    this.updateX(scroll);

    if (this.template === 'about') {
      this.updateY(infinite * this.speed);

      const scaleY = this.mesh.scale.y / 2;
      const sizesY = this.viewport.height / 2;

      if (direction === 'down') {
        if (this.mesh.position.y + scaleY < -sizesY) {
          this.extra += this.viewport.height + this.mesh.scale.y;
        }
      } else if (direction === 'up') {
        if (this.mesh.position.y - scaleY > sizesY) {
          this.extra -= this.viewport.height + this.mesh.scale.y;
        }
      }
    }
  }
}
