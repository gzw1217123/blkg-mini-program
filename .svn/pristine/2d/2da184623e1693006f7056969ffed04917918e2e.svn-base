module.exports = {
    BASE: '',
    RESTORE: 'restore',
    SLIDE: 'slide',
    animationTime: 300,
    page: {},
    //获取元素自适应后的实际宽度
    bindPage: function (page, listName) {
        this.clearSlide(page);
        this.page = page;
        this.page.setData({
            slideIndex: -1,
            listName: listName
        });

    },
    getSlideItemIndex: function (page) {
        var slideIndex = page.data.slideIndex;
        return slideIndex;
    },
    getItem: function (currentIndex, page) {
        var list = page.data[page.data.listName];
        return list[currentIndex];
    },
    canClickItem: function (currentIndex, page) {
        var result = false;
        var slideIndex = this.getSlideItemIndex(page);
        var slideItem = undefined;
        var item = this.getItem(currentIndex, page);
        if (currentIndex == slideIndex) {
            slideItem = item;
        } else if (slideIndex > -1) {
            slideItem = this.getItem(slideIndex, page);
        }
        if (slideItem == undefined || slideItem.move == undefined
            || (slideItem.move == this.RESTORE
                && new Date() - slideItem.lastTimeStamp >= this.animationTime)) {
            result = true;
        }
        var list = page.data[page.data.listName];
        if (slideIndex > -1 && list[slideIndex].move == this.SLIDE) {
            var slideItem = list[slideIndex];
            slideItem.move = this.RESTORE;
            slideItem.lastTimeStamp = new Date();
            var tempData = {};
            tempData[page.data.listName] = list;
            page.setData(tempData);
        }
        return result;
    },
    deleteItem: function(currentIndex, page) {
        var slideIndex = this.getSlideItemIndex(page);
        var list = page.data[page.data.listName];
        if (slideIndex > -1
            && list.length > slideIndex
            && list[slideIndex].move == this.SLIDE) {
            var slideItem = list[slideIndex];
            slideItem.move = this.BASE;
            slideItem.lastTimeStamp = new Date()
            list.splice(currentIndex, 1);
            var tempData = {};
            tempData[page.data.listName] = list;
            tempData['slideIndex'] = -1;
            //更新列表的状态
            page.setData(tempData);
        }
    },
    clearSlide: function(page) {
        var slideIndex = this.getSlideItemIndex(page);
        var list = page.data[page.data.listName];
        if (slideIndex > -1
            && list.length > slideIndex
            && list[slideIndex].move == this.SLIDE) {
            var slideItem = list[slideIndex];
            slideItem.move = this.RESTORE;
            slideItem.lastTimeStamp = new Date();

            var tempData = {};
            tempData[page.data.listName] = list;
            tempData['slideIndex'] = -1;
            //更新列表的状态
            page.setData(tempData);
        }
    },
    touchS: function (e, page) {
        if (e.touches.length == 1) {
            page.setData({
                //设置触摸起始点水平方向位置
                startX: e.touches[0].clientX,
                startY: e.touches[0].clientY
            });
        }
    },
    touchM: function (e, page) {
        if (e.touches.length == 1) {
            //手指移动时水平方向位置
            var moveX = e.touches[0].clientX;
            var moveY = e.touches[0].clientY;

            var index = e.target.dataset.index;
            var list = page.data[page.data.listName];
            var disX = page.data.startX - moveX;
            var disY = page.data.startY - moveY;
            var slideIndex = this.getSlideItemIndex(page);
            //水平垂直夹角小于一定角度 或者 滑开状态向左滑 或者 不存在滑开的条目向右滑 直接返回
            if (Math.abs(disX / disY) < 2 
                || (disX < 0 && slideIndex < 0)
                || (disX > 0 && list[index].move == this.SLIDE)) {
                return;
            }
            var restore = false;
            //存在滑开状态的条目向右滑
            if (disX < 0 && (slideIndex > -1 || list[index].move == this.SLIDE)) {
                    restore = true;
            } else {
                list[index].move = this.SLIDE;
            }            
            if (restore || (slideIndex != index
                    && slideIndex > -1
                    && list.length > slideIndex
                    && list[slideIndex].move == this.SLIDE)) {
                var slideItem = list[slideIndex];
                slideItem.move = this.RESTORE;
                slideItem.lastTimeStamp = new Date();
            }
            var tempData = {};
            tempData[page.data.listName] = list;
            tempData['slideIndex'] = restore == true ? -1 : index;
            //更新列表的状态
            page.setData(tempData);
        }
    },
    touchE: function (e, page) {
    }
}