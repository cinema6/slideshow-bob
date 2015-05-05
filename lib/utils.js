export function noop() {}

export function allSettled(promises) {
    return new Promise(function(fulfill) {
        const result = [];
        const total = promises.length;
        let resolved = 0;

        function checkDone() {
            if (++resolved === total) {
                fulfill(result);
            }
        }

        if (total === 0) {
            return fulfill(result);
        }

        promises.forEach((promise, index) => {
            Promise.resolve(promise).then((value) => {
                result[index] = {
                    state: 'fulfilled',
                    value
                };

                checkDone();
            }, (reason) => {
                result[index] = {
                    state: 'rejected',
                    reason
                };

                checkDone();
            });
        });
    });
}

export function defer(PromiseClass) {
    let fulfill, reject;
    const promise = new PromiseClass((_fulfill, _reject) => {
        fulfill = _fulfill;
        reject = _reject;
    });

    return { promise, fulfill, reject };
}

export function map(array, fn) {
    const result = [];
    const {length} = array;
    let index = 0;

    for ( ; index < length; index++) {
        result[index] = fn(array[index], index);
    }

    return result;
}

export function filter(array, fn) {
    const result = [];
    const {length} = array;
    let index = 0;

    for ( ; index < length; index++) {
        if (fn(array[index], index)) {
            result.push(array[index]);
        }
    }

    return result;
}

export function forEach(array, fn) {
    const {length} = array;
    let index = 0;

    for ( ; index < length; index++) {
        fn(array[index], index);
    }
}

export function reduce(array, fn, initial) {
    let result = initial;
    const {length} = array;
    let index = 0;

    for ( ; index < length; index++) {
        result = fn(result, array[index], index);
    }

    return result;
}

export function find(array, fn) {
    const {length} = array;
    let index = 0;

    for ( ; index < length; index++) {
        if (fn(array[index], index)) {
            return array[index];
        }
    }

    return null;
}

export function extend() {
    return reduce(arguments, (result, object) => {
        reduce(Object.keys(object || {}), (result, key) => {
            result[key] = object[key];
            return result;
        }, result);
        return result;
    }, {});
}
