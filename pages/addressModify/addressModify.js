// pages/addressModify/addressModify.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRegionTs: false,
    regionTS: "",
    region: ["浙江省", "杭州市", "滨江区"],
    addInfo: [],
    addressId: ''
  },

  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value,
      regionTS: '',
      isRegionTs: false,
    })
  },

  // 保存修改地址
  toSave: function(e) {
    let that = this;
    var e = e;
    var name = e.detail.value.contactName;
    var phone = e.detail.value.phone;
    var address = e.detail.value.address;
    var province = that.data.region[0];
    var city = that.data.region[1];
    var district = that.data.region[2];
    var postal = e.detail.value.postal;
    var myreg = /^1[3456789]\d{9}$/;
    var myVerification = /^[1-9]\d{5}(?!\d)$/;
    if (name == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
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
    if (postal == "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮政编码',
        showCancel: false
      })
      return
    } else if (postal.length < 6) {
      wx.showModal({
        title: '提示',
        content: '邮政编码长度有误!',
        showCancel: false
      })
      return
    } else if (!myVerification.test(postal)) {
      wx.showModal({
        title: '提示',
        content: '邮政编码有误!',
        showCancel: false
      })
      return
    }
    if (that.data.region.length == 0) {
      wx.showModal({
        title: '提示',
        content: '请选择地区!',
        showCancel: false
      })
      return
    }
    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写详细地址!',
        showCancel: false
      })
      return
    }

    wx.request({
      url: app.globalData.baseUrl + '/address/add.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        address_id: that.data.addressId,
        consignee: name,
        mobile: phone,
        address: address,
        province: province,
        city: city,
        district: district,
        zipcode: postal,
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.toSave(e);
          return
        }

        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            wx.showModal({
              title: '提示',
              content: '地址修改成功',
              showCancel: false,
              success: function(resp) {
                if (resp.confirm) {
                  wx.navigateBack({})
                }
              }
            })
          }
        }

      }
    })
  },


  // 设置默认地址
  chooseDefault: function(e) {
    var e = e;
    var val = e.detail.value;
    var isDefault;
    var that = this;
    var id = that.data.addressId;
    if (val) {
      isDefault = 1
    } else {
      isDefault = 0
    }
    wx.request({
      url: app.globalData.baseUrl + '/address/default.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        address_id: id,
        is_default: isDefault
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.chooseDefault(e);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10003) {
            wx.showModal({
              title: '提示',
              content: res.data.message,
              showCancel: false
            })
          }
        }
      }
    })
  },

  // 加载地址信息
  loadData: function() {
    let that = this;
    var id = that.data.addressId;
    wx.showLoading({
      title: '加载中',
    })
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
          that.loadData();
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            var address = [res.data.data]
            var region = [res.data.data.province, res.data.data.city, res.data.data.district]
            that.setData({
              addInfo: address,
              region: region
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  // 删除地址
  toDelete: function() {
    let that = this;
    var id = that.data.addressId;
    wx.showModal({
      title: '提示',
      content: '确认删除改地址？',
      confirmColor: '#e01212',
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.baseUrl + '/address/delete.html?token=' + wx.getStorageSync('token'),
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
                that.toDelete();
                return
              }

              if (res.statusCode == 200) {
                if (res.data.status == 10000) {
                  wx.showModal({
                    title: '提示',
                    content: '地址删除成功',
                    showCancel: false,
                    success: function(resp) {
                      if (resp.confirm) {
                        wx.navigateBack({})
                      }
                    }
                  })
                }
              }
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    this.setData({
      addressId: id
    })
    this.loadData()
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