/**
 * Created by jeesoong on 15/12/27.
 */


var Valid = function(){

    this.init();

}

Valid.prototype = {

    init : function(){

        this._initDom();

        this._initEvent();

    },

    _initDom : function(){

        this.visual = document.querySelector('#visual');

        this.crop = document.querySelector('#crop');

        this._data = {
            startX : 0,
            startY : 0,
            startT : 0,
            endX : 0,
            endY : 0,
            endT : 0,
            move : 0,
            moving : false
        }

    },

    _initEvent : function(){

        var me = this;

        this.visual.addEventListener('mousedown',me._Events.dragCtrl.call(me), false)

        this.visual.addEventListener('mousemove',me._Events.dragCtrl.call(me), false)

        this.visual.addEventListener('mouseup',me._Events.dragCtrl.call(me), false)

    },

    _Events : {

        dragCtrl : function(e){

            var me = this;

            return function(e){

                switch (e.type){

                    case 'mousedown' :

                        if(me._data.moving) return;

                        me._data.isDown = true;

                        me._data.startX = e.clientX;

                        me._data.startT = new Date();

                        break;

                    case 'mousemove' :

                        if(!me._data.isDown) return

                        me._data.moving = true;

                        me._data.move = e.clientX;

                        e.preventDefault();

                        me._Events.dragMove.call(me);

                        break;

                    case 'mouseup' :

                        /* 如果没有触发touchmove直接退出 */
                        if(!me._data.moving) return;

                        me._data.isDown = false;

                        me._data.moving = false;

                        //可以从changedTouches取出最后的位置
                        me._data.endX = e.clientX;

                        me._data.endT = new Date();

                        me._Events.sendMess.call(me);

                        break;

                    default :

                        console.log('what!');

                        break;

                }

            }



        },

        dragMove : function(){

            var me = this;
            console.log(me._data.move);
            this.crop.style.left = me._data.move - 15 +'px';
            this.visual.style.left = me._data.move - 15 +'px';

        },

        sendMess : function(){

            var me = this;

            var xhr = new XMLHttpRequest();

            var formData = new FormData ();

            formData.append('start-time', me._data.startT);
            formData.append('end-time', me._data.endT);
            formData.append('end-x', me._data.endX);

            xhr.open ('POST', '/checkValid');
            xhr.send (formData);

            xhr.onreadystatechange = function (){
                if ( xhr.readyState == 4 && xhr.status == 200 ) {
                    console.log('ok');
                } else {

                }
            };


        }

    }


}
