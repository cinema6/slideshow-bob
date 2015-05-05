import global from './global.js';
import RunnerPromise from './RunnerPromise.js';
import {extend} from './utils.js';

function checkStatus(response) {
    const status = response.status;

    if (status >= 400 && status < 600) {
        throw response;
    }

    return response;
}

function fetch(fetcher, method, url, options = {}) {
    return fetcher.fetch(url, extend(options, {
        method: method,
        body: JSON.stringify(options.body)
    }));
}

class Fetcher {
    fetch(url, options) {
        return RunnerPromise.resolve(global.fetch(url, options).then(checkStatus));
    }

    get(url, options) {
        return fetch(this, 'GET', url, options);
    }

    put(url, options) {
        return fetch(this, 'PUT', url, options);
    }

    post(url, options) {
        return fetch(this, 'POST', url, options);
    }

    delete(url, options) {
        return fetch(this, 'DELETE', url, options);
    }
}

export default new Fetcher();
