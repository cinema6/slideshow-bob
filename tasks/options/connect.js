module.exports = {
    options: {
        hostname: '0.0.0.0'
    },
    server: {
        options: {
            port: '<%= settings.port %>',
            base: 'server',
            livereload: true
        }
    }
};
