var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var Connector = require('../../utils/connector-pomelo.js')

var app = getApp();

Page({
  data: {
    tabs: ['发表情', '发弹幕',],
    activeTab: 0,
    index1: 0,
    imgBase: api.imgBase,
    loading: false,
    loadtxt: '正在加载',
    userInfo: app.globalData.userInfo, // 存放用户信息
    currentTab: 0,
    menuitem: [{
      currentpage: '0',
      text: "发表情"
    }, {
      currentpage: '1',
      text: "发弹幕"
    }],
    connector:{},
    //电视id
    tv_id: app.globalData.connectedInfo.unionId,
    //房间id
    room_id: app.globalData.connectedInfo.room_id,
    isPlayPage: false,
    connectClass: 'disconnected',
    hoverConnectClass: "disconnected_on",
    playClass: 'play',
    hoverPlayClass: 'play_on',
    accompanyClass: 'original',
    hoverAccompanyClass: 'original_on',
    nextClass: 'next',
    hoverNextClass: 'next_on',
    replayClass: 'replay',
    hoverReplayClass: 'replay_on',
  },
  /**
  * 滑动切换tab
  */
  bindChange: function (e) {
    this.setData({ currentTab: e.detail.current });
  },
  /**
   * 点击tab切换
   */
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current
      })
    }
  },
  onLoad: function (options) {
    //登陆后才才能进行连接
    app.onLogined(this, "onConnect");
  },
  onShow: function () {
    var that = this;
    var connector = this.data.connector;

      //更新链接按钮状态
      if(app.globalData.connected){
        that.setData({
          connectClass: 'connected',
          hoverConnectClass: "connected_on"
        })
      }else{
        that.setData({
          connectClass: 'disconnected',
          hoverConnectClass: "disconnected_on"
        })
      }
  },
  onHide: function () {

  },
  //连接按钮点击事件
  toConnect: function() {
    var that = this;
    var connector = this.data.connector;
    //更新链接按钮状态
    if (app.globalData.connected) {
      wx.showModal({
        title: '提示',
        content: '是否断开与电视的连接',
        success: function (res) {
          if (res.confirm) { 
            //断开与电视的链接
            connector.disconnect();
            //将tv_id，room_id设置为空
            app.globalData.connectedInfo.role = null;
            app.globalData.connectedInfo.room_id = null;
            app.globalData.connected = false;
            that.setData({
              connectClass: 'disconnected',
              hoverConnectClass: "disconnected_on"
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      //断开连接,跳转去扫描帮助页
      connector.disconnect();
      wx.redirectTo({
        url: '/pages/connect_help/index' 
      })
    }
  },
  onConnect: function (loginData){
    var that = this;
    if (loginData && loginData.userInfo) {
      //设置全局信息
      that.setData({
        userInfo: loginData.userInfo,
        tv_id: app.globalData.connectedInfo.unionId,
        room_id: app.globalData.connectedInfo.room_id
      });
      //var phone_id = that.data.userInfo.unionId;
      //用户登录的id，防止与小程序账号冲突
      var phone_id = app.getConnectId();
      var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
      //var connector = new Connector('112.74.192.148', '3014'); 
      that.data.connector = connector;
      //收到连接消息
      connector.on('connect', function () { 
        connector.login(phone_id, function (data) {
          if (data.code === 200) {
            console.log('登录成功！');
 
            that.afterConnect();
          }
        });
      });
    }
  },
  //连接后的操作
  afterConnect: function() {
    var that = this;
    var connector = this.data.connector;
    //断开连接
    connector.on('disconnect', function (data) {
      console.log('与服务器连接中断！');
    });
    //收到消息
    connector.on('onUserSendMessage', function (data) {

      // 屏蔽自己发来的消息
      if (data.from === connector.uid) return; 
      console.log('收到消息：', data.message);

      //电视发来的互动消息
      if (data.message.type === "control") {
        var content = data.message.content;
        console.log('收到电视的控制消息:' + content);
        if (content === 'play') {//播放
          that.setData({ playClass: 'play', hoverPlayClass: 'play_on' })
        } else if (content === 'pause') {//暂停
          that.setData({ playClass: 'pause', hoverPlayClass: 'pause_on' })
        } else if (content === 'Left') {//伴唱
          that.setData({ accompanyClass: 'accompany', hoverAccompanyClass: 'accompany_on', })
        } else if (content === 'Stereo') {//原唱
          that.setData({ accompanyClass: 'original', hoverAccompanyClass: 'original_on', })
        }

      }
    });
  },
  onReachBottom: function () {
    this.bindscrolltolower();
  },
  /**
  * 下滑
  */
  bindscrolltolower() {

  },
  /**
* 下拉刷新
*/
  onPullDownRefresh() {

  },
 toPage: function (e) {
    var page = e.currentTarget.dataset.page;
    util.toPage(e, 1);

  },
 onShareAppMessage: function () {

  },
  onLoadOther: function () {

  },
  _updateSelectedPage(page) {

  },
  //点击底部两个按钮事件
  handlerTabTap(e) { 
    var connector = this.data.connector;
    var index = e.currentTarget.dataset.index;
    var data = e.currentTarget.dataset;
    //没链接电视，则不让进行互动
    if (!app.globalData.connected) {
      util.alert('你没连接电视，还不能互动~');
      setTimeout(function () {
        connector.disconnect();
        wx.redirectTo({
          url: '/pages/connect_help/index'
        });
      }, 1000)
      return;
    }


    //跳转至不同页面
    if(index === 0 ){
      data.page = "expression";
      util.toPage(e, 1);
    }else if(index === 1){
      data.page = "danmu/customed";
      util.toPage(e, 1);
    }
  },
  //小程序对电视播放控制
  playControl: function (e) {
    var that = this;
    var connector = this.data.connector;
    var conntrolType = e.currentTarget.dataset.type;

    //没链接电视，则不让进行互动
    if (!app.globalData.connected) {
      util.alert('你没连接电视，还不能互动~');
      setTimeout(function () {
        connector.disconnect();
        wx.redirectTo({
          url: '/pages/connect_help/index'
        });
      }, 1000)
      return;
    }

    //先去查询用户是否在播放页面，播放页面才能互动
    this.data.connector.sendMessage("@" + that.data.tv_id, "getTVPage", "",function(data1){
      if(data1.code == 200){
        connector.on('onUserSendMessage', function (data) {

          if (data.from === connector.uid) return; // 屏蔽自己发来的消息

          if (data.message.type === "playPage") {
            //电视不在播放页
            if (data.message.content === false) {
              that.setData({
                isPlayPage: false,
              });
              util.alert('电视端不在播放页面，不能互动~');
              return false;
            } else {//电视在播放页
              that.setData({
                isPlayPage: true,
              });
            }
          }
        })
      }
    });

    switch (conntrolType) {
      case 'nextSong'://下一首
        this.data.connector.sendMessage('@' + this.data.tv_id, 'control', 'next');
        break;
      case 'replay'://重播
        this.data.connector.sendMessage("@" + this.data.tv_id, "control", "replay");
        break;
      case 'playOrPause'://暂停或播放
        this.data.connector.sendMessage("@" + this.data.tv_id, "control", "play_pause");
        break;
      case 'accompanyOrOrginal'://原伴唱切换
        this.data.connector.sendMessage("@" + this.data.tv_id, "control", "yuan_ban");
        break;
      case 'volUp'://声音调大
        this.data.connector.sendMessage("@" + this.data.tv_id, "control", "vol_up");
        break;
      case 'volDown'://声音调小
        this.data.connector.sendMessage("@" + this.data.tv_id, "control", "vol_down");
        break;

      default:
        util.alert('出错了')
    }
  }
})