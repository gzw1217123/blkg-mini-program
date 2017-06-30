var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var app = getApp()
var Connector = require('../../utils/connector-pomelo.js')
Page({
  data: {

    tabs: ['心情', '人物', '动物', '其他'],
    stv: {
      windowWidth: 0,
      lineWidth: 0,
      offset: 0,
      tStart: false
    },
    activeTab: 0,
    index1: 0,
    imgBase: api.imgBase,
    loading: false,
    loadtxt: '正在加载',
    userInfo: {}, // 存放用户信息
    currentTab: 0,
    expressionList:{},
    menuitem: ['mood','person','animal','other'],
    connector: {},
    tv_id: app.globalData.connectedInfo.unionId,
    room_id: app.globalData.connectedInfo.room_id
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
        currentTab: e.currentTarget.dataset.current,
      })
      
    }
  },
  notiFun: function (name, content) {

  },
  onLoad: function (options) {
    var that = this
    var data = {}
    //显示导航条加载动画
    wx.showNavigationBarLoading()
    //获取所有的表情
    api.post(api.API_URL + api.get_expression_list, data)
      .then(res => {
        console.log(res.data.mood);
        that.data.expressionList = res.data;
        //更新第一页的数据
        that.updata();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading()
      })
    app.onLogined(this, "onConnect");
  },
  onConnect: function (loginData) {
    var that = this;
    if (loginData && loginData.userInfo) {
      that.setData({
        userInfo: loginData.userInfo,
        tv_id: app.globalData.connectedInfo.unionId,
        room_id: app.globalData.connectedInfo.room_id

      });
      var phone_id = that.data.userInfo.unionId;
      //var phone_id = app.getConnectId();
      var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
      that.data.connector = connector;
      connector.on('connect', function () {
        connector.login(phone_id, function (data) {
          if (data.code === 200) {
            console.log('登录成功！');

            connector.joinRoom(that.data.room_id, function (data) {
              if (data.code != 200) {
                //清空房间号
              }
              else {
                console.log('加入房间成功' + that.data.room_id);
              }
            });
            that.afterConnect();
          }

        });
      });
    }
  },

  //连接后的操作
  afterConnect: function () {
    var that = this;
    var connector = this.data.connector;

    connector.getUserInfo(that.data.tv_id, function (data) {

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

  /**
    * 数据更新（追加或重置）
    */
  updata() {
    var that = this;
    var currentName = that.data.menuitem[that.data.currentTab];
    console.log("当前tab:" + that.data.expressionList[currentName]);
    that.setData({
      expression_list: that.data.expressionList[currentName]
    })
    //隐藏导航条加载动画
    wx.hideNavigationBarLoading()

  },
  toPage: function (e) {
    var page = e.currentTarget.dataset.page;
    if (page == "addDyranic")
      this.setData({
        currentTab: 1
      })
    util.toPage(e, 1);

  },

  onShareAppMessage: function () {

  },
  toDetailPage: function (e) {
    var data = e.currentTarget.dataset
    var toDetail = data.todetail;
    if (toDetail == "todetail") {
      this.toPage(e);
    }
  },

  _updateSelectedPage(page) {
    let {tabs, stv, activeTab} = this.data;
    activeTab = page;
    this.setData({ activeTab: activeTab })
    stv.offset = stv.windowWidth * activeTab;
    this.setData({ stv: this.data.stv })
  },
  handlerTabTap(e) {
    this.setData({
      index1: e.currentTarget.dataset.index
    })
    this._updateSelectedPage(e.currentTarget.dataset.index);
    this.swichNav(e);
    this.updata();
  },
  //发送弹幕
  sendExpression: function(e){
    var that = this;

    if (!app.globalData.connected) {
      util.alert('你没连接电视，还不能互动~');
      setTimeout(function () {
        wx.navigateTo({
          url: '/pages/connect_help/index'
        });
      }, 1000)
      return;
    }

    var connector = this.data.connector;
    this.data.connector.sendMessage("@" + that.data.tv_id, "getTVPage", "", function (data1) {
      if (data1.code == 200) {
        connector.on('onUserSendMessage', function (data) {

          if (data.from === connector.uid) return; // 屏蔽自己发来的消息

          if (data.message.type === "playPage") {

            if (data.message.content === false) {
              console.log('当前是不播放页');
              that.setData({
                isPlayPage: false,
              });
              util.alert('电视端不在播放页面，不能互动~');
              return false;
            } else {
              console.log('当前是播放页');
              that.setData({
                isPlayPage: true,
              });
            }
          }
        })
      }
    });

    var faceData = e.currentTarget.dataset;
    connector.sendMessage("@" + that.data.tv_id, "faces", { "facesCode": faceData.code, "facesPosition": faceData.position, "facesGif": faceData.gif }, function (res) {
      if (res.code == 200) {
        util.alert('发送成功');
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      } else {
        util.alert('发送失败');
      }
    });   //发送表情信息
  }
})