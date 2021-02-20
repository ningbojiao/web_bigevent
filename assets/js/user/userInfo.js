$(function () {
    // 获取layui表单
    var form = layui.form;
    var layer = layui.layer;
    // 验证数据
    form.verify({
        nickname: [
            /^[\S]{6,12}$/,
            '昵称必须6到12位，且不能出现空格'
        ]
    });

    // 初始化用户信息到表单
    function initUserInfo() {
        $.ajax({
            method: 'GET',
            url: '/my/userinfo',
            success: function (res) {
                console.log(res);
                // 判断
                if (res.status !== 0) {
                    return layer.msg('获取用户信息失败', { icon: 5 });
                } else {
                    console.log(res.data);
                    // 回显用户数据： layui - 内置模块 - 表单 - 表单赋值与取值（目录）
                    // 参数1: 表单中lay-filter=""的值
                    // 参数2: 把该对象对应的属性赋值给参数中对应的name属性值的表单项
                    form.val('userInfo', res.data);
                }
            }
        });
    }

    // 调用函数
    initUserInfo();

    // 绑定重置按钮的单击事件
    $("#btnReset").on('click', function (e) {
        // 阻止重置按钮的默认事件
        e.preventDefault();
        // 这里重置就是将用户信息重新初始化一次
        initUserInfo();
    });

    // 绑定表单提交事件
    $(".layui-form").on('submit', function (e) {
        // 阻止表单的默认行为
        e.preventDefault();
        // 发起ajax请求
        $.ajax({
            method: 'POST',
            url: '/my/userinfo',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新用户信息失败', { icon: 5 });
                } else {
                    layer.msg('更新用户信息成功', { icon: 6 });
                    // 调用父页面index.html对应的index.js中的getUserInfo()重新渲染页面的头像
                    window.parent.getUserInfo();
                }
            }
        });
    });
});