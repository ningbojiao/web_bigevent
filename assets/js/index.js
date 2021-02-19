// 编写入口函数
$(function () {
    // 获取用户信息
    getUserInfo();
    // 实现系统退出功能
    var layer = layui.layer;
    $('#btnLogout').on('click', function () {
        // 参见 layui - 内置模块 - 弹出层 - confirm(目录)
        layer.confirm('您确认要退出系统吗?', { icon: 3, title: '提示' }, function (index) {
            // 清除本地存储的认证信息
            localStorage.removeItem('token');
            // 跳转页面
            window.location.href = '/大事件/login.html';
            // 默认的关闭确认框代码不变
            layer.close(index);
        });
    });
});

// 获取用户信息，渲染头像
function getUserInfo() {
    $.ajax({
        method: 'GET',
        url: '/my/userinfo',
        data: {},
        // 因为这里访问的是授权资源，因此我们需要新增请求头
        /* 优化：在baseAPI.js中统一设置
        headers: {
            Authorization: localStorage.getItem('token') || ''
        },
        */
        success: function (res) {
            console.log(res);
            // 判断
            if (res.status !== 0) {
                return layui.layer.msg('获取用户消息失败', { icon: 5 });
            } else {
                renderAvatar(res.data);
            }
        },
        // 开发者发出请求成功回调success(),失败回调error(),无论失败还是成功都会继续回调complete(),因此可以在这里过滤用户请求
        /* 优化：优化到baseAPI.js中，当每次发起请求之前，给参数对象绑定complete()
        complete: function (res) {
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
        */
    });
}

// 渲染用户头像
function renderAvatar(user) {
    // 优先显示昵称再显示登录名
    var name = user.nickname || user.username;
    // 跟新左边菜单栏的用户欢迎信息
    $('#welcome').html('欢迎&nbsp;&nbsp;' + name);
    // 判断头像
    if (user.user_pic !== null) {
        // 显示图片头像
        $('.layui-nav-img').attr('src', user.user_pic);
        // 隐藏文本头像
        $('.text-avatar').hide();
    } else {
        // 显示文本头像
        $('.layui-nav-img').hide();
        // 获取用户名首字母
        var firstChar = name[0].toUpperCase();
        $('.text-avatar').html(firstChar).show();

    }
}