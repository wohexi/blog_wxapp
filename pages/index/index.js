//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        blogData: {},
        timeline: null, //存放时间和列表对应的数据
        years: [], //所有年代数据
        dataSuccess: false,
        loading: true,
        requestUrl: null
    },
    onLoad: function () {
        const _ts = this;
        _ts.setData({
            requestUrl: app.baseUrl + '/api/blog'
        })
        this.getIndexData()
    },
    //打开详情
    openBlog: function (e) {
        var id = e.currentTarget.dataset.id;
        console.log(id)
        wx.navigateTo({
            url: '../detail/detail?id=' + id
        })
    },
    //获取首页数据
    getIndexData: function () {
        const _ts = this;
        const url = _ts.data.requestUrl
        if (url == null) {
            wx.showToast({
                title: '无数据',
            })
            return;
        }
        //请求markdown文件，并转换为内容
        wx.showLoading({
            title: '加载中',
        })
        wx.request({
            url: url,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: (res) => {
                wx.hideLoading()
                wx.stopPullDownRefresh();
                wx.hideNavigationBarLoading();
                // console.log(res.data)
                if (res.data.code == 400) {
                    that.setData({
                        dataSuccess: false,
                        loading: false
                    });
                    wx.showModal({
                        title: '提示',
                        content: res.data.msg,
                    })

                    return false;
                }
                //设置数据
                let _data = res.data.data.data;
                let json  = {}; // 根据时间划分数据
                _data.forEach((value,index) => {
                    let created_year = value.created_at.split("-",1)[0];
                    if(json[created_year]){
                        json[created_year].push(index);
                    }else{
                        json[created_year] = [index];
                    }
                });

                _ts.setData({
                    blogData: _data,
                    timeline : json,
                    years: Object.keys(json).sort().reverse(),
                    dataSuccess: true,
                    loading: false,
                    requestUrl: res.data.data.next_page_url
                });

            }
        });
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        this.setData({
            requestUrl: app.baseUrl + '/api/blog'
        });
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        this.getIndexData();
    },
    /**
     * 分享
     */
    onShareAppMessage: function (res) {
        return {
            title: 'Tegic Blog',
            path: '/pages/index/index',
            imageUrl: 'https://files.b15.me/images/avatar.png',
            success: function (res) {
                // 转发成功
            },
            fail: function (res) {
                // 转发失败
            }
        }
    },
})
