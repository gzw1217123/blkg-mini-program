var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var Connector = require('../../utils/connector-pomelo.js')
var app = getApp()

Page({

    data: {
        imagePath: api.contextImgPath + 'connect_help/'
    },
    scan: function () {
        app.onLogined(this, 'scanAction');
    },
    scanAction: function() {
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                if (res.result) {
                    var params = res.result.split('&');
                    console.log(JSON.stringify(params));
                    if (params.length == 3) {
                        var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
                        this.data.connector = connector;
                        var phone_id = app.getConnectId();
                        try {
                          console.log(phone_id); 
                            connector.on('connect', function () {
                                console.log('connect');
                                connector.login(phone_id, function (data) {
                                    console.log('login');
                                    if (data.code === 200) {
                                        console.log('登录成功！');
                                        console.log("roomid++" + params[2]); 

                                        //connector.emit('joinRoom', { rid: params[2], uid:phone_id,source: '直接查找' }, function (data) {
                                          connector.joinRoom(params[2], phone_id, function (data) {
                                            if (data.code != 200) {
                                                util.alert('连接失败');
                                            } else {
                                                console.log('加入房间成功' + params[2]);
                                                app.globalData.connectedInfo.tv_id = params[0];
                                                app.globalData.connectedInfo.unionId = params[0];
                                                app.globalData.connectedInfo.role = params[1];
                                                app.globalData.connectedInfo.room_id = params[2];
                                                app.globalData.connected = true;
                                                console.log(app.globalData.connectedInfo);
                                                util.alert('连接成功');
                                                setTimeout(function () {
                                                    app.globalData.switchLastPage = false;
                                                    wx.navigateBack()
                                                }, 1000);
                                            }
                                        });
                                    } else {
                                        util.alert("您的网络异常,登录失败");
                                    }
                                });
                            });
                        } catch (e) {
                            console.error(JSON.stringify(e));
                        }
                    } else {
                        util.alert("扫描错误,登录失败");
                    }
                }
            },
            fail: (res) => {
                console.log('连接失败');
            }
        });
    }
})