import fetcher from '../../.tmp/lib-real/fetcher.js';
import RunnerPromise from '../RunnerPromise.js';
import {createKey} from 'private-parts';
import {
    allSettled,
    extend,
    forEach,
    map,
    reduce,
    defer
} from '../utils.js';
const Fetcher = fetcher.constructor;

const _ = createKey();

class MockFetcher extends Fetcher {
    constructor() {
        super();

        // Keep track of expectations made
        _(this).expects = {};
        // Keep track of responses defined for expectations
        _(this).responses = {};
        // Keep track of deferred objects for promises returned by fetch()
        _(this).deferreds = {};
    }

    fetch(url, _options) {
        const options = extend({ method: 'GET' }, _options);
        const {method, body} = options;
        const {expects, responses, deferreds} = _(this);

        // Fail if a request is made when it is not expect()ed.
        if (!expects[method] || !(url in expects[method])) {
            throw new Error(`Unexpected ${method} [${url}].`);
        }

        const expected = JSON.stringify(expects[method][url]);

        // Fail if expected requested was made, but not with the expected body.
        if (expected !== body) {
            throw new Error(
                `Expected ${method} [${url}] with different ` +
                `data. EXPECTED: ${expected}; GOT: ${body};`
            );
        }

        // Fail if a response is not defined for a request.
        if (!responses[method] || !(url in responses[method])) {
            throw new Error(`No response defined for ${method} [${url}].`);
        }

        delete expects[method][url];

        const deferred = defer(RunnerPromise);

        (deferreds[method] || (deferreds[method] = {}))[url] = deferred;

        return deferred.promise;
    }

    expect(method, url, body) {
        const {expects, responses} = _(this);

        (expects[method] || (expects[method] = {}))[url] = body;

        return {
            respond(status, body) {
                (responses[method] || (responses[method] = {}))[url] = {
                    status: status,
                    body: body
                };
            }
        };
    }

    flush() {
        const {expects, deferreds, responses} = _(this);

        // Fail if a request was expect()ed but never made.
        forEach(Object.keys(expects), method => {
            forEach(Object.keys(expects[method]), url => {
                throw new Error(`Expected ${method} [${url}].`);
            });
        });

        // Coerce request URLs, deferreds and response bodies into a flat array.
        const data = reduce(map(Object.keys(responses), method => {
            return map(Object.keys(responses[method]), url => {
                const deferred = deferreds[method][url];
                const body = responses[method][url];

                return [url, deferred, body];
            });
        }), (result, set) => result.concat(set), []);

        // Fulfill/reject request promises based on defined response.
        forEach(data, item => {
            const [url, deferred, config] = item;
            const {status, body} = config;

            const success = !(status >= 400 && status < 600);
            const response = new global.Response(
                body instanceof Object ? JSON.stringify(body) : body,
                {
                    status: status,
                    statusText: success ? 'OK' : 'ERROR',
                    headers: new global.Headers(),
                    url: url
                }
            );

            if (success) {
                deferred.fulfill(response);
            } else {
                deferred.reject(response);
            }
        });

        // Reset the state of the MockFetcher() for future requests/expectations.
        this.constructor();

        // Resolve the flush() promise after it has resolved all promises it is flushing.
        return allSettled(map(data, item => item[0].promise));
    }
}

export default new MockFetcher();
