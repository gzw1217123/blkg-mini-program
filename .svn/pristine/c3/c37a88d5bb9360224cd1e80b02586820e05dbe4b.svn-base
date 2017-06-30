var api = require('../../../utils/api.js')
var util = require('../../../utils/util.js')
var slide = require('../../../utils/slide.js')
var toast = require('../../../component/toast/index.js')

var app = getApp()

Page({
    target: 'mini-program/fav/song',
    data: {
        favData: [],
        imagePath: api.imgBase,
        defaultThumb: api.contextImgPath + 'fav/songlist/default.png'
    }, 
    onLoad: function (options) {

    },
    onReady: function () {
        // Do something when page ready.
    },
    onShow: function () {
        if (app.globalData.userInfo === undefined) {
            app.notificationCenter.register("login-notification", this, "initFavData");
        } else {
            this.initFavData({ userInfo: app.globalData.userInfo });
        }
        toast.bindPage(this);
        slide.bindPage(this, 'favData');
    },
    initFavData: function (loginData) {
        this.setData({
            userInfo: loginData.userInfo
        });
        this.getFavDataByPage();
    },
    current: 0,
    pageSize: 1000,
    totalPage: 1,
    totalData: -1,
    hasMore: function () {
        var result = false;
        if (this.totalData == -1 || this.data.favData.length < this.totalData) {
            result = true;
        }
        return result;
    },
    getNextPage: function () {
        if (this.hasMore()) {
            this.current++;
        }
        return this.current;
    },
    getFavDataByPage: function () {
        if (!this.hasMore()) {
            return;
        }
        var current = this.getNextPage();
        var that = this;
        api.post(api.API_URL + api.get_fav_song_list, {
            "userid": that.data.userInfo.unionId,
            "role": that.data.userInfo.role,
            "appVersion": api.appVersion,
            "type": 'songlist',
            "current": 1,
            "pageSize": that.pageSize * current,
        }).then(res => {
            if (res.data && res.statusCode == 200 && res.data) {
                var pb = res.data.pb;
                that.totalData = pb.rowCount;
                that.current = 1;
                var favData = that.data.favData;
                if (pb.dataList) {
                    favData = pb.dataList;
                    favData.forEach(function (e) {
                        if (e.thumb === '' || e.thumb === undefined) {
                            e.thumb = that.data.defaultThumb;
                        } else {
                            e.thumb = that.data.imagePath + e.thumb;
                        }
                    });
                    var temp = { favData: favData };
                    that.setData(temp);
                    console.log(JSON.stringify(favData))
                }
                if (that.data.favData.length == 0) {
                    that.showNoFavData(true);
                }
            }
        });
    },
    onReachBottom: function () {
        this.getFavDataByPage();
    },
    /*  
        show = true 则显示 没有歌曲提示 show = false 则反之
     */
    showNoFavData: function (show, pageData) {
        if (pageData) {
            pageData.hasNoFavSong = show == true ? true : false;
        } else {
            this.setData({ hasNoFavSong: show });
        }
    },
    removeFav: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (that.data.favData[index].code) {
            api.post(api.API_URL + api.remove_fav, {
                "userid": that.data.userInfo.unionId,
                "role": that.data.userInfo.role,
                "type": "songlist",
                "value": that.data.favData[index].code,
                "appVersion": api.appVersion
            }).then(res => {
                if (res.statusCode == 200 && res.data) {
                    if (that.data.favData.length <= 1) {
                        that.showNoFavData(true);
                    }
                    //如果删除前只剩一个
                    slide.deleteItem(index, that);
                    toast.showToast('取消收藏成功', 3000);
                }
            });
        } else {
            toast.showToast('取消收藏失败', 3000);
        }
    },
    toSonglist: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (slide.canClickItem(index, this) !== true) {
            return;
        }
        var code = e.currentTarget.dataset.code;
        e.currentTarget.dataset.parameter = '?code=' + code;
        e.currentTarget.dataset.page = 'songlist';
        util.toPage(e);
    },
    touchS: function (e) {
        slide.touchS(e, this);
    },
    touchM: function (e) {
        slide.touchM(e, this);
    },
    touchE: function (e) {
        slide.touchE(e, this);
    },
    globalTap: function (e) {
        slide.clearSlide(this);
    }
})