(function() {
    'use strict';

    var crypto = require('crypto'),
        Q = require('q');

    module.exports = {
        mountFolder: function(connect, dir) {
            return connect.static(require('path').resolve(dir));
        },

        genId: function(prefix) {
            var hash = crypto.createHash('sha1');
            var txt =   process.env.host                    +
                        process.pid.toString()              +
                        process.uptime().toString()         +
                        (new Date()).valueOf().toString()   +
                        (Math.random() * 999999999).toString();

            hash.update(txt);
            return (prefix + '-' + hash.digest('hex').substr(0,14));
        },

        QS3: function(s3) {
            for (var prop in s3) {
                if (typeof s3[prop] === 'function') {
                    this[prop] = Q.nbind(s3[prop], s3);
                }
            }
        }
    };
})();
