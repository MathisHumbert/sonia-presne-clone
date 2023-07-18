import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/plane-vertex.glsl';
import fragment from 'shaders/plane-fragment.glsl';

export default class Media {
  constructor({ element, scene, viewport, screen, geometry }) {
    this.element = element;
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.isAnimated = false;
    this.scroll = 0;

    this.createTexture();
    this.createMaterial();
    this.createMesh();
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
        uWind: { value: 10 },
        uTime: { value: 0 },
        uHover: { value: 1 },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  createBounds() {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top + this.scroll,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    this.updateScale();
    this.updateX();
    this.updateY();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isAnimated) {
          this.animateIn();
        }
      });
    });

    this.observer.observe(this.element);
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
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
  }

  /**
   * Animations.
   */
  show() {
    gsap.fromTo(
      this.material.uniforms.uAlpha,
      {
        value: 0,
      },
      { value: 1 }
    );
    this.createObserver();
  }

  hide() {
    gsap.to(this.material.uniforms.uAlpha, {
      value: 0,
    });
  }

  animateIn() {
    this.isAnimated = true;

    gsap.to(this.material.uniforms.uWind, { value: 2 });
    gsap.to(this.material.uniforms.uWind, { value: 0, delay: 0.5 });
  }

  /**
   * Events.
   */
  onResize({ viewport, screen }) {
    this.viewport = viewport;
    this.screen = screen;

    this.createBounds();
  }

  /**
   * Loop.
   */
  update({ scroll }) {
    this.scroll = scroll;
    this.updateY(scroll);
  }
}
