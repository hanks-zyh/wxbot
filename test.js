var phantom = require('phantom');
// 搜索 os 相關的圖片
horseman
    .viewport(1680, 900)
    .userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36')
    .timeout(600000)
    .open('https://passport.csdn.net/account/login')
    .do(function(done) {
        setTimeout(function() {
            console.log('dddd');
            done();
        }, 3000);
    })
    .screenshot('s.jpg')
    .evaluate(function() {
        document.querySelector('input#username').value = 'xxxx'
        document.querySelector('input#password').value = 'xxxx'
        document.querySelector('input.logging').click();
    })
    .wait(5000)
    .screenshot('logined.jpg')
    .evaluate(function() {
        return document.querySelectorAll('#showinfo a')[0].href;
    })
    .then(function(size) {
        console.log(size);
        return horseman
            .viewport(1680, 900)
            .userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36')
            .timeout(600000)
            .open(size);
    })
    .wait(5000)
    .screenshot('image.jpg')
    .close();
