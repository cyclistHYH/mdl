// pages/myComment/myComment.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    comment: [],
    page: 1,
    pageSize: 10,
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/product/my-evaluatr-list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            if (res.data.data.length == 0) {
              wx.showToast({
                title: '暂无数据',
              })
            } else if (res.data.data.length > 0) {
              that.setData({
                comment: res.data.data
              })
            }
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData()
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
      url: app.globalData.baseUrl + '/product/evaluatr-list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        product_id: that.data.productId,
        pagenumber: that.data.page,
        numberperpage: that.data.pageSize
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.uploadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            if (res.data.data.length == 0 || res.data.data.length == undefined) {
              wx.showToast({
                icon: 'none',
                title: '暂无更多数据~',
              })
              that.setData({
                page: --that.data.page
              })
            } else if (res.data.data.length > 0) {
              that.setData({
                comment: that.data.comment.concat(res.data.data)
              })
            }
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    var page = that.data.page;
    that.setData({
      page: ++page
    })
    setTimeout(function() {
      that.uploadData()
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})