var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var slide = require('../../utils/slide.js')
var toast = require('../../component/toast/index.js')
var Connector = require('../../utils/connector-pomelo.js')
var app = getApp()

Page({

    data: {
        isFav: false,
        fav: '/image/songlist/fav.png',
        faved: '/image/songlist/faved.png',
        btnWidth: 166,
        imgBase: api.imgBase,
        defaultThumb: api.contextImgPath + 'songlist/default.png',
        connector: {}
    },
    target: 'mini_songlist',
    onLoad: function (options) {
        var code = options.code;
        if (code) {
            this.setData({ code: code });
        } else {
            console.error('code is null');
        }
        this.getSonglist();
        this.setData({ connected: app.globalData.connected });
        slide.bindPage(this, 'recommendSong');
        toast.bindPage(this);
    },
    onShow: function () {
        toast.bindPage(this);
        var connected = app.globalData.connected;
        if (connected == true) {
            var phone_id = app.getConnectId();
            var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
            this.data.connector = connector;
            connector.on('connect', function () {
                connector.login(phone_id, function (data) {
                    if (data.code === 200) {
                        console.log('登录成功！');
                    } else {
                        util.alert("您的网络异常,登录失败");
                    }
                });
            });
        }
    },
    goConnect: function (e) {
        slide.clearSlide(this);
        wx.navigateTo({
            url: '/pages/connect_help/index'
        });
    },
    onReachBottom: function () {
        // Do something when page reach bottom.
        //this.bindscrolltolower();
    },
    getSonglist: function () {
        var that = this;
        api.post(api.API_URL + api.get_songlist, {
            "appVersion": api.appVersion,
            "code": that.data.code,
            "type": "songlist"
        }).then(res => {
            if (res.statusCode == 200
                && res.data.code == 0 && res.data.songlistInfo && res.data.songlistInfo.songlist) {
                var recommendSong = res.data.songlistInfo.songlist.program.songList;
                var programId = res.data.songlistInfo.songlist.program.id;
                var thumb = that.data.imgBase + res.data.songlistInfo.songlist.thumb;
                var songlist_name = res.data.songlistInfo.songlist.name;
                that.setData({
                    recommendSong: recommendSong,
                    thumb: thumb,
                    songlist_name: songlist_name,
                    programId: programId
                });
                if (app.globalData.userInfo === undefined) {
                    that.setData({
                        userInfo: app.globalData.userInfo
                    });
                    app.notificationCenter.register("login-notification", that, "initFavData");
                } else {
                    that.initFavData({ userInfo: app.globalData.userInfo });
                }
            }
        })
    },
    initFavData: function (loginData) {
        this.setData({
            userInfo: loginData.userInfo
        });
        var that = this;
        that.checkFav();
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
    checkFav: function () {
        var that = this;
        api.post(api.API_URL + api.is_fav, {
            "userid": that.data.userInfo.unionId,
            "role": that.data.userInfo.role,
            "appVersion": api.appVersion,
            "type": "songlist",
            "code": that.data.code
        }).then(res => {
            if (res.statusCode == 200 && res.data && res.data.collected === true) {
                that.setData({ isFav: res.data.collected });
            }
        });
    },
    playAll: function (e) {
        var that = this;
        var connected = app.globalData.connected;
        var programId = that.data.programId;
        if (connected == true && programId) {
            that.data.connector.sendMessage('@' + app.globalData.connectedInfo.tv_id, "playProgram", { programId: programId, source: that.target }, function (data) {
                console.log(data);
                if (data.code != 200) {
                    toast.showToast('点播失败', 3000);
                }
            });
        } else {
            this.goConnect();
        }
    },
    favSonglist: function (e) {
        var that = this;
        var fav = that.data.isFav;
        var favType = 'songlist';
        if (new Date() - that.data.lastTimeStamp < 2000) {
            toast.showToast('亲你点的太快了！', 2000);
            return;
        }
        if (fav == true) {
            api.post(api.API_URL + api.remove_fav, {
                "userid": that.data.userInfo.unionId,
                "role": that.data.userInfo.role,
                "type": favType,
                "value": that.data.code,
                "appVersion": api.appVersion
            }).then(res => {
                if (res.statusCode == 200 && res.data) {
                    this.setData({ isFav: false });
                    toast.showToast('取消收藏', 3000);
                }
            });
        } else {
            api.post(api.API_URL + api.add_fav, {
                "userid": that.data.userInfo.unionId,
                "role": that.data.userInfo.role,
                "orderType": that.data.userInfo.orderType,
                "type": favType,
                "value": that.data.code,
                "appVersion": api.appVersion
            }).then(res => {
                if (res.statusCode == 200 && res.data) {
                    this.setData({ isFav: true });
                    toast.showToast('收藏歌单成功', 3000);
                }
            });
        }
        that.data.lastTimeStamp = new Date();
    },
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
    chooseSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (slide.canClickItem(index, this) !== true) {
            return;
        }
        console.log('chooseSong');
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
    globalTap: function(e) {
        slide.clearSlide(this);
    }
})