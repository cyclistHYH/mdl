// pages/orderDetails/orderDetails.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    isService: true,
    orderId: '',
    status: '',
    orderInfo: {},
    logisticsInfo: '',
    orderStatus: '卖家已发货',
    orderDeliveryName: '百世汇通',
    orderDeliveryNumber: '12121218989',
    productList: [],
  },

  toEvaluate: function(e) {
    wx.navigateTo({
      url: '/pages/evaluation/evaluation',
    })
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

  toLogistics: function(e) {
    wx.navigateTo({
      url: '/pages/logistics/logistics?id=' + e.currentTarget.dataset.id,
    })
  },

  loadData: function() {
    let that = this;
    var id = that.data.orderId;
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
        order_id: id
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          var kuaidicom = res.data.data.kuaidicom;
          var orderDeliveryName;
          switch (kuaidicom) {
            case 'yunda':
              orderDeliveryName = '韵达快递';
              break;
            case 'yuantong':
              orderDeliveryName = '圆通速递';
              break;
            case 'shentong':
              orderDeliveryName = '申通快递';
              break;
            case 'youzhengguonei':
              orderDeliveryName = '邮政快递';
              break;
            case 'shunfeng':
              orderDeliveryName = '顺丰速运';
              break;
            case 'zhongtong':
              orderDeliveryName = '中通快递';
              break;
            case 'huitongkuaidi':
              orderDeliveryName = '百世快递';
              break;
            case 'tiantian':
              orderDeliveryName = '天天快递';
              break;
          }
          that.setData({
            orderDeliveryName: orderDeliveryName,
            status: res.data.data.order_status,
            orderInfo: res.data.data
          })
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
                  that.searchData(e);
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
            that.loadData()
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


  // 获取物流信息
  loadLogistics: function() {
    let that = this;
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
        if (res.statusCode == 422) {
          app.login();
          that.loadLogistics();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            that.setData({
              logisticsInfo: res.data.data.data[0]
            })
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.id)
    this.setData({
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
    this.loadData();
    this.loadLogistics();
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