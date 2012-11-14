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
        var idxB = ballB.getIndex().slice();
        this._setBall(ballA, idxB);
        this._setBall(ballB, idxA);
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

    cls.prototype._setBall = function(ball, idx){
        ball.setIndex(idx);
        this._squares[idx[0]][idx[1]] = ball;
        this._view.append(ball.getView());
    }

    cls.prototype.resetBalls = function(){
        var self = this;
        this.eachSquare(function(v, i, idx){
            var ball = $a.Ball.factory();
            self._setBall(ball, idx);
        });
    }

    cls.prototype.startDisappearingBalls = function(){
        var matcher = $a.Matcher.factory();
        matcher.match(this._squares);
        $d(matcher);
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
        var self = this;

        /** [rowIndex, columnIndex] */
        this._index = [undefined, undefined];

        this.type = undefined;

        this._isDragging = false;

        this._view = $('<div />').css({
            position: 'absolute',
            width: cls.SIZE[0],
            height: cls.SIZE[1],
            zIndex: $a.Board.ZINDEXES.BALL//,
        }).draggable({
            opacity: 0.5,
            start: function(evt){ return __ONDRAGSTART(evt, self) },
            stop: function(evt){ return __ONDRAGSTOP(evt, self) }
        }).bind('drag', {self:this}, __ONDRAG);
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
            backgroundColor: master.styles.backgroundColor,
            zIndex: $a.Board.ZINDEXES.BALL
        });
    }

    cls.prototype.getView = function(){ return this._view }

    function __ONDRAGSTART(evt, self){
        self._isDragging = true;
        self._view.css({ zIndex:$a.Board.ZINDEXES.HIGHEST_BALL });
    }
    function __ONDRAGSTOP(evt, self){
        self._isDragging = false;
        self.draw();
    }
    function __ONDRAG(evt){
        var self = evt.data.self;
        var areaKey = self.getIndex().join(',');
        var nextAreaKey = $a.pointer.at(evt.pageY, evt.pageX);
        //$(evt.target).text(nextAreaKey + '/' + areaKey);

        if (nextAreaKey === areaKey) return true;
        if (nextAreaKey === '__default__') return false;

        var orgIdx = nextAreaKey.split(',').map(function(v){ return parseInt(v) });
        var idx = orgIdx.slice();
        if (idx[0] === -1) idx[0] = 0;
        if (idx[1] === -1) idx[1] = 0;
        var ball = $a.board.getBall(idx);

        $a.board.exchangeBalls(self.getIndex(), ball.getIndex());
        ball.draw();

        return true;
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


$a.Matcher = (function(){
    var cls = function(){
        this._ballSets = [];
        this._combos = [];
    }

    cls.prototype.match = function(squares){

        // Pick ball sets
        var self = this;
        $a.Board.EXTENT[1].times(function(rowIndex){
            var ballSets = __pickBallSets(squares[rowIndex].slice(), 'row', rowIndex);
            self._ballSets = self._ballSets.concat(ballSets);
        });
        $a.Board.EXTENT[0].times(function(columnIndex){
            var squaresOnLine = squares.map(function(v){ return v[columnIndex] });
            var ballSets = __pickBallSets(squaresOnLine, 'column', columnIndex);
            self._ballSets = self._ballSets.concat(ballSets);
        });

        // Make combos from ball sets
        this._combos = __mergeBallSets(this._ballSets.slice());
        this._combos.sort(function(a, b){// Order by 1) DESC rowIndex 2) DESC columnIndex
            return __makeComboOrder(b) - __makeComboOrder(a);
        });
        function __makeComboOrder(ballSet){
            var mostBottomLeftIdx = ballSet.indexes.max(function(idx){ return __idxToOrder(idx) });
            return __idxToOrder(mostBottomLeftIdx);
        }
        function __idxToOrder(idx){
            return idx[0] * 1000 - idx[1];
        }
    }

    /**
     * Pick 3-matched ball sets in board for each a line
     *
     * @param arr squaresOnLine Line of squares that sliced board vertical or horizontal
     * @param str direction     'row' | 'column'
     * @param int               rowOrColumnIndex
     * @return arr ex) [{ type:'aqua', indexes:[[0, 1], [0, 2], [0, 3], [0, 4]]}, ..]
     */
    function __pickBallSets(squaresOnLine, direction, rowOrColumnIndex){

        // Check 3-match pattern
        // ex) [daaaaf] => [['aqua', 1, 4]]
        //     [dddrrr] =>  [['dark', 0, 3], ['red', 3, 3]]
        var matches = [];
        var preBallType = null;
        var count = 1;
        squaresOnLine.push(null); // For end of loop
        squaresOnLine.each(function(square, i){
            var ballType = (square !== null)? square.type: null;

            if (ballType !== preBallType) {
                if (count >= 3) {
                    matches.push([preBallType, i - count, count]);
                }
                preBallType = ballType;
                count = 1;
            } else {
                if (ballType !== null) {
                    count += 1;
                }
            }
        });

        // Match results to ball indexes
        // ex) [['aqua', 1, 4]] => { type:'aqua', indexes:[[0, 1], [0, 2], [0, 3], [0, 4]]}
        var ballSets = [];
        matches.each(function(m){
            var set = [m[0], []];
            var set = {
                type: m[0],
                indexes: []
            };
            m[2].times(function(i){
                if (direction === 'row') {
                    set.indexes.push([rowOrColumnIndex, m[1] + i]);
                } else if (direction === 'column') {
                    set.indexes.push([m[1] + i, rowOrColumnIndex]);
                }
            });
            ballSets.push(set)
        });

        return ballSets;
    }

    /**
     * Merge same type ball sets for making combos
     */
    function __mergeBallSets(ballSets){
        var mergedBallSets = [];
        var i, currentBallSet, result;
        while (ballSets.length > 0) {
            currentBallSet = ballSets.shift();
            result = __findSameTypeAndMergeBallSet(currentBallSet, ballSets);
            mergedBallSets.push(result[0]);
            ballSets = result[1];
        }
        return mergedBallSets;

        function __findSameTypeAndMergeBallSet(subject, ballSets){
            var newBallSets = [];
            ballSets.each(function(target){
                if (__areNeighboringSameTypeBallSets(subject, target)) {
                    subject.indexes = subject.indexes.union(target.indexes);
                } else {
                    newBallSets.push(target);
                }
            });
            return [subject, newBallSets];
        }

        function __areNeighboringSameTypeBallSets(a, b){
            if (a.type !== b.type) return false;
            var ai, bi;
            for (ai = 0; ai < a.indexes.length; ai++) {
                for (bi = 0; bi < b.indexes.length; bi++) {
                    if ($f.pointsToDistance(a.indexes[ai], b.indexes[bi]) <= 1) return true;
                }
            }
            return false;
        }
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
    var key = idx.join(',');
    var top = ball.getTop() + $a.Board.POS[0];
    var left = ball.getLeft() + $a.Board.POS[1];
    var width = $a.Ball.SIZE[0];
    var height = $a.Ball.SIZE[1];
    $a.pointer.setArea(key, top, left, width, height);
});
$a.Board.EXTENT[0].times(function(i){
    var key = [-1, i].join(',');
    var top = 0;
    var left = $a.Ball.SIZE[0] * i;
    var width = $a.Ball.SIZE[0];
    var height = $a.Board.POS[0];
    $a.pointer.setArea(key, top, left, width, height);
});

return Deferred.next();

}).error(function(err){
    $d('$a.init');
    $a.catchError(err);
});
//}}}
};
