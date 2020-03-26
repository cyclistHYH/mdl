// pages/evaluation/evaluation.js
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    isAnonymous: true,
    uploadImg: [],
    unselected: 5,
    selected: 0,
    productId: '',
    uImg: [],
    content: ""
  },

  toUploadPicture: function() {
    let remaining = 3;
    let that = this;
    let number = that.data.uploadImg.length;
    remaining = 3 - number;
    wx.chooseImage({
      count: remaining,
      success: function(res) {
        that.setData({
          uploadImg: that.data.uploadImg.concat(res.tempFilePaths)
        })
        if (that.data.uploadImg.length > 2) {
          that.setData({
            isShow: true
          })
        } else {
          that.setData({
            isShow: false
          })
        }
      },
    })
  },

  toDelete: function(e) {
    let that = this;
    let idx = e.currentTarget.dataset.index;
    let uploadImg = that.data.uploadImg;
    uploadImg.splice(idx, 1)
    that.setData({
      uploadImg: uploadImg
    })
    if (that.data.uploadImg.length < 3) {
      that.setData({
        isShow: false
      })
    }
  },

  toChoose: function() {
    let that = this;
    let isAnonymous = that.data.isAnonymous;
    if (isAnonymous) {
      that.setData({
        isAnonymous: false
      })
    } else {
      that.setData({
        isAnonymous: true
      })
    }
  },

  toSelected: function(e) {
    var isIn = e.currentTarget.dataset.in;
    var selected;
    selected = Number(e.currentTarget.id);
    this.setData({
      selected: selected,
    })
  },
  uploadFile: function(that, imgArr) {
    wx.uploadFile({
      url: app.globalData.baseUrl + '/my/upload-img.html?token=' + wx.getStorageSync('token'),
      filePath: imgArr[0],
      name: 'file',
      header: {
        "Content-Type": "multipart/form-data"
      },
      success: function(res) {
        if (res.statusCode == 422) {
          app.login();
          that.uploadFile(that, imgArr);
          return
        }
        if (res.statusCode == 200) {
          var list = JSON.parse(res.data)
          that.setData({
            uImg: that.data.uImg.concat(list.url)
          })
          imgArr.splice(0, 1);
          if (imgArr.length > 0) {
            that.uploadFile(that, imgArr);
          } else {
            that.submit(that);
          }
        }
      },
      complete: function() {}
    })
  },
  submit: function(that) {
    var isAnonymous = that.data.isAnonymous;
    var star = that.data.selected;
    if (isAnonymous) {
      isAnonymous = 1
    } else {
      isAnonymous = 0
    }
    var img = '';
    for (var i = 0; i < that.data.uImg.length; i++) {
      if (img.length > 0) {
        img += ",";
      }
      img += that.data.uImg[i];
    }
    wx.request({
      url: app.globalData.baseUrl + '/evaluate/add.html?token=' + wx.getStorageSync('token'),
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        order_product_id: that.data.productId,
        evaluate_star: star,
        evaluate_img: img,
        is_anonymity: isAnonymous,
        evaluate_content: that.data.content
      },
      success: function(res) {
        console.log(res)
        if (res.statusCode == 422) {
          app.login();
          that.submit(that);
          return
        }
        if (res.statusCode == 200) {
          if (res.data.status == 10000) {
            wx.reLaunch({
              url: '/pages/evaluation/success/success',
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },
  toConfirm: function(e) {
    wx.showLoading({
      title: '上传中',
    })
    let that = this;
    var imgArr = that.data.uploadImg;
    var content = e.detail.value.evaluationCon;
    if (content == '') {
      wx.showModal({
        title: '提示',
        content: '请填写评价内容',
        showCancel: false
      })
      return
    }
    that.setData({
      content: e.detail.value.evaluationCon
    });

    if (imgArr.length > 0) {
      that.uploadFile(that, imgArr);
      // for(var i=0;i<imgArr.length;i++) {
      //   wx.uploadFile({
      //     url: app.globalData.baseUrl + '/my/upload-img.html?token=' +wx.getStorageSync('token'),
      //     filePath: imgArr[i],
      //     name: 'file',
      //     header: {
      //       "Content-Type": "multipart/form-data"
      //     },
      //     success:function(res){
      //       var list=JSON.parse(res.data)
      //       // img=img+","+list.url
      //       that.setData({
      //         uImg: that.data.uImg.concat(list.url)
      //       })
      //     }
      //   })
      // }
    } else {
      that.submit(that);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    this.setData({
      productId: options.id
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