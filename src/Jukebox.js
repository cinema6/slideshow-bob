import { createKey } from 'private-parts';

const _ = createKey();

export default class Jukebox {
    constructor() {
        _(this).audio = new Audio();
    }

    load(src) {
        _(this).audio.src = src;
        _(this).audio.load();
        _(this).audio.loop = true;
    }

    play() {
        _(this).audio.play();
    }

    pause() {
        _(this).audio.pause();
    }
}
