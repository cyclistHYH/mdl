// pages/buyNow/buyNow.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentAdd: '',
    carId: '',
    remarks: '',
    addressId: '',
    pathHeader: app.globalData.baseUrl,
    totalQuantity: 1,
    totalPrice: 0,
    addressShow: true,
    address: [],
    productList: [],
    offer: [],
    offerId: ''
  },

  loadAddress: function() {
    let that = this;
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
            var address = [res.data.data[0]];
            var addressId = res.data.data[0].address_id
            that.setData({
              address: address,
              addressId: addressId,
              addressShow: false
            })
          }
        }
      }
    })
  },

  messageInp: function(e) {
    this.setData({
      remarks: e.detail.value
    })
  },

  chooseOffer: function (e) {
    this.setData({
      offerId: e.detail.value
    })
  },

  choose: function (e) {
    let that = this;
    var offerId = that.data.offerId;
    var offer = that.data.offer;
    for (var i = 0; i < offer.length; i++) {
      if (offer[i].id == that.data.offerId) {
        for (var j = 0; j < offer.length; j++) {
          if (offer[j].checked && j != i) {
            offer[j].checked = false;
          }
        }
        offer[i].checked = !(offer[i].checked);
      }
    }
    that.setData({
      offer: offer,
    })
    that.totalPrice();
  },

  totalPrice:function(){
    let that = this
    let totalPrice = 0;
    var offer = that.data.offer;
    var offerPrice = 0;
    for (var i = 0; i < offer.length; i++) {
      if (offer[i].checked) {
        offerPrice = parseFloat(offer[i].opt_price)
      }
    }
    for (var i = 0; i < that.data.productList.length; i++) {
      totalPrice = totalPrice + that.data.productList[i].price * that.data.productList[i].product_number
    }
    totalPrice =totalPrice+offerPrice;
    that.setData({
      totalPrice: parseFloat(totalPrice.toFixed(2))
    })
  },

  toBuy: function() {
    let that = this;
    var offerId = '';
    var offer = that.data.offer;
    for (var i = 0; i < offer.length; i++) {
      if (offer[i].checked) {
        offerId = offer[i].id
      }
    }
    if (that.data.addressId == '' || that.data.addressId == undefined) {
      wx.showToast({
        icon: 'none',
        title: '请添加收货地址',
      })
      return
    }
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/generate-orders.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        cart_id: that.data.carId,
        address_id: that.data.addressId,
        remarks: that.data.remarks,
        onsale_pro_id: offerId
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.toBuy();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var orderId = res.data.data
            if (orderId != "") {
              wx.request({
                url: app.globalData.baseUrl + '/order/wxpay-string.html?token=' + wx.getStorageSync('token'),
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  open_id: wx.getStorageSync('openId'),
                  order_id: orderId
                },
                success: function(resp) {
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
                                url: '/pages/buySuccess/buySuccess?money=' + that.data.totalPrice + '&orderId=' + orderId,
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
              })
            }
          } else if (res.data.status == 10003) {
            wx.showModal({
              title: '提示',
              content: '订单生成失败',
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

  upDataAdd: function(e) {
    let that = this;
    var id = e;
    wx.request({
      url: app.globalData.baseUrl + '/address/view.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        address_id: id
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.upDataAdd(e);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var address = [res.data.data]
            that.setData({
              address: address,
              addressId: res.data.data.address_id
            })
          }
        }
      }
    })
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    var id = that.data.carId;
    wx.request({
      url: app.globalData.baseUrl + '/product/sale-pro.html?token=' +wx.getStorageSync('token'),
      method: 'POST',
      success:function(res){
        console.log(res)
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var offer = res.data.data.onSalePro;
            for (var i = 0; i < offer.length; i++) {
              offer[i].checked = false
            }
            that.setData({
              offer: offer,
            })
            // that.totalPrice()
          }
        }
      }
    })
    wx.request({
      url: app.globalData.baseUrl + '/cart/order-confirm.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        cart_id: id
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          // var totalMoney = 0;
          // for (var i = 0; i < res.data.data.length; i++) {
          //   totalMoney = totalMoney + res.data.data[i].price * res.data.data[i].product_number
          // }

          // totalMoney = parseFloat(totalMoney.toFixed(2));
          that.setData({
            productList: res.data.data,
            totalQuantity: res.data.data.length,
            // totalPrice: totalMoney
          })
          that.totalPrice();
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
    console.log(options)
    let that = this;
    that.setData({
      carId: options.carId
    })
    that.loadData()
    if (options.addressId != "") {
      that.setData({
        currentAdd: options.addressId
      })
    }
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
    that.loadAddress();
    if (that.data.currentAdd != undefined && that.data.currentAdd != '') {
      that.upDataAdd(that.data.currentAdd)
    }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})