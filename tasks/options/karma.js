module.exports = {
    options: {
        basePath: '../..',

        preprocessors: {
            'src/**/*.js': ['jshint', 'browserify'],
            'lib/**/*.js': ['jshint', 'browserify'],
            'test/**/*.js': ['jshint', 'browserify']
        },

        // web server port
        port: 8000,

        // cli runner port
        runnerPort: 9100,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 30000,

        // How long will Karma wait for a message from a browser before disconnecting from it.
        browserNoActivityTimeout: 300000
    },
    unit: {
        options: {
            configFile: 'test/unit/karma.<%= grunt.task.current.args[0] %>.conf.js',
            reporters: ['progress', 'junit'],
            junitReporter: {
                outputFile: 'reports/unit--<%= grunt.task.current.args[0] %>.xml'
            },
            singleRun: true
        }
    },
    tdd: {
        options: {
            configFile: 'test/unit/karma.<%= grunt.task.current.args[0] %>.conf.js',
            autoWatch: true
        }
    },
    server: {
        options: {
            configFile: 'test/unit/karma.<%= grunt.task.current.args[1] %>.conf.js',
            background: true,
            singleRun: false
        }
    },

    perf: {
        options: {
            configFile: 'test/perf/karma.conf.js'
        }
    }
};
