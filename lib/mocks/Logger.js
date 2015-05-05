class MockLogger {
    log() {}
    info() {}
    warn() {}
    error() {}
}

const logger = new MockLogger();

MockLogger.create = function() {
    return logger;
};

export default MockLogger;
