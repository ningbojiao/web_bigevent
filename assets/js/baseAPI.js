// 在调用$.get()/$.post()/$.ajax()方法之前，默认调用以下函数
$.ajaxPrefilter(function (options) {
    // options就代表调用$.get()/$.post()/$.ajax()时候的传递参数对象
    console.log(options.url);
    // 调用前进行重新设置
    options.url = 'http://ajax.frontend.itheima.net' + options.url;
});