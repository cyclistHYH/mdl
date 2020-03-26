// pages/myCode/myCode.js
const app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    pathHeader: app.globalData.baseUrl,
    img: '',
    userId: ''
  },

  loadData: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.baseUrl + '/my/qrcode.html?token=' + wx.getStorageSync('token'),
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
              img: res.data.data
            })
          } else if (res.da.status == 10002) {
            wx.showModal({
              title: '提示',
              content: '当前您尚未绑定手机号，请先绑定手机。',
              showCancel: false,
              success(resp) {
                if (resp.confirm) {
                  wx.navigateTo({
                    url: '/pages/binding/binding',
                  })
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
  },

  toSaveImg:function(){
    let that=this;
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success(res) {
              that.saveToBlum()
            }
          })
        } else {
          that.saveToBlum()
        }
      }
    })
  },

  saveToBlum:function(){
    let that=this;
    wx.showLoading({
      title: '保存中',
    })
    var img=that.data.pathHeader+that.data.img;
    console.log(img)
    wx.downloadFile({
      url: img,
      success: function(res){
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(resp) {
            wx.showToast({
              icon: 'success',
              title: '图片保存成功',
            })
          },
          fail(resp) {
            wx.showToast({
              icon: 'none',
              title: '图片保存失败',
            })
          },
          complete:function(){
            wx.hideLoading()
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.loadData();
    this.setData({
      userId: options.id
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