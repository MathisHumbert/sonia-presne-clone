import * as THREE from 'three';
import { gsap } from 'gsap';

import vertex from 'shaders/transition-vertex.glsl';
import fragment from 'shaders/transition-fragment.glsl';

export default class Transition {
  constructor({ element, scene, sizes, geometry, destroyTransition }) {
    this.element = element;
    this.scene = scene;
    this.sizes = sizes;
    this.geometry = geometry;
    this.destroyTransition = destroyTransition;

    this.time = 0;

    this.createMaterial();
    this.createMesh();
  }

  createMaterial() {
    this.material = new THREE.RawShaderMaterial({
      fragmentShader: fragment,
      vertexShader: vertex,
      transparent: true,
      uniforms: {
        uTexture: { value: this.element.texture },
        uImageSizes: {
          value: new THREE.Vector2(
            this.element.imageElement.naturalWidth,
            this.element.imageElement.naturalHeight
          ),
        },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uAlpha: { value: 0 },
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.mesh.scale.x = this.element.mesh.scale.x;
    this.mesh.scale.y = this.element.mesh.scale.y;
    this.mesh.scale.z = this.element.mesh.scale.z;

    this.mesh.position.x = this.element.mesh.position.x;
    this.mesh.position.y = this.element.mesh.position.y;
    this.mesh.position.z = this.element.mesh.position.z + 0.02;

    this.material.uniforms.uPlaneSizes.value = new THREE.Vector2(
      this.mesh.scale.x,
      this.mesh.scale.y
    );

    this.scene.add(this.mesh);
  }

  animate(element, onComplete) {
    const tl = gsap.timeline({
      defaults: { duration: 1, ease: 'expo.inOut' },
    });

    tl.set(this.mesh.position, {
      z: element.position.z,
    })
      .to(
        this.mesh.position,
        {
          x: element.position.x,
          y: element.position.y,
        },
        0
      )
      .to(
        this.mesh.scale,
        {
          x: element.scale.x,
          y: element.scale.y,
          z: element.scale.z,
        },
        0
      )
      .to(
        this.material.uniforms.uPlaneSizes.value,
        {
          x: element.scale.x,
          y: element.scale.y,
        },
        0
      )
      .call(() => onComplete())
      .call(
        () => {
          this.mesh.removeFromParent();
          this.destroyTransition();
        },
        null,
        '+=0.5'
      );
  }
}
