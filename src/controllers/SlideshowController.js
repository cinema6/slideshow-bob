import ViewController from '../../lib/core/ViewController.js';
import Slideshow from '../models/Slideshow.js';
import SlideshowView from '../views/SlideshowView.js';
import { send } from '../messenger.js';

export default class SlideshowController extends ViewController {
    constructor() {
        super(...arguments);

        this.model = new Slideshow();
        this.view = this.addView(new SlideshowView());

        this.model.on('init', () => this.updateView());
        this.model.on('move', () => this.updateView());

        this.view.on('focus', () => {
            if (this.model.paused) { return; }

            this.model.halt();
            this.view.once('blur', () => this.model.autoadvance());
        });

        send('ready');
    }

    updateView() {
        this.view.slides.update({
            currentIndex: this.model.currentIndex,
            slides: this.model.slides.map((slide, index) => ({
                id: index,
                title: slide.title,
                button: {
                    text: `$${slide.product.price.toFixed(2)}`,
                    href: slide.product.url
                },
                image: slide.images.large
            }))
        });

        this.view.thumbs.update(this.model.slides.map((slide, index) => ({
            id: index,
            image: slide.images.small,
            title: slide.title,
            active: index === this.model.currentIndex
        })));
    }

    move(thumb) {
        this.model.moveTo(this.view.thumbs.children.indexOf(thumb));
    }
}
