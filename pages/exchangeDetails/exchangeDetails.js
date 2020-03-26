// pages/exchangeDetails/exchangeDetails.js
const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRemind: true,
    isShow: true,
    incomeInfo: ''
  },

  toShow: function() {
    this.setData({
      isShow: false
    })
  },

  toClose: function() {
    this.setData({
      isShow: true
    })
  },

  toCloseRemind: function() {
    this.setData({
      isRemind: true
    })
  },

  toExchange: function() {
    let that = this;
    if (that.data.incomeInfo.integral < 5) {
      that.setData({
        isRemind: false
      })
    } else {
      wx.navigateTo({
        url: '/pages/exchangeOrder/exchangeOrder?integral=' + that.data.incomeInfo.integral,
      })
    }
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/my/help-center.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function (res) {
        if (res.statusCode == 422) {
          that.login();
          that.loadData();
          return;
        }
        if (res.statusCode == 200) {
          WxParse.wxParse('description', 'html', res.data.data.productChange.content, that, 5);
        }
      }
    })
    wx.request({
      url: app.globalData.baseUrl + '/my/get-shop-user-info.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            that.setData({
              incomeInfo: res.data.data,
            })
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
    this.loadData()
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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})