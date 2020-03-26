// pages/income/detail/detail.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    income: '',
    withdraw: '',
    detailList: [],
    page: 1,
    pageSize: 20,
  },

  bindDateChange: function(e) {
    let that = this;
    that.setData({
      date: e.detail.value
    })
    that.loadData();
  },

  getTime: function() {
    let that = this;
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var time = year + "-" + month
    that.setData({
      date: time
    })
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/withdraw/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        month: that.data.date,
        pagenumber: 1,
        numberperpage: 20
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
            if (res.data.data.length == 0 || res.data.data.length == undefined) {
              wx.showToast({
                title: '暂无数据',
              })
            } else if (res.data.data.length > 0) {
              that.setData({
                detailList: res.data.data
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
    let that = this;
    that.setData({
      income: options.income,
      withdraw: options.withdraw
    })
    that.getTime();
    that.loadData()
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
      url: app.globalData.baseUrl + '/withdraw/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        month: that.data.date,
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
                detailList: that.data.detailList.concat(res.data.data)
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