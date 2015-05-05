import {createKey} from 'private-parts';
const _ = createKey();

class Animator {
    constructor() {
        _(this).listeners = {};
    }

    on(event, handler) {
        const listeners = _(this).listeners;

        (listeners[event] || (listeners[event] = [])).push(handler);
    }

    remove(event, handler) {
        const listeners = _(this).listeners;

        // Listener array is replaced here so that if this method is called from a handler,
        // other handlers aren't skipped. Doing the removal this way avoids all the complications
        // of mutating an array while iterating through it.
        listeners[event] = listeners[event].filter(fn => fn !== handler);
    }

    trigger(event, view) {
        const handlers = _(this).listeners[event] || [];

        if (handlers.length < 1) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const status = [];

            handlers.forEach((handler, index) => {
                function done() {
                    status[index] = true;

                    if (status.indexOf(false) < 0) {
                        resolve();
                    }
                }

                status[index] = false;
                handler(view, done);
            });
        });
    }
}

export default new Animator();
