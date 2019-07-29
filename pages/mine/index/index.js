const util = require('../../../utils/util.js')

const app = getApp()
var userId;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    isAuthorized: false,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          userId = app.globalData.userId;
          that.getUserInfo()
        }
      }
    })
  },
  getUserInfo: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var userInfo = res.data.data
        that.setData({
          userInfo: userInfo,
          isAuthorized: true,
        })
      }
    })
  },
  bindGetUserInfo: function(e) {
    if (e.detail.errMsg == 'getUserInfo:fail auth deny') {
      return
    }
    wx.showLoading({
      title: '登录中',
      mask: true
    })
    var that = this;
    if (app.globalData.authorized) {
      wx.showToast({
        title: '登录成功',
        duration: 2000,
        mask: true
      })
      that.setData({
        isAuthorized: true,
        userInfo: app.globalData.userInfo
      })
      return;
    }
    //完善用户信息
    userId = app.globalData.userId;
    //login
    wx.login({
      success: res => {
        if (res.errMsg != 'getUserInfo:fail:auth deny' && res.code) {
          //register new temp user
          wx.request({
            url: app.globalData.requestUrlWechat + '/miniSystem/login',
            method: "GET",
            data: {
              code: res.code
            },
            dataType: "json",
            success: function(res) {
              const userId = res.data.userId;
              const openId = res.data.openId;
              const sessionKey = res.data.sessionKey;
              if (userId && typeof(userId) != 'undefined' && userId != '') {
                //授权回调函数获取用户详情    
                wx.getUserInfo({
                  withCredentials: true,
                  success: function(res) {
                    console.log(res);
                    if (res.errMsg == "getUserInfo:ok") {
                      //decrypt encrypeted userInfo
                      wx.request({
                        url: app.globalData.requestUrlWechat + '/miniSystem/authorizeUser/' + userId,
                        data: {
                          encryptedData: res.encryptedData,
                          iv: res.iv,
                          sessionKey: sessionKey
                        },
                        dataType: "json",
                        method: "POST",
                        success: function(res) {
                          console.log('[bindGetUserInfo]->完善用户信息', res.data)
                          app.globalData.authorized = res.data.authorized;
                          app.globalData.userInfo = res.data.userInfo;
                          app.globalData.userId = app.globalData.userInfo.userId;
                          wx.setStorageSync("userId", app.globalData.userId)
                          wx.hideLoading();
                          wx.showToast({
                            title: '授权成功',
                            duration: 2000
                          })
                          that.setData({
                            isAuthorized: true,
                            userInfo: app.globalData.userInfo,
                          })
                        }
                      })
                    }
                  },
                  fail: function(res) {
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '微信功能报错,请稍后再试',
                  duration: 100000,
                  mask: true,
                })
                console.log("服务器配置微信环境出错，请检查APPID和APPSECRT是否匹配！")
              }
            }
          })
        }
      }
    })
  },
  home: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../home/home',
    })
  },
  modify: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../modify/modify',
    })
  },
  adoptlist: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../adopt/adopt',
    })
  },
  collect: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../collect/collect',
    })
  },
  feedback: function() {
    wx.navigateToMiniProgram({
      appId: 'wx8abaf00ee8c3202e',
      // path: 'page/index/index?id=123',
      extraData: {
        id: '35424',
        customData: {
          clientInfo: app.globalData.model
        }
      },
      envVersion: 'develop',
      success(res) {
        // 打开成功
      }
    })
  },
  receiveApply: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../receiveapply/receiveapply',
    })
  },
  sendApply: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../sendapply/sendapply',
    })
  },
  certify: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../identify/identify',
    })
  },
  followlist: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../followlist/followlist?targetUserId=' + userId,
    })
  },
  followedlist: function() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../followedlist/followedlist?targetUserId=' + userId,
    })
  },
  authorizedFilter: function() {
    if (!this.data.isAuthorized) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1000
      })
      return false
    } else {
      return true
    }
  },
  adoptRules: function () {
    wx.navigateTo({
      url: '../../adoption/rule/rule',
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
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          userId = app.globalData.userId
          that.getUserInfo()
        }
      }
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
    wx.stopPullDownRefresh()
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
    return {
      title: '上海宠物领养平台-邻宠',
      imageUrl: app.globalData.staticResourceUrlPrefix+'cms/logo/share-img.png',
      path: '/pages/index/index'
    }
  }
})