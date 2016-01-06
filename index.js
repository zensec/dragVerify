/**
 * Created by jeesoong on 15/12/19.
 */
var koa = require('koa');
var render = require('./lib/render');
//var parse = require('co-body');
var route = require('koa-route');
//var path = require('path');
var serve = require('koa-static');
var validCanvas = require('./canvas.js');
var json = require('koa-json');

var app = koa();


//设置静态文件目录
app.use(serve(__dirname +'/static'));

app.use(json());

// route middleware
app.use(route.get('/', index));
//app.use(route.get('/valid', valid));
app.use(route.post('/checkValid', checkValid));


var validPromise = function() {
    return new Promise(function(resolve, reject) {
        validCanvas.run(function(data) {
            /*if(err) reject(err)
            else resolve(data)*/
            resolve(data)
        })
    })
}

function *index(){

    var data = yield validPromise()

    this.body = yield render('index', { data: data })

}

function *checkValid(){
    //返回验证

    this.body = { foo: 'bar' };

}



app.listen(3000);
