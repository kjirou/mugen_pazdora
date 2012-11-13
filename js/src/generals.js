// vim: set foldmethod=marker :
var $f = {};

$f.consoleLog = function(){
    if ('console' in this && 'log' in this.console) {
        try {
            return this.console.log.apply(this.console, arguments);
        } catch (err) {// For IE
            var args = Array.prototype.slice.apply(arguments);
            return this.console.log(args.join(' '));
        };
    };
};

//$f.withinNum = function(value, min, max){
//    if (min !== null && min !== undefined && min > value) return min;
//    if (max !== null && max !== undefined && max < value) return max;
//    return value;
//};

/** Format string like the Python 3
    @example format('My name is {0}, {1} years old', 'kjirou', 34)
             format('I like {0} and {1}', ['sushi', 'sukiyaki'])
             format('{0.x} {1.y}', {x:11}, {y:22})
    @author http://d.hatena.ne.jp/ajalabox/20110223/1298448703 */
$f.format = function() {
    var args, fmt, result;

    args = Array.apply([], arguments);
    fmt = typeof this === "string" ? this : args.shift();

    if (args.length === 1 && typeof args[0] === "object") {
        args = args[0];
    };

    result = fmt.replace(/{([^}]+)}/g, function (s, id) {
        var chain = id.split("."), substr, i;
        if (chain.length >= 2) {
            substr = args[chain[0]];
            for (i = 1; i < chain.length; i++) {
                substr = substr[chain[i]];
            }
        } else {
            substr = args[id];
        }
        return substr;
    });

    return result;
};

$f.randChoice = function(arr){
    return arr[Number.random(0, arr.length - 1)];
};

$f.pointsToDistance = function(a, b){
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
};

