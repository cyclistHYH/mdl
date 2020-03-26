// pages/categories/categories.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentId: '',
    inputVal: '',
    pathHeader: app.globalData.baseUrl,
    categories: [],
    activeIndex: 0,
    product: [],
    banner: '',
    hasMore: false,
    page: 1,
    pageSize: 10,
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

  categoriesNav: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var categories = that.data.categories;
    var idx = e.currentTarget.dataset.index;
    var banner;
    banner = categories[idx].image
    that.setData({
      activeIndex: idx,
      currentId: id,
      banner: banner
    });
    that.loadCategories();
  },

  toSearch: function(e) {
    let that = this;
    var content = e.detail.value;
    that.searchData(content)
  },

  searchData: function(e) {
    var content = e;
    let that = this;
    wx.showLoading({
      title: '加载中',
    });
    wx.request({
      url: app.globalData.baseUrl + '/classify/list.html',
      method: 'POST',
      data: {
        product_name: content
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.searchData(e);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.proList.length == 0) {
            wx.showToast({
              icon: 'none',
              title: '搜索不到此商品',
              duration: 2000
            })
          } else if (res.data.data.proList.length > 0) {
            that.setData({
              activeIndex: -1,
              product: res.data.data.proList
            })
          }
        }

      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  loadCategories:function(){
    let that=this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/classify/list.html',
      method: 'POST',
      data: {
        type_id: that.data.currentId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.proList.length == 0) {
            wx.showToast({
              icon: 'none',
              title: '暂无该类商品',
              duration: 2000
            })
          }
          if (res.data.data.proList.length < 10) {
            that.setData({
              hasMore: false
            })
          } else if (res.data.data.proList.length >= 10) {
            that.setData({
              hasMore: true
            })
          }
          that.setData({
            product: res.data.data.proList,
          })
        }
      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },

  loadData: function() {
    wx.showLoading({
      title: '加载中',
    });
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/classify/list.html',
      method: 'POST',
      data: {
        type_id: that.data.currentId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.proList.length == 0) {
            wx.showToast({
              icon: 'none',
              title: '暂无该类商品',
              duration: 2000
            })
          }
          if (res.data.data.proList.length < 10) {
            that.setData({
              hasMore: false
            })
          } else if (res.data.data.proList.length >= 10) {
            that.setData({
              hasMore: true
            })
          }
          that.setData({
            product: res.data.data.proList,
            categories: res.data.data.proType,
          })
          var image = res.data.data.proType[0].image
          that.setData({
            banner: image
          })
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
    // this.loadData()
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
    // that.login();
    that.loadData();
    that.setData({
      activeIndex: 0
    })
    // var inputVal = wx.getStorageSync('inputVal')
    // if (inputVal.isJump == true) {
    //   that.setData({
    //     activeIndex: -1,
    //     inputVal: inputVal.val
    //   })
    //   that.searchData(inputVal.val)
    //   wx.removeStorageSync('inputVal');
    // } else {
    //   that.setData({
    //     inputVal: ''
    //   })
    // }
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
      url: app.globalData.baseUrl + '/classify/list.html',
      method: 'POST',
      data: {
        type_id: that.data.currentId,
        pagenumber: that.data.page,
        numberperpage: that.data.pageSize
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.proList.length == 0) {
            wx.showToast({
              icon: 'none',
              title: '暂无更多数据~',
            })
            that.setData({
              hasMore: false,
              page: --that.data.page
            })
          } else if (res.data.data.proList.length > 0) {
            if (res.data.data.proList.length < 10) {
              that.setData({
                hasMore: false
              })
            } else if (res.data.data.proList.length >= 10) {
              that.setData({
                hasMore: true
              })
            }
            that.setData({
              product: that.data.product.concat(res.data.data.proList),
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    let that = this;
    if (that.data.hasMore) {
      var page = that.data.page;
      that.setData({
        page: ++page
      })
      setTimeout(function() {
        that.uploadData()
      }, 1000)
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})