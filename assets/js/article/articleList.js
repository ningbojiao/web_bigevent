$(function () {
    var form = layui.form;
    var layer = layui.layer;
    var laypage = layui.laypage;
    // 定义查询对象query，列表页面默认要查看第几页的哪些数据
    var query = {
        pagenum: 1,     // 页码值，默认请求第1页数据
        pagesize: 5,    // 每页显示的文章数，默认值为5
        cate_id: '',    // 文章分类的id，默认为null
        state: ''       // 文章的发布状态，默认为null
    }

    // 定义一个时间格式化过滤器
    template.defaults.imports.dateFormat = function (date) {
        const dt = new Date(date);
        var y = dt.getFullYear();
        var m = paddingZero(dt.getMonth() + 1);
        var d = paddingZero(dt.getDate());

        var hh = paddingZero(dt.getHours());
        var mm = paddingZero(dt.getMinutes());
        var ss = paddingZero(dt.getSeconds());

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    }

    function paddingZero(n) {
        return n > 9 ? n : '0' + n;
    }

    // 获取文章列表数据
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: query,
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败', { icon: 5 });
                } else {
                    // 使用模版引擎渲染数据
                    var trs = template('tpl-table', res);
                    // 渲染到tbody中
                    $('tbody').html(trs);
                    // 提示消息
                    layer.msg('获取文章列表成功', { icon: 6 });

                    // 当表格数据渲染完毕后，我们应该渲染分页: res.total获取的是总记录数
                    renderPage(res.total);
                }
            }
        });
    }

    // 获取文章列表数据
    initTable();

    // 定义获取所有文章分类函数
    function initArticleTypeList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败', { icon: 5 });
                } else {
                    // 引入模版引擎js库，调用方法
                    var ops = template('tpl-cate', res);
                    // 设置给页面元素
                    $('[name=cate_id]').html(ops);
                    // 这里需要使用form重新渲染页面区域的UI结构
                    form.render();
                    // 提示信息
                    layer.msg('获取文章分类成功', { icon: 6 });
                }
            }
        });
    }

    // 获取文章分类列表
    initArticleTypeList();

    // 为筛选表单绑定提交事件
    $('#form-search').on('submit', function (e) {
        // 阻止默认事件
        e.preventDefault();
        // 获取筛选条件值
        var cate_id = $('[name=cate_id]').val();
        var cate_state = $('[name=state]').val();
        // 将获取的查询参数设置给查询参数对象
        query.cate_id = cate_id;
        query.state = cate_state;
        // 重新渲染table数据
        initTable();
    });

    // 定义一个渲染页面分页区域的函数
    function renderPage(total) {
        console.log('总文章数：' + total);
        // 使用laypage渲染页面pageBox元素
        laypage.render({
            elem: 'pageBox',    // 渲染的页面元素
            count: total,       // 数据总数，从服务端得到
            limit: query.pagesize, // 指定每页显示几条数据
            curr: query.pagenum, // 指定当前页码
            jump: function (obj, first) {
                // obj是分页条的封装对象
                console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                // 将用户单击切换的页码值赋给query对象
                query.pagenum = obj.curr;
                // 配置完了分页条的显示风格，那么可以通过obj.limit获取用户选择的每页展示条数
                console.log(obj.limit);
                query.pagesize = obj.limit;
                // 按照最新的当前页渲染页面: 这里有死循环
                /*
                jump死循环分析：
                1. 单击切换页码时候回回调jump函数（不是）
                2. 调用laypage.render()函数会调用jump函数（是）
                   - 渲染表格数据initTable()
                   - 渲染分页条数据renderPage()
                   - laypage.render()调用
                   - jump()被调用后又执行initTable() 死循环
                */
                // first参数判断是第一种还是第二种方式触发的jump函数
                console.log(first);
                if (!first) {
                    initTable();
                }
            },
            // 自定义分页条的样式: 要注意数组值出现的顺序
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            // 自定义下拉的每页显示数量: 用户切换选择的时候也会触发jump()函数
            limits: [5, 10, 15, 20, 25]
        });
    }

    // 为删除按钮委托代理事件
    $('tbody').on('click', '.btn-del', function () {
        // 获取要删除文章的id值
        var id = $(this).attr('data-id');
        // 获取当前页面中删除按钮的个数
        var count = $('.btn-del').length;
        console.log('当前页面还有：' + count + '条数据');
        // 打开一个确认框
        layer.confirm('确定要删除该文章吗?', { icon: 3, title: '提示' }, function (index) {
            // 发起删除文章的请求
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败', { icon: 5 });
                    } else {
                        layer.msg('删除文章成功', { icon: 6 });
                        /*
                         bug: 如果当页数据删除完毕，发现页面-1了，但是当前表格数据为null，原因是当前的pagenum值没有改变
                         解决方案：判断如果当前页数据已经删除完毕，那么pagenum-1之后再重新渲染页面
                         */
                        if (count === 1) {
                            // 当前页码必须-1，但是当前页码最小为1
                            query.pagenum = query.pagenum === 1 ? 1 : query.pagenum - 1;
                        }
                        // 重新渲染表格数据
                        initTable();
                    }
                }
            });
            layer.close(index);
        });
    });

    // 为编辑按钮委托代理事件
    $('tbody').on('click', '.btn-edit', function () {
        // 获取id值
        var id = $(this).attr('data-id');
        // 跳转页面
        window.location.href = 'articlePublish.html?id=' + id;
        // 存储id
        // localStorage.setItem('id', id);
    });
});