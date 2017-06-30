  var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var slide = require('../../utils/slide.js')
var toast = require('../../component/toast/index.js')

var app = getApp();
Page({
    data: {
        imgBase: api.imgBase,
        userInfo: app.globalData.userInfo
    },

    currentPage: 'mini-program/recommend',
    toSonglist: function (e) {
        var code = e.currentTarget.dataset.code;
        e.currentTarget.dataset.parameter = '?code=' + code;
        util.toPage(e);
    },
    //使用配置歌曲歌单的常量
    RECOMMEND_CONFIG: 'config',
    //获取推荐歌单
    getRecommendSonglist: function () {
        var epg = this.data.epg;
        //不使用配置歌单
        if (epg && epg.groupList[0].metadataList[0].label != this.RECOMMEND_CONFIG) {
            api.post(api.API_URL + api.top_access_songlist, {
                "appVersion": api.appVersion,
                "type": "songlist",
                "size": 6
            }
            ).then(res => {
                var recommendSonglist = res.data.pb.dataList;
                for (var songlist in recommendSonglist) {
                    recommendSonglist[songlist].label = recommendSonglist[songlist].name;
                    recommendSonglist[songlist].linkImageUri = recommendSonglist[songlist].thumb;
                    recommendSonglist[songlist].value = recommendSonglist[songlist].code;
                    if (recommendSonglist[songlist].label.length > 16) {
                        var label = recommendSonglist[songlist].label;
                        label = label.substring(0, 15) + '...';
                        recommendSonglist[songlist].label = label;
                    }
                }
                this.setData({
                    recommendSonglist: recommendSonglist
                });
            });
        } else if (epg && epg.groupList[1]) {
            var recommendSonglist = epg.groupList[1].metadataList;
            for (var songlist in recommendSonglist) {
                if (recommendSonglist[songlist].label.length > 16) {
                    var label = recommendSonglist[songlist].label;
                    label = label.substring(0, 15) + '...';
                    recommendSonglist[songlist].label = label;
                }
            }
            this.setData({
                recommendSonglist: recommendSonglist
            });
            console.log(this.data.recommendSonglist);
        }
    },
    //获取推荐歌曲
    getRecommendSong: function () {
        var that = this;
        var epg = this.data.epg;
        if (epg && epg.groupList[0].metadataList[1].label != this.RECOMMEND_CONFIG) {
            api.post(api.API_URL + api.top_vod_song, {
                "size": 20
            }).then(res => {
                var recommendSong = res.data.pb.dataList;
                that.setData({
                    recommendSong: recommendSong
                });
                //console.log("app.globalData.userInfo:" + JSON.stringify(app.globalData.userInfo));
                app.onLogined(this, "initFavData");
            });
        } else if (epg
            && epg.groupList[2]
            && epg.groupList[2].metadataList[0]
            && epg.groupList[2].metadataList[0].value) {
            var id = epg.groupList[2].metadataList[0].value;
            api.post(api.API_URL + api.get_program, {
                "id": id,
                "pageable": true,
                "current": 1,
                "pageSize": 20
            }).then(res => {
                if (res.statusCode == 200
                    && res.data && res.data.pb && res.data.pb.dataList) {
                    var recommendSong = res.data.pb.dataList;
                    that.setData({
                        recommendSong: recommendSong
                    });
                    console.log("app.globalData.userInfo:" + JSON.stringify(app.globalData.userInfo));
                    app.onLogined(this, "initFavData");
                }
            })
        }
    },
    //初始化收藏数据
    initFavData: function (loginData) {
        if (loginData && loginData.userInfo) {
            this.setData({
                userInfo: loginData.userInfo
            });
            this.getFavAndSelectedData();
        }
    },
    //获取收藏已点数据
    getFavAndSelectedData: function () {
        var that = this;
        api.post(api.API_URL + api.get_fav_value, {
            "appVersion": api.appVersion,
            "userid": that.data.userInfo.unionId,
            "role": that.data.userInfo.role,
            "type": "song",
            "pageable": false
        }).then(res => {
            if (res.statusCode == 200 && res.data
                && res.data.valueList) {
                var valueList = res.data.valueList;
                var valueStr = '';
                for (var value in valueList) {
                    valueStr += valueList[value] + ';';
                }
                if (app.globalData.connected == true
                    && app.globalData.connectedInfo.unionId
                    && app.globalData.connectedInfo.role) {
                    api.post(api.API_URL + api.get_song_list, {
                        "userid": app.globalData.connectedInfo.unionId,
                        "role": app.globalData.connectedInfo.role,
                        "mp": "default",
                        "current": 1,
                        "pageSize": 1000
                    }).then(res => {
                        if (res.statusCode == 200 && res.data
                            && res.data.pb.dataList) {
                            var chosenData = res.data.pb.dataList;
                            var chosenStr = '';
                            for (var value in chosenData) {
                                chosenStr += chosenData[value].code + ';';
                            }
                            that.setFavAndChosenData(valueStr, chosenStr);
                        }
                    });
                } else {
                    that.setFavAndChosenData(valueStr);

                }
            }
        });
    },
    //设置收藏已点数据
    setFavAndChosenData: function (valueStr, chosenStr) {
        var recommendSong = this.data.recommendSong;
        for (var song in recommendSong) {
            if (valueStr && valueStr.indexOf(recommendSong[song].code) > -1) {
                recommendSong[song].fav = true;
            } else {
                recommendSong[song].fav = false;
            }
            if (chosenStr && chosenStr.indexOf(recommendSong[song].code) > -1) {
                recommendSong[song].selected = true;
            } else {
                recommendSong[song].selected = false;
            }
        }
        this.setData({
            recommendSong: recommendSong
        });
    },
    //初始化页面
    onLoad: function (options) {
        var that = this;
        api.post(api.API_URL + api.get_epg, { code: "xcx_recommend", appVersion: "A" }).then(res => {
            if (res.statusCode == 200 && res.data && res.data.epg) {
                that.setData({
                    epg: res.data.epg
                });
                that.getRecommendSonglist();
                that.getRecommendSong();
                console.log(JSON.stringify(res.data.epg));
            }
        });
    },
    onReady: function () {
        // Do something when page ready.
    },
    onShow: function () {
        if (app.globalData.hasUserInfoAuth == false) {
            wx.redirectTo({
                url: '/pages/swiper/index'
            })
            return;
        }
        this.setData({ connected: app.globalData.connected });
        if (this.data.userInfo && this.data.userInfo.unionId) {
            this.getFavAndSelectedData();
        }
        slide.bindPage(this, 'recommendSong');
        toast.bindPage(this);
        app.setLastTab('/pages/recommend/index');
    },
    onHide: function () {
    },
    onUnload: function () {
        // Do something when page close.
    },
    onPullDownRefresh: function () {
        // Do something when pull down.
    },
    onReachBottom: function () {
        // Do something when page reach bottom.
        //this.bindscrolltolower();
    },
    previewImg: function (e) {
        api.previewImg(e);
    },
    //收藏
    favSong: function (e) {
        var that = this;
        var fav = e.currentTarget.dataset.fav;
        var index = e.currentTarget.dataset.index;
        if (new Date() - that.data.recommendSong[index].lastTimeStamp < 2000) {
            toast.showToast('亲你点的太快了！', 2000);
            return;
        }
        if (fav == 'true') {
            if (index > -1 && that.data.recommendSong[index].code) {
                api.post(api.API_URL + api.remove_fav, {
                    "userid": that.data.userInfo.unionId,
                    "role": that.data.userInfo.role,
                    "type": "song",
                    "value": that.data.recommendSong[index].code,
                    "appVersion": api.appVersion
                }).then(res => {
                    if (res.statusCode == 200 && res.data) {
                        console.log(JSON.stringify(res.data));
                        that.data.recommendSong[index].fav = false;
                        this.setData({ recommendSong: that.data.recommendSong });
                        toast.showToast('取消收藏成功', 3000);
                    }
                });
            } else {
                toast.showToast('取消收藏失败', 3000);
            }
        } else {
            if (index > -1 && that.data.recommendSong[index].code) {
                api.post(api.API_URL + api.add_fav, {
                    "userid": that.data.userInfo.unionId,
                    "role": that.data.userInfo.role,
                    "orderType": that.data.userInfo.orderType,
                    "type": "song",
                    "value": that.data.recommendSong[index].code,
                    "appVersion": api.appVersion
                }).then(res => {
                    if (res.statusCode == 200 && res.data) {
                        console.log(JSON.stringify(res.data));
                        that.data.recommendSong[index].fav = true;
                        this.setData({ recommendSong: that.data.recommendSong });
                        toast.showToast('收藏成功', 3000);
                    }
                });
            } else {
                toast.showToast('收藏失败', 3000);
            }
        }
        that.data.recommendSong[index].lastTimeStamp = new Date();
    },
    goConnect: function (e) {
        slide.clearSlide(this);
        wx.navigateTo({
            url: '/pages/connect_help/index'
        });
    },
    //点歌
    chooseSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (slide.canClickItem(index, this) !== true) {
            return;
        }
        var connected = app.globalData.connected;
        if (connected === true) {
            var index = e.currentTarget.dataset.index;
            var recommendSong = this.data.recommendSong;
            if (recommendSong && recommendSong[index] && recommendSong[index].selected !== true) {
                api.post(api.API_URL + api.add_song, {
                    "userid": app.globalData.connectedInfo.unionId,
                    "role": app.globalData.connectedInfo.role,
                    "mp": "default",
                    "code": recommendSong[index].code,
                    "source": "mini-program/recommend",
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
                            console.log(JSON.stringify(res.data));
                            that.data.recommendSong[index].selected = true;
                            this.setData({ recommendSong: that.data.recommendSong });
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
    },
    touchGlobalM: function (e) {
        if (e.detail) {
            var disY = e.detail.deltaY;
            var playController = this.data.playController;
            //垂直滑动距离小于20直接返回
            if (disY < -20 && playController != 'hide') {
                playController = 'hide';
                this.setData({ playController: playController });
            } else if (disY > 20 && playController != 'display') {
                playController = 'display';
                this.setData({ playController: playController });
            }
        }
    },
    goPlayController: function (e) {
        slide.clearSlide(this);
        wx.navigateTo({
                url: '/pages/play_controller/index'
        });
    }
})