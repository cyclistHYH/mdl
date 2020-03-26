// pages/mine/mine.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nickName: '',
    avatar: '/images/avatar.png',
    mineInfo: '',
    membershipName: '',
    orderNav: [{
        id: 'deliver',
        img: '/images/orderImg1.png',
        name: '待发货',
        number: 0,
        isHidden: true
      },
      {
        id: 'receipt',
        img: '/images/orderImg2.png',
        name: '待收货',
        number: 0,
        isHidden: false
      },
      {
        id: 'completed',
        img: '/images/orderImg3.png',
        name: '已完成',
        number: 0,
        isHidden: true
      }
    ],
    isLogin: '',
  },

  loginBtn:function(){
    this.login()
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

  toMyCode:function(e){
    let that=this;
    var id=e.currentTarget.dataset.id;
    var membership_level = that.data.mineInfo.membership_level;
    if (membership_level==0) {
      wx.showModal({
        title: '提示',
        content: '当前您不是会员，暂时无法生成邀请码邀请他人。',
        showCancel: false
      })
    } else {
      wx.navigateTo({
        url: '/pages/myCode/myCode?id=' + id,
      })
    }
  },

  loadOrder: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/order/order-num.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadOrder();
          return
        }
        if (res.statusCode == 200) {
          var orderNav = that.data.orderNav;
          orderNav[0].number = res.data.data.order_status_two;
          orderNav[1].number = res.data.data.order_status_three;
          orderNav[2].number = res.data.data.order_status_five;
          that.setData({
            orderNav: orderNav
          })
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  loadData: function() {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/my/get-shop-user-info.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var name;
            switch (res.data.data.membership_level) {
              case 1:
                name = 'VIP';
                break;
              case 2:
                name = '钻石';
                break;
              case 3:
                name = '皇冠';
                break;
            }
            that.setData({
              mineInfo: res.data.data,
              membershipName: name
            })
          }
        }
      }
    })
  },

  toRemind:function(){
    wx.showModal({
      title: '提示',
      content: '当前您未登录，请先登录。',
      showCancel: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    var userInfo = wx.getStorageSync('userInfo');
    that.setData({
      nickName: userInfo.nickName,
      avatar: userInfo.avatarUrl
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
    // that.login();
    if (wx.getStorageSync('token')=='') {
      that.setData({
        isLogin: false
      })
    } else {
      that.setData({
        isLogin: true
      })
    }
    that.loadOrder()
    that.loadData()
    var userInfo = wx.getStorageSync('userInfo');
    that.setData({
      nickName: userInfo.nickName,
      avatar: userInfo.avatarUrl
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