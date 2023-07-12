import imagesLoaded from 'imagesloaded';
import * as THREE from 'three';
import map from 'lodash/map';
import { gsap } from 'gsap';
export default class Preloader {
  constructor() {
    this.loadedTextureUrl = [];
    window.TEXTURES = {};

    this.textureLoader = new THREE.TextureLoader();

    this.logoOne = document.querySelector('.logo__one');
  }

  preload(content, onLoaded) {
    const contentImages = content.querySelectorAll('img');
    const galleryImages = document.querySelectorAll('.gallery__media__img');

    const images = [...contentImages, ...galleryImages];

    this.loadedTextureUrl.push(window.location.pathname);

    const loadImages = new Promise((resolve) => {
      imagesLoaded(document.body, resolve);
    });

    const loadTextures = Promise.all(
      map(images, (image) => {
        return new Promise((res) => {
          const src =
            image.getAttribute('src') || image.getAttribute('data-src');
          this.textureLoader.load(src, (texture) => {
            window.TEXTURES[src] = texture;

            res();
          });
        });
      })
    );

    Promise.all([loadImages, loadTextures]).then(() => {
      this.logoOne.classList.add('active');
      gsap.fromTo('.logo__one', { scale: 1.5 }, { scale: 1, duration: 1 });
      gsap.delayedCall(1, () => {
        onLoaded();
      });
    });
  }

  load(content, onLoaded) {
    const images = content.querySelectorAll('img');

    if (!this.loadedTextureUrl.includes(window.location.pathname)) {
      this.loadedTextureUrl.push(window.location.pathname);

      const loadTextures = Promise.all(
        map(images, (image) => {
          return new Promise((res) => {
            const src = image.getAttribute('src');
            this.textureLoader.load(src, (texture) => {
              window.TEXTURES[src] = texture;

              res();
            });
          });
        })
      );

      const loadImages = new Promise((resolve) => {
        imagesLoaded(content, resolve);
      });

      Promise.all([loadImages, loadTextures]).then(() => {
        onLoaded();
      });
    } else {
      const imgLoaded = imagesLoaded(content);

      imgLoaded.on('done', () => {
        onLoaded();
      });
    }
  }
}
