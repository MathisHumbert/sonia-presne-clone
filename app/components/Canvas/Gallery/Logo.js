import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/logo-vertex.glsl';
import fragment from 'shaders/logo-fragment.glsl';

export default class Logo {
  constructor({ element, scene, viewport, screen, geometry }) {
    this.element = element;
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.createTexture();
    this.createMaterial();
    this.createMesh();
  }

  /**
   * Create.
   */
  createTexture() {
    const src = this.element.getAttribute('data-src');

    this.alphaMap = window.TEXTURES[src];
    this.texture = window.TEXTURES[src];
  }

  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      alphaMap: this.texture,
      uniforms: {
        uTexture: { value: this.texture },
      },
    });

    // this.material = new THREE.MeshBasicMaterial({
    //   color: 'white',
    //   alphaMap: this.texture,
    //   depthWrite: false,
    //   transparent: true,
    //   alphaTest: 0,
    // });
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
    // gsap.fromTo(this.material.uniforms.uAlpha, { value: 0 }, { value: 1 });
  }

  hide() {
    // gsap.to(this.material.uniforms.uAlpha, {
    //   value: 0,
    // });
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
  update({ scroll }) {}
}
