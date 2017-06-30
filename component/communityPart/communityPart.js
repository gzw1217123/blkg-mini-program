var util = require('../../utils/util.js')
Page({
  
  toPage: function (e) {
    util.toPage(e);
  },

vote(e) {
    var that = this;
    var dataset = e.currentTarget.dataset;
    var vote = dataset.vote;
    if (vote == 0) {
      util.alert("已经赞过了啦")
      return;
    }
    var index = dataset.index;
    var personalObj = that.data.personalObj;
    var detail = personalObj.dyramicList;
    var replies = detail[index];
    var dyramicId = replies.dyramicId;
    var userid = replies.userid;
    var role = replies.role;
    var operType = "vote" //comment/vote
    var status = "online" //默认online，(取消offline)
    var data = { "dyramicId": dyramicId, "userid": userid, "role": role, "operType": operType, "operType": operType, "status": status }
    api.post(api.HOST_IOS + api.add_dyranic_oper, data)
      .then(res => {
        personalObj.dyramicList[index].voteNum++;
        that.setData({ personalObj: personalObj });
      })
  },

})