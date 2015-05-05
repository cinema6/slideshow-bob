import { views } from './core/View.js';
import {
    forEach
} from './utils.js';
import Runner from './Runner.js';
import {createKey} from 'private-parts';

const {body} = document;

function forEachAncestor(node, fn) {
    if (!node) { return; }

    fn(node);
    forEachAncestor(node.parentNode, fn);
}

const _ = createKey({
    addListener(event) {
        const {handlers, listenerCount} = this;

        if (!(event in listenerCount)) { listenerCount[event] = 0; }
        listenerCount[event]++;

        if (handlers[event]) { return; }

        let handler = this.createHandler(event);

        handlers[event] = handler;
        body.addEventListener(event.toLowerCase(), handler, false);
    },

    removeListener(event) {
        const {handlers, listenerCount} = this;

        if (--listenerCount[event] < 1) {
            body.removeEventListener(event.toLowerCase(), handlers[event], false);
            handlers[event] = null;
        }
    },

    createHandler(eventName) {
        return function(event) {
            Runner.run(() => {
                const {target} = event;

                forEachAncestor(target, node => {
                    const view = views.get(node);

                    if (view && view[eventName]) {
                        view[eventName](event);
                    }
                });
            });
        };
    }
});

class EventDelegator {
    constructor() {
        this.events = [
            'touchStart', 'touchMove', 'touchEnd', 'touchCancel',
            'keyDown', 'keyUp', 'keyPress',
            'mouseDown', 'mouseUp', 'contextMenu', 'click', 'doubleClick',
            'mouseMove', 'mouseEnter', 'mouseLeave',
            'focusIn', 'focusOut',
            'submit', 'change',
            'dragStart', 'drag', 'dragEnter', 'dragLeave', 'dragOver', 'drop', 'dragEnd'
        ];

        _(this).handlers = {};
        _(this).listenerCount = {};
        _(this).events = new WeakMap();
    }

    addListeners(view, eventNames) {
        _(this).events.set(view, eventNames.slice());

        forEach(eventNames, event => _(this).addListener(event));
    }

    removeListeners(view) {
        const {events} = _(this);
        const eventNames = events.get(view);

        events.delete(view);

        forEach(eventNames, event => _(this).removeListener(event));
    }
}

export default new EventDelegator();
