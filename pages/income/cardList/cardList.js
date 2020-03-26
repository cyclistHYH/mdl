// pages/income/cardList/cardList.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chooseId: '',
    cardList: [],
    currentId: ''
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    var id = that.data.currentId;
    wx.request({
      url: app.globalData.baseUrl + '/shop-user-bankcard/list.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.data.length == 0 || res.data.data.length == undefined) {

          } else {
            console.log(id)
            var list = res.data.data;
            that.setData({
              chooseId: id
            })

            for (var i = 0; i < list.length; i++) {
              var num = list[i].bankcard_numbers.toString()
              var a = num.slice(0, 4) + ' **** **** ' + num.slice(-4)
              list[i].bankcard_numbers = a;
              if (list[i].id == id) {
                list[i].isChecked = true
              } else {
                list[i].isChecked = false
              }
            }
            that.setData({
              cardList: list
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  chooseBtn: function(e) {
    this.setData({
      chooseId: e.detail.value
    })
  },


  toDelete: function() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除此银行卡？',
      confirmColor: '#d91e2d',
      success(res) {
        if (res.confirm) {
          console.log(that.data.chooseId)
          wx.showLoading({
            title: '删除中',
          })
          wx.request({
            url: app.globalData.baseUrl + '/shop-user-bankcard/delete-bankcard.html?token=' + wx.getStorageSync('token'),
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
                that.toDelete();
                return
              }
              if (res.statusCode == 200) {
                if (res.data.status == 10000) {
                  wx.showToast({
                    title: '删除成功',
                  })
                  wx.showLoading({
                    title: '加载中',
                  })
                  wx.request({
                    url: app.globalData.baseUrl + '/shop-user-bankcard/list.html?token=' + wx.getStorageSync('token'),
                    method: 'POST',
                    success: function(res) {
                      if (res.data.data.length == 0 || res.data.data.length == undefined) {

                      } else {
                        var list = res.data.data;
                        that.setData({
                          chooseId: list[0].id
                        })

                        for (var i = 0; i < list.length; i++) {
                          var num = list[i].bankcard_numbers.toString()
                          var a = num.slice(0, 4) + ' **** **** ' + num.slice(-4)
                          list[i].bankcard_numbers = a;
                          if (i == 0) {
                            list[i].isChecked = true
                          } else {
                            list[i].isChecked = false
                          }
                        }
                        that.setData({
                          cardList: list
                        })
                      }
                    },
                    complete: function() {
                      wx.hideLoading()
                    }
                  })
                } else {
                  wx.showToast({
                    icon: 'none',
                    title: '删除失败，请重试',
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

  confirmBtn: function() {
    let that = this;
    wx.redirectTo({
      url: '/pages/income/bankCard/bankCard?id=' + that.data.chooseId,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      currentId: options.id
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
    this.loadData()
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