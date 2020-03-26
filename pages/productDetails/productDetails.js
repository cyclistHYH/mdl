// pages/productDetails/productDetails.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    evaluation: '',
    isNull: false,
    productId: '',
    isLabel: true,
    product: '',
    pathHeader: app.globalData.baseUrl,
    skuId: '',
    skuId1: '',
    opt_price: '',
    opt_price2: '',
    stock: '',
    currentLabel: '',
    currentLabel1: '',
    isBuyNow: false,
    labelActive: 0,
    labelActive1: 0,
    isParameter: true,
    isService: true,
    scrollTop: 0,
    canBuy: '',
    isShow: true,
    goTopStatus: true,
    isSuccess: true,
    service: [{
        name: '退货说明'
      },
      {
        name: '换货说明'
      },
      {
        name: '价格说明'
      }
    ],
    label: [],
    buyQuantity: 1
  },

  toEvaluation: function() {
    wx.navigateTo({
      url: '/pages/comment/comment?id=' + this.data.productId,
    })
  },

  pageScroll: function(e) {
    let that = this;
    let scrollTop = e.detail.scrollTop;
    if (scrollTop > 300) {
      that.setData({
        goTopStatus: false
      })
    } else {
      that.setData({
        goTopStatus: true
      })
    }
  },

  toGoTop: function() {
    this.setData({
      scrollTop: 0
    })
  },

  toClose: function() {
    this.setData({
      isShow: true,
      isParameter: true,
      isService: true
    })
  },

  completeBtn: function() {
    this.setData({
      isParameter: true,
      isService: true
    })
  },

  toParameter: function() {
    this.setData({
      isParameter: false
    })
  },

  toService: function() {
    this.setData({
      isService: false
    })
  },

  numberPlus: function() {
    let that = this;
    // let number = parseInt(that.data.buyQuantity);
    // number++;
    // that.setData({
    //   buyQuantity: number
    // })
  },

  numberLess: function() {
    let that = this;
    // let number = parseInt(that.data.buyQuantity);
    // if (number > 1) {
    //   number--
    // }
    // that.setData({
    //   buyQuantity: number
    // })
  },

  chooseLabel: function() {
    let that = this;
    that.setData({
      isShow: false,
      isLabel: true,
      buyQuantity: 1
    })
  },

  toChooseLabel: function(e) {
    let that = this;
    let idx = e.currentTarget.dataset.index;
    if (that.data.product.goods_optional.length == 1) {
      if (that.data.product.goods_optional[0].id.length > 1) {
        that.setData({
          skuId: that.data.product.goods_optional[0].id[idx],
          currentLabel: that.data.product.goods_optional[0].opt_text[idx],
          labelActive: idx,
          opt_price: that.data.product.goods_optional[0].opt_price[idx].opt_price,
        })
      } else {
        that.setData({
          skuId: that.data.product.goods_optional[0].id,
          currentLabel: that.data.product.goods_optional[0].opt_text,
          labelActive: idx,
          opt_price: that.data.product.goods_optional[0].opt_price[0].opt_price,
        })
      }
    }
    if (that.data.product.goods_optional.length == 2) {
      if (that.data.product.goods_optional[0].id.length > 1) {
        that.setData({
          skuId: that.data.product.goods_optional[0].id[idx],
          currentLabel: that.data.product.goods_optional[0].opt_text[idx],
          labelActive: idx,
          opt_price: that.data.product.goods_optional[0].opt_price[idx][that.data.product.goods_optional[1].id[that.data.labelActive1]].opt_price,
          stock: that.data.product.goods_optional[0].opt_price[idx][that.data.product.goods_optional[1].id[that.data.labelActive1]].stock
        })
      } else {
        that.setData({
          skuId: that.data.product.goods_optional[0].id,
          currentLabel: that.data.product.goods_optional[0].opt_text,
          labelActive: idx,
          opt_price: that.data.product.goods_optional[0].opt_price[0][that.data.product.goods_optional[1].id].opt_price,
        })
      }
    }
    // that.setData({
    //   labelActive: idx
    // })
  },

  toChooseLabel1: function(e) {
    var that = this
    var idx = e.currentTarget.dataset.index;
    if (that.data.product.goods_optional[0].id.length > 1) {
      that.setData({
        skuId1: that.data.product.goods_optional[1].id[idx],
        currentLabel1: that.data.product.goods_optional[1].opt_text[idx],
        labelActive1: idx,
        opt_price: that.data.product.goods_optional[0].opt_price[that.data.labelActive][that.data.product.goods_optional[1].id[idx]].opt_price,
        stock: that.data.product.goods_optional[0].opt_price[that.data.labelActive][that.data.product.goods_optional[1].id[idx]].stock
      })
    } else {
      that.setData({
        skuId1: that.data.product.goods_optional[1].id,
        currentLabel1: that.data.product.goods_optional[1].opt_text,
        labelActive1: idx,
        opt_price: that.data.product.goods_optional[0].opt_price[0][that.data.product.goods_optional[1].id].opt_price,
      })
    }
  },


  // 加入购物车
  toAddCart: function() {
    let that = this;
    that.setData({
      isShow: false,
      isBuyNow: false,
      buyQuantity: 1,
      isLabel: false
    })
  },

  toBuyNow: function() {
    this.setData({
      isShow: false,
      isBuyNow: true,
      buyQuantity: 1,
      isLabel: false
    })
  },

  toConfirm: function() {
    let that = this;
    let isBuyNow = that.data.isBuyNow;
    if (isBuyNow) {
      that.buyNowBtn()
    } else {
      that.addCartBtn()
    }
  },

  toExchange: function() {
    wx.navigateTo({
      url: '/pages/exchangeDetails/exchangeDetails',
    })
  },

  // 加载数据
  loadData: function(id) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/my/is-frist.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData(id)
        }
        if (res.statusCode == 200) {
          that.setData({
            canBuy: res.data.data
          })
        }
      }
    })
    wx.request({
      url: app.globalData.baseUrl + '/my/help-center.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return;
        }
        if (res.statusCode == 200) {
          WxParse.wxParse('description', 'html', res.data.data.serviceDescription.content, that, 5);
        }
      }
    })
    wx.request({
      url: app.globalData.baseUrl + '/product/pro-view.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      data: {
        product_id: id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData(id)
        }
        if (res.statusCode == 200) {
          if (res.data.data.goods_optional.length == 1) {
            let id = String(res.data.data.goods_optional[0].id)
            if (id.indexOf(',') > -1) {
              res.data.data.goods_optional[0].opt_text = res.data.data.goods_optional[0].opt_text.split(",")
              res.data.data.goods_optional[0].id = res.data.data.goods_optional[0].id.split(",")
              that.setData({
                skuId: res.data.data.goods_optional[0].id[0],
                currentLabel: res.data.data.goods_optional[0].opt_text[0],
                opt_price: res.data.data.goods_optional[0].opt_price[0].opt_price,
                stock: res.data.data.goods_optional[0].opt_price[0].stock
              })
            } else {
              res.data.data.goods_optional[0].opt_text = Array(res.data.data.goods_optional[0].opt_text)
              that.setData({
                skuId: res.data.data.goods_optional[0].id,
                currentLabel: res.data.data.goods_optional[0].opt_text[0],
                opt_price: res.data.data.goods_optional[0].opt_price[0].opt_price,
                stock: res.data.data.goods_optional[0].opt_price[0].stock
              })
            }
          }
          if (res.data.data.goods_optional.length == 2) {
            let id = String(res.data.data.goods_optional[0].id);
            var id1 = String(res.data.data.goods_optional[1].id);
            if (id.indexOf(',') > -1) {
              if (id1.indexOf(',') > -1) {
                res.data.data.goods_optional[0].opt_text = res.data.data.goods_optional[0].opt_text.split(",")
                res.data.data.goods_optional[1].opt_text = res.data.data.goods_optional[1].opt_text.split(",")
                res.data.data.goods_optional[0].id = res.data.data.goods_optional[0].id.split(",")
                res.data.data.goods_optional[1].id = res.data.data.goods_optional[1].id.split(",")
                that.setData({
                  skuId: res.data.data.goods_optional[0].id[0],
                  skuId1: res.data.data.goods_optional[1].id[0],
                  currentLabel: res.data.data.goods_optional[0].opt_text[0],
                  currentLabel1: res.data.data.goods_optional[1].opt_text[0],
                  opt_price: res.data.data.goods_optional[0].opt_price[0][res.data.data.goods_optional[1].id[0]].opt_price,
                  stock: res.data.data.goods_optional[0].opt_price[0][res.data.data.goods_optional[1].id[0]].stock
                })
              } else {
                res.data.data.goods_optional[0].opt_text = res.data.data.goods_optional[0].opt_text.split(",")
                res.data.data.goods_optional[0].id = res.data.data.goods_optional[0].id.split(",")
                res.data.data.goods_optional[1].opt_text = Array(res.data.data.goods_optional[1].opt_text)
                that.setData({
                  skuId: res.data.data.goods_optional[0].id[0],
                  skuId1: res.data.data.goods_optional[1].id,
                  currentLabel: res.data.data.goods_optional[0].opt_text[0],
                  currentLabel1: res.data.data.goods_optional[1].opt_text[0],
                  opt_price: res.data.data.goods_optional[0].opt_price[0].opt_price,
                })
              }
            } else {
              if (id1.indexOf(',') > -1) {
                res.data.data.goods_optional[0].opt_text = Array(res.data.data.goods_optional[0].opt_text)
                res.data.data.goods_optional[1].opt_text = res.data.data.goods_optional[1].opt_text.split(",")
                res.data.data.goods_optional[1].id = res.data.data.goods_optional[1].id.split(",")
                that.setData({
                  skuId: res.data.data.goods_optional[0].id,
                  skuId1: res.data.data.goods_optional[1].id[0],
                  currentLabel: res.data.data.goods_optional[0].opt_text[0],
                  currentLabel1: res.data.data.goods_optional[1].opt_text[0],
                  opt_price: res.data.data.goods_optional[0].opt_price[0][res.data.data.goods_optional[1].id[0]].opt_price,
                  stock: res.data.data.goods_optional[0].opt_price[0][res.data.data.goods_optional[1].id[0]].stock
                })
              } else {
                res.data.data.goods_optional[0].opt_text = Array(res.data.data.goods_optional[0].opt_text)
                res.data.data.goods_optional[1].opt_text = Array(res.data.data.goods_optional[1].opt_text)
                that.setData({
                  skuId: res.data.data.goods_optional[0].id,
                  skuId1: res.data.data.goods_optional[1].id,
                  currentLabel: res.data.data.goods_optional[0].opt_text[0],
                  currentLabel1: res.data.data.goods_optional[1].opt_text[0],
                  opt_price: res.data.data.goods_optional[0].opt_price[0][res.data.data.goods_optional[1].id].opt_price,
                })
              }
            }
          }
          that.setData({
            product: res.data.data
          })
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
          WxParse.wxParse('parameter', 'html', res.data.data.parameter, that, 5)
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  loadEvaluation: function() {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/product/evaluatr-list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        product_id: that.data.productId,
        numberperpage: 1,
        pagenumber: 1
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadEvaluation();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            if (res.data.data.length == 0) {
              that.setData({
                isNull: false
              })
            } else if (res.data.data.length > 0) {
              that.setData({
                isNull: true,
                evaluation: res.data.data
              })
            }
          }
        }
      }
    })
  },

  // 加入购物车
  addCartBtn: function() {
    let that = this;
    let optional_id;
    if (that.data.skuId1 == "") {
      optional_id = that.data.skuId
    } else {
      optional_id = that.data.skuId + "," + that.data.skuId1
    }

    wx.request({
      url: app.globalData.baseUrl + '/cart/add-cart.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        product_id: that.data.productId,
        product_num: that.data.buyQuantity,
        optional_id: optional_id
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.addCartBtn();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            that.setData({
              isSuccess: false,
              isShow: true
            })
            setTimeout(function() {
              that.setData({
                isSuccess: true
              })
            }, 2000)
          } else if (res.data.status == 10002) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false
            })
          } else if (res.data.status == 10006) {
            wx.showModal({
              title: '提示',
              content: '库存不足，请重新选择数量！',
              showCancel: false
            })
          }
        }
      }
    })
  },

  // 立即购买
  buyNowBtn: function() {
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
            let optional_id;
            if (that.data.skuId1 == "") {
              optional_id = that.data.skuId
            } else {
              optional_id = that.data.skuId + "," + that.data.skuId1
            }

            wx.request({
              url: app.globalData.baseUrl + '/cart/add-cart.html?token=' + wx.getStorageSync('token'),
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                product_id: that.data.productId,
                product_num: that.data.buyQuantity,
                optional_id: optional_id
              },
              success: function(res) {
                console.log(res)
                if (res.statusCode == 422) {
                  app.login();
                  that.buyNowBtn()
                }
                if (res.statusCode == 200) {
                  if (res.data.status == 10000) {
                    var carId = res.data.data
                    wx.navigateTo({
                      url: '/pages/buyNow/buyNow?carId=' + carId,
                    })
                    return
                  } else if (res.data.status == 10002) {
                    wx.showModal({
                      title: '提示',
                      content: res.data.message,
                      showCancel: false,
                      success:function(res){
                        if(res.confirm) {
                          wx.switchTab({
                            url: '/pages/shop-cart/shop-cart',
                          })
                        }
                      }
                    })
                  } else if (res.data.status == 10006) {
                    wx.showModal({
                      title: '提示',
                      content: '库存不足，请重新选择数量！',
                      showCancel: false
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


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    let that = this;
    var id = options.id;
    that.setData({
      productId: id
    })
    that.loadData(id)
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
    if (wx.getStorageSync('token') == '') {
      app.login();
    }
    this.loadData(this.data.productId)
    this.loadEvaluation();
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