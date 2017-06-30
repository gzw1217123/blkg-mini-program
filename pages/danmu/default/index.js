var api = require('../../../utils/api.js')
var util = require('../../../utils/util.js')
var Connector = require('../../../utils/connector-pomelo.js')
var app = getApp()

Page({

  data: {
    connector: {},
    tv_id: app.globalData.connectedInfo.unionId,
    room_id: app.globalData.connectedInfo.room_id,
    barrage_texts:
    [
      '最爱他了！', '真可爱呀！', 'MV棒棒哒~', '这个风格不错，我喜欢。', '哇~还有这么多功能呀~', '百灵K歌真不错', '歌曲好丰富哦', '这么新的歌都有', '太阳打西边出来了啊', '就像真的在K房！', '厉害！这么难唱的歌都能唱。', '特别的歌唱给特别的你~', '越来越爱听~', '声音真迷人~', '真是太好看了。', '含泪点赞',
      '谁能明白我的心', '难受啊', '今天天气真好~', '快哭了~', '乐得停不下来~', '笑得像花儿一样。', '心跳的感觉', '月亮代表我的心', '黑夜给了我黑色的眼睛',
      '特别轻松的感觉', '好安静的样子', '这首歌很舒缓啊', '太燥了', 'So what!', '激情无限啊~', '哈哈哈，笑cry...', 'yooooooo!', '我好感动！！！！',
      '多点小鲜肉的歌就好啦！', '原版MV再多点就好啦~', '有无线麦克风直接购买就好了。', '要是有提醒功能就更棒了', '点歌方式能再简单点吗', '可以语音搜歌该有多好', '不能快点更新吗', '歌曲有卡顿啊', '画面有抖动啊',
      '好像没有很清晰啊', '歌曲内容有点旧', '操作不是很方便', '颜色有问题吧', '音量时大时小啊', '卧槽！灵魂歌手', '碉堡了！！！', '就是来留名', '交还封面我们还是好朋友', '人与人之间的信任去那里了。。。', '然后我就睡着了...', '多大仇！！！', '已哭晕在厕所...', '你这么吊你家里人知道么', '一天不听，浑身难受！', '醉了...', '我想静静',
      '好听', '嗓子真好', '职业水准哦', 'I服了YOU', '膜拜，膜拜', '比原唱还好听', '大神啊', '被你深深的折服了', '天籁之音', '说不出的好听', '唱出了歌曲的意境', '你能一直唱下去吗', '怎么唱的这么好！？',
      '要！不能停！', '求签名啊~~', '无尽的喜欢', '天空都因你放晴', '小鹿乱撞', '热舞劲歌我喜欢', '酸酸甜甜就是我', '花开的声音', '喜欢你没道理',
      '我们的爱情，小火慢炖', '曾经你是风，我却做不来沙', '微微一笑很倾城', '樱花的美丽', '刺痛的声音', '眼泪快掉下来', '想笑又笑不出', '想哭又哭不出', '想喊又喊不出', '我的眼里含着泪水', '偷笑一下', '好安逸', '真的好喜欢你',
      '太可爱了吧', '怎么这么好听的声音', '天籁之音呀', '来不及说爱你', '细雨微风带走我思恋', '等花开唱你听！', '清风袭来的感觉', '你是我的小苹果', '没有你我怎么办', '越夜越想听',
      '好怀念的歌~~', '满满都是回忆', '一首歌，一段情，一座城，一个人', '沙发', '我整个人都不好了', '哈哈哈，好有才', '有没有一种声音，你一听，就过耳不忘', '起来high！', '我真的听哭了', '不要问我为什么，这就是爱啊！！！', '啊啊啊啊啊啊', '好喜欢，好喜欢', '愉悦', '悲伤', '伤感', '深深的感动', '已经沉浸到歌声里',
      '静静地听，全部收藏！', '太美了，听到想哭', '看见封面我就进来了', '唱得好，点个赞', '先藏为敬', 'nice', '大爱', '良心歌曲', '好听哦！', '不错~~不错~~', '赞爆了！！！！', '跪着听歌中....', '无限循环中，我是不是病了啊！？', '教练，我要学唱歌', '一听，腿就抖啊！', '如此骚气的歌声', '有点意思', '哎呦，不错哦！', '我是你的脑残粉', '炒鸡赞！！！'
    ]
  },
  onLoad: function (options) {


    this.setData({
      random_barrages: this.getArrayItems(this.data.barrage_texts,10)
    });
    
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
      //var phone_id = that.data.userInfo.unionId;
      var phone_id = app.getConnectId();
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


    connector.on('onUserLogin', function (data) { }); // 用户登录时触发
    connector.on('onUserLogout', function (data) { }); // 用户退出时触发
    connector.on('onUserJoinRoom', function (data) { }); // 用户进入房间时触发
    connector.on('onUserLeaveRoom', function (data) { }); // 用户离开房间时触发

  },
  onReady: function () {
    // Do something when page ready.
  },
  onShow: function () {
    // Do something when page show.
  },
  onHide: function () {
    // Do something when page hide.
  },
  onUnload: function () {
    // Do something when page close.
  },
  onPullDownRefresh: function () {
    this.setData({
      random_barrages: this.getArrayItems(this.data.barrage_texts, 10)
    })
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    // Do something when page reach bottom.
    //this.bindscrolltolower();
  },
  previewImg: function (e) {
    api.previewImg(e);
  },
  /************************************************************ */
  onLoadOther: function () {

  },
  getArrayItems: function (arr, num) { //随机获取几个值
    //新建一个数组,将传入的数组复制过来,用于运算,而不要直接操作传入的数组;
    var temp_array = new Array();
    for (var index in arr) {
      temp_array.push(arr[index]);
    }
    //取出的数值项,保存在此数组
    var return_array = new Array();
    for (var i = 0; i < num; i++) {
      //判断如果数组还有可以取出的元素,以防下标越界
      if (temp_array.length > 0) {
        //在数组中产生一个随机索引
        var arrIndex = Math.floor(Math.random() * temp_array.length);
        //将此随机索引的对应的数组元素值复制出来
        return_array[i] = temp_array[arrIndex];
        //然后删掉此索引的数组元素,这时候temp_array变为新的数组
        temp_array.splice(arrIndex, 1);
      } else {
        //数组中数据项取完后,退出循环,比如数组本来只有10项,但要求取出20项.
        break;
      }
    }
    return return_array;
  },
  sendBarrage: function(event){
   var content = event.currentTarget.dataset.content;
   console.log("弹幕内容>>>>>>>>>>>>"+content);

   var that = this;
   var code = 'test';
   var userid = 'test';
   var time = 10;
   var connector = that.data.connector;


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


   connector.sendMessage("@" + that.data.tv_id, "barrage", { "content": content, "source": "MINA"});
   //util.alert("发送成功");
   console.log("发送弹幕成功");
   setTimeout(function () {
     wx.navigateBack({
       delta: 2
     })
   }, 1000);

  }
})