//{{{
///** オブジェクトを拡張する */
//$f.extend = function(target, expansion) {
//    var k;
//    for (k in expansion) { target[k] = expansion[k] };
//    return target;
//};
//
///** オブジェクトのキー／値リストを配列で返す, 順番は保障されない */
//$f.keys = function(obj){
//    var keys = [], k;
//    for (k in obj) { keys.push(k) };
//    return keys;
//};
//$f.values = function(obj){
//    var values = [], k;
//    for (k in obj) { values.push(obj[k]) };
//    return values;
//};
//
///** 継承する／Mixinする
//    @param SubClass   func
//    @param superObj   obj || null(Mixin時のみ)
//    @param SuperClass func || null */
//var __MIXIN__ = function(SubClass, superObj, SuperClass){
//    var k;
//    if (superObj !== undefined && superObj !== null) {
//        for (k in superObj) { SubClass.prototype[k] = superObj[k] };
//    };
//    //! superObj.constructor で楽しようとするとプロトタイプチェーン時にバグる
//    if (SuperClass !== undefined && SuperClass !== null) {
//        for (k in SuperClass) {
//            if (k === 'prototype') continue; // For FF3
//            SubClass[k] = SuperClass[k]
//        };
//    };
//};
//$f.inherit = function(SubClass, superObj, SuperClass){
//    SubClass.prototype = superObj;
//    SubClass.prototype.__myClass__ = SubClass;// constructorが自分では無くなるため, なお'class'だとIEでバグ
//    __MIXIN__(SubClass, null, SuperClass);// _MIXINを定義したのはここでクロージャにするため
//}
//$f.mixin = __MIXIN__;
//
///** Arrayをプロトタイプ・チェーン継承したクラスの継承されたメソッド群をなじませる
//    ref) http://kjirou.sakura.ne.jp/mt/2012/02/javascript_9.html */
//$f.blendArray = function(klass){
//    klass.convert = function(arr){
//        if (arr instanceof Array === false) {
//            throw new Error('RPGMaterial:($f.blendArray).convert, invalid parameter');
//        };
//        var obj = new klass(), i;
//        for (i = 0; i < arr.length; i++) { obj.push(arr[i]) };
//        return obj;
//    };
//    var toMine = function(methodName){
//        return function(){
//            return klass.convert(Array.prototype[methodName].apply(this, arguments));
//        };
//    };
//    klass.prototype.slice = toMine('slice');
//    klass.prototype.splice = toMine('splice');
//    klass.prototype.concat = function(){
//        throw new Error('RPGMaterial:($f.blendArray).concat, not implemented');
//    };
//    klass.prototype.toString = function(){
//        var arr = Array.prototype.slice.apply(this); // 配列に変換しないと使えない
//        return Array.prototype.toString.apply(arr, arguments);
//    };
//};
//
///** 関数の動的スコープを束縛する
//    ネイティブ関数やarguments.calleeを直接参照コピーせずに複製する際にも使用 */
//$f.bindScope = function(func, scope){
//    return function() {
//        return func.apply(scope, arguments);
//    };
//};
//
///** オブジェクトや配列の各要素に対して関数を実行する, @ref jQuery */
//$f.each = function(obj, callback) {
//    var length = obj.length, name;
//    //! Function.length があるので関数だと正常に動作しない
//    //  ref) http://1106.suac.net/johoB/JavaScript/jscriptf.html#functionlength
//    if (length === undefined) {
//        for (name in obj) {
//            if (callback.call(obj[name], name, obj[name]) === false) { break };
//        };
//    } else {
//        var i = 0;
//        for ( ; i < length; ) {
//            if (callback.call(obj[i], i, obj[i++]) === false) { break };
//        };
//    };
//    return obj;
//};
//
///** 指定回数ループする, callback func=引数には1からの回数が入る,falseを返すと実行終了 */
//$f.times = function(count, callback){
//    var i;
//    for (i = 1; i <= count; i++) {
//        if (callback(i) === false) return;
//    };
//};
//
///** 配列各要素を関数で評価し、その結果で配列を再生成して返す, undefined を返すと除外される
//    ref) RubyのArray#collect */
//$f.collect = function(arr, callback){
//    if (arr instanceof Array === false) {// オブジェクトを入れることが良くあるので
//        throw new Error('RPGMaterial:$functions.collect, collect usable to Array only');
//    };
//    var newArr = [], i, result;
//    for (i = 0; i < arr.length; i++) {
//        result = callback(i, arr[i]);
//        if (result !== undefined) newArr.push(result);
//    };
//    return newArr;
//};
//
///** 配列全要素を真偽評価して、その論理和／論理積を返す
//    callback func 評価ルーチンを決定する, デフォルトは !!value 評価
//    ex) callback = function(v, i){ return v % 2 } */
//$f.any = function(arr, callback){
//    callback = callback || function(v, i){ return v };
//    var i;
//    for (i = 0; i < arr.length; i++) {
//        if (!!callback(arr[i], i)) return true; // 最終的には常に論理型へキャストされる
//    };
//    return false;
//};
//$f.all= function(arr, callback){
//    callback = callback || function(v, i){ return v };
//    var i;
//    for (i = 0; i < arr.length; i++) {
//        if (!!callback(arr[i], i) === false) return false;
//    };
//    return true;
//};
//
///** Array.indexOf と同じ, IE対策 */
//$f.indexOf = function(target, arr){
//    if (arr instanceof Array === false) {// inArrayにオブジェクトを入れることが良くあるので
//        throw new Error('RPGMaterial:$functions.indexOf, invalid parameter, `arr` is not instanceof Array');
//    };
//    var i;
//    for (i = 0; i < arr.length; i++) { if (target === arr[i]) return i; };
//    return -1;
//};
//
///** 配列内に指定要素があるかを判定する */
//$f.inArray = function(target, arr) {
//    return $f.indexOf(target, arr) !== -1;
//};
//
///** 配列内に指定要素が全てあるかを判定する */
//$f.allInArray = function(targets, arr){
//    var i;
//    for (i = 0; i < targets.length; i++) {
//        if ($f.inArray(targets[i], arr) === false) return false;
//    };
//    return true;
//};
//
///** 配列から重複値を除去して返す */
//$f.uniqueArray = function(arr) {
//    var list = [], i;
//    for (i = 0; i < arr.length; i++) {
//        if ($f.inArray(arr[i], list) === false) list.push(arr[i]);
//    };
//    return list;
//};
//
///** 配列をシャッフルする, 破壊的に変更しつつ戻り値でも返す
//    @author http://la.ma.la/blog/diary_200608300350.htm */
//$f.shuffleArray = function(ary){
//    var i = ary.length;
//    while (i) {
//        var j = Math.floor(Math.random() * i);
//        var t = ary[--i];
//        ary[i] = ary[j];
//        ary[j] = t;
//    };
//    return ary;
//};
//
///** 配列の指定2要素の位置を交換する */
//$f.replaceArray = function(arr, aidx, bidx){
//    if (aidx < 0 || aidx >= arr.length || bidx < 0 || bidx >= arr.length) {
//        throw new Error('RPGMaterial:$f.replaceArray, out of array.length');
//    };
//    var b = arr[bidx];
//    arr.splice(bidx, 1, arr.splice(aidx, 1, b)[0]);
//    return arr;
//};
//
///** 配列の指定要素を数個ずらす, @param int direction ずらす回数,負の値も可能 */
//$f.rotateArray = function(arr, idx, direction){
//    var newIdx = (idx + direction) % arr.length;
//    while (newIdx < 0) newIdx += arr.length;
//    return $f.replaceArray(arr, idx, newIdx);
//};
//
///** ランダムに要素を選択して返す */
//
///** ランダムに複数要素を選択して返す, @return arr 順番は保障されない */
//$f.randChoices = function(arr, count){
//    //! なぜ1に初期化しているのかは不明, プロジェクト変更時に止める
//    if (count === undefined) count = 1;
//    var stack = arr.slice();
//    var results = [];
//    if (count > stack.length) throw new Error('RPGMaterial:$f.randChoices, invalid parameter');
//    $f.times(count, function(){
//        results.push(stack.splice($f.randInt(0, stack.length - 1), 1)[0]);
//    });
//    return results;
//};
//
///** 選択比率からランダムにキーを選択して返す
//    ratioMap arr=[1.0, 2.0, 0.5] のような比率リスト ||
//             dict={apple:1.0, orange:2.0, grape:0.5} のような比率辞書
//    @return 配列の場合は比率によりランダム選択された要素番号、辞書の場合はキーを返す */
//$f.randRatioChoice = function(ratioMap){
//    var list = [], i, k;
//    // [要素番号orキー, 選択比率] の配列にする
//    if (ratioMap instanceof Array) {
//        for (i = 0; i < ratioMap.length; i++) list.push([i, ratioMap[i]]);
//    } else if (typeof ratioMap === 'object') {
//        for (k in ratioMap) list.push([k, ratioMap[k]]);
//    } else {
//        throw new Error('RPGMaterial:$f.randRatioChoice, invalid parameter=' + ratioMap);
//    };
//    var total = $f.sum(list, function(v){ return v[1] });
//    var rand = Math.random() * total;
//    for (i = 0; i < list.length; i++) {
//        if (rand < list[i][1]) return list[i][0];
//        rand -= list[i][1];
//    };
//    throw new Error('RPGMaterial:$f.randRatioChoice, invalid situation');// 来ないはず
//};
//
///** 配列の値の合計値を返す
//    @param callback func=numを返す加算式,nullやundefinedだと無視する, デフォルトは単純な加算 */
//$f.sum = function(arr, callback){
//    var callback = callback || function(v){ return v };
//    var total = 0, i;
//    for (i = 0; i < arr.length; i++) { total += callback(arr[i], i) || 0 };
//    return total;
//};
//
///** 配列同士の内容を比較して内容が同じかを判定する
//    ! 前はtoStringを掛けた同士を比較していたが、順番が保障されるか不明なので止めた
//    asNoParticularOrder false(default)=順番も要一致 || true=順不同 */
//$f.areSimilarArrays = function(a, b, asNoParticularOrder){
//    var asNoParticularOrder = !!asNoParticularOrder;
//    var a2 = a.slice();
//    var b2 = b.slice();
//    if (asNoParticularOrder) {
//        a2.sort();
//        b2.sort();
//    };
//    if (a2.length !== b2.length) return false;
//    var i;
//    for (i = 0; i < a2.length; i++) {
//        if (a2[i] !== b2[i]) return false;
//    };
//    return true;
//};
//
//
///** 端数をランダムで丸めた整数を返す, ex) 1.2は80%で1, 20%で2 / -2.5は50%で-2, 50%で-3 */
//$f.randRound = function(num){
//    if (num % 1 === 0) return num;
//    var plusOrMinus = (num < 0)? -1: 1;
//    var base = Math.abs(parseInt(num));
//    var fraction = Math.abs(num % 1);
//    var zeroOrOne = (Math.random() < fraction)? 1: 0;
//    return (base + zeroOrOne) * plusOrMinus;
//};
//
///** 範囲内で正規分布風確率でランダムな値を返す
//    実際は中央を頂点として直線状に下がる図の分布になる
//    @param と @return は両方とも float
//    ref) http://kjirou.net/main/public/js/test/oreore_rand/ */
//$f.randGaussLike = function(min, max){
//    var delta = max - min;
//    return (Math.random() * delta + Math.random() * delta) / 2 + min;
//};
//
///** 数値AがBより超過／以上／等しい／以下／未満かを判定する */
//$f.compareNum = function(oper, a, b){
//    //! 関数化する '==' '<' 等にも対応する
//    var operands = ['eq', '==', 'gt', '>', 'egt', '>=', 'elt', '<=', 'lt', '<'];
//    if ($f.inArray(oper, operands) === false) {
//        throw new Error('RPGMaterial:$f.compareNum, not defined operand=' + oper);
//    };
//    if (oper === 'gt' || oper === '>') return a > b;
//    if (oper === 'egt' || oper === '>=') return a >= b;
//    if (oper === 'eq' || oper === '==') return a == b;
//    if (oper === 'elt' || oper === '<=') return a <= b;
//    if (oper === 'lt' || oper === '<') return a < b;
//};
//
//
///** 文字を一定文字数にて切り落とす */
//$f.cutStr = function(str, max, suffix){
//    if (suffix === undefined) suffix = '';
//    return str.replace(new RegExp('^(.{' + parseInt(max) + '}).+$'), '$1' + suffix);
//};
//
///** 文字列の桁数を指定し、足りない分を指定文字で埋める, 0埋めなどに使う */
//$f.fillStr = function(str, digits, chr){
//    var i;
//    for (i = 0; i < digits; i++) { str = chr + str };
//    return str.slice(-digits);
//};
//
///** 半角英数字で構成されるランダムな文字列を生成する
//    options:
//        smalls: 候補となる半角小文字英字を文字列で指定, デフォルトは全部
//        larges: 半角大文字英字
//        digits: 半角数値 */
//$f.randStr = function(length, options){
//    var opts = options || {};
//    var smalls = ('smalls' in opts)? opts.smalls.split(''): 'abcdefghijklmnopqrstuvwxyz'.split('');
//    var larges = ('larges' in opts)? opts.larges.split(''): 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
//    var digits = ('digits' in opts)? opts.digits.split(''): '0123456789'.split('');
//    var all = smalls.concat(larges.concat(digits));
//    var s = '', i;
//    for (i = 0; i < length; i++) s += $f.randChoice(all);
//    return s;
//};
//
///** 金額へ桁区切りを入れる、例) '1234567.89' -> '1,234,567.89' */
//var __FORMAT_NUM_PATTERN__ = /(\d)(\d{3})(,|\.|$)/;
//$f.formatNum = function(numOrStr){
//    var str = numOrStr;
//    if (typeof str !== 'string') str = str.toString();
//    while (1) {
//        var replaced = str.replace(__FORMAT_NUM_PATTERN__, '$1,$2$3');
//        if (str === replaced) {
//            return str;
//        } else {
//            str = replaced;
//        };
//    }
//};
//
///** 文字が半角か／文字列が半角文字だけかを判定する, utf-8専用 */
//var __IS_HAN_PATTERN__ = /^[\x00-\x7F]$/;
//$f.isHan = function(character){
//    return __IS_HAN_PATTERN__.test(character);
//};
//var __IS_HAN_STRING_PATTERN__ = /^[\x00-\x7F]*$/;
//$f.isHanString = function(str){
//    return __IS_HAN_STRING_PATTERN__.test(str);
//};
//
///** 文章前後の改行文字をすべて削除する */
//var __TNLC1_PATTERN__ = /^[\n\r]*/g;
//var __TNLC2_PATTERN__ = /[\n\r]*$/g;
//$f.trimNewLineCharacters = function(text){
//    return text.replace(__TNLC1_PATTERN__, '').replace(__TNLC2_PATTERN__, '');
//};
//
///** 改行文字を正規化する */
//var __NNLC_PATTERN__ = /(\r\n|\r)/g;
//$f.normalizeNewLineCharacters = function(text, options){
//    var opts = options || {};
//    // オプション: 末尾が改行文字なら削除
//    var deleteLast = ('deleteLast' in opts)? opts.deleteLast: false;
//    text = text.replace(__NNLC_PATTERN__, '\n'); // 改行文字を\nへ揃える
//    if (deleteLast) text = text.replace(/\n$/, '');
//    return text;
//};
//
///** -1 を '-1' に、1 を '+1' に変換して返す, zeroPrefixは値が0の場合の符号を個別設定 */
//$f.toModifierString = function(num, zeroPrefix) {
//    zeroPrefix = zeroPrefix || '';
//    if (num === 0) return zeroPrefix + '0';
//    return (num > 0)? '+' + num: num.toString();
//};
//
///** 指定オブジェクトのあるスコープ内での変数名リストを取得する
//    @return arr=変数名文字列リスト, []=無い場合 */
//$f.getMyNames = function(obj, scope){
//    var list = [], k;
//    for (k in scope) { if (obj === scope[k]) list.push(k) };
//    return list;
//};
///** 上記で複数または無い場合にはエラーを返す, @return 変数名文字列 */
//$f.getMyName = function(obj, scope){
//    var names = $f.getMyNames(obj, scope);
//    if (names.length !== 1) throw new Error('RPGMaterial:$f.getMyName, invalid situation');
//    return names[0];
//};
//
///** IEかを判別する */
//var __IS_IE_PATTERN__ = /MSIE \d+\./;
//$f.isIE = function(){
//    return __IS_IE_PATTERN__.test(window.navigator.userAgent);
//};
//
///** ブラウザ判別を行う
//    jQuery.browserは非推奨とされ代替のjQuery.supportも微妙なため作成した */
//$f.getBrowser = function(){
//    // 未対応点:
//    // - iPhoneアプリとiPhone-Safari判別が一緒になっている
//    //   iPhoneアプリはアプリ次第だが、"Safari"の有無で分岐して良さそう
//    //   ref) http://www.diigo.com/item/note/ofm2/b01m
//    // - スマフォのAndroidブラウザと携帯版Androidが一緒になっている
//    //   "Mobile"を含むものが携帯版らしい
//    //   ref) http://www.alphaseo.jp/seo-faq/mobile/110617_200517.html
//    // - 下記関数が複数条件を持てる形になっていないのと
//    //   確認が手間で当面必要ないので後回しにした
//    var browsers = [
//        //! 古いiPadは'iPhone'を含むらしく, iPhone-Safariには'Safari'を含むので
//        // iPad -> iPhone -> Safari という順にすること
//        ['ipad', /iPad/],
//        ['iphone', /iPhone/],
//        ['android', /Android/],
//        ['ie9', /MSIE 9\./],
//        ['ie8', /MSIE 8\./],
//        ['ie7', /MSIE 7\./],
//        ['ie6', /MSIE 6\./],
//        ['chrome', /Chrome/],
//        ['firefox', /Firefox/],
//        ['safari', /Safari/],
//        ['opera', /Opera/]//,
//    ];
//    var i;
//    for (i = 0; i < browsers.length; i++) {
//        if (browsers[i][1].test(window.navigator.userAgent)) return browsers[i][0];
//    };
//    return 'unknown';
//};
//
///** HTML特殊文字をエスケープする
//    なおcreateTextNodeを使うprototype.js式は、重いし改行文字が潰される問題があった */
//$f.escapeHTML = function(str){
//    str = str.replace(/>/g, '&gt;');
//    str = str.replace(/</g, '&lt;');
//    str = str.replace(/&/g, '&amp;');
//    str = str.replace(/"/g, '&quot;');
//    str = str.replace(/'/g, '&#039;');
//    return str;
//};
//
///** 改行文字を改行タグへ置換する */
//var __NL2BR_PATTERN__ = /(?:\r\n|\n|\r)/g;
//$f.nl2br = function(str){
//    //! IE7以前で連続する<br />が正しく表示されないので、その対処をしている
//    //  Ref) http://www.tagindex.com/stylesheet/text_font/letter_spacing.html
//    var br = '<br style="letter-spacing:0;" />';
//    return str.replace(__NL2BR_PATTERN__, br);
//};
//
///** URLを解析してGET値のハッシュを返す */
//$f.parseUrlToParameters = function(url){
//    var params = {};
//    if (/^.+?\?./.test(url)) {
//        var pairs = url.replace(/^.+?\?/, '').split('&');
//        var i, pair;
//        for (i = 0; i < pairs.length; i++) {
//            pair = pairs[i].split('=');
//            params[pair[0]] = ((pair[1] !== undefined)? pair[1]: "");
//        };
//    };
//    return params;
//};
//
///** 素オブジェクトをGETリクエスト用クエリストリングへ変換する
//    '?'は含まない */
//$f.objectToQueryString = function(data){
//    var str = '', first = true;
//    $f.each(data, function(k, v){
//        if (first === false) str += '&';
//        first = false;
//        str += encodeURIComponent(k) + '=' + encodeURIComponent(v);
//    });
//    return str;
//};
//
///** テキスト選択を不可にする, 子要素も影響を受ける
//    - 本当は継承させたくなかったけどCSSの仕様か無理だった
//    - IEの場合、自然には継承されず再帰的に全子要素に個別設定するので重さ注意
//    - また、IEで動的にメッセージ出力中は、出力中インライン要素の親ブロック要素の親ブロック要素 ..に
//      付けないと有効にならなかった, 詳細不明なので過信は禁物
//    - removing=true で選択不可を解除するが、設定したjqObjの子要素を指定するとIEだけ解除されることになる
//      設定した要素に対して解除を行うこと
//    @ref http://www.programming-magic.com/20071217225449/
//    @ref https://developer.mozilla.org/en/CSS/user-select
//    @ref http://blogs.msdn.com/b/ie_ja/archive/2012/01/17/css-user-select.aspx */
//$f.toUnselectable = function(jqObj, removing){
//    removing = !!removing;
//    var he = jqObj.get(0); // jqObj.css だと存否確認が出来ない
//    // IE10=MsUserSelect(未確認), Firefox=MozUserSelect, Chrome=KhtmlUserSelect
//    // Safari=webkitUserSelect(未確認), HTML5=UserSelect(未確認)
//    var propNames = ['MsUserSelect', 'MozUserSelect',
//        'KhtmlUserSelect', 'webkitUserSelect', 'UserSelect'];
//    var i, propName;
//    for (i = 0; i < propNames.length; i++) {
//        propName = propNames[i];
//        if (typeof he.style === 'object' && propName in he.style) {
//            if (!removing) {
//                he.style[propName] = 'none';
//            } else {
//                he.style[propName] = '';
//            };
//            //jqObj.children().each(function(){// 子要素へは継承を解除したかったけど出来なかった
//            //    this.style[propName] = 'text';// 'all'でもダメ
//            //});
//            return;
//        };
//    };
//    // IE, Opera, Others
//    var modifier = function(){$(this).attr('unselectable', 'on')};
//    if (removing) modifier = function(){$(this).removeAttr('unselectable')};
//    jqObj.each(modifier).find('*').each(modifier);
//};
//
///** keypress/keyupイベント時にFirefoxでエラーが発生しないようにjQueryを書き換える
//    挙動が若干変わるので注意、詳細は以下参照
//    ref) http://kjirou.sakura.ne.jp/mt/2012/02/jquery_firefoxkeydownkeyup.html */
//$f.modifyJQueryForStableKeyEvents = function(jQuery_){
//    jQuery_.event.keyHooks.props = "char key keyCode".split(" ");
//    jQuery_.event.keyHooks.filter = function(event, original){
//        // "keypress"
//        if (event.type === 'keypress') {
//            // jQuery original filter
//            if (event.which == null) {
//                event.which = original.charCode != null ? original.charCode : original.keyCode;
//            };
//        // "keydown", "keyup"
//        } else {
//            if (event.which == null) {
//                event.which = event.keyCode;
//            };
//        };
//        return event;
//    };
//};
//
///** ある長さに複数サイズの辺を並べた時に間隔が等間隔になる座標リストを返す
//    辺の合計の長さが全長に収まらない場合は、重なる部分が等間隔になる座標リストを返す
//    @param length num=全体の辺の長さ
//    @param sides arr=辺の長さリスト
//    @param options:
//             startPoint: true(default)=始点にも間隔を作る, false=作らない
//             endPoint: true(default)=右端にも間隔を作る, false=作らない
//    @return arr 最始点を0とした辺リストの始点リスト */
//$f.spacing = function(length, sides, options) {
//    var opts = options || {};
//    var points = [];
//    var total = $f.sum(sides);
//    var spaceCount = sides.length - 1;
//    var startPoint = ('startPoint' in opts)? opts.startPoint: true;
//    var endPoint = ('endPoint' in opts)? opts.endPoint: true;
//    var space;
//    // 全長に収まる
//    if (total <= length) {
//        if (startPoint) spaceCount += 1;
//        if (endPoint) spaceCount += 1;
//        if (spaceCount === 0) throw new Error('RPGMaterial:$f.spacing, none space');
//        space = (length - total) / spaceCount;
//        //! ここわかり難いけど、ループに入る前に1つ目の辺の座標を格納して
//        //  ループ内ではそれに 次の辺の長さ＋間隔 を足して次の辺の始点を格納している
//        //  sides.length - 1 と最後の辺をループに含まないのは、既に前ループで格納されているから
//        points.push(startPoint ? space: 0);
//        $f.times(sides.length - 1, function(t){
//            var idx = t - 1;
//            points.push(points[idx] + sides[idx] + space);
//        });
//    // 全長に収まらない
//    } else {
//        if (spaceCount === 0) throw new Error('RPGMaterial:$f.spacing, none space');
//        space = (length - total) / spaceCount;
//        points.push(0);
//        $f.times(sides.length - 1, function(t){
//            var idx = t - 1;
//            points.push(points[idx] + sides[idx] + space);
//        });
//    };
//    return points;
//};
//
///** 大きな矩形を一定サイズの矩形で分割した場合の座標リストを返す
//    @param partSize [width,height]
//    @param targetSize [width,height]
//    @param borderWidth 矩形と矩形の隙間幅, default=0
//    @return arr [[top,left], ...] の座標リスト, 左から右・上から下 の順 */
//$f.squaring = function(partSize, targetSize, borderWidth) {
//    if (borderWidth === undefined) borderWidth = 0;
//    var coords = [], top, left;
//    for (top = 0; targetSize[1] > top; top += partSize[1] + borderWidth) {
//        for (left = 0; targetSize[0] > left; left += partSize[0] + borderWidth) {
//            coords.push([top, left]);
//        };
//    };
//    return coords;
//};
//
///** 多次元配列を直列化する
//    @param mdArray 多次元配列 @param maxDimension 直列化する階層の深さ上限, default=2次元まで */
//$f.collapseMDArray = function(mdArray, maxDimension){
//    if (maxDimension === undefined) maxDimension = 2;
//    var seq = [];
//    (function(mdArray, dimension){
//        var i, v;
//        for (i = 0; i < mdArray.length; i++) {
//            v = mdArray[i];
//            if (v instanceof Array && dimension <= maxDimension) {
//                arguments.callee(v, dimension + 1);
//            } else {
//                seq.push(v);
//            };
//        };
//    })(mdArray, 2);
//    return seq;
//};
//
///** 矩形のデータマップ情報を表現したテキストを解析して2次元配列へ変換する
//    @param text 行と列それぞれが揃っているテキストデータ,1行は改行文字で表現される
//                ex) 'abc\ndef\nghi\njkl' は 行4x列3 のデータを表す
//                なお、配列を渡した場合は1要素に1行入っていると解釈される
//                ex) [['abc'],['def'],['ghi'],['jkl']] は上記と等価
//                基本は半角文字で使うことを想定しているが全角でも大丈夫なはず
//    @param allowedSymbols 許可されている文字,初期値はnullで全て許可されている状態
//    @return [[<2次元配列>], 広さ [列数,行数]] */
//$f.parseMapLikeText = function(text, allowedSymbols){
//    if (allowedSymbols === undefined) allowedSymbols = null;
//    if (text instanceof Array) text = text.join('\n');
//    text = $f.normalizeNewLineCharacters(text, {deleteLast:true});
//
//    var chrs = [[]];
//    var ri = 0; // 現在の行番号
//    var ci = 0; // 現在の列番号
//    var i, chr;
//    for (i = 0; i < text.length; i++) {
//        chr = text.slice(i, i + 1);
//        if (chr === '\n') {
//            ri += 1;
//            ci = 0;
//            chrs[ri] = [];
//        } else {
//            // 正しい記号かを判定
//            if (allowedSymbols !== null && $f.inArray(chr, allowedSymbols) === false) {
//                throw new Error('RPGMaterial:$f.parseMapLikeText, invalid symbol=`' + chr + '`');
//            };
//            chrs[ri][ci] = chr;
//            ci += 1;
//        };
//    };
//    // 矩形かをチェック
//    var columnCount = chrs[0].length;
//    for (i = 1; i < chrs.length; i++) {
//        if (columnCount !== chrs[i].length) {
//            throw new Error('RPGMaterial:$f.parseMapLikeText, not rectangle');
//        };
//    };
//    return [chrs, [columnCount, chrs.length]];
//};
//}}}
