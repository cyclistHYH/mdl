// pages/addAddress/addAddress.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isRegionTs: true,
    regionTS: "地区信息",
    region: []
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value,
      regionTS: '',
      isRegionTs: false
    })
  },

  toAddAddress:function(e){
    let that=this;
    var e=e;
    var name=e.detail.value.contactName;
    var phone=e.detail.value.phone;
    var address=e.detail.value.address;
    var province=that.data.region[0];
    var city=that.data.region[1];
    var district=that.data.region[2];
    var postal=e.detail.value.postal;
    var isChecked;
    var myreg = /^1[3456789]\d{9}$/;
    var myVerification = /^[1-9]\d{5}(?!\d)$/;
    var defaulted =e.detail.value.default;
    if (name=="") {
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
    } else if (postal.length <6) {
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

    if (defaulted) {
      isChecked=1
    } else {
      isChecked=0
    }
    wx.request({
      url: app.globalData.baseUrl + '/address/add.html?token=' +wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        consignee: name,
        mobile: phone,
        address: address,
        province: province,
        city: city,
        district: district,
        zipcode: postal,
        is_default: isChecked
      },
      success: function (res) {
        if (res.statusCode==422) {
          app.login();
          that.toAddAddress(e);
          return
        }
        if (res.statusCode==200) {
          if (res.data.status == 10000) {
            wx.showModal({
              title: '提示',
              content: '地址添加成功',
              showCancel: false,
              success: function (resp) {
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