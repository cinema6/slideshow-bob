import TemplateView from '../../lib/core/TemplateView.js';

export default class SlideView extends TemplateView {
    constructor() {
        super(...arguments);

        this.tag = 'li';
        this.classes.push('gallery__item');
        this.template = require('./SlideView.html');
    }
}
