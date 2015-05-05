import Mixable from './Mixable.js';

export default class Controller extends Mixable {
    addView(view) {
        return view.on('action', (target, action, args) => {
            if (target !== 'controller') { return; }

            if (typeof this[action] !== 'function') {
                throw new TypeError(
                    `Controller tried to respond to action [${action}] from View [${view.id}] but` +
                    ` it does not implement ${action}().`
                );
            }

            this[action](...args);
        });
    }
}
