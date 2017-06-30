var api = require('../../../utils/api.js')
var util = require('../../../utils/util.js')
var app = getApp()
var Connector = require('../../../utils/connector-pomelo.js')
Page({
  data: {
    userInfo: {},
    loading: false,
    disabled: false,
    inputLen: 0,
    connector: {},
    tv_id: app.globalData.connectedInfo.unionId,
    room_id: app.globalData.connectedInfo.room_id,
    barrageState: false,
    isChecked: '',
    isPlayPage:false
  },
  bindKeyInput: function (e) {
    var value = e.detail.value
    this.setData({
      inputLen: value.length
    });
  },
  switchChange: function (e) {
    var that = this;
    var connector = this.data.connector;

    this.data.connector.sendMessage("@" + that.data.tv_id, "getTVPage", "", function (data1) {
      if (data1.code == 200) {
        connector.on('onUserSendMessage', function (data) {

          if (data.from === connector.uid) return; // 屏蔽自己发来的消息

          if (data.message.type === "playPage") {

            if (data.message.content === false) {

              that.setData({

                loading: false,
                disabled: false,
                isChecked:''
              });
              util.alert('电视端不在播放页面，不能互动~');
              return false;
            } else {

            }
          }
        })
      }
    });
    if (that.data.barrageState) {
      that.setData({
        barrageState: false
      });
    } else {
      that.setData({
        barrageState: true
      });
    }
    that.data.connector.sendMessage("@" + that.data.tv_id, "phoneBarrage", "");
  },
  /**
* 发布
*/
  submit: function (e) {
    var that = this;
    var data = {};

    if (!that.data.barrageState) {
      util.alert('要先打开弹幕才能发送');
      that.setData({
        loading: false,
        disabled: false,
      });
      return;
    }

    var content = e.detail.value.content;
    if (content.trim().length == 0) {
      util.alert("请添加弹幕");
      return
    }

    that.setData({
      loading: true,
      disabled: true,
    });
    if (content.trim().length != 0) {
      data.content = content
    }
    that.submitAfter(data);
  },
  /**
* 发布,保存至数据库
*/
  submitAfter: function (data) {

    var that = this;
    var connector = this.data.connector;

    this.data.connector.sendMessage("@" + that.data.tv_id, "getTVPage", "", function (data1) {
      if (data1.code == 200) {
        connector.on('onUserSendMessage', function (data) {

          if (data.from === connector.uid) return; // 屏蔽自己发来的消息

          if (data.message.type === "playPage") {

            if (data.message.content === false) {
              console.log('当前是不播放页');
              that.setData({
                loading: false,
                disabled: false,
              });
              util.alert('电视端不在播放页面，不能互动~');

              return false;
            } else {
              console.log('当前是播放页');
              that.setData({
              });
            }
          }
        })
      }
    });

    connector.sendMessage("@" + that.data.tv_id, "barrage", { "content": data.content,"source":"MINA","status":"non-checked"});
    util.alert("发送成功");
    console.log("发送弹幕成功");
    setTimeout(function () {
      wx.navigateBack({
        delta: 1
      })
    }, 1000)
  },
  onLoad: function () {

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

      var phone_id = app.getConnectId();
      var connector = new Connector(api.CONNECTOR_SERVER, api.CONNECTOR_PORT);
      connector.sendMessage("@" + that.data.tv_id, "getBarrageState", "");
      that.data.connector = connector;
      connector.on('connect', function () {
        connector.login(phone_id, function (data) {
          if (data.code === 200) {
            console.log('登录成功！');

            that.afterConnect();
          }

        });
      });
    }

    connector.on('onUserSendMessage', function (data) {

      if (data.from === connector.uid) return; // 屏蔽自己发来的消息
      console.log('收到消息：', data.message);
      //获取到弹幕开关的状态
      if (data.message.type === "barrageState") {
        console.log('弹幕开关状态:' + data.message.content);
        that.data.barrageState = data.message.content;
        if (data.message.content){
          //更改页面上弹幕开关状态
          that.setData({
            isChecked: 'checked'
          })
        }else{
          that.setData({
            isChecked: ''
          })
          
        }
      }

    });

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
    



    connector.on('onUserLogin', function (data) { }); // 用户登录时触发
    connector.on('onUserLogout', function (data) { }); // 用户退出时触发
    connector.on('onUserJoinRoom', function (data) { }); // 用户进入房间时触发
    connector.on('onUserLeaveRoom', function (data) { }); // 用户离开房间时触发

  },
  /**
   * 跳转页面
   */
  toPage: function (e) {
    var that = this;
    if (!that.data.barrageState) {
      util.alert('要先打开弹幕才能发送');
      that.setData({
        loading: false,
        disabled: false,
      });
      return;
    }

    var page = e.currentTarget.dataset.page;
    util.toPage(e, 1);

  }
})
