import './polyfill.js';
import Runner from '../lib/Runner.js';
import ApplicationController from './controllers/ApplicationController.js';

Runner.run(() => new ApplicationController(document.body));
