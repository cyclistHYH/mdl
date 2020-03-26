// pages/binding/binding.js
const app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isInvited: false,
    codeName: '发送验证码',
    codeDisabled: false,
    phone: ''
  },

  phoneInp:function(e){
    this.setData({
      phone: e.detail.value
    })
  },

  getCode:function(){
    let that=this;
    var phone=that.data.phone;
    var myreg = /^1[3456789]\d{9}$/;
    if (phone == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    } else if (phone.length < 11) {
      wx.showModal({
        title: '提示',
        content: '手机号码长度有误!',
        showCancel: false
      })
      return
    } else if (!myreg.test(phone)) {
      wx.showModal({
        title: '提示',
        content: '手机号码有误!',
        showCancel: false
      })
      return
    }
    wx.request({
      url: app.globalData.baseUrl + '/login/send-sms.html',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        mobile: phone,
        wx_openid: wx.getStorageSync('openId')
      },
      success:function(res){
        if (res.data.status==10000) {
          wx.showToast({
            icon: 'none',
            title: '短信发送成功',
          })
          that.setData({
            codeDisabled: true
          })
          var num = 61;
          var timer = setInterval(function () {
            num--;
            if (num <= 0) {
              clearInterval(timer);
              that.setData({
                codeName: '重新发送',
                codeDisabled: false
              })
            } else {
              that.setData({
                codeName: num + "s"
              })
            }
          }, 1000)
        } else {
          wx.showToast({
            icon: 'none',
            title: '短信发送失败，请重试',
          })
        }
      }
    })
  },

  toBinding:function(e){
    console.log(e)
    var phone=e.detail.value.phone;
    var verificationCode = e.detail.value.verificationCode;
    var invitationCode = e.detail.value.invitationCode;
    var myreg = /^1[3456789]\d{9}$/;

    if (phone == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    } else if (phone.length < 11) {
      wx.showModal({
        title: '提示',
        content: '手机号码长度有误!',
        showCancel: false
      })
      return
    } else if (!myreg.test(phone)) {
      wx.showModal({
        title: '提示',
        content: '手机号码有误!',
        showCancel: false
      })
      return
    }

    if (verificationCode=='') {
      wx.showModal({
        title: '提示',
        content: '请输入验证码!',
        showCancel: false
      })
      return
    }

    if (invitationCode == '') {
      wx.showModal({
        title: '提示',
        content: '请输入推荐码!',
        showCancel: false
      })
      return
    }

    var userInfo = wx.getStorageSync('userInfo');
    var nickName = userInfo.nickName;
    wx.showLoading({
      title: '绑定中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/login/login.html',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        wx_openid: wx.getStorageSync('openId'),
        wx_nikename: nickName,
        code: verificationCode,
        mobile: phone,
        superior: invitationCode
      },
      success:function(res){
        console.log(res)
        if (res.data.status==10000) {
          wx.setStorageSync('token', res.data.data)
          wx.showModal({
            title: '提示',
            content: '手机绑定成功',
            showCancel: false,
            success(resp){
              if (resp.confirm){
                wx.switchTab({
                  url: '/pages/index/index',
                })
              }
            }
          })
        }
        if (res.data.status==10003) {
          wx.showModal({
            title: '提示',
            content: res.data.message,
            showCancel: false
          })
        }
      },
      complete:function(){
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})