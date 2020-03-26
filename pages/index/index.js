// pages/index/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    vipImg: '',
    banner: [],
    swiperCurrent: 0,
    commodity: [],
    hasMore: false,
    page: 1,
    pageSize: 10,
  },

  swiperChange(e) {
    let current = e.detail.current;
    let that = this;
    that.setData({
      swiperCurrent: current
    })
  },

  toJump: function(e) {
    var id = e.currentTarget.dataset.id;
    if (id == null || id == '') {} else {
      wx.navigateTo({
        url: '/pages/productDetails/productDetails?id=' + id,
      })
    }
  },

  // toSearch:function(e){
  //   var val=e.detail.value;
  //   console.log(val)
  //   wx.setStorageSync('inputVal', {
  //     val: val,
  //     isJump: true
  //     })
  //   wx.switchTab({
  //     url: '/pages/categories/categories',
  //   })
  // },


  // 登录
  login: function() {
    let that = this;
    if (wx.getStorageSync('userInfo') == '') {
      wx.navigateTo({
        url: '/pages/authorize/authorize',
      })
    } else {
      wx.login({
        success: function(res) {
          wx.request({
            url: app.globalData.baseUrl + '/login/get-openid.html',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: res.code
            },
            success: function(resp) {
              if (resp.data.status == 10000) {
                wx.setStorageSync('openId', resp.data.data)
                var userInfo = wx.getStorageSync('userInfo');
                var nickName = userInfo.nickName;
                wx.request({
                  url: app.globalData.baseUrl + '/login/login.html',
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  data: {
                    wx_openid: wx.getStorageSync('openId'),
                    wx_nikename: nickName
                  },
                  success: function(res) {
                    if (res.data.status == 10000) {
                      wx.setStorageSync('token', res.data.data);
                      return;
                    }
                    if (res.data.status == 10002) {
                      wx.showModal({
                        title: '提示',
                        content: '无法登录，请重试',
                        showCancel: false
                      })
                      return;
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  },

  loadData: function() {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/index/index.html',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        pagenumber: 1,
        numberperpage: 10
      },
      success: function(res) {
        console.log(res)
        var productList = res.data.data.proList
        for (var i = 0; i < productList.length; i++) {
          productList[i].discount = (productList[i].current_price / productList[i].original_price * 10).toFixed(1);
        }
        if (productList.length < 10) {
          that.setData({
            hasMore: false
          })
        } else {
          that.setData({
            hasMore: true
          })
        }
        that.setData({
          banner: res.data.data.banner,
          vipImg: res.data.data.banner_under[0].url,
          commodity: productList
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // this.login();
    this.loadData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // this.login();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  uploadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/index/index.html',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        pagenumber: that.data.page,
        numberperpage: that.data.pageSize
      },
      success: function(res) {
        var productList = res.data.data.proList
        if (productList.length == 0 || productList.length == undefined) {
          wx.showToast({
            icon: 'none',
            title: '暂无更多数据~',
          })
          that.setData({
            hasMore: false,
            page: --that.data.page
          })
        } else if (productList.length > 0) {
          for (var i = 0; i < productList.length; i++) {
            productList[i].discount = (productList[i].current_price / productList[i].original_price * 10).toFixed(1);
          }
          if (productList.length < 10) {
            that.setData({
              hasMore: false
            })
          } else {
            that.setData({
              hasMore: true
            })
          }
          that.setData({
            commodity: that.data.commodity.concat(productList)
          })
        }
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.hasMore) {
      var page = that.data.page;
      that.setData({
        page: ++page
      })
      setTimeout(function() {
        that.uploadData()
      }, 1000)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})