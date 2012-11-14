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
    deviceType: 'pc',
    mediaUrl: '.'
};

var $d = $f.consoleLog;

var $a = {

    player: undefined,
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


$a.Player = (function(){
    var cls = function(){
        this.maxComboCount = 0;
        this.totalComboCount = 0;
        this.totalBallCount = 0;
    }

    function __INITIALIZE(self){
    }

    cls.factory = function(){
        var obj = new this();
        __INITIALIZE(obj);
        return obj;
    }

    return cls;
})();


$a.Screen = (function(){
    var cls = function(){
        this._view = $('<div />').css({
            position: 'absolute',
            width: 320,
            height: 416,
            backgroundColor: '#CCCCCC'
        });

        this._dummyScoreboard = $('<div />').css({
            position: 'absolute',
            top: 10,
            left: 10,
            width: 160,
            height: 84,
            lineHeight: '28px',
            fontSize: '14px',
            backgroundColor: '#FFF'
        }).appendTo(this._view);
    }

    function __INITIALIZE(self){
    }

    cls.prototype.draw = function(){
        this.drawDummyScoreboard();
    };

    cls.prototype.drawDummyScoreboard = function(options){
        var opts = Object.merge({
            maxComboCount: $a.player.maxComboCount,
            totalComboCount: $a.player.totalComboCount,
            totalBallCount: $a.player.totalBallCount//,
        }, options || {});

        var t = $f.format('Max combos: {0}\nTotal combos: {1}\nTotal balls: {2}',
            opts.maxComboCount, opts.totalComboCount, opts.totalBallCount);
        this._dummyScoreboard.html($f.nl2br(t));
    }

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
            overflow: 'hidden',
            backgroundColor: '#FFF'
        });

        this._lastComboResults = [];
    }

    /** [top, left], top = 416 - 52 * 5 */
    cls.POS = [156, 4];

    /** [cols, rows] */
    cls.EXTENT = [6, 5];

    cls.ZINDEXES = {};
    cls.ZINDEXES.HIGHEST_BALL = 100;
    cls.ZINDEXES.MOVING_BALL = 10;
    cls.ZINDEXES.BALL = 1;

    function __INITIALIZE(self){
        cls.EXTENT[1].times(function(rowIndex){
            self._squares.push([]);
            cls.EXTENT[0].times(function(columnIndex){
                self._squares[rowIndex][columnIndex] = null;
            });
        });
        self._resetBalls();
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

    cls.prototype._setBall = function(ball, idx, drawing){
        var drawing = (drawing === undefined)? true: false;
        ball.setIndex(idx);
        this._squares[idx[0]][idx[1]] = ball;
        if (drawing) this._view.append(ball.getView());
    }

    cls.prototype._newBall = function(idx, drawing){
        var newBall = $a.Ball.factory();
        this._setBall(newBall, idx, drawing);
    }

    cls.prototype._removeBall = function(idx, drawing){
        var drawing = (drawing === undefined)? true: false;
        var ball = this.getSquare(idx);
        if (ball === null) return;
        this._squares[idx[0]][idx[1]] = null;
        if (drawing) ball.getView().remove();
    }

    cls.prototype._moveBall = function(fromIdx, toIdx, drawing){
        var to = this.getSquare(toIdx);
        if (to !== null) {
            throw new Error('Board._moveBall: invalid situation');
        }
        this._setBall(this.getBall(fromIdx), toIdx);
        this._removeBall(fromIdx, drawing);
    }

    cls.prototype.exchangeBalls = function(a, b){
        var ballA = this.getBall(a);
        var idxA = ballA.getIndex().slice();
        var ballB = this.getBall(b);
        var idxB = ballB.getIndex().slice();
        this._setBall(ballA, idxB);
        this._setBall(ballB, idxA);
    }

    cls.prototype._resetBalls = function(){
        var self = this;
        this.eachSquare(function(ball, i, idx){
            self._removeBall(idx);
            self._newBall(idx);
        });
        // Remove 3-matched ball patterns
        // !! Sync _runCombo, if you fix this code !!
        var matcher;
        while (true) {
            matcher = $a.Matcher.factory();
            matcher.match(this._squares);
            if (matcher.getCombos().length > 0) {
                matcher.getMatchedIndexes().each(function(idx){
                    self._removeBall(idx);
                });
                self._fallBalls();
            } else {
                break;
            }
        }
    }

    /**
     * Fall balls to blank square
     *
     * @return arr Ball movement data
     *             [
     *                 [[1, 0], [3, 0]], // (1,0) fall to (3,0)
     *                 [null, [4, 1]],   // New ball fall to (4,1)
     *                 ..
     *             ]
     */
    cls.prototype._fallBalls = function(){
        var self = this;
        var movements = [];
        cls.EXTENT[0].times(function(columnIndex){
            var results = [];
            (cls.EXTENT[1] - 1).downto(0, function(rowIndex){
                results.push(__fallHere(self, [rowIndex, columnIndex]));
            });
            results = results.filter(function(result){
                return result !== null;
            });
            movements = movements.concat(results);
        });
        return movements;

        function __fallHere(self, idx){
            if (self.getSquare(idx) !== null) return null;
            var result = null;
            self._getColumnSquares(idx[1]).reverse().filter(function(data){
                return data[0][0] < idx[0]; // Compare other-square-rowIndex and here-square-rowIndex
            }).each(function(upperSquareData){
                var upperIdx = upperSquareData[0];
                if (upperSquareData[1] !== null) {
                    self._moveBall(upperIdx, idx, false);
                    result = [upperIdx, idx];
                    return false;
                }
            });
            if (result === null) {
                self._newBall(idx);
                return [null, idx];
            }
            return result;
        }
    }

    /** @return arr [[[0, 1], ball], [[1, 1], null], ..] */
    cls.prototype._getColumnSquares = function(columnIndex){
        var self = this;
        var squares = [];
        this._squares.each(function(row, rowIndex){
            squares.push([[rowIndex, columnIndex], self._squares[rowIndex][columnIndex]]);
        });
        return squares;
    }

    /**
     * Animate falling balls
     *
     * @param arr movements See this._fallBalls()
     * @preturn deferred
     */
    cls.prototype._runFallingBalls = function(movements){
        var self = this;
        // Animate for each rows that is different from original,
        //   the reason is for a performance
        var movementEachRows = [];
        (cls.EXTENT[1] - 1).downto(0, function(rowIndex){
            movementEachRows.push(
                movements.filter(function(movement){
                    return movement[1][0] === rowIndex;
                })
            );
        });
        var deferred = new Deferred();
        Deferred.loop(movementEachRows.length, function(loopIndex){
            var stoppers = [Deferred.next()];
            movementEachRows[loopIndex].each(function(movement){
                var fromIdx = movement[0];
                var toIdx = movement[1];
                var ball = self.getBall(toIdx);
                if (fromIdx !== null) {
                    ball.draw({ index:fromIdx });
                    stoppers.push(ball.runMoving(toIdx));
                } else {
                    fromIdx = [-1, toIdx[1]];
                    ball.draw({ index:fromIdx });
                    stoppers.push(ball.runMoving(toIdx));
                }
            });
            return Deferred.parallel(stoppers);
        }).next(function(){
            deferred.call();
            return Deferred.next();
        }).error($a.catchError);
        return deferred;
    }

    cls.prototype._runCombo = function(){
        var self = this;
        var deferred = new Deferred();

        //
        // !! Sync _resetBalls, if you fix this code !!
        //

        var matcher = $a.Matcher.factory();
        matcher.match(this._squares);
        this._lastComboResults = this._lastComboResults.concat(matcher.getCombos());

        // Run disappearing ball animations with updating scores
        Deferred.loop(matcher.getCombos().length, function(loopIndex){
            var combo = matcher.getCombos()[loopIndex];
            var stoppers = combo.indexes.map(function(idx){
                var d = new Deferred();
                var ball = $a.board.getBall(idx);
                ball.getView().fadeOut('normal', function(){ d.call() })
                return d;
            });
            return Deferred.parallel(stoppers).next(function(){
                $a.player.totalComboCount += 1;
                $a.player.totalBallCount += combo.indexes.length;
                $a.screen.drawDummyScoreboard();
                return Deferred.wait(0.1);
            });
        // Remove and fall balls
        }).next(function(){
            // Data
            matcher.getMatchedIndexes().each(function(idx){
                self._removeBall(idx);
            });
            var movements = self._fallBalls();
            // Animation
            return self._runFallingBalls(movements);
        }).next(function(){
            deferred.call();
            return Deferred.next();
        }).error($a.catchError);

        return deferred;
    }

    cls.prototype.runChainedCombo = function(){
        var self = this;
        var deferred = new Deferred();
        this._lastComboResults = [];
        var preComboCount = 0;
        function __runCombo(){
            self._runCombo().next(function(){
                if (self._lastComboResults.length > preComboCount) {
                    preComboCount = self._lastComboResults.length;
                    setTimeout(__runCombo, 1);
                } else {
                    if (self._lastComboResults.length > $a.player.maxComboCount) {
                        $a.player.maxComboCount = self._lastComboResults.length;
                        $a.screen.drawDummyScoreboard();
                    }
                    deferred.call();
                }
                return Deferred.next();
            }).error($a.catchError);
        }
        setTimeout(__runCombo, 1);
        return deferred;
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
        this._isRuningComboAnimation = false;

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

    cls.prototype.toString = function(){
        return 'Ball[' + this.type + '](' + this.getRowIndex() + ',' + this.getColumnIndex() + ')';
    }

    /** [width, height] */
    cls.SIZE = [52, 52];

    cls.TYPE_CHOICES = {
        fire: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-fire.png',
            styles: { backgroundColor:'red' }
        },
        water: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-water.png',
            styles: { backgroundColor:'aqua' }
        },
        wood: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-wood.png',
            styles: { backgroundColor:'green' }
        },
        light: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-light.png',
            styles: { backgroundColor:'yellow' }
        },
        dark: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-dark.png',
            styles: { backgroundColor:'gray' }
        },
        heart: {
            imgUrl: $e.mediaUrl + '/img/ball/ball-heart.png',
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
        return cls._calculatePos(this.getIndex());
    }
    cls.prototype.getTop = function(){
        return this.getPos()[0];
    }
    cls.prototype.getLeft = function(){
        return this.getPos()[1];
    }

    cls.prototype.draw = function(options){
        var opts = Object.merge({
            index: this.getIndex()
        }, options || {});

        var master = cls.TYPE_CHOICES[this.type];
        var pos = cls._calculatePos(opts.index);
        this._view.css({
            top: pos[0],
            left: pos[1],
            background: 'url(' + master.imgUrl + ')',
            //backgroundColor: master.styles.backgroundColor,
            zIndex: $a.Board.ZINDEXES.BALL
        });
    }

    cls.prototype.runMoving = function(toIdx){
        var self = this;
        var toPos = cls._calculatePos(toIdx);
        var deferred = new Deferred();
        this._view.css({
            zIndex: $a.Board.ZINDEXES.MOVING_BALL//,
        }).animate({
            top: toPos[0],
            left: toPos[1]//,
        }, {
            duration: 200,
            easing: 'linear',
            complete: function(){
                self._view.css({ zIndex:$a.Board.ZINDEXES.BALL });
                deferred.call();
            }
        });
        return deferred;
    }

    cls.prototype.getView = function(){ return this._view }

    cls._calculatePos = function(idx){
        return [cls.SIZE[1] * idx[0], cls.SIZE[0] * idx[1]];
    }

    function __ONDRAGSTART(evt, self){
        self._isDragging = true;
        self._view.css({ zIndex:$a.Board.ZINDEXES.HIGHEST_BALL });
    }
    function __ONDRAGSTOP(evt, self){
        self.draw();
        self._isDragging = false;
        self._isRuningComboAnimation = true;
        $a.board.runChainedCombo().next(function(){
            self._isRuningComboAnimation = false;
            return Deferred.next();
        }).error($a.catchError);
    }
    function __ONDRAG(evt){
        var self = evt.data.self;
        if (self._isRuningComboAnimation) return false;
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

    cls.prototype.getCombos = function(){ return this._combos }

    cls.prototype.getMatchedIndexes = function(){
        var list = [];
        this._combos.each(function(combo){
            combo.indexes.each(function(idx){
                list.push(idx);
            });
        });
        return list;
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

$a.player = $a.Player.factory();

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
