module.exports = function(grunt) {
    'use strict';

    grunt.registerTask(
        'resetbrowserify',
        'Reset all browserify instances to their virgin state.',
        function() {
            Object.keys(require.cache).filter(function(name) {
                return (/browserify/).test(name) && !(/grunt-browserify/).test(name);
            }).forEach(function(name) {
                delete require.cache[name];
            });
        }
    );
};
