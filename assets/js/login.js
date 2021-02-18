$(function () {
    // 单击注册账号的链接
    $('#link_reg').on('click', function () {
        $('.login-box').hide();
        $('.reg-box').show();
    });
    // 单击登录账号的链接
    $('#link_login').on('click', function () {
        $('.login-box').show();
        $('.reg-box').hide();
    });
    // 自定义表单校验规则: 从layui上获取form表单
    var form = layui.form;

    form.verify({
        uname: [
            /^[\S]{6,12}$/,
            '用户名必须6到12位，且不能出现空格'
        ],
        psw: [
            // \S代表非空格字符 ^开始 $结尾
            /^[\S]{6,12}$/,
            '密码必须6到12位，且不能出现空格'
        ],
        // 校验两次密码是否一致：value为当前输入框的值
        repsw: function (value) {
            // 获取密码值
            var psw = $('.reg-box [name=password]').val();
            // value为确认密码的值,进行比较
            if (psw !== value) {
                return '两次密码输入不一致';
            }
        }
    });

    // 使用layer进行消息提示：从layui上后去layer
    var layer = layui.layer;

    //  监听注册表单的提交事件
    $('#form_reg').on('submit', function (e) {
        // 阻止表单默认提交行为
        e.preventDefault();
        // 获取数据
        var data = {
            username: $('#form_reg [name=username]').val(),
            password: $('#form_reg [name=password]').val()
        };
        // 发起POST请求
        $.post(
            '/api/reguser',
            data,
            function (res) {
                console.log(res);
                if (res.status != 0) {
                    // return console.log(res.message);
                    // 使用layer提示消息
                    layer.msg(res.message, { icon: 5 });
                } else {
                    // console.log('注册成功');
                    // 使用layer提示消息
                    layer.msg(res.message, { icon: 6 });
                    // 模拟单击【去登录】链接
                    $('#link_login').click();
                }
            }
        );
    });

    // 监听登录表单的提交事件
    $('#form_login').submit(function (e) {
        e.preventDefault();
        $.ajax(
            {
                method: 'POST',
                url: '/api/login',
                // 快速获取表单数据
                data: $(this).serialize(),
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('用户名或密码错误', { icon: 5 });
                    } else {
                        /*
                         {
                          status: 0, 
                          message: "登录成功！", 
                          token: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZC…wODl9.7pXlqTSse24hbIePGK4MiCpqcIui7uK8QbXd6v-M0n4"
                         }
                         如果获取的资源是需要身份认证的，那么需要添加请求头
                         Authorization:值就是token的值，不带""号
                         */
                        console.log(res);
                        // 登录成功
                        layer.msg('登录成功', { icon: 6 });
                        // 既然后面可能使用该值，那么需要保存起来
                        localStorage.setItem('token', res.token);
                        // 跳转到首页
                        window.location.href = '/大事件/index.html';
                    }
                }
            }
        );
    });
});