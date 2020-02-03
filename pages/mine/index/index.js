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
    signDays: [{
      point: 20
    }, {
      point: 50,
      picUrl: '/images/point-20.png'
    }, {
      point: 75,
      picUrl: '/images/point-25.png'
    }, {
      point: 100,
      picUrl: '/images/point-30.png'
    }, {
      point: 120
    }, {
      point: 150
    }, {
      point: 200,
      picUrl: '/images/point-100.png'
    }],
    hasSigned: false,
    showMask: false,
    tasks: [{
      taskName: '首次签到',
      taskValue: 100
    }, {
      taskName: '完善个人信息',
      taskValue: 200,
      taskOption: '去完善',
      path: '../identify/identify',
      isCompleted: false
    }, {
      taskName: '转发领养',
      taskValue: 10,
      taskOption: '去转发',
      limit: 3,
      path: 'home'
    }, {
      taskName: '浏览领养帖',
      taskValue: 10,
      taskOption: '去浏览',
      limit: 3,
      path: 'home'
    }, {
      taskName: '转发活动',
      taskValue: 10,
      taskOption: '去转发',
      limit: 1,
      path: 'activity'
    }, {
      taskName: '成功参加活动',
      taskOption: '去参加',
      path: 'activity'
    }, {
      taskName: '发帖',
      taskValue: 5,
      taskOption: '去发帖',
      limit: 5,
      path: 'circle'
    }],
    maskPoint: '',
    maskDay: '',
    unreadMsg:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    wx.showLoading({
      title: '加载个人信息',
      mask:true
    })
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          userId = app.globalData.userId;
          that.getUserInfo()
          that.getTotalSignDays()
        }else{
          wx.hideLoading()
        }
      }
    })
  },
  getUserInfo: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/users/user',
      data: {
        userId: userId
      },
      method: "GET",
      success: function (res) {
        var userInfo = res.data.data
        that.data.tasks[1].isCompleted = userInfo.authenticated === 1
        that.setData({
          userInfo: userInfo,
          isAuthorized: true,
          hasSigned: userInfo.hasSigned === 1,
          tasks: that.data.tasks
        })
        wx.hideLoading()
      }
    })
  },
  bindGetUserInfo: function (e) {
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
            url: app.globalData.requestUrlWechat + '/wxmini/user/login',
            method: "GET",
            data: {
              code: res.code
            },
            dataType: "json",
            success: function (res) {
              const userId = res.data.userId;
              const openId = res.data.openId;
              const sessionKey = res.data.sessionKey;
              if (userId && typeof (userId) != 'undefined' && userId != '') {
                //授权回调函数获取用户详情    
                wx.getUserInfo({
                  withCredentials: true,
                  success: function (res) {
                    console.log(res);
                    if (res.errMsg == "getUserInfo:ok") {
                      //decrypt encrypeted userInfo
                      wx.request({
                        url: app.globalData.requestUrlWechat + '/wxmini/user/authorizeUser/' + userId,
                        data: {
                          encryptedData: res.encryptedData,
                          iv: res.iv,
                          sessionKey: sessionKey
                        },
                        dataType: "json",
                        method: "POST",
                        success: function (res) {
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
                  fail: function (res) {
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '登录失败，请点击帮助反馈提交问题或与客服直接联系',
                  icon: 'none',
                  duration: 5000,
                })
                console.log("服务器配置微信环境出错，请检查APPID和APPSECRT是否匹配！")
              }
            }
          })
        }
      }
    })
  },
  getUnreadMessage: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/unreadlist',
      data: {
        userId: userId
      },
      method: "GET",
      success: function (res) {
        var msgList = res.data.data
        if (msgList.length > 0) {
          that.setData({
            unreadMsg:true
          })
        }else{
          that.setData({
            unreadMsg: false
          })
        }
      }
    })
  },
  copyWx: function (e) {
    wx.setClipboardData({
      data: 'zmydwx83',
      success(res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  home: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../home/home',
    })
  },
  modify: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../modify/modify',
    })
  },
  adoptlist: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../adopt/adopt',
    })
  },
  collect: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../collect/collect',
    })
  },
  feedback: function () {
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
  receiveApply: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../receiveapply/receiveapply',
    })
  },
  sendApply: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../sendapply/sendapply',
    })
  },
  certify: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../identify/identify',
    })
  },
  followlist: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../followlist/followlist?targetUserId=' + userId,
    })
  },
  followedlist: function () {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '../followedlist/followedlist?targetUserId=' + userId,
    })
  },
  authorizedFilter: function () {
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
  signIn() {
    if (!this.authorizedFilter()) {
      return
    }
    let that = this
    if (!this.data.hasSigned) {
      wx.showLoading({
        title: '获取积分中',
      })
      wx.request({
        url: app.globalData.requestUrlCms + '/users/signIn',
        data: {
          userId: app.globalData.userId
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.hideLoading()
          if (res.data.success) {
            that.setData({
              maskPoint: res.data.data.points,
              maskDay: res.data.data.groupDays === -1 ? '首次' : res.data.data.groupDays,
              hasSigned: true,
              showMask: true
            })
            that.getTotalSignDays()
            that.getUserInfo()
          }
        }
      })
    }
  },
  getTotalSignDays() {
    let that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/users/signIn',
      data: {
        userId: app.globalData.userId
      },
      method: "GET",
      success: function (res) {
        if (res.data.success) {
          that.data.signDays.map((item, index) => {
            item.complete = index < res.data.data
          })
          that.setData({
            signDays: that.data.signDays
          })
        }
      }
    })
  },
  taskDetail() {
    wx.navigateTo({
      url: '/pages/mine/taskDetail/index',
    })
  },
  clickMask() {
    this.setData({
      showMask: false
    })
  },
  completeTask(e) {
    let item = this.data.tasks[e.currentTarget.dataset.index]
    if (!item.isCompleted) {
      if (item.path === 'activity') {
        wx.request({
          url: app.globalData.requestUrlCms + '/group/list',
          data: {
            groupType: '1',
            isActive: 1
          },
          method: "GET",
          success: function (res) {
            let item = res.data.data[0]
            wx.navigateTo({
              url: '/pages/circle/activity/index?groupId=' + item.groupId + "&groupType=" + item.groupType,
            })
          }
        })
      } else if (item.path === 'home') {
        wx.switchTab({
          url: '/pages/index/index',
        })
      } else if (item.path === 'circle') {
        wx.switchTab({
          url: '/pages/circle/index/index',
        })
      } else {
        wx.navigateTo({
          url: item.path,
        })
      }
    }
  },
  myPosts() {
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '/pages/mine/postlist/postlist',
    })
  },
  toMsgList(){
    if (!this.authorizedFilter()) {
      return
    }
    wx.navigateTo({
      url: '/pages/msg/index/index',
    })
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
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          userId = app.globalData.userId
          that.getUserInfo()
          that.getUnreadMessage()
        }
      }
    })
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
    wx.stopPullDownRefresh()
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
    return {
      title: '上海宠物领养平台-邻宠',
      imageUrl: app.globalData.staticResourceUrlPrefix + 'cms/logo/share-img.png',
      path: '/pages/index/index'
    }
  }
})