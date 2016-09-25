var fs = require("fs");
var request = require("request");
var Botkit = require('botkit');
var config = require('./config');


var controller = Botkit.slackbot();
var bot = controller.spawn({
    token: config.slackToken
})
bot.startRTM(function(err, bot, payload) {
    if (err) {
        throw new Error('Could not connect to Slack');
    }
});

controller.hears(["keyword", "^pattern$"], ["direct_message", "direct_mention", "mention", "ambient"],
    function(bot, message) {
        bot.reply(message, 'You used a keyword!');
    });

var APP_ID = config.avosId;
var APP_KEY = config.avosKey;

function uploadImage(filePath, callback) {
    var options = {
        method: 'POST',
        url: 'https://api.leancloud.cn/1.1/files/1.jpg',
        headers: {
            'X-LC-Key': APP_KEY,
            'X-LC-Id': APP_ID,
            'Content-Type': 'image/jpeg'
        },
        body: fs.createReadStream(filePath)
    };
    console.log(options);
    request(options, function(error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        callback(JSON.parse(body.trim()));
    });
}

exports.sendBySlack = function(filePath) {
    if (!filePath) {
        console.log('filePath must not be null!!!');
        return;
    }
    uploadImage(filePath, function(obj) {
        var m = {
            type: 'message',
            channel: 'D2FFFEXS7',
            user: 'U2CE0K880',
            text: 'op',
            ts: '1474725618.000015',
            team: 'T2BD7KZH6',
            event: 'direct_message',
        }
        bot.reply(m, obj.url);
    });
}


exports.getTodayContent = function() {
    return new Promise(function(resolve, reject) {
        var options = {
            method: 'GET',
            url: 'https://api.leancloud.cn/1.1/classes/Article',
            qs: {
                limit: '10',
                order: '-createdAt'
            },
            headers: {
                'content-type': 'application/json',
                'x-lc-key': APP_KEY,
                'x-lc-id': APP_ID
            }
        };
        request(options, function(error, response, body) {
            if (error) {
                reject(error);
                throw new Error(error);
            }
            console.log(body);
            var res = '';
            var json = JSON.parse(body);
            var array = json.results;
            for (var i = 0; i < array.length; i++) {
                var article = array[i];
                res += '<h1 style="color:#3aa3e3; font-size:18px;">' + i + '. ' + article.title + '</h1><p>' + article.subtitle + '</p><br/>';
            }
            resolve(res);
        });
    });
}
