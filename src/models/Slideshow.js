import { EventEmitter } from 'events';
import { listenFor, send } from '../messenger.js';
import Slide from './Slide.js';
import { createKey } from 'private-parts';
import timer from '../../lib/timer.js';
import Jukebox from '../Jukebox.js';

const _ = createKey();

export default class Slideshow extends EventEmitter {
    constructor() {
        super();

        _(this).jukebox = new Jukebox();
        _(this).jukebox.load('mp3/muzak.mp3');

        this.slides = [];
        this.currentSlide = null;
        this.currentIndex = -1;
        this.paused = true;

        _(this).interval = null;

        listenFor('load', slides => {
            this.slides = slides.map(slide => new Slide(slide));

            this.emit('init');
        });

        listenFor('play', () => this.play());
        listenFor('pause', () => this.pause());
    }

    moveTo(index) {
        this.currentIndex = index;
        this.currentSlide = this.slides[index];

        this.emit('move');
    }

    next() {
        if (this.currentIndex === this.slides.length - 1) {
            return this.moveTo(0);
        }

        return this.moveTo(this.currentIndex + 1);
    }

    previous() {
        if (this.currentIndex === 0) {
            return this.moveTo(this.slides.length - 1);
        }

        return this.moveTo(this.currentIndex - 1);
    }

    play() {
        if (!this.paused) { return; }

        this.paused = false;
        _(this).jukebox.play();
        this.autoadvance();
        send('play');
    }

    pause() {
        if (this.paused) { return; }

        this.paused = true;
        _(this).jukebox.pause();
        this.halt();
        send('pause');
    }

    autoadvance() {
        if (_(this).interval) { return; }

        this.next();
        _(this).interval = timer.interval(() => this.next(), 3000);
    }

    halt() {
        if (!_(this).interval) { return; }

        timer.cancel(_(this).interval);
        _(this).interval = null;
    }
}
