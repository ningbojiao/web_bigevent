// 优化：在调用$.get()/$.post()/$.ajax()方法之前，默认调用以下函数
$.ajaxPrefilter(function (options) {
    // options就代表调用$.get()/$.post()/$.ajax()时候的传递参数对象
    console.log(options.url);
    // 调用前进行重新设置
    options.url = 'http://ajax.frontend.itheima.net' + options.url;

    // 优化：统一为有权限的资源设置headers请求头  /api/* 的资源可以直接访问  /my/* 的资源需要权限
    if (options.url.indexOf('/my/')) {
        options.headers = {
            Authorization: localStorage.getItem('token') || ''
        }
    }

    // 优化：全局统一绑定complete(),任何访问资源无论请求成功或失败都会执行该函数
    options.complete = function (res) {
        console.log('回调了complete(): ');
        console.log(res);
        // 如果用户不登录直接访问index.html，那么返回消息被封装在了responseJSON
        console.log(res.responseJSON);
        // 判断
        if (res.responseJSON.status === 1 && res.responseJSON.message === '身份认证失败！') {
            // 没有登录
            // 强制清空token
            localStorage.removeItem('token');
            // 跳转登录
            window.location.href = '/大事件/login.html';
        }
    }
});

// 请求发起显示加载图片，请求结束隐藏加载图片
$(document).ajaxStart(function () {
    $("#loadingImg").show();
}).ajaxStop(function () {
    $('#loadingImg').hide(0);
});