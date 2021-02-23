$(function () {
    var layer = layui.layer;
    var form = layui.form;

    // 初始化富文本编辑器
    initEditor();

    // 初始化封面裁剪区域
    // 1. 初始化图片裁剪器
    var $image = $('#image');
    // 2. 裁剪选项
    var options = {
        aspectRatio: 400 / 280,
        preview: '.img-preview'
    };
    // 3. 初始化裁剪区域
    $image.cropper(options);

    // 获取文章分类列表信息
    function initArticleTypeList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                console.log(res);
                console.log(res.data);
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败', { icon: 5 });
                } else {
                    var ops = template('tpl-type', res);
                    $('[name=cate_id]').html(ops);
                    // 记得重新渲染以下form表单
                    form.render();
                    // 初始化文章
                    initArticle();
                }
            }
        });
    }
    // 调用
    initArticleTypeList();

    // 给选择封面绑定单击事件
    $('#btnChooseImg').on('click', function () {
        $('#coverFile').click();
    });
    // 监听#coverFile的change事件
    $('#coverFile').on('change', function (e) {
        // 用户选择的文件在e.target.files伪数组中
        var files = e.target.files;
        // 判断
        if (files.length === 0) {
            return;
        } else {
            // 根据文件创建URL地址
            var newImgURL = URL.createObjectURL(files[0]);
            // 为裁剪区域重新设置图片
            $image
                .cropper('destroy')      // 销毁旧的裁剪区域
                .attr('src', newImgURL)  // 重新设置图片路径
                .cropper(options)        // 重新初始化裁剪区域
        }
    });

    // 定义一个存储文章状态的变量
    var state = '已发布';
    // 给存为草稿按钮绑定事件
    $('#btnSave2').on('click', function () {
        state = '草稿';
    });
    // 监听表单的提交事件
    $('#form-Pub').on('submit', function (e) {
        e.preventDefault();
        // 创建FormData对象
        var fd = fd = new FormData($(this)[0]);
        // 将文章的状态存到fd中
        fd.append('state', state);
        // 如果页面没有回填的文章Id且当前提交按钮文本为发布文章，则新增文章数据
        if ($('#btnSave1').text() === '发布文章' && !$('[type=hidden]').val()) {
            // 注意：使用同一个表单的时候会将null的Id也填充进去，因此需要删除
            fd.delete('Id');
            // 发布文章
            $image
                .cropper('getCroppedCanvas', {  // 创建一个 Canvas 画布
                    width: 400,
                    height: 280
                })
                .toBlob(function (blob) {       // 将Canvas画布上的内容，转化为文件对象
                    // 得到文件对象后，进行后续的操作
                    fd.append('cover_img', blob);
                    // 发起发布文章请求(注意在这里调用发布函数并传递fd数据)
                    publishArticle(fd);
                });
        } else if ($('#btnSave1').text() === '修改文章' && $('[type=hidden]').val().trim()) {
            $image
                .cropper('getCroppedCanvas', {  // 创建一个 Canvas 画布
                    width: 400,
                    height: 280
                })
                .toBlob(function (blob) {       // 将Canvas画布上的内容，转化为文件对象
                    // 得到文件对象后，进行后续的操作
                    fd.append('cover_img', blob);
                    // 编辑文章
                    editArticle(fd);
                });
        }
    });

    // 定义发布文章的函数
    function publishArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/add',
            // 如果数据类型是FormData格式，那么必须指定类型
            contentType: false,
            processData: false,
            data: fd,
            success: function (res) {
                console.log(res);
                if (res.status !== 0) {
                    return layer.msg('发布文章失败', { icon: 5 });
                } else {
                    layer.msg('发布文章成功', { icon: 6 });
                    // 跳转到文章列表页面：注意这里的路径以页面为准而不是以当前资源文件为准，因此应该以articlePublish.html为准
                    window.location.href = 'articleList.html';
                }
            }
        });
    }

    function editArticle(fd) {
        $.ajax({
            method: 'POST',
            url: '/my/article/edit',
            // 如果数据类型是FormData格式，那么必须指定类型
            contentType: false,
            processData: false,
            data: fd,
            success: function (res) {
                console.log(res);
                if (res.status !== 0) {
                    return layer.msg('编辑文章失败', { icon: 5 });
                } else {
                    layer.msg('编辑文章成功', { icon: 6 });
                    // 编辑完毕后
                    $('#btnSave1').text('发布文章');
                    $('[type=hidden]').val('');
                    // 跳转到文章列表页面：注意这里的路径以页面为准而不是以当前资源文件为准，因此应该以articlePublish.html为准
                    window.location.href = 'articleList.html';
                }
            }
        });
    }

    // 页面默认填充数据函数
    function initArticle() {
        var id = window.location.search.split('=')[1];
        if (id != null) {
            // 获取指定文章信息回显
            $.ajax({
                method: 'GET',
                url: '/my/article/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('获取文章信息失败', { icon: 5 });
                    } else {
                        layer.msg('获取文章信息成功', { icon: 6 });
                        console.log('--------------');
                        console.log(res.data);
                        // 快速回显数据：在页面表单上使用 lay-filter="articleInfo" 属性
                        form.val('articleInfo', res.data);
                        // 回显下拉框: 正常回填数据是可以的，要注意的是分类是可以被删除的，文章的cate_id没有进行外键关联
                        // 回显文章内容(这里要注意的是先获取激活编辑器对象后再使用setContent()设置获取服务器文章内容)
                        tinyMCE.activeEditor.setContent(res.data.content);
                        // 回显裁剪区
                        $image
                            .cropper('destroy')      // 销毁旧的裁剪区域
                            .attr('src', 'http://ajax.frontend.itheima.net' + res.data.cover_img)  // 重新设置图片路径
                            .cropper(options)        // 重新初始化裁剪区域

                        // 将发布文章修改为修改文章
                        $('#btnSave1').text('修改文章');
                    }
                }
            });
        }
    }
});