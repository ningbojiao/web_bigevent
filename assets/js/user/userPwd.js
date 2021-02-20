$(function () {
    var form = layui.form;
    var layer = layui.layer;

    // 验证数据
    form.verify({
        pwd: [
            /^[\S]{6,12}$/,
            '密码必须6到12位，且不能出现空格'
        ],
        samePwd: function (value) {
            if (value === $('[name=oldPwd]').val()) {
                return '新旧密码不能一致';
            }
        },
        rePwd: function (value) {
            if (value !== $('[name=newPwd]').val()) {
                return '两次新密码不一致';
            }
        },
    });

    // 绑定修改表单提交事件
    $('.layui-form').on('submit', function (e) {
        e.preventDefault();
        alert('更新密码');
        $.ajax({
            method: 'POST',
            url: '/my/updatepwd',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更新密码失败', { icon: 5 });
                } else {
                    layer.msg('更新密码成功', { icon: 6 });
                    // 重置表单: 转换为原生的DOM对象，调用reset()
                    $('.layui-form')[0].reset();
                }
            }
        });
    });
});