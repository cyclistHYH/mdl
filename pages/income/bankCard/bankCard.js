// pages/income/bankCard/bankCard.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isNull: false,
    isSuccess: true,
    cardList: [],
    chooseId: '',
    balance: '',
    withdrawAmount: 0
  },

  closePopUp: function() {
    this.setData({
      isSuccess: true
    })
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
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
            that.setData({
              balance: res.data.data.income,
            })
          }
        }
      }
    })

    wx.request({
      url: app.globalData.baseUrl + '/shop-user-bankcard/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.data.data.length == 0 || res.data.data.length == undefined) {
          that.setData({
            isNull: false
          })
        } else {
          var list = res.data.data[0];
          var num = list.bankcard_numbers.toString()
          var a = num.slice(0, 4) + ' **** **** ' + num.slice(-4)
          list.bankcard_numbers = a
          that.setData({
            isNull: true,
            cardList: list
          })
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  upDataCard: function() {
    let that = this;
    wx.request({
      url: app.globalData.baseUrl + '/shop-user-bankcard/view.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        bankcard_id: that.data.chooseId
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.upDataCard();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var list = res.data.data
            var num = list.bankcard_numbers.toString()
            var a = num.slice(0, 4) + ' **** **** ' + num.slice(-4)
            list.bankcard_numbers = a
            that.setData({
              cardList: res.data.data
            })
          }
        }
      }
    })
  },

  numberInp: function(e) {
    this.setData({
      withdrawAmount: e.detail.value
    })
  },

  withdrawBtn: function() {
    let that = this;
    var reg = /^(\d?)+(\.\d{0,2})?$/;
    var num = that.data.withdrawAmount;
    if (num == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入提现金额',
      })
    } else if (reg.test(num)) {
      var bankId = that.data.cardList.id;
      if (bankId == '' || bankId == undefined) {
        wx.showToast({
          icon: 'none',
          title: '请选择银行卡',
        })
      } else {
        wx.showLoading({
          title: '提交中',
        })
        wx.request({
          url: app.globalData.baseUrl + '/withdraw/add.html?token=' + wx.getStorageSync('token'),
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            bankcard_id: bankId,
            money: parseFloat(num)
          },
          success: function(res) {
            if (res.statusCode == 422) {
              app.login();
              that.withdrawBtn();
              return
            }
            if (res.statusCode == 200) {
              if (res.data.status == 10003) {
                wx.showModal({
                  title: '提示',
                  content: '账户余额小于提现金额，请重新输入。',
                  showCancel: false
                })
              } else if (res.data.status == 10000) {
                that.setData({
                  isSuccess: false
                })
              }
            }
          },
          complete: function() {
            wx.hideLoading()
          }
        })
      }
    } else if (!reg.test(num)) {
      wx.showToast({
        icon: 'none',
        title: '请输入数字且最多两位小数',
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    if (options.id != "") {
      that.setData({
        chooseId: options.id
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
    let that = this
    that.loadData();
    if (that.data.chooseId != undefined && that.data.chooseId != '') {
      that.upDataCard()
    }
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