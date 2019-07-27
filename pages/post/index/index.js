const util = require('../../../utils/util.js')

const app = getApp()
var userId;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    showFilter: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    userId=app.globalData.userId
  },


  adopt: function(e) {
    var that = this
    app.IfAccess().then(function(res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.navigateTo({
            url: '../adopt/adopt',
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },
  genFormId: function(formId) {
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/formId',
      data: {
        formId: formId,
        userId: userId
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {}
    })
  },
  cancelLogin: function() {
    this.setData({
      showFilter: false
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
        showFilter: false,
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
                            showFilter: false,
                            isAuthorized: true,
                            userInfo: app.globalData.userInfo,
                          })
                        }
                      })
                    }
                  },
                  fail: function(res) {
                    wx.showToast({
                      title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
                    })
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
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

  lost: function() {
    wx.navigateTo({
      url: '../lost/lost?chooseTab=0',
    })
  },

  find: function() {
    wx.navigateTo({
      url: '../lost/lost?chooseTab=1',
    })
  },
  adoptTour:function(e){
    var url = 'https://mp.weixin.qq.com/s/jNI3MjT4Q-QJLKs3L6RdaQ'
    wx.navigateTo({
      url: '../../redirect/redirect?url=' + url,
    })
  },
  addFormId:function(e){
    this.genFormId(e.detail.formId)
  },
  followAccount:function(){
    wx.navigateTo({
      url: '../../adoption/account/account',
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
  }
})