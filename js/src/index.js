// vim: set foldmethod=marker :
/**
 * Mugen-Pazdora
 *
 * @dependency Sugar.js v1.3.6 <http://sugarjs.com/>
 *             JSDeferred v0.4 <http://cho45.stfuawsc.com/jsdeferred/>
 *             jQuery v1.8.2 <http://jquery.com/>
 *             jQuery UI v1.9.1 <http://jqueryui.com/download/>
 *             jQuery UI Touch Punch v0.2.2 <http://touchpunch.furf.com/>
 */
var $e = {
    deviceType: 'pc'
};

var $d = $f.consoleLog;

var $a = {

    screen: undefined,
    board: undefined,
    pointer: undefined,

    catchError: function(err){
        if ($e.deviceType === 'sf') {
            $d('error =' + err);
        } else {
            $d('error =', err);
            $d('error.stack =', err.stack);
        };
    }
};


$a.Screen = (function(){
    var cls = function(){
        this._view = $('<div />').css({
            position: 'absolute',
            width: 320,
            height: 416,
            backgroundColor: '#CCCCCC'
        });
    }

    function __INITIALIZE(self){
    }

    cls.prototype.draw = function(){};

    cls.prototype.getView = function(){ return this._view };

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    }

    return cls;
})();


$a.Board = (function(){
    var cls = function(){

        /** [rowIndex][columnIndex] */
        this._squares = [];

        this._view = $('<div />').css({
            position: 'absolute',
            left: 4,
            bottom: 0,
            width: this.getWidth(),
            height: this.getHeight(),
            backgroundColor: '#EEEEEE'
        });
    }

    /** [top, left], top = 416 - 52 * 5 */
    cls.POS = [156, 4];

    /** [cols, rows] */
    cls.EXTENT = [6, 5];

    cls.ZINDEXES = {};
    cls.ZINDEXES.HIGHEST_BALL = 100;
    cls.ZINDEXES.BALL = 1;

    function __INITIALIZE(self){
        cls.EXTENT[1].times(function(rowIndex){
            self._squares.push([]);
            cls.EXTENT[0].times(function(columnIndex){
                self._squares[rowIndex][columnIndex] = null;
            });
        });
        self.resetBalls();
    }

    cls.prototype.exchangeBalls = function(a, b){
        //if (!__areNeighbors(a, b)) throw new Error('exchangeBalls: Not neighbors');
        var ballA = this.getBall(a);
        var idxA = ballA.getIndex().slice();
        var ballB = this.getBall(b);
        ballA.setIndex(ballB.getIndex().slice());
        ballB.setIndex(idxA);
    }

    cls.prototype.getSquare = function(idx){
        if (
            idx[0] < 0 ||
            idx[0] >= cls.EXTENT[1] ||
            idx[1] < 0 ||
            idx[1] >= cls.EXTENT[0]
        ) {
            throw new Error('getSquare: Out of board extent');
        }
        return this._squares[idx[0]][idx[1]];
    }
    cls.prototype.getBall = function(idx){
        var ball = this.getSquare(idx);
        if (ball === null) throw new Error('getBall: Not found ball');
        return ball;
    }

    cls.prototype._appendBall = function(idx){
        var ball = $a.Ball.factory();
        ball.setIndex(idx);
        this._squares[idx[0]][idx[1]] = ball;
        this._view.append(ball.getView());
    }

    cls.prototype.resetBalls = function(){
        var self = this;
        this.eachSquare(function(v, i, idx){
            self._appendBall(idx);
        });
    }

    cls.prototype.getWidth = function(){
        return $a.Ball.SIZE[0] * cls.EXTENT[0];
    }
    cls.prototype.getHeight = function(){
        return $a.Ball.SIZE[1] * cls.EXTENT[1];
    }

    cls.prototype.draw = function(){
        this.eachSquare(function(v){
            v.draw();
        });
    }

    cls.prototype.getView = function(){ return this._view };

    cls.prototype.eachSquare = function(callback){
        return this._squares.flatten().each(function(v, i){
            var idx = [~~(i / cls.EXTENT[0]), i % cls.EXTENT[0]];
            return callback(v, i, idx);
        });
    }

    //function __areNeighbors(a, b){
    //    return $f.pointsToDistance(a, b) === 1;
    //}

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    }

    return cls;
})();


