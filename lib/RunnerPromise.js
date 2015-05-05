import Runner from './Runner.js';

const ES6Promise = Promise;

export default class RunnerPromise extends ES6Promise {
    then(fulfillmentHandler, rejectionHandler) {
        return super(
            fulfillmentHandler && function(value) {
                return Runner.run(fulfillmentHandler, value);
            },
            rejectionHandler && function(reason) {
                return Runner.run(rejectionHandler, reason);
            }
        );
    }
}
