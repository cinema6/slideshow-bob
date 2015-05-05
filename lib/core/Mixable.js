import {
    forEach
} from '../utils.js';

class Mixable {
    constructor() {
        forEach(this.constructor.mixins, Mixin => Mixin.call(this));
    }
}

Mixable.mixins = [];
Mixable.mixin = function(...mixins) {
    this.mixins = this.mixins.concat(mixins);

    forEach(mixins, Mixin => {
        for (let method in Mixin.prototype) {
            const classMethod = this.prototype[method];
            const mixinMethod = Mixin.prototype[method];

            if (classMethod) {
                /*jshint loopfunc: true */
                this.prototype[method] = function(...args) {
                    const hasSuper = 'super' in this;
                    const origSuper = this.super;
                    let result;

                    this.super = classMethod;
                    result = mixinMethod.call(this, ...args);

                    if (hasSuper) { this.super = origSuper; } else { delete this.super; }

                    return result;
                };
            } else {
                this.prototype[method] = mixinMethod;
            }
        }
    });
};

export default Mixable;
