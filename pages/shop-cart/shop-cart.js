// pages/shop-cart/shop-cart.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    isEmpty: true,
    isAllChoose: false,
    goods: [],
    totalPrice: 0
  },

  // 登录
  login: function () {
    let that = this;
    if (wx.getStorageSync('userInfo') == '') {
      wx.navigateTo({
        url: '/pages/authorize/authorize',
      })
    } else {
      wx.login({
        success: function (res) {
          wx.request({
            url: app.globalData.baseUrl + '/login/get-openid.html',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: res.code
            },
            success: function (resp) {
              if (resp.data.status == 10000) {
                wx.setStorageSync('openId', resp.data.data)
                var userInfo = wx.getStorageSync('userInfo');
                var nickName = userInfo.nickName;
                wx.request({
                  url: app.globalData.baseUrl + '/login/login.html',
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
                      wx.setStorageSync('token', res.data.data);
                      return;
                    }
                    if (res.data.status == 10002) {
                      wx.showModal({
                        title: '提示',
                        content: '无法登录，请重试',
                        showCancel: false
                      })
                      return;
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
  },

  emptyBtn: function() {
    let that = this;
    let goods = that.data.goods;
    var id;
    for (let i = 0; i < goods.length; i++) {
      if (goods[i].isChecked) {
        var item = goods[i]
        if (id == undefined) {
          id = item.id
        } else {
          id = id + "," + item.id
        }
      }
    }
    if (id == undefined) {
      wx.showModal({
        title: '提示',
        content: '请选择需要删除的商品',
        showCancel: false,
        confirmColor: '#e01212'
      })
    } else {
      console.log(id)
      wx.request({
        url: app.globalData.baseUrl + '/cart/delete-cart.html?token=' + wx.getStorageSync('token'),
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          cart_id: id
        },
        success: function(res) {
          console.log(res)
          if (res.statusCode == 422) {
            app.login();
            that.emptyBtn();
            return
          }
          if (res.statusCode == 200) {
            if (res.data.status == 10000) {
              wx.showModal({
                title: '提示',
                content: '商品删除成功',
                showCancel: false,
                success: function(e) {
                  if (e.confirm) {
                    that.loadData()
                  }
                }
              })
            }
          }
        }
      })
    }
  },

  buySubmit: function() {
    let that = this;
    let goods = that.data.goods;
    var id;
    var goodsInfo = [];
    for (let i = 0; i < goods.length; i++) {
      if (goods[i].isChecked) {
        var item = goods[i]
        if (id == undefined) {
          id = item.id
        } else {
          id = id + "," + item.id
        }
      }
    }
    if (id == undefined) {
      wx.showModal({
        title: '提示',
        content: '请选择需要购买的商品',
        showCancel: false,
        confirmColor: '#e01212'
      })
    } else {
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
              wx.navigateTo({
                url: '/pages/buyNow/buyNow?carId=' + id,
              })
            }
          }
        }
      })
    }
    // wx.navigateTo({
    //   url: '/pages/buyNow/buyNow',
    // })
  },

  goodsChoose: function(e) {
    let that = this;
    let index = parseInt(e.currentTarget.dataset.index);
    let goods = that.data.goods;
    let isChoose = true;
    goods[index].isChecked = !goods[index].isChecked;
    that.setData({
      goods: goods
    })
    for (let i = 0; i < that.data.goods.length; i++) {
      if (!that.data.goods[i].isChecked) {
        isChoose = false
      }
    }
    if (!isChoose) {
      that.setData({
        isAllChoose: false
      })
    } else {
      that.setData({
        isAllChoose: true
      })
    }
    that.toTotal()
  },

  numberPlus: function(e) {
    let that = this;
    // let index = e.currentTarget.dataset.index;
    // let goods = that.data.goods;
    // if (index !== "" && index != null) {
    //   goods[index].product_number++;
    //   that.setData({
    //     goods: goods
    //   })
    // }
    // wx.request({
    //   url: app.globalData.baseUrl + '/cart/change-num.html?token=' + wx.getStorageSync('token'),
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   data: {
    //     cart_id: goods[index].id,
    //     num: goods[index].product_number,
    //   },
    //   success: function(res) {
    //     if (res.statusCode == 422) {
    //       app.login();
    //       that.numberPlus(e);
    //       return
    //     }
    //   }
    // })
    // that.toTotal()
  },

  numberLess: function(e) {
    let that = this;
    // let index = parseInt(e.currentTarget.dataset.index);
    // let goods = that.data.goods;
    // if (index !== "" && index != null) {
    //   if (goods[index].product_number > 1) {
    //     goods[index].product_number--;
    //   }
    //   that.setData({
    //     goods: goods
    //   })
    // }
    // wx.request({
    //   url: app.globalData.baseUrl + '/cart/change-num.html?token=' + wx.getStorageSync('token'),
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   data: {
    //     cart_id: goods[index].id,
    //     num: goods[index].product_number,
    //   },
    //   success: function(res) {
    //     console.log(res)
    //     if (res.statusCode == 422) {
    //       app.login();
    //       that.numberLess(e);
    //       return
    //     }
    //   }
    // })
    // that.toTotal()
  },

  chooseAll: function() {
    let that = this;
    let goods = that.data.goods;
    if (that.data.isAllChoose) {
      for (let i = 0; i < goods.length; i++) {
        goods[i].isChecked = false
      }
      that.setData({
        isAllChoose: false
      })
    } else {
      for (let i = 0; i < goods.length; i++) {
        goods[i].isChecked = true
      }
      that.setData({
        isAllChoose: true
      })
    }
    that.setData({
      goods: goods
    })
    that.toTotal()
  },

  toTotal: function() {
    let that = this;
    let totalPrice = 0;
    let goods = that.data.goods;
    for (let i = 0; i < goods.length; i++) {
      if (goods[i].isChecked) {
        var item = goods[i]
        totalPrice += parseFloat(item.price) * item.product_number;
      }
    }
    totalPrice = parseFloat(totalPrice.toFixed(2));
    that.setData({
      totalPrice: totalPrice
    })
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/cart/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          var list = res.data.data;
          console.log(list)
          if (list.length == 0) {
            that.setData({
              isEmpty: false
            })
          } else {
            for (var i = 0; i < list.length; i++) {
              list[i].isChecked = false
            }
            that.setData({
              isEmpty: true,
              goods: list
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
    // this.login();
    this.toTotal()
    this.loadData()
    this.setData({
      isAllChoose: false
    })
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