import ListView from '../../lib/core/ListView.js';
import SlideView from './SlideView.js';
import prefix from 'prefix';

export default class SlideListView extends ListView {
    constructor() {
        super(...arguments);

        this.itemViewClass = SlideView;
    }

    update({ currentIndex, slides }) {
        super(slides);

        this.element.style[prefix('transform')] = `translateX(${currentIndex * -5}%)`;
    }
}
