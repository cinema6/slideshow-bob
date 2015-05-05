import ApplicationView from '../views/ApplicationView.js';
import Controller from '../../lib/core/Controller.js';
import SlideshowController from './SlideshowController.js';

export default class ApplicationController extends Controller {
    constructor(body) {
        super();

        this.view = new ApplicationView(body);
        this.SlideshowCtrl = new SlideshowController();
        this.SlideshowCtrl.renderInto(this.view);
    }
}
