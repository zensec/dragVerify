/**
 * Created by jeesoong on 15/12/24.
 */


var Canvas = require('canvas')
    , fs = require('fs')
    , Image = Canvas.Image;


exports.run = function(callback){

    var CROP_NUM = 190; //切分图片的数量

    var sourceImg = './static/img/abc.jpg';

    var cropImg = '/img/tempValidImg/crop.png';

    var validImg = '/img/tempValidImg/valid.png';

    var imgSrc = fs.readFileSync(sourceImg);

    var img = new Image;
    img.src = imgSrc;

    var canvas = new Canvas(img.width, img.height),
        ctx = canvas.getContext('2d');

    ctx.drawImage(img, 0, 0, img.width, img.height);

    var ruleObj = drawArea(ctx, img.width, img.height);

    //扣取图形
    var canvas0 = new Canvas(img.width, img.height),
        ctx0 = canvas0.getContext('2d');

    ctx0.drawImage(img, 0, 0, img.width, img.height);

    var cropCanvas = drawArea(ctx0,null,null,true, ruleObj, canvas0);

    var cropOut = fs.createWriteStream(__dirname + '/static'+ cropImg)
        , cropStream = cropCanvas.pngStream();

    var callBackComplate = 0;
    var callBackData = {
        cropImg:null,
        cropImgW:ruleObj.W+ruleObj.r,
        cropImgH:ruleObj.H+ruleObj.r,
        cropImgT:ruleObj.y,
        divs:null,
        divsImg:null,
        divsW:null,
        divsH:null
    }
    cropStream.on('data', function(chunk){
        cropOut.write(chunk);
    });
    cropStream.on('end', function(){
        console.log('cropsaved png');
        callBackComplate++;
        callBackData.cropImg = cropImg;
        if(callBackComplate === 2) callback(callBackData)
    });


    //生成背景图
    var mixObj = mixImg(canvas);

    var out = fs.createWriteStream(__dirname + '/static' + validImg)
        , stream = mixObj.mixCanvas.pngStream();

    stream.on('data', function(chunk){
        out.write(chunk);
    });
    stream.on('end', function(){
        console.log('saved png');

        var divs = makeDivs(mixObj);
        callBackComplate++;
        callBackData.divs = divs;
        callBackData.divsImg = validImg;
        callBackData.divsW = mixObj.w;
        callBackData.divsH = mixObj.h;
        if(callBackComplate === 2) callback(callBackData)

    });


    /*
     * 画随机区域,并返回随机值
     *
     * */
    function drawArea(ctx,ctxW,ctxH,crop,rule,canvas0){

        var W = 100;

        var H = 50;

        var r = 15;

        if(!crop){

            var x = makeRandom(ctxW - W - r);

            var y = makeRandom(ctxH - H - r);

            var x1 = makeRandom(W-2*r)+x;

            var y1 = makeRandom(H-2*r)+y;

        }else{

            var x = rule.x;

            var y = rule.y;

            var x1 = rule.x1;

            var y1 = rule.y1;

        }

        ctx.beginPath();

        ctx.fillStyle='transparent';

        ctx.moveTo(x,y);
        ctx.lineTo(x,y+H);
        ctx.lineTo(x1,y+H);
        //下圆
        ctx.arc(x1+r,y+H,r,0,Math.PI,false);
        ctx.lineTo(x+W,y+H);
        //右圆
        ctx.arc(x+W,y1+r,r,0.5*Math.PI,1.5*Math.PI,true);
        ctx.lineTo(x+W,y);
        ctx.closePath();
        ctx.fill();

        //API参照:https://developer.mozilla.org/zh-TW/docs/Web/Guide/HTML/Canvas_tutorial/Compositing
        //如果是截取则显示反差
        var composeType;

        !crop ? composeType = 'destination-out' : composeType = 'destination-in';

        ctx.globalCompositeOperation = composeType;

        ctx.beginPath();

        ctx.fillStyle='red';

        ctx.moveTo(x,y);
        ctx.lineTo(x,y+H);
        ctx.lineTo(x1,y+H);
        //下圆
        ctx.arc(x1+r,y+H,r,0,Math.PI,false);
        ctx.lineTo(x+W,y+H);
        //右圆
        ctx.arc(x+W,y1+r,r,0.5*Math.PI,1.5*Math.PI,true);
        ctx.lineTo(x+W,y);
        ctx.closePath();
        ctx.fill();

        //如果是截取,则截掉透明部分;
        if(crop){

            var canvas1 = new Canvas(W+r, H+r),
                ctx1 = canvas1.getContext('2d');

            ctx1.drawImage(canvas0, x, y, W+r, H+r, 0, 0, W+r, H+r);

            return canvas1

        }

        return {
            W:W,
            H:H,
            r:r,
            x:x,
            y:y,
            x1:x1,
            y1:y1
        }


    }
//截取不同图形
    function getArea(ctx,type){

        ctx.beginPath();

        ctx.fillStyle='transparent';

        ctx.moveTo(x,y);
        ctx.lineTo(x,y+H);
        ctx.lineTo(x1,y+H);
        //下圆
        ctx.arc(x1+r,y+H,r,0,Math.PI,false);
        ctx.lineTo(x+W,y+H);
        //右圆
        ctx.arc(x+W,y1+r,r,0.5*Math.PI,1.5*Math.PI,true);
        ctx.lineTo(x+W,y);
        ctx.closePath();
        ctx.fill();

        //API参照:https://developer.mozilla.org/zh-TW/docs/Web/Guide/HTML/Canvas_tutorial/Compositing
        //如果是截取则显示反差
        var composeType;

        !crop ? composeType = 'destination-out' : composeType = 'destination-in';

        ctx.globalCompositeOperation = composeType;

        ctx.beginPath();

        ctx.fillStyle='red';

        ctx.moveTo(x,y);
        ctx.lineTo(x,y+H);
        ctx.lineTo(x1,y+H);
        //下圆
        ctx.arc(x1+r,y+H,r,0,Math.PI,false);
        ctx.lineTo(x+W,y+H);
        //右圆
        ctx.arc(x+W,y1+r,r,0.5*Math.PI,1.5*Math.PI,true);
        ctx.lineTo(x+W,y);
        ctx.closePath();
        ctx.fill();

    }

//打乱图片数组
    function makeArr(){

        //crop(x, y, width, height)
        var arr = [],
            temp;

        for(var i = 0; i < CROP_NUM; i++){

            temp = makeRandom(CROP_NUM);

            while(arr.indexOf(temp) > -1) temp = makeRandom(CROP_NUM);

            arr.push(temp);

        }

        return arr

    }

//可设置几分钟重新生成一次,也可强制刷新,生成的图片可根据IP和时间戳来命名
    function mixImg(canvas){

        var arr = makeArr();

        //console.log(arr);

        var w = Math.floor(2 * img.width / CROP_NUM);

        var h = Math.floor(img.height / 2);

        var tempImgArr = [];

        var x,y,x1,y1;

        var mixCanvas = new Canvas(img.width, img.height),
            mixCtx = mixCanvas.getContext('2d');

        for(var i = 0; i < CROP_NUM; i++){

            if(arr[i] < CROP_NUM/2){

                x = arr[i]*w;

                y = 0;

            }else{

                x = (arr[i] - CROP_NUM/2)*w;

                y = h;

            }

            //tempImgArr[i] = img.crop(x, y, w, h);

            if(i < CROP_NUM/2){

                x1 = i*w;

                y1 = 0;

            }else{

                x1 = (i - CROP_NUM/2)*w;

                y1 = h;

            }

            mixCtx.drawImage(canvas, x, y, w, h, x1, y1, w, h);



            //tempImgArr[i].copy(newImg, x1, y1, 0, 0, w, h);

        }

        return {
            mixCanvas:mixCanvas,
            arr:arr,
            w:w,
            h:h
        };

    }

    function restoreImg(canvas,rule){

        var tempImgArr1 = [];

        var x1, y1, x2, y2;

        var restoreCanvas = new Canvas(img.width, img.height),
            restoreCtx = restoreCanvas.getContext('2d');

        for(var j = 0; j < CROP_NUM; j++){

            var k = rule.arr[j];

            //tempImgArr1[k] = tempImgArr[j];

            if(j < CROP_NUM/2){

                x1 = j*rule.w;

                y1 = 0;

            }else{

                x1 = (j - CROP_NUM/2)*rule.w;

                y1 = rule.h;

            }

            if(k < CROP_NUM/2){

                x2 = k*rule.w;

                y2 = 0;

            }else{

                x2 = (k - CROP_NUM/2)*rule.w;

                y2 = rule.h;

            }

            //tempImgArr1[k].copy(newImg, x2, y2, 0, 0, w, h);
            restoreCtx.drawImage(canvas, x1, y1, rule.w, rule.h, x2, y2, rule.w, rule.h);

        }

        return restoreCanvas


    }

    function makeDivs(rule){

        var x1, y1, x2, y2;

        var divs = [];

        for(var j = 0; j < CROP_NUM; j++){

            var k = rule.arr.indexOf(j);

            if(k < CROP_NUM/2){

                x2 = k*rule.w;

                y2 = 0;

            }else{

                x2 = (k - CROP_NUM/2)*rule.w;

                y2 = rule.h;

            }

            x2 = -x2+'px';
            y2 = -y2+'px';

            divs.push({x:x2,y:y2});

            //restoreCtx.drawImage(canvas, x1, y1, rule.w, rule.h, x2, y2, rule.w, rule.h);

        }

        return divs;

    }


//做随机数
    function makeRandom(num){
        return Math.floor(Math.random()*num)
    }

    //判断回调是否都执行完成
    function isComplte(complate, num, callback){
        complate++;
        if(complate === num) callback.call(this);
    }
}


