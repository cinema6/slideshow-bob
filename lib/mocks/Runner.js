import Runner from '../../.tmp/lib-real/Runner.js';
import {createKey} from 'private-parts';

const _ = createKey();

class Queue {
    constructor() {
        _(this).items = [];
    }

    add(context, fn, args = []) {
        _(this).items.push({ context, fn, args, once: false });
    }

    addOnce(context, fn, args = []) {
        const { items } = _(this);
        let { length } = items;

        while (length--) {
            const item = items[length];

            if (item.once && item.fn === fn && item.context === context) {
                item.args = args;
                return;
            }
        }

        items.push({ context, fn, args, once: true });
    }

    flush(done) {
        const items = _(this).items;
        let task;

        while (task = items.shift()) {
            let { context, fn, args } = task;
            if (typeof fn  === 'string') { fn = context[fn]; }
            fn.call(context, ...args);
        }

        done();
    }

    get hasWork() {
        return _(this).items.length > 0;
    }
}

class BeforeRenderQueue extends Queue {
    constructor() {
        super();
        this.name = 'beforeRender';
    }
}

class RenderQueue extends Queue {
    constructor() {
        super();
        this.name = 'render';
    }
}

class AfterRenderQueue extends Queue {
    constructor() {
        super();
        this.name = 'afterRender';
    }
}

class MockRunner extends Runner {}
MockRunner.queues = [BeforeRenderQueue, RenderQueue, AfterRenderQueue];

export default MockRunner;
