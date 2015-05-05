'use strict';

module.exports = {
    options: {
        browserifyOptions: {
            debug: true
        },
        transform: [
            ['babelify', require('../../tasks/resources/babel.config.js')],
            ['partialify']
        ]
    },
    tmp: {
        options: {
            plugin: [
                ['minifyify', {
                    map: 'main.js.map',
                    output: '.tmp/<%= settings.distDir %>/<%= _version %>/main.js.map'
                }]
            ]
        },
        files: [
            {
                src: '<%= package.main %>',
                dest: '.tmp/uncompressed/<%= settings.distDir %>/<%= _version %>/main.js'
            }
        ]
    },
    server: {
        options: {
            watch: true,
            keepAlive: false
        },
        files: [
            {
                src: '<%= package.main %>',
                dest: 'server/.build/main.js'
            }
        ]
    }
};
