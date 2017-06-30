var api = require('../../utils/api.js')
var util = require('../../utils/util.js')
var app = getApp()

Page({

  data: {
      vipImagePath: '/image/profile/vip.png',
      noVipImagePath: '/image/profile/no_vip.png',
      maleImage: '/image/profile/male.png',
      femaleImage: '/image/profile/female.png'
  },
  onShow: function() {
      var imgBase = api.contextImgPath + 'profile/';
      var avatar = imgBase + 'avatar_default.png';
      var nickName = '';
      var isMale = true;
      var ordered = false;
      if (app.globalData.userInfo) {
          avatar = app.globalData.userInfo.avatarUrl
          isMale = app.globalData.userInfo.gender == '1';
          nickName = app.globalData.userInfo.nickName;
          /*if (nickName.length > 10) {
              nickName = nickName.substring(0, 9) + '...';
          }*/
          ordered = app.getOrderCode() == 0;
      }
      this.setData({ imgBase: imgBase, avatar: avatar, nickName: nickName, isMale: isMale, ordered: ordered });
      //已点页面相关
      app.setLastTab('/pages/profile/index');
  },
  onPullDownRefresh: function() {
    // Do something when pull down.
  },
  toPage(e) {
      util.toPage(e);
  }
})