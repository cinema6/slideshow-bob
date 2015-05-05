import ListView from '../../lib/core/ListView.js';
import ThumbView from './ThumbView.js';

export default class ThumbListView extends ListView {
    constructor() {
        super(...arguments);

        this.itemViewClass = ThumbView;
    }
}
