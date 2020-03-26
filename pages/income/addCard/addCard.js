// pages/income/addCard/addCard.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },


  toConfirm: function(e) {
    let that = this;
    var number = e.detail.value.bankNumber;
    var name = e.detail.value.bankName;
    var account = e.detail.value.bankAccount;
    var phone = e.detail.value.bankPhone;
    var myreg = /^1[3456789]\d{9}$/;

    if (number == "") {
      wx.showModal({
        title: '提示',
        content: '请填写银行卡号',
        showCancel: false
      })
      return
    }
    // else if (!that.checkCard(number)) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '请填写正确的银行卡号',
    //     showCancel: false
    //   })
    //   return
    // }

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

    if (name == "") {
      wx.showModal({
        title: '提示',
        content: '请填写持卡人姓名',
        showCancel: false
      })
      return
    }

    if (account == "") {
      wx.showModal({
        title: '提示',
        content: '请填写开户行银行',
        showCancel: false
      })
      return
    }

    wx.showModal({
      content: '为避免申请提现失败，请确保您的银行卡卡号与持卡人姓名正确无误。',
      cancelText: '取消提交',
      cancelColor: '#000000',
      confirmText: '确认提交',
      confirmColor: '#d91e2d',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '提交中',
          })
          wx.request({
            url: app.globalData.baseUrl + '/shop-user-bankcard/create-bankcard.html?token=' + wx.getStorageSync('token'),
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              open_bank: account,
              bankcard_numbers: number,
              cardholder: name,
              mobile: phone
            },
            success: function(res) {
              console.log(res)
              if (res.statusCode == 422) {
                app.login();
                that.toConfirm(e);
                return
              }
              if (res.statusCode == 200) {
                if (res.data.status == 10000) {
                  wx.showModal({
                    title: '提示',
                    content: '银行卡添加成功',
                    showCancel: false,
                    success: function(resp) {
                      if (resp.confirm) {
                        wx.navigateBack({})
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
        }
      }
    })

  },


  // 验证银行卡有效性
  checkCard(cardNo) {
    if (isNaN(cardNo))
      return false;
    if (cardNo.length < 12) {
      return false;
    }
    var nums = cardNo.split("");
    var sum = 0;
    var index = 1;
    for (var i = 0; i < nums.length; i++) {
      if ((i + 1) % 2 == 0) {
        var tmp = Number(nums[nums.length - index]) * 2;
        if (tmp >= 10) {
          var t = tmp + "".split("");
          tmp = Number(t[0]) + Number(t[1]);
        }
        sum += tmp;
      } else {
        sum += Number(nums[nums.length - index]);
      }
      index++;
    }
    if (sum % 10 != 0) {
      return false;
    }
    return true;
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