var phantom = require('phantom');
var config = require('./config');
var api = require('./api');

var baseUrl = 'https://mp.weixin.qq.com/';
var account = config.account;
var pwd = config.pwd;

var title = "Android 日报";
var author = "hanks";
var content = "这里是今天的日报,暂时正在测试,编辑于机器人,详情点击原文链接<br/><br/>";
var originUrl = "http://hanks.xyz/daily/";

var date = new Date();
var day = date.getDate();
var month = date.getMonth() + 1;
var year = date.getFullYear();

title += '（' + year + '-' + month + '-' + day + '）';

var defaultTimeout = 600000;
var Horseman = require('node-horseman');
var horseman = new Horseman({
    timeout: defaultTimeout
});


api.getTodayContent()
    .then(function(r) {
        content += r;
        horseman
            .viewport(1680, 900)
            .userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36')
            .open(baseUrl)
            .type('input#account', account)
            .type('input#pwd', pwd)
            .click('#loginBt')
            .wait(10000)
            // login qrcode
            .screenshot('loginQR.jpg')
            .do(function(done) {
                api.sendBySlack('loginQR.jpg');
                done();
            })
            // click 圖文
            .wait(60000)
            //.waitForSelector('a[data-id="10005"]')
            .screenshot('home.jpg')
            .evaluate(function() {
                document.querySelector('a[data-id="10005"]').click();
            })
            .wait(5000)
            .evaluate(function() {
                return document.querySelectorAll("div.tab_panel a")[1].href;
            })
            .then(function(href) {
                console.log(href);
                return horseman
                    .viewport(1680, 900)
                    .userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36')
                    .timeout(600000)
                    .open(href);
            })
            .wait(5000)
            // editor
            .screenshot('editor.jpg')
            .evaluate(function(title, author, content, originUrl) {
                document.querySelector('#title').value = title;
                document.querySelector('#author').value = author;
                document.querySelector('div.edui-editor-iframeholder iframe').contentWindow.document.querySelector('body.view').innerHTML = content;
                document.querySelector('input.js_url_checkbox').click();
                document.querySelector('input[name="source_url"]').value = originUrl;
                document.querySelector('#js_imagedialog').click();
            }, title, author, content, originUrl)
            .wait(6000)
            .evaluate(function() {
                document.querySelector('ul.img_list>li').click();
                document.querySelector('.img_dialog_wrp button[data-index="0"]').click()
                document.querySelector('#js_send').click();
            })
            .wait(5000)
            .click('#js_submit')
            .wait(5000)
            .evaluate(function() {
                document.querySelectorAll('div.dialog_ft a')[0].click();
            })
            .wait(6000)
            .screenshot('sendQR.jpg')
            .do(function(done) {
                api.sendBySlack('sendQR.jpg');
                done();
            })
            .wait(600000)
            .close();
    });
