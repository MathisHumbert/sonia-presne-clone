import Page from 'classes/Page';

export default class About extends Page {
  constructor() {
    super({
      id: 'about',
      element: '.about',
      elements: {
        wrapper: '.about__wrapper',
      },
    });
  }

  show() {
    // custom animation

    super.show();
  }
}
