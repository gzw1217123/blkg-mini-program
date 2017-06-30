module.exports = {
    //图片字符串转数组
    str2arr: function (list, key) {
        for (var i = 0; i < list.length; i++) {
            var picArr = new Array();
            var picUrls = list[i][key];//返回数据里的图片字符串
            if (picUrls != null) {
                picArr = picUrls.split(","); //字符分割为数组
                list[i].picUrls = picArr;
            }
        };
        return list
    },
    //对象转JSON字符串
    toJson: function (obj) {
        var jsonStr = JSON.stringify(obj)
        var jsonObj = JSON.parse(jsonStr)
        return jsonObj;
    },

    //根据出生时间计算年龄
    age: function (str) {
        var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
        if (r == null) return false;
        var d = new Date(r[1], r[3] - 1, r[4]);
        if (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4]) {
            var Y = new Date().getFullYear();
            return Y - r[1];
        }
        return false;
    },
    /*根据出生日期算出年龄*/

    ageOnYear: function (birthYear) {
        var nowYear = new Date().getFullYear();
        var ageDiff = nowYear - birthYear; //年之差 
        return ageDiff;//返回周岁年龄  

    },
    //页面跳转
    toPage: function (e) {
        var data = e.currentTarget.dataset
        var page = data.page
        var redirect = data.redirect
        var parameter = ""
        if (data.hasOwnProperty("parameter")) {
            parameter = data.parameter
        }
        if (redirect == true) {
            wx.redirectTo({
                url: '/pages/' + page + '/index' + parameter
            })
            return
        }
        wx.navigateTo({
            //url: '../' + page + '/index' + parameter
            url: '/pages/' + page + '/index' + parameter
        })
    },
    //返回上一页
    back: function (e, delta) {
        wx.navigateBack({
            delta: delta
        });
    },
    //弹窗
    alert: function (title) {
        wx.showToast({
            title: title,
            icon: 'success',
            duration: 1000
        })

    },
    //dateToString
    dateToString: function (now) {
        var year = now.getFullYear();
        var month = (now.getMonth() + 1).toString();
        var day = (now.getDate()).toString();
        if (month.length == 1) {
            month = "0" + month;
        }
        if (day.length == 1) {
            day = "0" + day;
        }

        var dateTime = year + "-" + month + "-" + day;
        return dateTime;

    },

    //dateStr2ymd
    dateStr2ymd: function (dateStr) {
        var dateStrTmp = dateStr.replace(/-/g, "/");
        var date = new Date(dateStrTmp);//将字符串转化为时间  
        var ymd = date.getFullYear() + "年" + (date.getMonth() + 1) + "月" + date.getDate() + "日";
        return ymd;
    },

    //dateString2days
    dateStr2days: function ( end_str) {
        //结束时间 去掉时分秒为了与电视一致
        var end_strTmp = /\d{4}-\d{1,2}-\d{1,2}/g.exec(end_str);
         end_strTmp = end_strTmp[0].replace(/-/g, "/");
        var end_date = new Date(end_strTmp);//将字符串转化为时间  
        //当前时间
        var sta_date = new Date();
        var num = (end_date - sta_date) / (1000 * 3600 * 24);//求出两个时间的时间差，这个是天数 
        //var days = parseInt(Math.ceil(num));//转化为整天
        //var days = Math.floor(num);
        var days = parseInt(parseFloat(num).toFixed(2));
        return days;
    },

    cloneObj: function (oldObj) { //复制对象方法
        if (typeof (oldObj) != 'object') return oldObj;
        if (oldObj == null) return oldObj;
        var newObj = new Object();
        for (var i in oldObj)
            newObj[i] = this.cloneObj(oldObj[i]);
        return newObj;
    },

    extendObj: function () { //复制对象方法
        var args = arguments;
        if (args.length < 2) return;
        var temp = this.cloneObj(args[0]); //调用复制对象方法
        for (var n = 1; n < args.length; n++) {
            for (var i in args[n]) {
                temp[i] = args[n][i];
            }
        }
        return temp;
    }

}
