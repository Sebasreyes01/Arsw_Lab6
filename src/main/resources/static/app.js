var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;

    var _addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 1, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var _getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        var pt=new Point(evt.clientX - rect.left,evt.clientY - rect.top);
        console.info("publishing point at "+pt);
        _addPointToCanvas(pt);
        stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        // return {
        //     x: evt.clientX - rect.left,
        //     y: evt.clientY - rect.top
        // };
    };


    var _connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                var coordinates=JSON.parse(eventbody.body);
                var pnt = new Point(coordinates.x, coordinates.y);
                _addPointToCanvas(pnt);
                // alert("x: " + coordinates.x + ", y: " + coordinates.y);
            });
        });

    };


    return {

        init: function () {
            var can = document.getElementById("canvas");

            //websocket connection
            _connectAndSubscribe();

            document.addEventListener("click", _getMousePosition);
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            _addPointToCanvas(pt);
            stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();