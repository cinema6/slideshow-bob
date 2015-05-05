import Controller from './Controller.js';
import {EventEmitter} from 'events';

class ViewController extends Controller {
    constructor() {
        super(...arguments);

        this.view = null;
    }

    renderInto(view) {
        this.view.appendTo(view);
    }
}
ViewController.mixin(EventEmitter);

export default ViewController;
