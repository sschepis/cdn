"use strict";

var restify = require('restify');
var async = require('async');
var http=require('http');
var url = require('url');
var request = require('request');
var path = require('path');
var fs = require('fs');
var wikipedia = require("wikipedia-js");
var GoogleSearch = require('google-search');
var S = require('string');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyBUnza5o2HaFsiSF_lcLsfS_T0Q9vyHPHY', // AIzaSyBwknzAPoXw0Z_ewXqzHbxeKGBYpjBoeL4
  cx: '016243861340633703996:tattmzooc_i'
});
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

function logPre(req, res, next) {
    req.log.info({req: req}, 'begin');
    return next();
}

function logOn(req, res, route) {
    req.log.info({res: res, route: route}, "end");
}

function jsFormatter(req, res, body) {
    return body.toString();
}
function htmlFormatter(req, res, body) {
    return body.toString();
}

var server = restify.createServer({
    name : config.host.name,
    version : '0.0.1',
    log : log,
});

var secserver = restify.createServer({
    name : config.host.name,
    version : '0.0.1',
    log : log,
 //   certificate: fs.readFileSync(__dirname + '/server.crt'),
 //   key: fs.readFileSync(__dirname + '/server.key'),
 //   requestCert: false,
 //   rejectUnauthorized: false
});

// add loggers to pre and after to log all requests
if(config.logging.log.request) {
    server.pre(logPre);
    secserver.pre(logPre);
}
if(config.logging.log.response) {
    server.on('after', logOn);
    secserver.on('after', logOn);
}

server.formatters['text/javascript'] = jsFormatter;
server.formatters['text/html'] = htmlFormatter;
secserver.formatters['text/javascript'] = jsFormatter;
secserver.formatters['text/html'] = htmlFormatter;

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.dateParser());
server.use(restify.jsonp());
server.use(restify.requestLogger());
server.use(restify.sanitizePath());
secserver.use(restify.acceptParser(server.acceptable));
secserver.use(restify.queryParser());
secserver.use(restify.bodyParser());
secserver.use(restify.CORS());
secserver.use(restify.dateParser());
secserver.use(restify.jsonp());
secserver.use(restify.requestLogger());
secserver.use(restify.sanitizePath());


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

function concat_contents(req, res, next) {
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
}

function search (req, res, next) {
    if(req.params.q) {
        var u = 'https://www.googleapis.com/customsearch/v1?q=' + encodeURIComponent(req.params.q) 
        + '&gl=US&lr=lang_en&fileType=pdf&key=AIzaSyBUnza5o2HaFsiSF_lcLsfS_T0Q9vyHPHY&cx=016243861340633703996%3Atattmzooc_i';
        request.get(u, function(err, bres, body) { 
            res.send(JSON.parse(body));
            next();
        });
    } else {
        var u = 'https://www.google.com:443/cse/publicurl?cx=016243861340633703996:tattmzooc_i';
        request.get(u, function(err, bres, body) { 
            res.contentType = 'text/html';
            res.send(body);
            next();
        });
    }
};

function wolfram (req, res, next) {
    var u = 'http://api.wolframalpha.com/v2/query?input=' 
            + encodeURIComponent(req.params.input) 
            + '&appid=RE2X5T-34R48LUX2K';
    request.get(u, function(err, bres, body) { 
        var parseString = require('xml2js').parseString;
        parseString(body, function (err, result) {
            res.send(result);
            next();
        });
    });
};

function chat (req, res, next) {
    var chatbotId = req.params.chatbotid || 71367;
    var m = req.params.message || req.params.m || 'hello';
    var u = 'http://www.personalityforge.com/api/chat/?apiKey=kHw0oX4DIHcNklVw&externalID=wolfie-6969&firstName=Sebastian&lastName=Schepis&gender=m&chatBotID=' 
          + chatbotId + '&message=' + encodeURIComponent(m);
    request.get(u, function(err, bres, body) {
        body = body.split('<br>');
        if(body.length === 3)
            res.send(JSON.parse(body[2]));
        else
            res.send({});
        next();
    });
};

function flickr (req, res, next) {
    var t = req.params.tags || req.params.tag || req.params.t || 'cats';
    var p = req.params.page || req.params.p || 1;
    var u = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=a828a6571bb4f0ff8890f7a386d61975&' 
          + 'sort=interestingness-desc&per_page=25&format=json&tags=' + encodeURIComponent(t) + '&page=' + p;
    request.get(u, function(err, bres, body) {
        function jsonFlickrApi(result) {
            res.send(result);
            next();
        }
        eval(body);
    });
};

function wiki (req, res, next) {
    var query = req.params.term || req.params.q || req.params.t;
    var options = {
        query : query, 
        format : "html", 
        summaryOnly : true
    };
    wikipedia.searchArticle ( options, function(err, htmlWikiText) {
        var options = {
            include_script : false,
            include_style : false,
            compact_whitespace : true
        };
        // don't look at this code
        var s = S(htmlWikiText)
            .stripTags()
            .replaceAll('.','PEEREEOOD')
            .replaceAll(',','CCOOMAAA')
            .replaceAll(':','COWLONN')
            .replaceAll('%','PURRCENNT')
            .replaceAll('$','MONNEEBITCHAZ')
            .replaceAll(';','SSEMMEECOWLONN')
            .stripPunctuation()
            .replaceAll('PEEREEOOD','.')
            .replaceAll('CCOOMAAA',',')
            .replaceAll('COWLONN',':')
            .replaceAll('PURRCENNT','%')
            .replaceAll('MONNEEBITCHAZ','$')
            .replaceAll('SSEMMEECOWLONN',';').s;

        // Strip tags and decode HTML entities
        var result = {
            query : query,
            text : s,
            html : htmlWikiText
        };
        console.log("Query successful[query=%s\n\nhtml=%s\n\ntext=%s]", result.query, result.html, result.text);
        res.send(result);
        next();
    });
};

function serveStatic (req, res, next) {
    return restify.serveStatic({
        directory: path.join(__dirname, '.'),
        default: 'index.html'
    })(req, res, next);
}

server.get('/_/', concat_contents);
server.get('/google/', search);
server.get('/search/', search);
server.get('/wolfram/', wolfram);
server.get('/v2/query/', wolfram);
server.get('/chat/', chat);
server.get('/flickr/', flickr);
server.get('/wikipedia/', wiki);
server.get(/.*/, serveStatic);

secserver.get('/_/', concat_contents);
secserver.get('/google/', search);
secserver.get('/search/', search);
secserver.get('/wolfram/', wolfram);
secserver.get('/v2/query/', wolfram);
secserver.get('/chat/', chat);
secserver.get('/flickr/', flickr);
secserver.get('/wikipedia/', wiki);
secserver.get(/.*/, serveStatic);


server.listen(config.host.port, function () {
    log.info({message:'%s listening.'}, server.url);
});
secserver.listen(3000, function () {
    log.info({message:'%s listening.'}, secserver.url);
});



