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
    this.isMain = isMain;

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
      ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
  }

  /**
   * Animations.
   */
  show() {
    // if (this.isMain) {
    gsap.fromTo(this.material.uniforms.uAlpha, { value: 0 }, { value: 1 });
    // }
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

  changeSize({ scroll, uAlpha }) {
    const rect = this.element.getBoundingClientRect();

    this.bounds = {
      top: rect.top,
      left: rect.left + scroll,
      width: rect.width,
      height: rect.height,
    };

    const tl = gsap.timeline({
      duration: 1,
      ease: 'linear',
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

  /**
   * Loop.
   */
  update({ scroll, velocity }) {
    this.scroll = scroll;

    this.updateX(scroll);
  }
}
