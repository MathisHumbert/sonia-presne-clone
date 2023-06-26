class Detection {
  constructor() {
    this.isDesktop = document.body.classList.contains('desktop');
  }

  checkIsDesktop() {
    return this.isDesktop;
  }
}

const detection = new Detection();

export default detection;
