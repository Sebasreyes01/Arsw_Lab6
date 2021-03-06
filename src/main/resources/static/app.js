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

    var _addPolygonToCanvas = function (polygon) {
        var c2 = canvas.getContext('2d');
        c2.fillStyle = '#f00';
        c2.beginPath();
        c2.moveTo(polygon[0].x, polygon[0].y);
        for(var i = 1; i < polygon.length;i++) {
            c2.lineTo(polygon[i].x, polygon[i].y);
        }
        c2.closePath();
        c2.fill();
    };
    
    
    var _getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var _connectAndSubscribe = function (id) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint.' + id, function (eventbody) {
                var coordinates=JSON.parse(eventbody.body);
                var pnt = new Point(coordinates.x, coordinates.y);
                _addPointToCanvas(pnt);
                // alert("x: " + coordinates.x + ", y: " + coordinates.y);
            });
            stompClient.subscribe('/topic/newpolygon.' + id, function (eventbody) {
                var polygonCoordiantes=JSON.parse(eventbody.body);
                _addPolygonToCanvas(polygonCoordiantes);
            });
        });

    };

    var publishPoint = function (x, y, id) {
        var pt=new Point(x,y);
        console.info("publishing point at "+pt);
        _addPointToCanvas(pt);
        // stompClient.send("/topic/newpoint." + id, {}, JSON.stringify(pt));
        stompClient.send("/app/newpoint." + id, {}, JSON.stringify(pt));
    };

    var disconnect = function () {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
        var button = document.getElementById("button");
        button.setAttribute("disabled", "true");
        var input = document.getElementById("ID");
        input.setAttribute("disabled","true");
    };


    return {

        init: function (id) {
            var can = document.getElementById("canvas");
            disconnect();
            //websocket connection
            _connectAndSubscribe(id);

            document.addEventListener("click", function (ev) {
                var coor = _getMousePosition(ev);
                publishPoint(coor.x, coor.y, id);
            });
        },

        publishPoint:publishPoint,

        // publishPoint: function(px,py){
        //     var pt=new Point(px,py);
        //     console.info("publishing point at "+pt);
        //     _addPointToCanvas(pt);
        //     stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
        //
        //     //publicar el evento
        // },

        disconnect:disconnect

        // disconnect: function () {
        //     if (stompClient !== null) {
        //         stompClient.disconnect();
        //     }
        //     // setConnected(false);
        //     console.log("Disconnected");
        // }
    };

})();