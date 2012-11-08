// vim: set foldmethod=marker :
/**
 * アプリケーション本体ファイル
 *
 * @charset utf-8
 * @dependency Sugar.js v1.3.6 <http://sugarjs.com/>
 *             jQuery v1.8.2 <http://jquery.com/>
 *             JSDeferred v0.4 <http://cho45.stfuawsc.com/jsdeferred/>
 */
//
// グローバル変数管理, ショートカット定義, グローバル設定等
//
//{{{
// ショートカット定義とグローバル変数確認
var $a;
var $c = FatmanTools;
var $d = function(){ if ($e.debug) return $c.apply(this, arguments) };
var $rpg = RPGMaterial;
var $f = $rpg.$functions;
FatmanTools.checkDependencies(['$e', '$a', '$f', '$c', '$d', '$rpg', '$', 'Deferred',
    'FatmanTools', 'ThreadManager', 'RPGMaterial']);
//}}}


/** アプリケーション本体 */
//{{{
$a = $rpg.Application.factory();

// 下層名前空間
$a.defineNameSpace('$buff');
$a.defineNameSpace('$character');
$a.defineNameSpace('$dialog');
$a.defineNameSpace('$dungeon');
$a.defineNameSpace('$enemy');
$a.defineNameSpace('$equipment');
$a.defineNameSpace('$gamewindow');
$a.defineNameSpace('$job');
$a.defineNameSpace('$page');
$a.defineNameSpace('$party');
$a.defineNameSpace('$race');
$a.defineNameSpace('$request');
$a.defineNameSpace('$skill');
$a.defineNameSpace('$spring');
$a.defineNameSpace('$storage');
$a.defineNameSpace('$text');
$a.defineNameSpace('$trap');
$a.defineNameSpace('$treasurebox');

// クラス
$a.define('Adventure');
$a.define('AI');
$a.define('Battle');
$a.define('Buff');
$a.define('Bufflist');
$a.define('Character');
$a.define('Clearbonus');
$a.define('Dialog');
$a.define('Dungeon');
$a.define('Enemy');
$a.define('Equipment');
$a.define('Equipmentset');
$a.define('Gamewindow');
$a.define('Image');
$a.define('Job');
$a.define('Page');
$a.define('Party');
$a.define('Player');
$a.define('Proclist');
$a.define('Race');
$a.define('Screen');
$a.define('Skill');
$a.define('Skilllist');
$a.define('Spring');
$a.define('Storage');
$a.define('Trap');
$a.define('Treasurebox');
$a.define('Warehouse');

// 唯一のオブジェクト
$a.define('adventure', null);
$a.define('adventurePage');
$a.define('barPage');
$a.define('characterWindow');
$a.define('institutionWindow');
$a.define('commandWindow');
$a.define('configPage');
$a.define('equipmentWindow');
$a.define('gatePage');
$a.define('homePage');
$a.define('img');
$a.define('menuWindow');
$a.define('player');
$a.define('party');
$a.define('partyWindow');
$a.define('screen');
$a.define('skillGainingWindow');
$a.define('skilllistWindow');
$a.define('storage');
$a.define('titlePage');
$a.define('warehouse');

// 共通処理
$a.define('catchError', function(err){// catch(err){func(err)} || deferred.error(func) 両方で使う
    if ($e.deviceType === 'sf') {
        $d('error =' + err);
        //$d('error.stack ='+ err.stack);// iPhoneだと無い
    } else {
        $d('error =', err);
        $d('error.stack =', err.stack);
    };
});
$a.define('alertSystemError', function(){// ユーザ側へ表示するアラートを出す
    alert($a.$text.system.system_error);
});
/** アニメ処理の基本待機時間を返す, 後でコンフィグで調整可能にする, 使う機会が多いのでここに定義した */
$a.define('getInterval', function(){
    var base = 666;
    return base / 1000;
});

// その他
$a.define('browser', $f.getBrowser());
$a.define('isIE', $f.isIE());
$a.define('isSF', $f.inArray($a.browser, ['iphone', 'android']));
$a.define('init');
$a.define('urlParams');
/** スタイル用フォントサイズ値を返す, Win/Macでずれないように'px'指定を強制するのと
    特定のサイズ以外は指定できないようにするため */
$a.define('fs', function(value){
    if ($f.inArray(value, [10, 12, 15, 18, 21, 24]) === false) {
        throw new Error('Error in $a.fs, invalid fontSize=' + value);
    };
    // Safari用調整, px指定でも実機だと大きさが違った
    // もしかしたら最小フォントサイズが違うのかもしれん、保留
    if ($a.browser === 'iphone') {
        if (value === 10) value = 9;
    };
    return value + 'px';
});
// マスタデータ関連
//! データとデータリストは性能のために相互に内部で読んで無いので変更があれば要同期
/** 当アプリのクラスを使ったデータ定義形式を元にマスタデータを生成する
    namespace ApplicationNamespaceインスタンス */
