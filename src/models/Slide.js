import { EventEmitter } from 'events';

export default class Slide extends EventEmitter {
    constructor(slide) {
        super();

        this.title = slide.title;
        this.description = slide.description;
        this.images = {
            small: slide.image.url_icon,
            large: slide.image.url_full
        };
        this.product = {
            type: slide.data.currency_code,
            price: parseFloat(slide.data.price),
            url: slide.data.url
        };
    }
}
