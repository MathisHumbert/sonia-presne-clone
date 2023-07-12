import Page from 'classes/Page';

export default class Project extends Page {
  constructor() {
    super({
      id: 'project',
      element: '.project',
      elements: {
        wrapper: '.project__wrapper',
        logoOne: '.logo__one',
        logoThree: '.logo__three',
      },
    });
  }

  show() {
    this.elements.logoThree.classList.add('active');
    this.elements.logoOne.classList.remove('active');

    super.show();
  }

  hide() {
    super.hide();
  }
}
