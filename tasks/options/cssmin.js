module.exports = {
    tmp: {
        files: [
            {
                expand: true,
                cwd: 'public',
                src: [
                    '**/*.css'
                ],
                dest: '.tmp/uncompressed/<%= settings.distDir %>/<%= _version %>'
            }
        ]
    }
};
