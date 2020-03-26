// pages/logistics/logistics.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    address: [{
      isColor: true,
      day: '',
      time: '',
      img: '/images/logisticSreceipt.png',
      content: '',
      info: ''
    }],
    logistics: []
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/view.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        order_id: that.data.orderId
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var content = res.data.data.province + res.data.data.city + res.data.data.district + res.data.data.address + res.data.data.consignee + '收';
            var address = that.data.address;
            address[0].content = content
            that.setData({
              address: address
            })
          }
        }
      }
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/check-express.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        order_id: that.data.orderId
      },
      success: function(res) {
        console.log(res)
        var list = res.data.data.data;
        that.setData({
          logistics: list
        })
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
    console.log(options)
    let that = this;
    that.setData({
      orderId: options.id
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