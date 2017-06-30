var notificationCenter = require('/utils/notification.js');
var api = require('utils/api.js')
var util = require('utils/util.js')
App({
    globalData: {
        userInfo: undefined,
        connected: false,
        //{ unionId: 'oZjmvw9NLFOKfYSUw0_ILwapnd7Y', role: 'youth'},
        connectedInfo: {},
        //0:已订购；非0：未订购
        orderCode: 1,
        //默认拥有用户信息权限
        hasUserInfoAuth: true
    },
    onLaunch: function () {
        this.notificationCenter = notificationCenter.center();
        this.wxLogin();
    },
    //获取用户城市信息
    getCityInfo: function(cb) {
        var data = {};
        api.post(api.API_URL + api.city_info, data)
            .then(res => {
                this.globalData.ip = res.data.ip || '127.0.0.1';
                this.globalData.city = res.data.cityInfo || '';
                console.log(res);
                typeof cb == "function" && cb(this.globalData.ip);
            })
    },
    getCity: function() {
        return this.globalData.city;
    },
    getIp: function() {
        return this.globalData.ip || '127.0.0.1';
    },
    wxLogin: function () {
        var that = this
        that.getUnionid();
    },
    getUnionid: function () {
        var that = this;
        wx.login({
            success: function (res) {
                //微信js_code
                var code = res.code;
                //获取用户信息
                wx.getUserInfo({
                    /*微信授权，拒绝*/
                    fail: function (res) {
                        that.globalData.hasUserInfoAuth = false;
                        wx.redirectTo({
                            url: '/pages/swiper/index'
                        })
                    },
                    /*微信授权，成功*/
                    success: function (res) {
                        //获取用户敏感数据密文和偏移向量
                        var encryptedData = res.encryptedData;
                        var iv = res.iv;
                        var data = { "encryptedData": encryptedData, "iv": iv, "code": code };
                        api.post(api.API_URL + api.decodeUserInfo, data)
                            .then(res => {
                                if (res.data.decryptedData) {
                                    var userInfo = JSON.parse(res.data.decryptedData);
                                    var unionId = userInfo.unionId;
                                    userInfo.orderType = 'free';
                                    userInfo.role = 'youth';
                                    that.globalData.userInfo = userInfo;
                                    that.getCityInfo(function () { that.updateOrderCode(function () { that.accountLogin(unionId); })});
                                }
                            })
                    }
                })
            }
        })
    },
    onLogined: function(obj, callbackName, callback) {
        if (this.globalData.userInfo === undefined) {
            this.notificationCenter.register("login-notification", obj, callbackName);
        } else {
            typeof obj[callbackName] == "function" && obj[callbackName]({ userInfo: this.globalData.userInfo });
        }
    },
    //获取最新的订购状态
    updateOrderCode: function (cb) {
        var that = this;
        var userid = that.globalData.userInfo.unionId;
        var send_orderAuth = { "userId": userid, "productId": api.productId_order, "channelId": api.channelId_order };
        api.post(api.orderAuth, send_orderAuth)
            .then(res => {
                var orderCode = res.data.code;
                that.globalData.orderCode = parseInt(orderCode);
                typeof cb == "function" && cb(orderCode);
            })
    },
    //页面设置orderCode，支付页面用户支付成功后用支付成功返回的code更新本地数据：orderCode
    setOrderCode: function (orderCode) {
        this.globalData.orderCode = orderCode;
    },
    //页面调用获取orderCode
    getOrderCode: function (cb) {
        return this.globalData.orderCode;
    },
    //login
    accountLogin: function (userid) {
        var that = this;
        var orderType = that.globalData.orderCode === 0 ? 'month' : 'free';
        that.globalData.userInfo.orderType = orderType;
        var data = {
             "userid": userid,
             "ip": this.globalData.ip,
             "city": this.globalData.city, 
             "orderType": orderType, 
             "channelCode": api.channelId_order, 
             "source": "mini-program"
        }
        api.post(api.API_URL + api.login, data)
            .then(res => {
                if(!(res && res.data && res.data.code === 0)) {
                    that.globalData.userInfo.loginStatus = false;
                } else {
                    that.globalData.userInfo.role = res.data.role;
                }
                var userInfo = that.globalData.userInfo;
                that.notificationCenter.post("login-notification", {
                    //任意通知object
                    userInfo: that.globalData.userInfo
                });
            });
    },
    //获取和柚子框架连接的id
    getConnectId() {
        var result = undefined;
        if (this.globalData.userInfo && this.globalData.userInfo.unionId) {
            result = 'wx_' + this.globalData.userInfo.unionId;
        } else {
            console.log('no unionid');
        }
        return result;
    },
    //设置最后点击的tab
    setLastTab: function (tab) {
        if(tab) {
            this.globalData.lastTab = tab;
        }
    },
    getLastTab: function() {
        return this.globalData.lastTab;
    },
    
})