$a.define('createClassBasedMasterData', function(namespace, superClass, filter){
    var dict = {};
    $f.each(namespace, function(className, klass){
        if ($a.__isSubClass(namespace, className, superClass) === false) return;
        dict[className] = filter(className, klass);
    });
    return dict;
});
/** マスタデータをリストで生成する, 未ソートなのでラッパー側で行う */
$a.define('createClassBasedMasterDataList', function(namespace, superClass, filter){
    var list = [];
    $f.each(namespace, function(className, klass){
        if ($a.__isSubClass(namespace, className, superClass) === false) return;
        list.push(filter(className, klass));
    });
    return list;
});
/** 指定ネームスペースの値があるクラスのサブクラスかを判定する, 上記のみでの使用を想定 */
$a.define('__isSubClass', function(namespace, subClassName, superClass){
    if (namespace.hasOwnProperty(subClassName) === false) return false;
    var subClass = namespace.get(subClassName);
    return  subClass.prototype instanceof superClass;
});
$a.define('VERSION', '0.0');
$a.define('DEFAULT_JQUERY_FX_INTERVAL', $.fx.interval);// 13
$a.define('FASTEST_INTERVAL', $a.DEFAULT_JQUERY_FX_INTERVAL);// 最速フレームレート
$a.define('STABLE_INTERVAL', 34);// IE8に合わせた安定フレームレート
//}}}


