var api = require('api.js')
var notificationCenter = {

    notificationCenter: {},

    // 向通知中心注册一个监听者。
    // name: 监听的通知名称
    // observer: 监听者
    // action: 监听者收通知时调用的方法名，
    // func: 监听者收到通知时调用的函数，
    // action func 2选1
    register: function (name, observer, action, func) {
        if (!name || !observer) return;
        if (!action && !func) return;
        if (api.consoleDebug) {
            console.log("注册通知：", name, observer);
        }

        var center = this.notificationCenter;
        var objects = center[name];
        if (!objects) {
            objects = [];
        }
        this.remove(name, observer);
        objects.push({
            observer: observer,
            action: action,
            func: func
        });
        center[name] = objects;
    },
    // 从通知中心移除一个监听者
    remove: function (name, observer) {
        if (!name || !observer) return;

        var center = this.notificationCenter;
        var objects = center[name];
        if (!objects) {
            return;
        }

        var idx;
        var object;
        for (idx = 0; idx < objects.length; idx++) {
            var obj = objects[idx];
            if (obj.observer == observer) {
                object = obj;
                break;
            }
        }
        if (object) {
            objects.splice(idx, 1);
        }
        center[name] = objects;
    },
    // 通过通知中心发出通知
    // name: 通知名称
    // notification: 通知内容
    post: function (name, notification) {
        if (!name) return;
        if (api.consoleDebug) {
            console.log("准备发出通知：", name, notification);
        }


        var center = this.notificationCenter;
        var objects = center[name];
        if (!objects) {
            objects = [];
        }
        objects.forEach(function (object) {
            var observer = object.observer;
            var action = object.action;
            var func = object.func;

            if (observer && action) {
                func = observer[action];
            }
            func(notification);
        });
        if (api.consoleDebug) {
            console.log("完成向 ", objects.length, " 个监听者发出通知：", name);
        }

    }
}

function center() {
    return notificationCenter;
}

module.exports.center = center;