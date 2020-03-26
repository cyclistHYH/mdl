// pages/myOrder/myOrder.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    status: '',
    isService: true,
    toView: 'all',
    evaluationTxt: '',
    activeCategoryId: 0,
    page: 1,
    pageSize: 10,
    orderNav: [{
        id: 'all',
        name: '全部'
      },
      {
        id: 'deliver',
        name: '待发货'
      },
      {
        id: 'receipt',
        name: '待收货'
      },
      {
        id: 'completed',
        name: '已完成'
      },
      {
        id: 'comment',
        name: '待评价'
      }
    ],
    orderList: []
  },

  serviceBtn: function() {
    this.setData({
      isService: false
    })
  },

  toClose: function() {
    this.setData({
      isService: true
    })
  },

  navClick: function(e) {
    var that = this;
    let index = e.currentTarget.dataset.index;
    var status;
    switch (index) {
      case 0:
        status = 0;
        break;
      case 1:
        status = 2;
        break;
      case 2:
        status = 3;
        break;
      case 3:
        status = 5;
        break;
      case 4:
        status = 4;
        break;
    }
    that.setData({
      activeCategoryId: index,
      status: status,
      page: 1,
      pageSize: 10,
      orderList: []
    });
    that.loadData()
  },

  toEvaluate: function(e) {
    wx.navigateTo({
      url: '/pages/evaluation/evaluation?id=' + e.currentTarget.dataset.id,
    })
  },

  toLogistics: function(e) {
    wx.navigateTo({
      url: '/pages/logistics/logistics?id=' + e.currentTarget.dataset.id,
    })
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    var status = that.data.status;
    if (status == 0) {
      status = ''
    }
    var page = that.data.page;
    var pageSize = that.data.pageSize;
    wx.request({
      url: app.globalData.baseUrl + '/order/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        status: status,
        pagenumber: page,
        numberperpage: pageSize
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          var list = res.data.data;
          var status;
          if (list.length == 0) {
            wx.showToast({
              icon: 'none',
              title: '暂无更多数据~',
            })
            that.setData({
              page: --that.data.page
            })
          } else if (list.length > 0) {
            for (var i = 0; i < list.length; i++) {
              switch (list[i].order_status) {
                case 0:
                  status = '已取消';
                  break;
                case 1:
                  status = '待付款';
                  break;
                case 2:
                  status = '待发货';
                  break;
                case 3:
                  status = '待收货';
                  break;
                case 4:
                  status = '待评价';
                  break;
                case 5:
                  status = '已完成';
                  break;
              }
              list[i].status = status;
            }
            that.setData({
              orderList: that.data.orderList.concat(res.data.data)
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  // 支付
  toPay: function(e) {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/my/get-shop-user-info.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.data.status == 10000) {
          if (res.data.data.mobile == null || res.data.data.mobile == '') {
            wx.reLaunch({
              url: '/pages/binding/binding'
            })
            return
          } else {
            var id = e.currentTarget.dataset.id;
            wx.request({
              url: app.globalData.baseUrl + '/order/wxpay-string.html?token=' + wx.getStorageSync('token'),
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                open_id: wx.getStorageSync('openId'),
                order_id: id
              },
              success: function(resp) {
                if (resp.statusCode == 500) {
                  wx.showModal({
                    title: '提示',
                    content: '该订单无法支付，建议取消该订单重新下单',
                    showCancel: false
                  })
                } else if (res.statusCode == 422) {
                  app.login();
                  that.toPay();
                } else if (resp.statusCode == 200) {
                  if (resp.data.status == 10000) {
                    wx.requestPayment({
                      timeStamp: resp.data.data.timeStamp.toString(),
                      nonceStr: resp.data.data.nonceStr,
                      package: resp.data.data.package,
                      signType: resp.data.data.signType,
                      paySign: resp.data.data.paySign,
                      success(res) {
                        wx.request({
                          url: app.globalData.baseUrl + '/call-back/synchronous-callback.html?token=' + wx.getStorageSync('token'),
                          method: 'POST',
                          header: {
                            'content-type': 'application/x-www-form-urlencoded'
                          },
                          data: {
                            order_id: orderId
                          },
                          success: function(e) {
                            if (e.data.status == 10000) {
                              wx.reLaunch({
                                url: '/pages/buySuccess/buySuccess?money=' + that.data.totalPrice,
                              })
                            }
                          }
                        })
                      },
                      fail(res) {
                        wx.reLaunch({
                          url: '/pages/failure/failure',
                        })
                      }
                    })
                  }
                }
              }
            })
          }
        }
      }
    })
  },

  // 取消订单
  cancelOrder: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    wx.showLoading({
      title: '取消中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/cancel-order.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        order_id: id
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.cancelOrder(e);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            wx.showModal({
              title: '提示',
              content: '取消订单成功',
              showCancel: false,
              success(resp) {
                if (resp.confirm) {
                  that.setData({
                    page: 1,
                    pageSize: 10,
                  })
                  that.loadData()
                }
              }
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  // 确认收货
  toReceipt: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    wx.showLoading({
      title: '确认收货中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/ordercompleted.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        order_id: id
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.toReceipt(e);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            wx.showToast({
              title: '确认收货成功',
            })
            setTimeout(function() {
              that.setData({
                orderList: [],
                page: 1,
                pageSize: 10,
              })
              that.loadData()
            }, 1000)
          } else if (res.data.status == 10003) {
            wx.showModal({
              title: '提示',
              content: '确认收货失败，请重试。',
              showCancel: false
            })
          } else if (res.data.status == 10004) {
            wx.showModal({
              title: '提示',
              content: '该订单未处于待收货状态，无法确认收货。',
              showCancel: false
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
    let that = this;
    var toView = options.id;
    var idx;
    var status;
    switch (toView) {
      case 'all':
        idx = 0;
        status = 0;
        break;
      case 'deliver':
        idx = 1;
        status = 2;
        break;
      case 'receipt':
        idx = 2;
        status = 3;
        break;
      case 'completed':
        idx = 3;
        status = 5;
        break;
    }
    that.setData({
      toView: toView,
      activeCategoryId: idx,
      status: status
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
    let that = this;
    that.setData({
      page: 1,
      pageSize: 10,
      orderList: []
    })
    that.loadData()
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
    let that = this;
    var page = that.data.page;
    that.setData({
      page: ++page
    })
    setTimeout(function() {
      that.loadData()
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})