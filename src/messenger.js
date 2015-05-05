import url from 'url';
import Runner from '../lib/Runner.js';

const { query: { id } } = url.parse(window.location.href, true);
const listeners = {
    load: [],
    play: [],
    pause: []
};

export function send(event, data = {}) {
    const message = { id, event, data };

    window.parent.postMessage(JSON.stringify(message), '*');
}

export function listenFor(message, handler) {
    if (!listeners[message]) { throw new Error(`${message} message is not supported.`); }

    listeners[message].push(handler);
}

window.addEventListener('message', event => {
    const data = (() => {
        try { return JSON.parse(event.data); } catch(e) {
            throw new Error(`${event.data} is not a valid JSON message.`);
        }
    }());
    const { method } = data;
    const args = data.args || [];

    if (!listeners[method]) {
        throw new Error(`${method} method is not supported.`);
    }

    Runner.run(() => listeners[method].forEach(handler => handler(...args)));
}, false);
