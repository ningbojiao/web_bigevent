$(function () {
    var layer = layui.layer;
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
                    // 引入模版引擎js库，调用方法
                    var trs = template('tpl-table', res);
                    // 设置给页面元素
                    $('tbody').html(trs);
                    // 提示信息
                    layer.msg('获取文章分类成功', { icon: 6 });
                }
            }
        });
    }
    // 调用
    initArticleTypeList();

    // 给添加列别按钮绑定单击事件
    // 定义弹出层变量，打开的时候接收该变量，关闭的时候需要使用
    var indexAdd = null;
    $('#btnAddType').on('click', function () {
        //  使用layer.open()打开弹出层
        indexAdd = layer.open({
            title: '添加文章分类',
            // content可以直接指定html标签，但是太麻烦，我们直接使用模版获取过来比较方便
            content: $('#dialogAddType').html(),
            // 默认为0是消息框，会有一个确定按钮；设置为1是页面层，取消按钮
            type: 1,
            // 指定宽高度
            area: ['500px', '250px']
        });
    });

    // 因为form是动态添加的，因此我们需要使用代理的方式委托事件
    $('body').on('submit', '#form-add', function (e) {
        e.preventDefault();
        console.log(e);
        // 发起请求
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('新增分类失败', { icon: 5 });
                } else {
                    // 消息提示
                    layer.msg('新增分类成功', { icon: 6 });
                    // 关闭弹出层
                    layer.close(indexAdd);
                    // 刷新列表数据
                    initArticleTypeList();
                }
            }
        });
    });

    // 给编辑按钮委托代理事件,这里绑定的是tbody的原因是生成的trs都是绑定给页面中的tbody元素的
    var indexEdit = null;
    var form = layui.form;
    $('tbody').on('click', '#btnEdit', function () {
        indexEdit = layer.open({
            title: '编辑文章分类',
            content: $('#dialogEditType').html(),
            type: 1,
            area: ['500px', '250px']
        });
        // 获取文章分类Id
        var id = $(this).attr('data-id');
        console.log(id);
        // 根据文章分类Id，查找文章分类数据
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类信息失败', { icon: 5 });
                } else {
                    // 获取数据并回显
                    form.val('form-edit', res.data);
                }
            }
        });
    });

    // 给弹出的编辑表单委托代理事件
    $('body').on('submit', '#form-edit', function (e) {
        e.preventDefault();
        console.log(e);
        // 发起请求
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('编辑分类失败', { icon: 5 });
                } else {
                    // 消息提示
                    layer.msg('编辑分类成功', { icon: 6 });
                    // 关闭弹出层
                    layer.close(indexEdit);
                    // 刷新列表数据
                    initArticleTypeList();
                }
            }
        });
    });

    // 给删除按钮委托代理事件
    $('tbody').on('click', '#btnDel', function () {
        var id = $(this).attr('data-id');
        // 弹出确认框
        layer.confirm(
            '确认要删除吗？',
            {
                icon: 3,
                title: '提示'
            },
            function (index) {
                // 用户单击确认按钮后执行该函数
                $.ajax({
                    method: 'GET',
                    url: '/my/article/deletecate/' + id,
                    success: function (res) {
                        if (res.status !== 0) {
                            return layer.msg('删除分类失败', { icon: 5 });
                        } else {
                            layer.msg('删除分类成功', { icon: 6 });
                            // 关闭窗口
                            layer.close(index);
                            // 刷新列表
                            initArticleTypeList();
                        }
                    }
                });
            }
        );
    });
})