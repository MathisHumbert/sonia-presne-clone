import Page from 'classes/Page';

export default class Project extends Page {
  constructor() {
    super({
      id: 'project',
      element: '.project',
      elements: {
        wrapper: '.project__wrapper',
      },
    });
  }

  show() {
    super.show();
  }

  hide() {
    super.hide();
  }
}
