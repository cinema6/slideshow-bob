module.exports = {
    options: {
        mode: 'gzip'
    },
    build: {
        files: [
            {
                cwd: '.tmp/uncompressed/<%= settings.distDir %>',
                expand: true,
                src: [
                    '**/*.js',
                    '**/*.css'
                ],
                dest: '<%= settings.distDir %>'
            }
        ]
    }
};
