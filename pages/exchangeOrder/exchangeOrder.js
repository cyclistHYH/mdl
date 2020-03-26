// pages/exchangeOrder/exchangeOrder.js
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    integral: 0,
    currentAdd: '',
    product_number: 1,
    totalQuantity: 1,
    totalPrice: '',
    addressShow: false,
    address: [],
    productList: [],
    offer: [],
    postage: 0,
    offerId: '',
    addressId: '',
    remarksCon: ''
  },

  messageInp: function(e) {
    that.setData({
      remarksCon: e.detail.value
    })
  },

  numberPlus: function(e) {
    let that = this;
    let product_number = that.data.product_number;
    var integral = that.data.integral;
    var stock = that.data.productList[0].stock
    if (product_number * 5 > integral) {
      wx.showToast({
        icon: 'none',
        title: '超出可兑换数量',
      })
    } else if (product_number > stock) {
      wx.showToast({
        icon: 'none',
        title: '超出可库存数量',
      })
    } else {
      product_number++;
    }
    that.setData({
      product_number: product_number
    })
    that.totalPrice()
  },

  numberLess: function(e) {
    let that = this;
    let product_number = that.data.product_number;
    if (product_number > 1) {
      product_number--;
    }
    that.setData({
      product_number: product_number
    })
    that.totalPrice()
  },

  totalPrice: function() {
    let that = this
    let totalPrice = 0;
    var offer = that.data.offer;
    var offerPrice = 0;
    for (var i = 0; i < offer.length; i++) {
      if (offer[i].checked) {
        offerPrice = parseFloat(offer[i].opt_price)
      }
    }
    totalPrice = totalPrice + parseFloat(that.data.postage) * Number(that.data.product_number) + offerPrice;
    that.setData({
      totalPrice: parseFloat(totalPrice.toFixed(2))
    })
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

  chooseOffer: function(e) {
    console.log(e)
    this.setData({
      offerId: e.detail.value
    })
  },

  choose: function(e) {
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

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/product/conversion.html?token=' + wx.getStorageSync('token'),
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
            var offer = res.data.data.onSalePro;
            for (var i = 0; i < offer.length; i++) {
              offer[i].checked = false
            }
            that.setData({
              productList: [res.data.data.conversionPro],
              offer: offer,
              postage: res.data.data.conversionPro.postage
            })
            that.totalPrice()
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  // 立即购买
  toBuy: function() {
    let that = this;
    var addressId = that.data.addressId;
    var offer = that.data.offer;
    var offerId = '';
    var remarksCon = that.data.remarksCon;
    var number = that.data.product_number
    for (var i = 0; i < offer.length; i++) {
      if (offer[i].checked) {
        offerId = offer[i].id
      }
    }
    console.log(addressId, offerId, remarksCon, number)
    if (addressId == '' || addressId == undefined) {
      wx.showToast({
        icon: 'none',
        title: '请添加收货地址',
      })
      return
    }
    wx.request({
      url: app.globalData.baseUrl + '/order/conversion-order.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        conversion_pro_num: number,
        address_id: addressId,
        onsale_pro_id: offerId,
        remarks: remarksCon
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.toBuy();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var orderId = res.data.data;
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
          }
        }
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this
    that.setData({
      integral: Number(options.integral)
    })
    that.loadData();
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
    that.totalPrice();
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