/** プレイヤークラス */
$a.Player = (function(){
//{{{
    var cls = function(){

        /**
         * コンフィグデータ
         *
         * textSpeed: 1=普通(文字送り,速度デフォルトでIEはちょっと早め設定)
         *            2=速い(文字送り,速度1ms)
         *            3=とても速い(行送り,速度デフォルト)
         */
        this._configs = undefined;

        /** 資金, 0以上 */
        this.gp = undefined;

        /** 名声LV, 1-999, 1/10の値が冒険者最大LVになる */
        this.fameLv = undefined;
        /** 最後に取得した名声経験値による名声LVアップ情報, 一時的に格納してすぐ消す
            変な実装だけど考えた末仕方なくこうなった
            dataObj=ソース参照 | null=この値の場合は参照しない予定 */
        this._lastFameLvUpInfo = null;

        /** 酒場LV, 1-21LV, 39+LVが実効値, LV単体では表示されない */
        this.barLv = undefined;

        /** 倉庫LV, 1-121LV, 79+LVが実効値, LV単体では表示されない */
        this.warehouseLv = undefined;

        /** 宣伝LV, 1-2LV(1しか上がらない), LV単体では表示されない */
        this.publicityLv = undefined;

        /** 最後に来訪した冒険者のサーバ時間, ミリ秒
            2Hに満たない端数は残すのでその分過去時間になる */
        this._lastVisitedAdventurerAt = undefined;

        /** 最後に混沌化処理を行ったサーバ時間, ミリ秒 */
        this._lastChaosEmergingAt = undefined;

        /** 酒場の冒険者リスト */
        this._adventurers = [];

        /** 自分のダンジョンデータ, Dungeonクラスから直参照される */
        this._myDungeonData = undefined;
    };

    /** 開始直後の冒険者固定職業リスト, この数が冒険者数にもなる
        戦士系/冒険補助系/回復系/魔法攻撃系 がそれぞれ (メイン4人+サブ2人)*4セットの構成 */
    cls.STARTING_ADVENTURER_JOBS = [
        'FighterJob', 'FighterJob', 'FighterJob', 'FighterJob', 'KnightJob', 'ArcherJob',
        'HealerJob', 'HealerJob', 'HealerJob', 'HealerJob', 'ClericJob', 'ClericJob',
        'MageJob', 'MageJob', 'MageJob', 'MageJob', 'ShamanJob', 'AlchemistJob',
        'TheifJob', 'TheifJob', 'TheifJob', 'TheifJob', 'RangerJob', 'RangerJob'//,
    ];
    /** 最大来訪数, 一度で来訪できる冒険者の最大数 */
    cls.MAX_ONCE_VISIT_COUNT = 8;
    /** 基本冒険者来訪間隔, 単位:ms */
    cls.VISIT_INTERVAL = 4 * 60 * 60 * 1000; // 4hに1回
    //cls.VISIT_INTERVAL = 5000;
    /** 基本混沌化来訪間隔, 単位:ms */
    cls.CHAOS_EMERGING_INTERVAL = 8 * 60 * 60 * 1000;// 8hに1回
    /** 混沌化が起こるのに必要な名声LV */
    cls.CHAOS_EMERGING_NECESSARY_FAMELV = 250;

    function __INITIALIZE(self){
        self.gp = $rpg.$values.NumberValue.factory($a.storage.getData('gp'), {
            max: 999999,
            min: 0
        });
        //
        // 名声LVマップ設定
        //
        // 値の根拠を言葉で説明すると以下となる
        //   a) 名声LVが100の時に、DLV10のフロアを10回移動すると1上昇する
        //   b) 後半になるに従いn倍まで上がりにくくなる
        //
        // もちろん、名声LVとDLVの比が異なれば、その分だけ上昇率は変わる
        // 例えば、名声LV=200:DLV=10 なら 20回移動 が必要だし
        //         名声LV=100:DLV=20 なら  5回移動 だけで良い
        //
        // 名声LVの経験値取得側で、1F移動時=DLV ということになっている
        // 下記advLv変数は、その値を示している
        //
        // 初期LVまで経験値を与えて変更しようと思ったが、そうするとマップ変更時に初期経験値も
        // 変更する必要が出てくるので止めた。初期LV未満に下がらなくなる点はスルーする
        //
        self.fameLv = $rpg.LvManager.factory();
        self.fameLv.setLvMap(999, function(nextLv){
            //0) この初期レベルは保障されている
            var defaultLv = 30;
            if (nextLv <= defaultLv) return 0;
            //1) この難易度のフロアを..
            var advLv = nextLv / 10;
            //2) この回数移動したら..
            var floorCount = 10;
            //3) 最後はこの倍率まで上がり難くなるけど..
            var maxRate = 10;
            var rate = ((maxRate - 1) * (1 + nextLv) / 1000) + 1.0;
            // ..上昇します！ という式
            return Math.ceil(advLv * floorCount * rate);
        });
        self.fameLv.gainExp($a.storage.getData('fame_exp'));

        self.barLv = $rpg.LvManager.factory();
        self.barLv.setLvMap(21, function(){ return 1 });
        self.barLv.gainExp($a.storage.getData('bar_exp'));

        self.warehouseLv = $rpg.LvManager.factory();
        self.warehouseLv.setLvMap(121, function(){ return 1 });
        self.warehouseLv.gainExp($a.storage.getData('warehouse_exp'));

        self.publicityLv = $rpg.LvManager.factory();
        self.publicityLv.setLvMap(2, function(){ return 1 });
        self.publicityLv.gainExp($a.storage.getData('publicity_exp'));

        self._lastVisitedAdventurerAt = $a.storage.getData('last_visited_adventurer_at');
        self._lastChaosEmergingAt = $a.storage.getData('last_chaos_emerging_at');
        self._configs = $a.storage.getData('config');
        $a.Dungeon.initializeData(self);
    };

    // 資金関係
    /** 支払いをする, 0未満にならないための制約をしたいだけのメソッド */
    cls.prototype.payGp = function(cost){
        if (cost > this.gp.get()) {
            throw new Error('Error in Player.payGp, not enough gp');
        };
        this.gp.delta(-cost);
    };

    // 名声LV関係
    cls.prototype.getLastFameLvUpInfo = function(){ return this._lastFameLvUpInfo };
    cls.prototype.setLastFameLvUpInfo = function(exp, beforeLv, afterLv){
        this._lastFameLvUpInfo = {
            exp: exp, // 獲得経験値, int
            lvUpCount: afterLv - beforeLv // LV上昇数, int
        };
    };
    cls.prototype.clearLastFameLvUpInfo = function(){ this._lastFameLvUpInfo = null };

    // 冒険者関係
    /** 冒険者リストを返す */
    cls.prototype.getAdventurers = function(){ return this._adventurers };
    /** 定型ソートを行う */
    cls.prototype.sortAdventurers = function(){
        // 二次ソート: LV降順
        this._adventurers.sort(function(a, b){
            return b.lv.getLv() - a.lv.getLv();
        // 一次ソート: 職種順
        }).sort(function(a, b){
            var aJobClass = $a.$job.get(a.job.className);
            var bJobClass = $a.$job.get(b.job.className);
            return aJobClass.order - bJobClass.order;
        });
    };
    /** 冒険者最大格納数を返す */
    cls.prototype.getMaxAdventurerCount = function(){
        return 39 + this.barLv.getLv();
    };
    /** 酒場を次LVへ拡張するための必要資金を返す, @return 1以上 | false=これ以上拡張出来ない*/
    cls.prototype.getNextBarExtensionCost = function(){
        var lv = this.barLv.getLv();
        if (lv === this.barLv.getLvCap()) return false;
        return lv * 500;
    };
    /** 冒険者リストへ冒険者を追加する */
    cls.prototype.addAdventurer = function(adv){
        this._adventurers.push(adv);
    };
    /** 冒険者リストをから指定冒険者を抜く */
    cls.prototype.removeAdventure = function(adv){
        var idx = $f.indexOf(adv, this._adventurers);
        if (idx === -1) {
            throw new Error('Error in Player.removeAdventure, not exist adventure=' + adv);
        };
        this._adventurers.splice(idx, 1);
    };
    /** 名声LVから生成冒険者の最大LVを小数で返す, @return float */
    cls.prototype.getMaxAdventurerLv = function(){
        return $f.withinNum(this.fameLv.getLv() / 10, 1.0, 99.9);
    };
    /** 新しい冒険者を名声考慮のランダム生成をして追加する
        jobClassName str | null
        lv int | null
        @return adv */
    cls.prototype.addNewAdventurer = function(jobClassName, lv){
        var adv = $a.$character.Adventurer.factory();
        adv.bornRandom(jobClassName);
        adv.growRandom(lv);
        adv.fullHealed();
        adv.fullMpHealed();
        this._adventurers.push(adv);
        return adv;
    };
    /** 冒険者来訪間隔を返す */
    cls.prototype.getVisitInterval = function(){
        var t = cls.VISIT_INTERVAL;
        if (this.publicityLv.getLv() >= 2) t *= 0.75;
        return t;
    };
    /** 冒険者来訪処理を行う, セーブは含まない
        @return num 新規来訪者数 */
    cls.prototype.visitedAdventurers = function(){
        var self = this;
        var isInit = (this._lastVisitedAdventurerAt === 0);// true=初期化時
        var cnt = (isInit)? cls.STARTING_ADVENTURER_JOBS.length: this.getVisitableAdventurerCount();

        // 来訪者無しの場合はここで終了、時間更新も無し
        if (cnt === 0) return 0;

        // 冒険者生成と追加, 最大値はcnt算出時に考慮されている
        $f.times(cnt, function(t){
            var idx = t - 1;
            var jobClassName = null;
            if (isInit) jobClassName = cls.STARTING_ADVENTURER_JOBS[idx];
            self.addNewAdventurer(jobClassName, null);
        });

        // 最終来訪時刻を更新
        var serverTime = $a.storage.getServerTime();
        var lastTime = $a.storage.getData('last_visited_adventurer_at');
        var limitLastTime = serverTime - this.getVisitInterval() * cls.MAX_ONCE_VISIT_COUNT;
        // 来訪時刻を更新
        // a) 初期は必ず現在時刻へ更新
        if (lastTime === 0) {
            this._lastVisitedAdventurerAt = $f.withinNum(serverTime, 1);
        // b) それ以外は、来訪人数分だけ時間を加算
        } else {
            var consume = cnt * this.getVisitInterval();
            this._lastVisitedAdventurerAt = $f.withinNum(this._lastVisitedAdventurerAt + consume, 1);
            // 来訪者数ストック人数が多過ぎる場合は、ストック時間を切り捨てる
            if (this._lastVisitedAdventurerAt < limitLastTime) {
                this._lastVisitedAdventurerAt = limitLastTime;
            };
        };

        return cnt;
    };
    /** 来訪待ちの冒険者数を返す, 最大来訪数や最大冒険者数もデフォルト考慮
        options.isAppliedMaxAdventurerCount false=最大冒険者数を考慮しない */
    cls.prototype.getVisitableAdventurerCount = function(options){
        var opts = options || {};
        var isAppliedMaxAdventurerCount = ('isAppliedMaxAdventurerCount' in opts)?
            opts.isAppliedMaxAdventurerCount: true;

        if (this._lastVisitedAdventurerAt === 0) {// 初期状態
            return cls.STARTING_ADVENTURER_JOBS.length;
        };
        var cnt = ~~(($a.storage.getServerTime() - this._lastVisitedAdventurerAt) / this.getVisitInterval());
        // 最大来訪数で切捨て
        cnt = $f.withinNum(cnt, 0, cls.MAX_ONCE_VISIT_COUNT);
        // 最大冒険者数で切捨て
        if (isAppliedMaxAdventurerCount) {
            var advCount = this._adventurers.length;
            cnt = $f.withinNum(cnt + advCount, 0, this.getMaxAdventurerCount()) - advCount;
        };
        return cnt;
    };
    /** 最終来訪時刻を返す */
    cls.prototype.getLastVisitedAdventurerAt = function(){
        return this._lastVisitedAdventurerAt;
    };
    /** 冒険者リストをpickleする */
    cls.prototype.pickleAdventurers = function(){
        var json = [];
        $f.each(this._adventurers, function(nouse, adv){
            json.push(adv.pickle());
        });
        return json;
    };
    /** 冒険者リストをunpickleする */
    cls.prototype.unpickleAdventurers = function(){
        var self = this;
        $f.each($a.storage.getData('adventurer'), function(nouse, data){
            var adv = $a.$character.Adventurer.factory();
            adv.unpickle(data);
            self.addAdventurer(adv);
        });
    };

    // 混沌化関係
    /** 最終混沌化発生時間を返す */
    cls.prototype.getLastChaosEmergingAt = function(){
        return this._lastChaosEmergingAt;
    };
    /** 混沌化処理が時間経過により有効になったかを判定する */
    cls.prototype._isEnabledChaosEmerging = function(){
        var serverTime = $a.storage.getServerTime();
        return serverTime > this.getLastChaosEmergingAt() + cls.CHAOS_EMERGING_INTERVAL;
    };
    /** 混沌化処理を行う, 実行判定含む
        @return ['<新しく混沌化したダンジョンクラス名>' | null, '<解除されたクラス名>' | null] */
    cls.prototype.executeChaosEmerging = function(){
        var result = [null, null];
        // 発生しない場合
        if (
            this._isEnabledChaosEmerging() === false ||
            this.fameLv.getLv() < cls.CHAOS_EMERGING_NECESSARY_FAMELV
        ) return result;
        // 対象となり得るダンジョンクラス名と、既に混沌化しているそれを取得
        var targets = [];
        var chaoses = [];
        $f.each($a.Dungeon.getData(), function(className, data){
            if (data.isChaotic) {
                chaoses.push(className);
            } else if (data.clearCount > 0) {
                targets.push(className);
            };
        });
        // 混沌化対象と解除対象を選択
        var target = null;
        if (targets.length > 0) target = $f.randChoice(targets);
        var disabled = null;// 3つ以上混沌化していたら解除する
        if (chaoses.length > 0 && chaoses.length >= 3) disabled = $f.randChoice(chaoses);
        // フラグ更新
        if (target !== null) $a.Dungeon.getData()[target].isChaotic = true;
        if (disabled !== null) $a.Dungeon.getData()[disabled].isChaotic = false;
        result[0] = target;
        result[1] = disabled;
        // 時間更新
        this._lastChaosEmergingAt = $a.storage.getServerTime();
        return result;
    };

    // 倉庫/袋関係
    /** 倉庫最大容量を返す */
    cls.prototype.getMaxStoreCount = function(){
        return 79 + this.warehouseLv.getLv();
    };
    /** 倉庫を次LVへ拡張するための必要資金を返す, @return 1以上 | false=これ以上拡張出来ない*/
    cls.prototype.getNextWarehouseExtensionCost = function(){
        var lv = this.warehouseLv.getLv();
        if (lv === this.warehouseLv.getLvCap()) return false;
        return lv * 50;
    };

    // 宣伝LV関係
    /** 宣伝を次LVへ拡張するための必要資金を返す, @return 1以上 | false=これ以上拡張出来ない*/
    cls.prototype.getNextPublicityExtensionCost = function(){
        var lv = this.publicityLv.getLv();
        if (lv === this.publicityLv.getLvCap()) return false;
        return 5000; //! とりあえず1LVしか上げられないので固定
    };

    cls.prototype.getConfigs = function(){
        if (this._configs === undefined) {// これは初期化前に呼んだ場合にありがちなので配慮した
            throw new Error('Error in Player.getConfig, not formatted configs');
        };
        return this._configs;
    };
    cls.prototype.getConfig = function(key){
        if (key in this._configs === false) {
            throw new Error('Error in Player.getConfig, not defined key=' + key);
        };
        return this._configs[key];
    };
    cls.prototype.setConfig = function(key, value){
        if (key === 'userBGMVolumeRate' || key === 'userSEVolumeRate') {
            value = $f.withinNum(value, 0.1, 5.0);
        } else if (key === 'textSpeed') {
            value = $f.withinNum(value, 1, 3);
        };
        this._configs[key] = value;
    };
    ///** 現在のコンフィグデータを即時反映する
    //    this._configs を変えるだけでは反映しないものもあるため */
    //cls.prototype.applyConfigs = function(){
    //    // 音関係
    //    $a.Sound.applyPlayerConfigs();
    //};


    // 外部環境による所与の値群, !格納後は変更不可
    ///** mixiのユーザID */
    //cls.mixiId = null;
    ///** mixiのユーザID */
    //cls.mixiNickname = '';
    /** クッキー保存用キー名 */
    cls.COOKIE_KEY_PID = 'rh__pid';
    /** WebゲストのPIDサフィックス, プレフィックスでないのは
        EasyKVSのデータファイル保存場所振り分け機能が無意味になるから */
    cls.AUTO_PID_SUFFIX = '_at';

    /** 外部環境へのログイン処理を行う, URLパラメータ解析も概ねここで行う
        とりあえずはmixiアプリと連携する処理を書きたかった */
    cls.login = function(){
        // ストレージのユーザ名を取得しクッキーへ保存
        var cookiePid = $rpg.Cookie.cookie(cls.COOKIE_KEY_PID);
        if ('pid' in $a.urlParams) {
            $e.easykvsPersonId = $a.urlParams.pid;
        } else if (typeof cookiePid === 'string') {
            $e.easykvsPersonId = cookiePid;
        } else {
            $e.easykvsPersonId = $f.randStr(6) + cls.AUTO_PID_SUFFIX;
        };
        $rpg.Cookie.cookie(cls.COOKIE_KEY_PID, $e.easykvsPersonId, { expires:730 });
        // GETパラメータを消すためにリダイレクト
        if ('pid' in $a.urlParams) {
            //! Deferred.wait()を返して遅延させているのは、次のstorage関係の処理をすぐ実行してしまうと
            //  リダイレクトでリクエストを中断してしまってそれがエラーになることがあるため
            //  Chromeでしか確認できてないが毎回発生する
            //! それが無くても次処理群を遅延させる方が優秀
            return Deferred.next(function(){
                location.href = '.';
                return Deferred.wait(10.0);
            });
        };
        //// 外部連携
        //var d;
        //if ($e.appType === 'mixiapp') {
        //    d = new Deferred();
        //    $rpg.$trials.MixiappUtils.start({
        //        complete: function(dataSet){
        //            cls.mixiId = dataSet.viewerId;
        //            cls.mixiNickname = dataSet.nickname;
        //            d.call();
        //        }
        //    });
        //    return d;
        //};
        return Deferred.next();
    };


    cls.factory = function(){
        var obj =  new this();
        __INITIALIZE(obj);
        return obj;
    };

    return cls;
//}}}
})();


