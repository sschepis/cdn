"use strict";

var path = require('path');

exports.host = {
    name : 'cdn',
    port : process.env.PORT || 9191,
    contact : 'contact@bespinholdings.com'
};

exports.cdn = {
    cfolder : '_',
    excludedFiles : [
        'jquery-2.0.2.min.js'
    ]
}

exports.logging = {
    trace : {
        logpath : 'trace.log'
    },
    log : {
        request : false,
        response : false
    }
};
