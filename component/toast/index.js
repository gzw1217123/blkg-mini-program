module.exports = {
    lastToast: undefined,
    page: undefined,
    bindPage: function (page) {
        //清空上个页面的toast
        if (this.page && this.lastToast != undefined) {
            clearTimeout(this.lastToast);
            this.page.setData({ isShowToast: false });
        }
        this.page = page;
    },
    showToast: function (text, time) {
        if (this.lastToast != undefined) {
            clearTimeout(this.lastToast);
            this.page.setData({ isShowToast: false });
        }
        if (text && time > 0) {
            var that = this;
            this.page.setData({ isShowToast: false });
            setTimeout(function () {
                that.page.setData({ isShowToast: true, toastText: text });
                that.lastToast = setTimeout(function () {
                    that.page.setData({ isShowToast: false });
                }, time);
            }, 200);
            
        }
    }
}