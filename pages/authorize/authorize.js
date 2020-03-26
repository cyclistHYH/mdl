// pages/authorize/authorize.js
const app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  bindGetUserInfo: function (e) {
    if (!e.detail.userInfo) {
      return;
    }
    wx.setStorageSync('userInfo', e.detail.userInfo);
    wx.login({
      success: function (res) {
        wx.request({
          url: 'https://ssl.mandylor.cn' + '/login/get-openid.html',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            code: res.code
          },
          success: function (resp) {
            wx.setStorageSync('openId', resp.data.data)
            var userInfo = wx.getStorageSync('userInfo');
            var nickName = userInfo.nickName;
            wx.request({
              url: 'https://ssl.mandylor.cn' + '/login/login.html',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                wx_openid: wx.getStorageSync('openId'),
                wx_nikename: nickName
              },
              success: function (res) {
                if (res.data.status == 10000) {
                  var token=wx.setStorageSync('token', res.data.data);
                }
                if (res.data.status == 10002) {
                  wx.showModal({
                    title: '提示',
                    content: '无法登录，请重试',
                    showCancel: false
                  })
                  return;
                }
                wx.navigateBack()
              }
            })
          }
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})