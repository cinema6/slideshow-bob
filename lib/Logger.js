/* global console */
import {createKey} from 'private-parts';
const _ = createKey();

function proxy(method, context, args) {
    const timestamp = (new Date()).toISOString();
    const data = [`${timestamp} [${method}] {${context}}`];

    data.push.apply(data, args);

    console[method].apply(console, data);
}

class Logger {
    constructor(context) {
        _(this).context = context;
    }

    log() {
        return proxy('log', _(this).context, arguments);
    }
    info() {
        return proxy('info', _(this).context, arguments);
    }
    warn() {
        return proxy('warn', _(this).context, arguments);
    }
    error() {
        return proxy('error', _(this).context, arguments);
    }
}
Logger.create = function(context) {
    return new this(context);
};

export default Logger;
