import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/vertex.glsl';
import fragment from 'shaders/fragment.glsl';

export default class Media {
  constructor({ element, index, scene, viewport, screen, geometry, isMain }) {
    this.element = element;
    this.index = index;
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.imageElement = element.querySelector('img');

    this.isAnimating = false;

    this.createTexture();
    this.createMaterial();
    this.createMesh();
  }

  /**
   * Create.
   */
  createTexture() {
    const textureLoader = new THREE.TextureLoader();

    textureLoader.load(this.imageElement.getAttribute('src'), (texture) => {
      this.material.uniforms.uTexture.value = texture;
    });
  }

  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      // wireframe: true,
      uniforms: {
        uTexture: { value: null },
        uImageSizes: {
          value: new THREE.Vector2(
            this.imageElement.naturalWidth,
            this.imageElement.naturalHeight
          ),
        },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uAlpha: { value: 0 },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  createBounds() {
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    this.material.uniforms.uPlaneSizes.value = new THREE.Vector2(
      this.mesh.scale.x,
      this.mesh.scale.y
    );
  }

  /**
   * Update.
   */
  updateScale() {
    this.mesh.scale.x =
      (this.viewport.width * this.bounds.width) / this.screen.width;
    this.mesh.scale.y =
      (this.viewport.height * this.bounds.height) / this.screen.height;
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
    gsap.fromTo(this.material.uniforms.uAlpha, { value: 0 }, { value: 1 });
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

    this.createBounds();
  }

  onPlaceChange({ viewport, screen, onComplete }) {
    this.viewport = viewport;
    this.screen = screen;

    this.isAnimating = true;

    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top,
      left: rect.left + this.scroll,
      width: rect.width,
      height: rect.height,
    };

    gsap.set(this.mesh.scale, {
      x: (this.viewport.width * this.bounds.width) / this.screen.width,
      y: (this.viewport.height * this.bounds.height) / this.screen.height,
    });

    gsap.to(this.mesh.position, {
      x:
        -(this.viewport.width / 2) +
        this.mesh.scale.x / 2 +
        ((this.bounds.left - 0) / this.screen.width) * this.viewport.width,
      y:
        this.viewport.height / 2 -
        this.mesh.scale.y / 2 -
        ((this.bounds.top - 0) / this.screen.height) * this.viewport.height,
      duration: 1,
      delay: 0.5,
      onComplete: () => {
        // pass it higher i think
        this.isAnimating = false;
        onComplete();
      },
    });
  }

  /**
   * Loop.
   */
  update({ scroll, velocity }) {
    if (this.isAnimating) return;

    this.scroll = scroll;
    this.updateX(scroll);
  }
}
