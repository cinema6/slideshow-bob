import {EventEmitter} from 'events';

class Dispatcher extends EventEmitter {
    constructor() {
        super();

        this.setMaxListeners(100);
    }
}

export default new Dispatcher();