$a.Ball = (function(){
    var cls = function(){

        /** [rowIndex, columnIndex] */
        this._index = [undefined, undefined];

        this.type = undefined;

        this._isDragging = false;

        this._view = $('<div />').css({
            position: 'absolute',
            width: cls.SIZE[0],
            height: cls.SIZE[1]//,
        }).draggable({
            opacity: 0.5
        }).bind('mousedown', {self:this}, __ONMOUSEDOWN)
            .bind('mouseup', {self:this}, __ONMOUSEUP)
            .bind('drag', {self:this}, __ONDRAG);
    }

    /** [width, height] */
    cls.SIZE = [52, 52];

    cls.TYPE_CHOICES = {
        fire: {
            styles: { backgroundColor:'red' }
        },
        water: {
            styles: { backgroundColor:'aqua' }
        },
        wood: {
            styles: { backgroundColor:'green' }
        },
        light: {
            styles: { backgroundColor:'yellow' }
        },
        dark: {
            styles: { backgroundColor:'gray' }
        },
        heart: {
            styles: { backgroundColor:'pink' }
        }//,
    }

    function __INITIALIZE(self){
        self.type = $f.randChoice(Object.keys(cls.TYPE_CHOICES));
    }

    cls.prototype.setIndex = function(idx){
        this._index = idx;
    }

    cls.prototype.getIndex = function(){
        return this._index;
    }
    cls.prototype.getRowIndex = function(){
        return this._index[0];
    }
    cls.prototype.getColumnIndex = function(){
        return this._index[1];
    }

    /** @return [top, left] */
    cls.prototype.getPos = function(){
        return [cls.SIZE[1] * this.getRowIndex(), cls.SIZE[0] * this.getColumnIndex()];
    }
    cls.prototype.getTop = function(){
        return this.getPos()[0];
    }
    cls.prototype.getLeft = function(){
        return this.getPos()[1];
    }

    cls.prototype.draw = function(){
        var master = cls.TYPE_CHOICES[this.type];
        this._view.css({
            top: this.getTop(),
            left: this.getLeft(),
            backgroundColor: master.styles.backgroundColor
        });
    }

    cls.prototype.getView = function(){ return this._view }

    function __ONMOUSEDOWN(evt){
        var self = evt.data.self;
        self._isDragging = true;
        self._view.css({ zIndex:$a.Board.ZINDEXES.HIGHEST_BALL });
    }
    function __ONMOUSEUP(evt){
        var self = evt.data.self;
        self._isDragging = false;
        self._view.css({ zIndex:$a.Board.ZINDEXES.BALL });
    }
    function __ONDRAG(evt){
        var self = evt.data.self;
        var idx = $a.pointer.at(evt.pageY, evt.pageX);
        $(evt.target).text(idx);
    }

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    }

    return cls;
})();


$a.Pointer = (function(){
    var cls = function(){
        this._areas = [];
    }

    cls.KEY_DEFAULT = '__default__';

    /** @param key mixed */
    cls.prototype.setArea = function(key, top, left, width, height){
        this._areas.push(Array.prototype.slice.apply(arguments));
    }

    cls.prototype.at = function(pageY, pageX){
        var i, a;
        for (i = 0; i < this._areas.length; i++) {
            a = this._areas[i];
            if (a[1] <= pageY && pageY < a[1] + a[4] &&
                a[2] <= pageX && pageX < a[2] + a[3]) return a[0];
        }
        return cls.KEY_DEFAULT;
    }

    cls.factory = function(){
        var obj = new this();
        return obj;
    }

    return cls;
})();


$a.init = function(){
//{{{
Deferred.next(function(){

$a.screen = $a.Screen.factory();
$a.screen.draw();
$('#gamecontainer').append($a.screen.getView());

$a.board = $a.Board.factory();
$a.board.draw();
$a.screen.getView().append($a.board.getView());

$a.pointer = $a.Pointer.factory();
$a.board.eachSquare(function(ball, notuse, idx){
    var top = ball.getTop() + $a.Board.POS[0];
    var left = ball.getLeft() + $a.Board.POS[1];
    var width = $a.Ball.SIZE[0];
    var height = $a.Ball.SIZE[1];
    $a.pointer.setArea(idx.slice(), top, left, width, height);
});

return Deferred.next();

}).error(function(err){
    $d('$a.init');
    $a.catchError(err);
});
//}}}
};
