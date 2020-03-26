//app.js
App({
  globalData: {
    userInfo: null,
    baseUrl: 'https://ssl.mandylor.cn'
  },
  login: function() {
    let that = this;
    if (wx.getStorageSync('userInfo') == '') {
      wx.navigateTo({
        url: '/pages/authorize/authorize',
      })
    } else {
      wx.login({
        success: function(res) {
          wx.request({
            url: 'https://ssl.mandylor.cn' + '/login/get-openid.html',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              code: res.code
            },
            success: function(resp) {
              wx.setStorageSync('openId', resp.data.data)
              var userInfo = wx.getStorageSync('userInfo');
              var nickName = userInfo.nickName;
              wx.request({
                url: 'https://ssl.mandylor.cn' + '/login/login.html',
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                  wx_openid: wx.getStorageSync('openId'),
                  wx_nikename: nickName
                },
                success: function(res) {
                  if (res.data.status==10000) {
                    wx.setStorageSync('token', res.data.data);
                    return
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
          })
        }
      })
    }
  }
})