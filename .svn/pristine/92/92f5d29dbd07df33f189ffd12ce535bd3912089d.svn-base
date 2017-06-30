var api = require('../../../utils/api.js')
var util = require('../../../utils/util.js')
var slide = require('../../../utils/slide.js')
var toast = require('../../../component/toast/index.js')

var app = getApp()

Page({
    target: 'mini-program/fav/songlist',
    data: {
        favData:[]
    },
    onLoad: function (options) {

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
        this.getFavDataByPage()
    },
    current: 0,
    pageSize: 1000,
    totalPage: 1,
    totalData: -1,
    hasMore: function() {
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
    getFavDataByPage: function() {
        if(!this.hasMore()) {
            return;
        }
        var current = this.getNextPage();
        var that = this;
        api.post(api.API_URL + api.get_fav_song, {
            "userid": that.data.userInfo.unionId,
            "role": that.data.userInfo.role,
            "appVersion": api.appVersion,
            "platform": api.platform,
            "current": 1,
            "pageSize": that.pageSize * current,
            "pageable": true,
        }).then(res => {
            if (res.data && res.statusCode == 200 && res.data) {
                var pb = res.data.pb;
                that.totalData = pb.rowCount;
                var favData = [];
                if (pb.dataList) {
                    favData = pb.dataList;
                    var temp = { favData: favData };
                    that.setData(temp);
                }
            }
            if (that.data.favData.length == 0) {
                that.showNoFavData(true);
            }
        });
    },
    onReachBottom: function () {
        this.getFavDataByPage();
    },
    /*  
        show = true 则显示 没有歌曲提示 show = false 则反之
     */
    showNoFavData: function(show, pageData) {
        if(pageData) {
            pageData.hasNoFavSong = show == true ? true : false;
        } else {
            this.setData({ hasNoFavSong: show });
        }
    },
    removeFav: function(e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (that.data.favData[index].code) {
            api.post(api.API_URL + api.remove_fav, {
                "userid": that.data.userInfo.unionId,
                "role": that.data.userInfo.role,
                "type": "song",
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
    chooseSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (slide.canClickItem(index, this) !== true) {
            return;
        }
        var connected = app.globalData.connected;
        if (connected === true) {
            var index = e.currentTarget.dataset.index;
            var favData = this.data.favData;
            if (favData && favData[index] && favData[index].selected !== true) {
                api.post(api.API_URL + api.add_song, {
                    "userid": app.globalData.connectedInfo.unionId,
                    "role": app.globalData.connectedInfo.role,
                    "mp": "default",
                    "code": favData[index].code,
                    "source": that.target,
                    "sourceType": "column",
                    "metadataType": "program",
                    //业务中设置默认true
                    "charge": true,
                    //业务中设置默认true
                    "dolog": true,
                    //业务中设置默认true
                    "cachable": true,
                    "enablePrevNext": false,
                    "andPlay": false,
                    "display": "fullscreen",
                    "mode": "listCycleOnce",
                    "menu": "",
                    "toTop": true
                }).then(res => {
                    if (res.statusCode == 200 && res.data) {
                        if (res.data.code == 0) {
                            that.data.favData[index].selected = true;
                            that.setData({ favData: that.data.favData });
                            toast.showToast('加入已点成功', 3000);
                        } else {
                            toast.showToast(res.data.text, 3000);
                        }
                    } else {
                        toast.showToast('加入已点失败', 3000);
                    }
                });
            } else {
                toast.showToast('该歌曲已经加入已点列表', 3000);
            }
        } else {
            this.goConnect();
        }
    }, 
    goConnect: function (e) {
        slide.clearSlide(this);
        wx.navigateTo({
            url: '/pages/connect_help/index'
        });
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