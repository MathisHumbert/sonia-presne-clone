import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/background-vertex.glsl';
import fragment from 'shaders/background-fragment.glsl';

export default class Background {
  constructor({ scene, viewport, screen, geometry }) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;
    this.geometry = geometry;

    this.time = 0;

    this.createMaterial();
    this.createMesh();
  }

  /**
   * Create.
   */

  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uAlpha: { value: 0 },
        uTime: { value: 0 },
        uColorMix: { value: 1 },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.mesh);
  }

  createBounds() {
    this.updateScale();
  }

  /**
   * Update.
   */
  updateScale() {
    this.mesh.scale.x = this.viewport.width;
    this.mesh.scale.y = this.viewport.height;
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
}
