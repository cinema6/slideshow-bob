module.exports = {
    livereload: {
        files: [
            'public/**/*.html',
            'public/**/*.css',
            'public/**/*.{png,jpg,jpeg,gif,webp,svg}',
            'server/.build/**/*.js'
        ],
        options: {
            livereload: true
        },
        tasks: ['jshint', 'copy:server']
    },
    'livereload-tdd': {
        files: [
            'public/**/*.html',
            'public/**/*.css',
            'public/**/*.{png,jpg,jpeg,gif,webp,svg}',
            'server/.build/**/*.js',
            'test/unit/**/*.js'
        ],
        options: {
            livereload: true
        },
        tasks: ['copy:server', 'karma:server:run:<%= grunt.task.current.args[1] %>']

    }
};
