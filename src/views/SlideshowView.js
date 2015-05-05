import TemplateView from '../../lib/core/TemplateView.js';
import SlideListView from './SlideListView.js';
import ThumbListView from './ThumbListView.js';
import Runner from '../../lib/Runner.js';

export default class SlideshowView extends TemplateView {
    constructor() {
        super(...arguments);

        this.tag = 'main';
        this.classes.push('slideshow__group');
        this.template = require('./SlideshowView.html');
        this.instantiates = {SlideListView, ThumbListView};
    }

    didInsertElement() {
        super();

        this.element.addEventListener('mouseenter', () => {
            Runner.run(() => this.emit('focus'), false);
        });
        this.element.addEventListener('mouseleave', () => {
            Runner.run(() => this.emit('blur'), false);
        });
    }
}
