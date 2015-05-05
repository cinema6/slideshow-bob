module.exports = function(grunt) {
    'use strict';

    var path = require('path'),
        osType = require('os').type(),
        _ = require('underscore');

    if (osType === 'Darwin'){
        require('posix').setrlimit('nofile', { soft : 1048 }); 
    }

    function loadGlobalConfig(relPath) {
        var configPath = path.join(process.env.HOME, relPath),
            configExists = grunt.file.exists(configPath);

        return configExists ? grunt.file.readJSON(configPath) : {};
    }

    var settings = {
        distDir: 'build',
        port: 9000,
        awsJSON: '.aws.json',
        s3: {
            staging: {
                bucket: 'com.cinema6.staging',
                app: 'apps/<%= package.name %>/'
            },
            production: {
                bucket: 'com.cinema6.portal',
                app: 'apps/<%= package.name %>/'
            }
        }
    },
        personal = _.extend({
            browser: null
        }, grunt.file.exists('personal.json') ? grunt.file.readJSON('personal.json') : {});

    require('load-grunt-config')(grunt, {
        configPath: path.join(__dirname, 'tasks/options'),
        config: {
            settings: _.extend(settings, {
                aws: loadGlobalConfig(settings.awsJSON)
            }),
            personal: personal
        }
    });

    grunt.loadTasks('tasks');

    /*********************************************************************************************
     *
     * SERVER TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('server', 'start a development server', function(config, target) {
        var withTests = config === 'tdd';
        target = target || 'app';

        if (withTests) {
            grunt.task.run('clean:test');
            grunt.task.run('copy:test');
            grunt.task.run('karma:server:foo:' + target);
        }
        grunt.task.run('clean:server');
        grunt.task.run('connect:server');
        grunt.task.run('copy:server');
        grunt.task.run('browserify:server');
        grunt.task.run('open:server');
        grunt.task.run('watch:livereload' + (withTests ? ('-tdd:' + target) : ''));
    });

    /*********************************************************************************************
     *
     * TEST TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('test:unit', 'run unit tests', function() {
        grunt.task.run('resetbrowserify');
        grunt.task.run('clean:test');
        grunt.task.run('copy:test');
        grunt.task.run('jshint');

        // Run library code tests if there are any.
        if (grunt.file.expand('test/unit/spec/lib/**/*.ut.js').length > 0) {
            grunt.task.run('karma:unit:lib');
        } else {
            grunt.log.error('There are no tests for library code.');
        }

        grunt.task.run('resetbrowserify');

        // Run application code tests if there are any.
        if (grunt.file.expand('./test/unit/spec/*.ut.js').length > 0) {
            grunt.task.run('karma:unit:app');
        } else {
            grunt.log.error('There are no tests for application code.');
        }
    });

    grunt.registerTask('test:perf', 'run performance tests', [
        'karma:perf'
    ]);

    grunt.registerTask('tdd', 'run unit tests whenever files change', function(target) {
        target = target || 'app';

        grunt.task.run('clean:test');
        grunt.task.run('copy:test');
        grunt.task.run('karma:tdd:' + target);
    });

    /*********************************************************************************************
     *
     * BUILD TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('build', 'build app into distDir', [
        'test:unit',
        'git_describe_tags',
        'clean:build',
        'copy:tmp',
        'htmlmin:tmp',
        'cssmin:tmp',
        'browserify:tmp',
        'copy:build',
        'compress:build',
        'replace:build'
    ]);

    /*********************************************************************************************
     *
     * UPLOAD TASKS
     *
     *********************************************************************************************/

    grunt.registerTask('publish', 'build and upload the application to s3', function(target) {
        grunt.task.run('build');
        grunt.task.run('s3:' + target);
    });
};
