$(function () {
    // 1. 获取裁剪区域的 DOM 元素
    var $image = $('#image');
    // 2. 配置选项
    const options = {
        // 纵横比: 4/3, 16/9 都可以，1指定为正方形
        aspectRatio: 1,
        // 指定预览区域：类选择器选择样式元素
        preview: '.img-preview'
    };

    // 3. 创建裁剪区域
    $image.cropper(options);

    // 4. 给上传按钮绑定事件
    $('#btnChooseImg').on('click', function () {
        // 模拟将文件上传框单击以下，以便弹出文件选择框
        $('#file').click();
    });

    var layer = layui.layer;

    // 5. 用上传文件替换裁剪的默认文件
    $('#file').on('change', function (e) {
        console.log(e);
        // 默认事件中的target属性的files属性存储了上传的文件，files是一个伪数组
        console.log(e.target.files[0]);
        var filelist = e.target.files;
        // 判断
        if (filelist.length === 0) {
            layer.msg('请选择要上传的图片', { icon: 5 });
        } else {
            // 5.1 获取要替换的文件
            var file = filelist[0];
            // 5.2 将图片转换为路径
            var newImgURL = URL.createObjectURL(file);
            // 5.3 使用cropper插件替换原来的裁剪区
            $image
                .cropper('destroy') // 先销毁原来的裁剪区
                .attr('src', newImgURL) // 再设置新的文件路径
                .cropper(options); // 重新绘制裁剪区
        }
    });

    // 6. 为确定按钮绑定上传事件
    $('#btnUpload').on('click', function () {
        // 获取裁剪好的图片(base64图片)
        var dataURL = $image.cropper('getCroppedCanvas', { width: 100, height: 100 }).toDataURL('image/png');
        // 发起请求
        $.ajax({
            method: 'POST',
            url: '/my/update/avatar',
            data: { avatar: dataURL },
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('更换头像失败', { icon: 5 });
                } else {
                    layer.msg('更换头像成功', { icon: 6 });
                    // 调用父页面刷新头像
                    window.parent.getUserInfo();
                }
            }
        });
    });
});