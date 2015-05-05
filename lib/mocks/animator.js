import animator from '../../.tmp/lib-real/animator.js';
const Animator = animator.constructor;
import {createKey} from 'private-parts';
import {
    defer
} from '../utils.js';

const _ = createKey();

class MockAnimator extends Animator {
    constructor() {
        super();

        _(this).deferreds = {};
    }

    trigger(event) {
        const deferred = defer(Promise);
        const {deferreds} = _(this);

        (deferreds[event] || (deferreds[event] = [])).push(deferred);

        return deferred.promise;
    }

    flush(event) {
        const deferreds = _(this).deferreds[event];
        const promise = Promise.all(deferreds.map(deferred => deferred.promise));

        deferreds.forEach(deferred => deferred.fulfill());
        deferreds.length = 0;

        return promise;
    }
}

export default new MockAnimator();
