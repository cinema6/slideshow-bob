import TemplateView from '../../lib/core/TemplateView.js';

const CURRENT_CLASS = 'navThumbs__item--current';

export default class ThumbView extends TemplateView {
    constructor() {
        super(...arguments);

        this.tag = 'li';
        this.classes.push('navThumbs__item');
        this.template = require('./ThumbView.html');
        this.attributes = {
            'data-target': 'controller',
            'data-action': 'move'
        };
    }

    update(data) {
        const result = super(data);

        if (data.active) {
            this.addClass(CURRENT_CLASS);
        } else {
            this.removeClass(CURRENT_CLASS);
        }

        return result;
    }

    click() {
        this.sendAction(this);
    }
}