/** 画面クラス */
$a.Screen = (function(){
//{{{
    var cls = function(){

        /** 現在表示中のページ */
        this._currentPage = null;
    };
    $f.inherit(cls, new $rpg.Block());
    cls.prototype.toString = function(){ return 'Screen' };

    // ウィンドウは-1した直下にカバーが掛かる
    cls.ZINDEXES = {};
    cls.ZINDEXES.DIALOG = 50000;
    cls.ZINDEXES.BATTLEDAMAGE = 30000;
    cls.ZINDEXES.SKILLGAININGWINDOW = 20400;
    cls.ZINDEXES.SKILLLISTWINDOW = 20300;
    cls.ZINDEXES.EQUIPMENTWINDOW = 20200;
    cls.ZINDEXES.INSTITUTIONWINDOW = 20100;
    cls.ZINDEXES.GAMEWINDOW = 20000;
    cls.ZINDEXES.PAGE = 10000;

    /** 定型メインカラー */
    cls.COLORS = {};
    //cls.COLORS.NORMAL = '#FAFAFA';
    cls.COLORS.NORMAL = '#000';
    cls.COLORS.GOOD = '#33CC33';
    cls.COLORS.BAD = '#FF0000';
    cls.COLORS.INACTIVE = '#666666';
    cls.COLORS.NOTICE = '#FFFF00';
    cls.COLORS.QUIET = '#CCCCCC';

    /** 定型スタイル */
    cls.STYLES = {};
    //cls.STYLES.CHARACTER_CHIP_DISPLAY = { position:'absolute',top:0,left:0,width:32,height:32 };
    //cls.STYLES.CHARACTER_CHIP_IMAGE_FROMT = { position:'absolute',top:0,left:-32,width:96,height:128 };

    function __INITIALIZE(self){
        self.getView().attr({ id:'screen' });
    };

    /** 現在のページを初期化しつつ描画する, 一度だけしか行えない, 描画はshow固定 */
    cls.prototype.drawAndInitializingPage = function(page){
        if (this._currentPage !== null) {
            throw new Error('Error in Screen.initializeCurrentPage, already set');
        };
        this._currentPage = page;
        page.show();
    };

    /** 現ページを返す, 単なるアクセサ */
    cls.prototype.getCurrentPage = function(){ return this._currentPage };

    /** ページ移動を行う
        @param nextPage 別のPageオブジェクト
        @param animationMode str='fade'(default) || 'none'
        @return deferred */
    cls.prototype.movePage = function(nextPage, animationMode /* var args */){
        var self = this;
        animationMode = animationMode || 'none';
        // フェードアニメ有り
        if (animationMode === 'fade') {
            var duration = arguments[2] || 400; // ms
            this.drawCover('move_page');
            var anim = $rpg.$animations.FadeChangeAnimation.factory(this._currentPage, nextPage, duration);
            return anim.run().next(function(){
                self._currentPage = nextPage;
                $a.menuWindow.drawCurrentPageTitle();
                self.clearCover('move_page');
                return Deferred.next();
            });
        // アニメ無し
        } else {
            // 次ページが自ページ下で表示中の状態にしてから自分を隠す
            this._currentPage.drawSettingZIndex($rpg.$consts.ZINDEX_TOP);
            this._currentPage.show();
            nextPage.drawSettingZIndex();
            nextPage.show();
            this._currentPage.hide();
            this._currentPage.drawSettingZIndex();
            this._currentPage = nextPage;
            $a.menuWindow.drawCurrentPageTitle();
            return Deferred.next();
        };
    };

    /** ボタン用ブロックを生成する */
    cls.button = function(sizeOrSizeType, text, options){
        var opts = options || {};
        var size = sizeOrSizeType;
        var fontSize = ('fontSize' in opts)? opts.fontSize: $a.fs(18);
        if (size === 'wide_middle') {
            size = [160, 66];
            fontSize = $a.fs(24);
        } else if (size === 'square_middle') {
            size = [66, 66];
            fontSize = $a.fs(21);
        } else if (size === 'square_small') {
            size = [44, 44];
            fontSize = $a.fs(15);
        } else if (size === 'perthree') {
            size = [106, 44];
            fontSize = $a.fs(15);
        } else if (size === 'perfive') {
            size = [64, 44];
            fontSize = $a.fs(15);
        };
        var frame = $rpg.block(size);
        $f.toUnselectable(frame.getView());
        frame.text(text);
        frame.style({ lineHeight:size[1]+'px', fontSize:fontSize, letterSpacing:0, textAlign:'center',
            color:cls.COLORS.NORMAL, bg:'#FF6600', cursor:'pointer' });
        return frame;
    };

    /**
     * 切替可能ボタンを生成する
     * @param arr dataList 各要素=['button_key', 'ラベル']
     * @return ブロック, いくつか特異プロパが付いている、ソース内参照
     */
    cls.switchableButton = function(dataList){

        // ブロック生成
        var frameSize = [152, 44]; // 152 = 44 + 64 + 44
        var frame = $rpg.block(frameSize);
        var leftButton = cls.button('square_small', '<');
        var rightButton = cls.button('square_small', '>');
        var centerButton = cls.button('perfive', '');
        frame.append(leftButton);
        frame.append(rightButton);
        frame.append(centerButton);
        leftButton.pos([null, 'left']);
        rightButton.pos([null, 'right']);
        centerButton.pos([null, 'center']);
        leftButton.drawAndShow();
        rightButton.drawAndShow();
        centerButton.drawAndShow();

        frame.___orgDataList___ = $rpg.JSONUtils.deepcopy(dataList);
        frame.___dataList___ = $rpg.JSONUtils.deepcopy(frame.___orgDataList___);
        frame.___currentButtonIndex___ = 0;
        /** 選択中ボタンキーを返す */
        frame.getCurrentButtonKey = function(){
            return this.___dataList___[frame.___currentButtonIndex___][0];
        };
        /** 中央ボタンを返す, イベント登録やスタイル変更時に使う */
        frame.getCenterButton = function(){
            return centerButton;
        };
        /** 中央ボタンを描画する */
        function __drawCenterButton(){
            centerButton.text(frame.___dataList___[frame.___currentButtonIndex___][1]);
        };
        /** 指定ボタンを選択中する */
        frame.changeSelectedButton = function(buttonKey){
            var self = this;
            $f.each(this.___dataList___, function(i, v){
                if (buttonKey === v[0]) {
                    self.___currentButtonIndex___ = i;
                    __drawCenterButton();
                    return false;
                };
            });
        };
        /** 指定ボタンキーのボタンを非表示にする, 1つは表示されてないとエラー
            buttonKeys arr 非表示にするボタンキーリスト */
        frame.disableButtons = function(buttonKeys){
            this.___dataList___ = $f.collect(this.___orgDataList___, function(i, v){
                if ($f.inArray(v[0], buttonKeys)) return;
                return v;
            });
            this.___currentButtonIndex___ = 0;
            __drawCenterButton();
        };
        /** 指定ボタンキーのボタンのみ表示する, 上記の逆 */
        frame.activateButtons = function(buttonKeys){
            this.___dataList___ = $f.collect(this.___orgDataList___, function(i, v){
                if ($f.inArray(v[0], buttonKeys)) return v;
            });
            this.___currentButtonIndex___ = 0;
            __drawCenterButton();
        };
        /** 初期状態にする */
        frame.resetButtons = function(){
            this.___currentButtonIndex___ = 0;
            this.___dataList___ = $rpg.JSONUtils.deepcopy(this.___orgDataList___);
            __drawCenterButton();
        };

        // 左右ボタンのイベント登録
        leftButton.bindEvent('touch', {}, function(evt){
            var len = frame.___dataList___.length;
            frame.___currentButtonIndex___ = (frame.___currentButtonIndex___ - 1 + len) % len;
            __drawCenterButton();
        });
        rightButton.bindEvent('touch', {}, function(evt){
            var len = frame.___dataList___.length;
            frame.___currentButtonIndex___ = (frame.___currentButtonIndex___ + 1) % len;
            __drawCenterButton();
        });
        // 中央ボタン描画
        __drawCenterButton();

        return frame;
    };

    /** 主にボタンセット格納用の横バーを生成する, デフォルトはページ内でパーティ窓直上位置へ設定 */
    cls.bar = function(){
        var height = 44;
        var frame = $rpg.block([$a.screen.getWidth(), height],
            [$a.screen.getHeight() - $a.$gamewindow.PartyWindow.HEIGHT - height - 4, 0]);
        return frame;
    };

    /** メニュー/ページ下部バー/パーティ窓 を除く位置に表示するブロックを生成する
        options.noneBar true=下部バーなしで計算 */
    cls.pagemain = function(options){
        var opts = options || {};
        // 余白込みの幅を算出
        var menuHeight = $a.$gamewindow.MenuWindow.HEIGHT + 4;
        var barHeight = 4 + 44;
        if (opts.noneBar === true) barHeight = 0;

        var frame = $rpg.block([
            $a.screen.getWidth(),
            416 - menuHeight - barHeight - 4 - $a.$gamewindow.PartyWindow.HEIGHT
        ], [
            menuHeight, 0
        ]);
        return frame;
    };

    /** ウィンドウ用パラメータ表示ブロックを生成する
        ショートカット＆当アプリの共通設定を入れるために定義 */
    cls.parameter = function(type, factoryArgs){
        var p, klass = $rpg.$trials.ParameterDisplayBlock;
        if (type === 'single') {
            p = klass.factorySingle.apply(klass, factoryArgs);
        } else if (type === 'with_max') {
            p = klass.factoryWithMax.apply(klass, factoryArgs);
        };
        p.style({ fontSize:$a.fs(12) });
        p.extendColors({
            normal: cls.COLORS.NORMAL,
            good: cls.COLORS.GOOD,
            bad: cls.COLORS.BAD,
            inactive: cls.COLORS.INACTIVE,
            notice: cls.COLORS.NOTICE//,
        });
        return p;
    };

    /** 画像文字列を生成する
        @param type '5x11' || '16x16' || '16x16-green' */
    cls.imageText = function(type, textLength, options){
        var opts = options || {};
        var b;
        if (type === '5x11') {
            b = $rpg.$trials.ImageTextBlock.factory([5, 11], textLength, null, opts);
            $f.each('0 1 2 3 4 5 6 7 8 9'.split(' '), function(idx, cha){
                b.setImage(cha, $a.img.get('font_5x11', idx + 1));
            });
        } else if (type === '16x16' || type === '16x16-green') {
            var imgIdxKey = (type === '16x16')? 'font_fz': 'font_fz_green';
            b = $rpg.$trials.ImageTextBlock.factory([16, 16], textLength, null, opts);
            $f.each('0 1 2 3 4 5 6 7 8 9 ! *'.split(' '), function(idx, cha){
                b.setImage(cha, $a.img.get(imgIdxKey, idx + 1));
            });
        };
        return b;
    };


    /** 冒険後の描画一式を行う */
    cls.drawAfterAdventure = function(){
        $a.homePage.draw();
        $a.configPage.draw();
        $a.barPage.draw();
        $a.gatePage.draw();
        $a.menuWindow.switchButtons('normal');
        $a.partyWindow.draw();
    };


    cls.factory = function(){
        var size = [320, 416]; //! CSSと要同期
        var pos = [0, 0];
        var obj = $rpg.Block._factory.apply(this, [size, pos]);
        __INITIALIZE(obj);
        return obj;
    };

    return cls;
//}}}
})();


