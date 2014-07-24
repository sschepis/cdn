"use strict";

var restify = require('restify');
var async = require('async');
var http=require('http');
var url = require('url');
var request = require('request');
var path = require('path');
var fs = require('fs');

var config = require('./config');

// configure bunyan logger
var Logger = require('bunyan');
var log = new Logger({
    name: 'cdn-server',
    streams: [
        {   // one debug logger to stdout
            stream: process.stdout,
            level: 'debug'
        },
        {   // one trace log to a logfile
            path: config.logging.trace.logpath,
            level: 'trace'
        }
    ],
    serializers: {
        req: Logger.stdSerializers.req,
        res: restify.bunyan.serializers.res
    }
});

// build the server now
var server = restify.createServer({
    name : config.host.name,
    version : '0.0.1',
    log : log,
    certificate: fs.readFileSync(__dirname + '/cert.pem'),
    key: fs.readFileSync(__dirname + '/key.pem'),
    requestCert: false,
    rejectUnauthorized: false
});

// add a server formatter for Javascript
server.formatters['text/javascript'] = function (req, res, body) {
    return body.toString();
};

// add a server formatter for HTML
server.formatters['text/html'] = function (req, res, body) {
    return body.toString();
};

// add loggers to pre and after to log all requests
if(config.logging.log.request) {
    server.pre(function (req, res, next) {
        req.log.info({req: req}, 'begin');
        return next();
    });
}
if(config.logging.log.response) {
    server.on('after', function (req, res, route) {
        req.log.info({res: res, route: route}, "end");
    });
}

// set up all our standard server modules
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.dateParser());
server.use(restify.jsonp());
server.use(restify.requestLogger());
server.use(restify.sanitizePath());

var fs = require('fs');
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = dir + '/' + file;
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

var _cache;
var _cacheLastTime;

server.get('/_/', function(req, res, next) {
    var nowTime = new Date().getTime() / 1000;

    if(_cache && nowTime - _cacheLastTime < 600) {
        console.log(nowTime - _cacheLastTime);
        res.contentType = 'text/javascript';
        return res.send(_cache) && next();
    }

    var cdn_Path = path.join(__dirname, config.cdn.cfolder);
    walk(cdn_Path, function(err, results){
        var outText = [];
        for(var theFile in results) {
            theFile = results[theFile];
            var excluded = false;
            for(var j in config.cdn.excludedFiles) {
                j = config.cdn.excludedFiles[j];
                if(theFile.indexOf(j) !== -1) {
                    excluded = true;
                    break;
                }
            }
            if(excluded) continue;
            var text = fs.readFileSync(theFile, 'utf8');
            outText.push(text);
        }
        res.contentType = 'text/javascript';
        _cache = outText.join('\n');
        _cacheLastTime = new Date().getTime() / 1000;
        res.send(_cache);
        next();
    });
});

// serve statically from this dir
function search (req, res, next) {
    var u = 'http://google.com/';
      if(req.params.q)
        u += 'search?q=' + encodeURIComponent(req.params.q);
    var r = request.defaults({ 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1636.0 Safari/537.36'
      }});
    r.get(u, function(err, bres, body) { 
        res.headers=bres.headers;
        res.contentType = 'text/html';
        res.send(body);
        next();
    });
};

server.get('/google/', search);
server.get('/search/', search);


server.get(/.*/, function(req, res, next) {
    return restify.serveStatic({
        directory: path.join(__dirname, '.'),
        default: 'index.html'
    })(req, res, next);
});

server.listen(9192, function () {
    log.info({message:'%s listening at %s'}, server.name, server.url);
});

// var https = require('https'), 
//     fs = require('fs');

// var options = {
//   pfx: fs.readFileSync(__dirname + '/cert.pfx'),
//   passphrase: 'password'
// };

// https.createServer(options, function (req, res) {
//     fs.readFile(__dirname + '/annyang.html',
//         function (err, data) {
//             if (err) throw err;
//             res.writeHead(200);
//             res.end(data);
//         });
// }).listen(9192);
