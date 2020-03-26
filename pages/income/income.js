// pages/income/income.js
const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRemind: true,
    isWithdraw: true,
    incomeInfo: ''
  },

  toWithdraw: function() {
    let that = this;
    var income = that.data.incomeInfo.income;
    if (income == 0) {
      wx.showToast({
        icon: 'none',
        title: '暂无余额可提现',
      })
    } else if (income > 0) {
      that.setData({
        isWithdraw: false
      })
    }
  },

  closeWithdraw: function() {
    this.setData({
      isWithdraw: true
    })
  },

  toShow: function() {
    this.setData({
      isRemind: false
    })
  },

  toCloseRemind: function() {
    this.setData({
      isRemind: true
    })
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
          WxParse.wxParse('description', 'html', res.data.data.earnings.content, that, 5);
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
      complete:function(){
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