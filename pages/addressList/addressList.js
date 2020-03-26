// pages/addressList/addressList.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    carId: '',
    isBuynow: ''
  },

  modifyBtn: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/addressModify/addressModify?id=' + id,
    })
  },

  chooseBtn: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    if (that.data.isBuynow === 'true') {
      wx.redirectTo({
        url: '/pages/buyNow/buyNow?addressId=' + id + '&carId=' + that.data.carId,
      })
    } else {
      wx.redirectTo({
        url: '/pages/exchangeOrder/exchangeOrder?addressId=' + id,
      })
    }
  },

  loadAddress: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/address/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadAddress();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.length == undefined) {
            that.setData({
              addressShow: true
            })
          } else if (res.data.data.length > 0) {
            var address = res.data.data;
            that.setData({
              addressList: address,
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
    console.log(options.isBuynow)
    this.setData({
      carId: options.carId,
      isBuynow: options.isBuynow
    })
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
    this.loadAddress()
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