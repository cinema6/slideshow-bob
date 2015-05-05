import {createKey} from 'private-parts';
import {
    noop,
    map,
    allSettled,
    find
} from './utils.js';
import global from './global.js';
const _ = createKey();

/**************************************************************************************************
 * QUEUE BASE CLASSES
 *************************************************************************************************/
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
            let item = items[length];

            if (item.once && item.fn === fn && item.context === context) {
                item.args = args;
                return;
            }
        }

        items.push({ context, fn, args, once: true });
    }

    get hasWork() {
        return _(this).items.length > 0;
    }
}

class AsyncQueue extends Queue {
    flush(next) {
        const items = _(this).items;

        allSettled(map(items, ({ context, fn, args }) => {
            if (typeof fn === 'string') { fn = context[fn]; }
            return fn.call(context, ...args);
        })).then(results => {
            const error = find(results, ({ state }) => state === 'rejected');

            if (error) {
                process.nextTick(() => { throw error.reason; });
            } else {
                next();
            }
        });
        items.length = 0;
    }
}

class RAFQueue extends AsyncQueue {
    flush(next) {
        global.requestAnimationFrame(() => super(next));
    }
}

/**************************************************************************************************
 * QUEUE CLASSES
 *************************************************************************************************/
class BeforeRenderQueue extends AsyncQueue {
    constructor() {
        super();
        this.name = 'beforeRender';
    }
}

class RenderQueue extends RAFQueue {
    constructor() {
        super();
        this.name = 'render';
    }
}

class AfterRenderQueue extends AsyncQueue {
    constructor() {
        super();
        this.name = 'afterRender';
    }
}

/**************************************************************************************************
 * RUNNER CLASS
 *************************************************************************************************/
let runner = null;

function getQueue(runner, name) {
    const queue = _(runner).queueHash[name];

    if (!queue) {
        throw new Error(`Unknown queue: [${name}].`);
    }

    return queue;
}

class Runner {
    constructor(queues) {
        const _this = _(this);

        _this.queues = queues;
        _this.queueHash = {};

        for (let queue of queues) {
            _this.queueHash[queue.name] = queue;
        }
    }

    schedule(queueName, context, fn, args) {
        getQueue(this, queueName).add(context, fn, args);
    }

    scheduleOnce(queueName, context, fn, args) {
        getQueue(this, queueName).addOnce(context, fn, args);
    }

    flush(callback = noop) {
        for (let queue of _(this).queues) {
            if (queue.hasWork) {
                queue.flush(() => this.flush(callback));
                return;
            }
        }

        callback();
    }
}

const nextRuns = [];

function executeNext() {
    if (nextRuns.length < 1) { return; }

    Runner.run(() => {
        let item;

        while (item = nextRuns.shift()) {
            const [fn, args] = item;
            fn(...args);
        }
    });
}

function schedule(params) {
    const { queue, context, fn, args, once } = params;

    if (!runner) {
        throw new Error('Cannot schedule task because there is no open runner instance.');
    }

    if (once) {
        runner.scheduleOnce(queue, context, fn, args);
    } else {
        runner.schedule(queue, context, fn, args);
    }
}


Runner.queues = [BeforeRenderQueue, RenderQueue, AfterRenderQueue];

Runner.run = function(fn, ...args) {
    let result;

    runner = new this(map(this.queues, Queue => new Queue()));
    result = fn(...args);
    runner.flush(executeNext);
    runner = null;

    return result;
};

Runner.schedule = function(queue, context, fn, args) {
    return schedule({ queue, context, fn, args, once: false });
};

Runner.scheduleOnce = function(queue, context, fn, args) {
    return schedule({ queue, context, fn, args, once: true });
};

Runner.runNext = function(fn, ...args) {
    if (!runner) {
        return this.run(fn, ...args);
    }

    nextRuns.push([fn, args]);
};

export default Runner;
