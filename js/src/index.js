// vim: set foldmethod=marker :
/**
 * アプリケーション本体ファイル
 *
 * @charset utf-8
 * @dependency Sugar.js v1.3.6 <http://sugarjs.com/>
 *             jQuery v1.8.2 <http://jquery.com/>
 *             JSDeferred v0.4 <http://cho45.stfuawsc.com/jsdeferred/>
 */
var $e = {
    deviceType: 'pc'
};

var $d = $f.consoleLog;

var $a = {

    screen: undefined,
    board: undefined,

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
    };

    function __INITIALIZE(self){
    };

    cls.prototype.draw = function(){};

    cls.prototype.getView = function(){ return this._view };

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    };

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
            width: $a.Ball.SIZE[0] * cls.EXTENT[0],
            height: $a.Ball.SIZE[1] * cls.EXTENT[1],
            backgroundColor: '#EEEEEE'
        });
    };

    /** [cols, rows] */
    cls.EXTENT = [6, 5];

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
        if (!__areNeighbors(a, b)) throw new Error('exchangeBalls: Not neighbors');
        var ballA = this.getBall(a);
        var idxA = ballA.getIndex().clone();
        var ballB = this.getBall(b);
        ballA.setIndex(ballB.getIndex().clone());
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
        this._each(function(v, i, idx){
            self._appendBall(idx);
        });
    };

    cls.prototype.draw = function(){
        this._each(function(v){
            v.draw();
        });
    };

    cls.prototype.getView = function(){ return this._view };

    cls.prototype._each = function(callback){
        return this._squares.flatten().each(function(v, i){
            var idx = [~~(i / cls.EXTENT[0]), i % cls.EXTENT[0]];
            return callback(v, i, idx);
        });
    };

    /**
     * @param a arr index
     * @param b arr index
     */
    function __areNeighbors(a, b){
        return $f.pointsToDistance(a, b) === 1;
    };

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    };

    return cls;
})();


$a.Ball = (function(){
    var cls = function(){

        /** [rowIndex, columnIndex] */
        this._index = [undefined, undefined];

        this.type = undefined;

        this.isCaught = false;

        this._view = $('<div />').css({
            position: 'absolute',
            width: cls.SIZE[0],
            height: cls.SIZE[1]//,
        });
    };

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
    };

    function __INITIALIZE(self){
        self.type = $f.randChoice(Object.keys(cls.TYPE_CHOICES));
    };

    cls.prototype.setIndex = function(idx){
        this._index = idx;
    };

    cls.prototype.getIndex = function(){
        return this._index;
    };
    cls.prototype.getRowIndex = function(){
        return this._index[0];
    };
    cls.prototype.getColumnIndex = function(){
        return this._index[1];
    };

    /** @return [top, left] */
    cls.prototype.getPos = function(){
        return [cls.SIZE[1] * this.getRowIndex(), cls.SIZE[0] * this.getColumnIndex()];
    };
    cls.prototype.getTop = function(){
        return this.getPos()[0];
    };
    cls.prototype.getLeft = function(){
        return this.getPos()[1];
    };

    cls.prototype.draw = function(){
        var master = cls.TYPE_CHOICES[this.type];
        this._view.css({
            top: this.getTop(),
            left: this.getLeft(),
            backgroundColor: master.styles.backgroundColor
        });
    };

    cls.prototype.getView = function(){ return this._view };

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    };

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

return Deferred.next();

}).error(function(err){
    $d('$a.init');
    $a.catchError(err);
});
//}}}
};