/** 初期化処理 */
$a.init = function(){
//{{{
Deferred.next(function(){// (1)ログインとそれまでに必要な処理


if ($e.appType === 'mixiapp') {
    if ($e.deviceType === 'pc') {
        mixi.init({
            appId: $e.mixiappGraphAPIConsumerKey,
            relayUrl: './connect.html'
        });
    } else if ($e.deviceType === 'sf') {
        mixi.init({
            appId: $e.mixiappGraphAPIConsumerKey
        });
    };
};

$a.urlParams = $f.parseUrlToParameters(document.URL);

return $a.Player.login();


}).next(function(){// (2)ストレージ初期化


$a.storage = $a.$storage.EasyKVSStorage.factory();
return $a.storage.start();


}).next(function(){// (3)本処理, 主に唯一のインスタンス生成と描画


if ($e.appType === 'mixiapp') {
    if ($e.deviceType === 'pc') {
        gadgets.window.adjustHeight(600); //! cssと要同期
    } else if ($e.deviceType === 'sf') {
        gadgets.window.adjustHeight(416); //! cssと要同期
    };
};


$a.img = $a.Image.createImageIndexer();

$a.player = $a.Player.factory();
$a.player.unpickleAdventurers();

$a.party = $a.$party.PlayerParty.factory();
$a.party.unpickle();

$a.warehouse = $a.Warehouse.factory();
$a.warehouse.unpickle();

$a.screen = $a.Screen.factory();
$a.screen.draw();
$a.screen.getView().appendTo($('#gamecontainer'));

$a.menuWindow = $a.$gamewindow.MenuWindow.factory();
$a.screen.append($a.menuWindow);
$a.menuWindow.draw();

$a.partyWindow = $a.$gamewindow.PartyWindow.factory();
$a.screen.append($a.partyWindow);
$a.partyWindow.draw();

$a.characterWindow = $a.$gamewindow.CharacterWindow.factory();
$a.screen.append($a.characterWindow);
$a.characterWindow.draw();

$a.equipmentWindow = $a.$gamewindow.EquipmentWindow.factory();
$a.screen.append($a.equipmentWindow);
$a.equipmentWindow.draw();

$a.skilllistWindow = $a.$gamewindow.SkilllistWindow.factory();
$a.screen.append($a.skilllistWindow);
$a.skilllistWindow.draw();

$a.commandWindow = $a.$gamewindow.CommandWindow.factory();
$a.screen.append($a.commandWindow);
$a.commandWindow.draw();

$a.institutionWindow = $a.$gamewindow.InstitutionWindow.factory();
$a.screen.append($a.institutionWindow);
$a.institutionWindow.draw();

$a.skillGainingWindow = $a.$gamewindow.SkillGainingWindow.factory();
$a.screen.append($a.skillGainingWindow);
$a.skillGainingWindow.draw();

$a.titlePage = $a.$page.TitlePage.factory();
$a.screen.append($a.titlePage);
$a.titlePage.draw();

$a.configPage = $a.$page.ConfigPage.factory();
$a.screen.append($a.configPage);
$a.configPage.draw();

$a.homePage = $a.$page.HomePage.factory();
$a.screen.append($a.homePage);
$a.homePage.draw();

$a.barPage = $a.$page.BarPage.factory();
$a.screen.append($a.barPage);
$a.barPage.draw();

$a.gatePage = $a.$page.GatePage.factory();
$a.screen.append($a.gatePage);
$a.gatePage.draw();

$a.adventurePage = $a.$page.AdventurePage.factory();
$a.screen.append($a.adventurePage);
$a.adventurePage.draw();

$a.screen.drawAndInitializingPage($a.titlePage);
$a.screen.show();

//$a.player.sendAccessLog('login');

return Deferred.next();

//----------------------------
// 開発用処理
}).next(function(){
    if ($e.debug && $e.deviceType === 'pc') {
        FatmanTools.getTester('rh_auto').test();
    };
    $d('Completed deferred');
}).error(function(err){
    $d('Error in $a.init');
    //if ($e.debug) {
    //    // データ不整合による初期化失敗時のデータ削除分岐, 主にスマホ用
    //    if (confirm('Error in init\nDelete save data?')) {
    //        $a.$request.EasyKVSRemoveRequest.factory().execute().next(function(){
    //            alert('Deleted');
    //        });
    //    };
    //};
    $a.catchError(err);
});
//}}}
};
