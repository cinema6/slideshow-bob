import RunnerPromise from './RunnerPromise.js';
import Runner from './Runner.js';
import global from './global.js';
import {createKey} from 'private-parts';
import {
    defer
} from './utils.js';

const pending = new WeakMap();

const _ = createKey({
    flush() {
        Runner.run(() => {
            let fn;

            while(fn = this.queue.shift()) {
                fn();
            }
        });
        this.flushScheduled = false;
    }
});

class Timer {
    constructor() {
        _(this).flushScheduled = false;
        _(this).queue = [];
    }

    wait(ms) {
        const deferred = defer(RunnerPromise);
        const id = global.setTimeout(deferred.fulfill, ms);

        pending.set(deferred.promise, {
            resolve: deferred.reject,
            id: id,
            clearMethod: 'clearTimeout'
        });

        return deferred.promise;
    }

    interval(fn, ms) {
        const deferred = defer(RunnerPromise);
        const done = (() => this.cancel(deferred.promise));
        const id = global.setInterval(() => Runner.run(fn, done), ms);

        pending.set(deferred.promise, {
            resolve: deferred.fulfill,
            id: id,
            clearMethod: 'clearInterval'
        });

        return deferred.promise;
    }

    cancel(promise) {
        const config = pending.get(promise);

        if (!config) {
            throw new Error(
                'Unknown promise passed to timer.cancel(). The ' +
                'promise must be one created by wait() or interval().'
            );
        }

        config.resolve();
        global[config.clearMethod](config.id);

        return promise;
    }

    nextTick(fn) {
        const _this = _(this);

        _this.queue.push(fn);

        if (!_this.flushScheduled) {
            process.nextTick(() => _this.flush());
            _this.flushScheduled = true;
        }
    }
}

export default new Timer();
