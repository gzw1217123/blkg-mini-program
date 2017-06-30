var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var MD5 = require('../../utils/MD5.js')
var app = getApp()

Page({
    YEAR:0,HALFYEAR:1,QUARTER:2,MONTH:3,
    FREE_CONFIG:0,MONTH_CONFIG:1,ACTIVITY_CONFIG:2,
    ACTIVITY_TIME:0,ACTIVITY_NAMES:1,DEFAULT_ACTIVITY:0,CURRENT_ACTIVITY:1,
    data: {
        items: [],
        defaultItems: [
            { value: 'year', orderType: 'year', orderFee: 16800, time: '12个月', checked: 'true' },
            { value: 'halfyear', orderType: 'halfyear', orderFee: 10800, time: '6个月' },
            { value: 'quarter', orderType: 'quarter', orderFee: 6800, time: '3个月' },
            { value: 'month', orderType: 'month', orderFee: 3000, time: '1个月' }
        ],
        orderCode: app.getOrderCode(),
        itemIndex: 0,
        ds: "year",
        money: ' '
    },
    //检查是否在活动
    checkActivity: function (activityTimeStr) {
        var result = false;
        try {
            var times = activityTimeStr.split(',');
            var startTime = new Date(times[0]);
            var endTime = new Date(times[1]);
            var current = new Date();
            if (current > startTime && current < endTime) {
                result = true;
            }
        } catch(e) {
            console.error(e);
        }
        return result;
    },
    isFreeUser: function() {
        return app.getOrderCode() === 0 ? false : true;
    },
    analysisConfig: function (order_config, activity_config, orderItems) {
        var activityNames = order_config[this.ACTIVITY_NAMES].label.split(',');
        var activityName;
        if (this.checkActivity(order_config[this.ACTIVITY_TIME].label)) {
            activityName = activityNames[this.CURRENT_ACTIVITY];
        } else {
            activityName = activityNames[this.DEFAULT_ACTIVITY];
        }
        if (activityName === undefined) {
            return;
        }
        for (var activity in activity_config) {
            if (activity_config[activity].label.indexOf(activityName) >= 0) {
                var dsStr = activity_config[activity].label
                dsStr = dsStr.substring(dsStr.indexOf('=') + 1);
                var dsArray = dsStr.split(',');
                for (var i = 0; i < dsArray.length; i++) {
                    var ds = parseInt(dsArray[i]);
                    if (ds > 0) {
                        orderItems[i].ds = ds;
                    }
                }
                break;
            }
        }
    },
    //获取配置的折扣
    getDiscount: function () {
        var that = this;
        api.post(api.API_URL + api.get_epg, { code: "xcx_order", appVersion: api.appVersion }).then(res => {
            if (res.statusCode == 200 && res.data && res.data.epg) {
                console.log(JSON.stringify(res.data.epg));
                if(res.data && res.data.epg) {
                    var epg = res.data.epg;
                    var activity_config = epg.groupList[that.ACTIVITY_CONFIG].metadataList;
                    var order_config;
                    if (that.isFreeUser()) {
                        order_config = epg.groupList[that.FREE_CONFIG].metadataList;
                    } else {
                        order_config = epg.groupList[that.MONTH_CONFIG].metadataList;
                    }
                    if (order_config && activity_config) {
                        that.analysisConfig(order_config, activity_config, that.data.defaultItems);
                        that.getOrderList();
                    } else {
                        console.error('获取活动配置失败');
                    }
                }
            }
        });
    },
    //获取订购价格详情
    getOrderList: function () {
        var that = this;
        var orderListUrl = api.orderList;
        var orderFeeListUrl = api.orderFeeList;
        var productId = 'xfjst';
        var channelId = 'xiaomi';
        //debug
        channelId = api.channelId_order;
        productId = api.productId_order;
        var data = { "productId": productId, "channelId": channelId };
        api.post(orderListUrl, data)
            .then(res => {
                var orderConfigList = res.data.orderConfigList;
                var items = this.data.defaultItems;
                var params = [];
                var queryIndex = [];
                for (var i = 0; i < orderConfigList.length; i++) {
                    for (var j = 0; j < items.length; j++) {
                        if (orderConfigList[i].orderType == items[j].orderType) {
                            if (items[j].ds !== undefined) {
                                var paramTemp = {};
                                paramTemp.orderFee = orderConfigList[i].orderFee;
                                paramTemp.ds = items[j].ds;
                                params.push(paramTemp);
                                queryIndex.push(j);
                            }
                            items[j].orderFee = orderConfigList[i].orderFee;
                        }
                    }
                }
                //查询折扣价格
                if (params.length > 0) {
                    api.post(orderFeeListUrl, params)
                        .then(res => {
                            var itemsFinal = res.data.dataList;
                            var items = that.data.defaultItems;
                            for (var i = 0; i < itemsFinal.length; i++) {
                                items[queryIndex[i]].orderFee = itemsFinal[i].discountFee;
                            }
                            that.setOrderItem();
                        });    
                }
            });
    },
    setOrderItem: function() {
        var items = this.data.defaultItems;
        if (this.isFreeUser()) {
            items.splice(this.HALFYEAR, 1);
        }
        this.setData({
            items: items,
            money: items[0].orderFee,
        });
    },
    radioChange: function (e) {
        var value = e.detail.value
        var items = this.data.items;
        var money;
        for (var i = 0; i < items.length; i++) {
            if (items[i].orderType == value) {
                money = items[i].orderFee;
                this.setData({
                    itemIndex: i,
                    money: money,
                });
                break;
            }
        }
    },
    //下拉刷新，如果是已经订购跳转到vip页面，（为了打开当前页，此时又在电视上订购的情况）
    onPullDownRefresh: function () {
        /*
        app.getOrderCode(function (orderCode) {
            if (orderCode == 0) {
                wx.redirectTo({
                    url: '../vip/index'
                })
            }
        })
        */
    },
    onLoad: function (options) {
        var that = this;
        that.getDiscount();
    },
    //添加订购日志
    addOrderLog: function (success, userInfo, info) {
        var miniProgram = 'mini';
        var uri = "order/add-" + (success === true ? "successed" : "failed");
        var request = {};
        request.city = app.getCity();
        request.carrier = miniProgram;
        request.appVersion = api.appVersion;
        request.platform = api.channelId_order;
        request.userid = userInfo.unionId;
        request.role = userInfo.role;
        request.orderType = userInfo.orderType;
        request.feeType = miniProgram;
        request.hour = 1;
        request.source = 'mini/order';
        request.sourceType = 'column';
        request.songCode = miniProgram;
        request.version = miniProgram;
        request.apkVersion = miniProgram;
        request.ip = app.getIp();
        //订购失败原因，订购成功不记录这个字段
        if (success == false) {
            request.description = info;
        }
        api.post(api.API_URL + uri, request).then(res => { console.log(res) });
    },
    //初始化获取订购类型并设置数据
    getOrderCode: function () {
        var that = this;
        var items = that.data.items;
        app.getOrderCode(function (orderCode) {
            var key = (orderCode == 0 ? "discountFee" : "orderFee");
            that.setData({
                orderCode: orderCode,
                money: items[0][key],
            })
        })
    },
    paing: false,
    pay: function () {
        if (this.paing == true) {
            return;
        }
        this.paing = true;
        if (app.globalData.userInfo === undefined) {
            console.error('no userinfo');
            return;
        }
        var that = this;
        var userid = app.globalData.userInfo.unionId;
        var openid = app.globalData.userInfo.openId;
        //从选中的项获取数据
        var items = that.data.items;
        var itemIndex = that.data.itemIndex;
        var itemChecked = items[itemIndex];
        //month, quarter, halfyear, year
        var orderType = itemChecked.orderType;

        //折扣ID与订购类型对应关系如下：211-包月 212-包季 213-包半年 214-包年
        var ds = 0
        if(itemChecked.ds !== undefined) {
            ds = itemChecked.ds;
        }

        var secretKey = "pJIA935f";
        var secresign = MD5.md5(userid + secretKey + ds + secretKey).toLowerCase();
        var data = { "userId": userid, "openId": openid, "ds": ds, "sign": secresign, "orderType": orderType, "orderCount": 1, "payChannelType": api.payChannelType_order, "productId": api.productId_order, "channelId": api.channelId_order, }
        var orderUrl = api.orderUrl;
        api.post(orderUrl, data)
            .then(res => {
                var dataPayment = res.data;
                wx.requestPayment({
                    'timeStamp': dataPayment.timestamp,
                    'nonceStr': dataPayment.noncestr,
                    'package': dataPayment.pkg,
                    'signType': 'MD5',
                    'paySign': dataPayment.sign,
                    'success': function (res) {
                        that.onPaiedSuccess(res);
                    },
                    'fail': function (res) {
                        that.onPaiedFailed(res);
                    }
                })
            })
    },
    onPaiedSuccess: function() {
        this.addOrderLog(true, app.globalData.userInfo);
        //订购成功，修改全局订购类型为已订购，并且跳转到订购页面
        app.setOrderCode(0);
        this.paing = false;
        setTimeout(function () {
            wx.switchTab({
                url: '/pages/profile/index'
            });
        }, 100);

    },
    onPaiedFailed: function() {
        this.paing = false;
        this.addOrderLog(false, app.globalData.userInfo, '微信订购失败');
    },
    toPage: function (e) {
        util.toPage(e);
    }
})
