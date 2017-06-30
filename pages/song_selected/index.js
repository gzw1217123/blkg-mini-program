var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var slide = require('../../utils/slide.js')
var toast = require('../../component/toast/index.js')
var Connector = require('../../utils/connector-pomelo.js')
var app = getApp()

Page({

    data: {
        connector: {}
    }, 
    target: 'mini_song_selected',
    mp: 'default',
    getSelectedSong() {
        var that = this;
        if (app.globalData.connected == true) {
            api.post(api.API_URL + api.get_song_list, {
               "userid": app.globalData.connectedInfo.unionId,
                "role": app.globalData.connectedInfo.role,
                "mp": that.mp,
                "current": 1,
                "pageSize": 1000
            }).then(res => {
                if (res.statusCode == 200 && res.data
                    && res.data.pb.dataList) {
                    var selectedSong = res.data.pb.dataList;
                    that.setData({ selectedSong: selectedSong });
                }
            });
        }
    },
    onLoad: function (options) {
        //pomelo.Connector('120.25.158.242', 3014);
    },
    //连接后的操作
    afterConnect: function () {
        var that = this;
        var connectedInfo = app.globalData.connectedInfo;
        var connector = this.data.connector;
        connector.getUserInfo(connectedInfo.tv_id, function (data) {
            if (data.isOnline == false) {
                console.log('您的电视不在互动状态哦，即将自动退出播控页面');
            }
            else {
                console.log('查询电视状态');
                connector.sendMessage("@" + that.data.tv_id, "getTVPage", "");
            }
        });
        connector.on('disconnect', function (data) {
            console.log('与服务器连接中断！');
        });
        connector.on('onUserSendMessage', function (data) {
            if (data.from === connector.uid) return; // 屏蔽自己发来的消息
            console.log('收到消息：', data.message);
            //log(data.from + ':' + data.message.content);
        });
    },
    onShow: function () {
        //如果没有扫码连接成功则 返回点击已点之前的页面。
        if (app.globalData.switchLastPage === true) {
            setTimeout(function () {
                var tabPageUrl = app.getLastTab();
                app.setLastTab();
                app.globalData.switchLastPage = false;
                wx.switchTab({
                    url: tabPageUrl || '/pages/recommend/index'
                });
            }, 300);
        } else if (app.globalData.connected === false) {
            //如果没有连接则设置需要返回点击已点页面之前的页面，并跳转到连接页面。
            app.globalData.switchLastPage = true;
            wx.navigateTo({
                url: '/pages/connect_help/index'
            });
        } else {
            var that = this;
            slide.bindPage(this, 'selectedSong');
            toast.bindPage(this);
            var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
            this.data.connector = connector;
            var phone_id = app.getConnectId();
            connector.on('connect', function () {
                connector.login(phone_id, function (data) {
                    if (data.code === 200) {
                        console.log('登录成功！');
                        that.afterConnect();
                    } else {
                        util.alert("您的网络异常,登录失败");
                    }
                });
            });
            connector.sendMessage("@" + app.globalData.connectedInfo.tv_id, "getSongInfoActive", "", function (data1) {
                if (data1.code == 200) {
                    connector.on('onUserSendMessage', function (data) {
                        if (data.from === connector.uid) return; // 屏蔽自己发来的消息
                        if (data.message.type === "songInfo") {
                            if (data.message.content.mp) {
                                that.mp = data.message.content.mp;
                            }
                            that.getSelectedSong();
                        }
                    })
                }
            });
        }
    },
    onPullDownRefresh: function () {
    },
    chooseSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (slide.canClickItem(index, this) !== true) {
            return;
        }
        wx.showModal({
            content: '您当前的操作会在电视上响应，是否继续',
            confirmText: '确定',
            cancelText: '取消',
            confirmColor: '#03a2f4',
            success: function (res) {
                if (res.confirm) {
                    var selectedSong = that.data.selectedSong;
                    var code = selectedSong[index].code;
                    console.log(app.globalData.connectedInfo);
                    console.log(code);
                    that.data.connector.sendMessage('@' + app.globalData.connectedInfo.tv_id, "playSong", { songCode: code, songSource: that.target,'mpid':that.mp }, function (data) {
                        var connector = that.data.connector;
                        if (data.code == 200) {
                            connector.on('onUserSendMessage', function (data) {
                                console.log("1"+JSON.stringify(data));
                                // 屏蔽自己发来的消息
                                if (data.from === connector.uid) return; 
                                if (data.message.type === "playSong_callback") {
                                    if (data.message.content.action === 'done') {
                                        selectedSong.splice(index, 1);
                                        that.setData({ selectedSong: selectedSong });
                                    } else {
                                        toast.showToast('点播失败', 3000);            
                                    }
                                }
                            })
                        } else {
                            toast.showToast('点播失败', 3000);
                        }
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    topSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        var selectedSong = this.data.selectedSong;
        if (index > 0) {
            api.post(api.API_URL + api.top_song, {
                "userid": app.globalData.connectedInfo.unionId,
                "role": app.globalData.connectedInfo.role,
                "mp": that.mp,
                "code": selectedSong[index].code
            }).then(res => {
                if (res.statusCode == 200
                    && res.data
                    && res.data.code == 0) {
                    slide.canClickItem(index, that);
                    var item = selectedSong[index];
                    selectedSong.splice(index, 1);
                    selectedSong.unshift(item);
                    this.setData({ selectedSong: selectedSong });
                } else {
                    toast.showToast('置顶失败', 3000);
                }
            });;
        }
    },
    removeSong: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;
        if (new Date() - that.data.selectedSong[index].lastTimeStamp < 2000) {
            toast.showToast('亲你点的太快了！', 2000);
            return;
        }
        var selectedSong = this.data.selectedSong;
        api.post(api.API_URL + api.remove_song, {
            "userid": app.globalData.connectedInfo.unionId,
            "role": app.globalData.connectedInfo.role,
            "mp": "default",
            "code": selectedSong[index].code
        }).then(res => {
            if (res.statusCode == 200
                && res.data
                && res.data.code == 0) {
                selectedSong.splice(index, 1);
                this.setData({ selectedSong: selectedSong });
            } else {
                toast.showToast('删除失败', 3000);
            }
        });;
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