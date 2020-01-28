const util = require('../../../utils/util.js')
const app = getApp()
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var userId;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png',
    activityId: '',
    activity: {},
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    isFollow: false,
    poi: {},
    showMask: false,
    addPointValue: '',
    isGetPoint: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.activityId = options.id
    userId = app.globalData.userId
    qqmapsdk = new QQMapWX({
      key: '4SOBZ-N4Z6P-2WEDV-V3NWZ-U25BF-IOBCM'
    });
  },

  getActivity: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/activities',
      data: {
        activityId: this.data.activityId,
        userId: app.globalData.userId
      },
      method: "GET",
      success: function (res) {
        console.log(res)
        var activity = res.data.data
        activity.activityBanner = that.data.photoPrefix + activity.activityBanner
        activity.activityStartTime = util.formatDayTime(new Date(Date.parse(activity.activityStartTime.replace(/-/g, '/'))))
        activity.activityEndTime = util.formatDayTime(new Date(Date.parse(activity.activityEndTime.replace(/-/g, '/'))))
        activity.activityContent = activity.activityContent.replace(/\<img/gi, '<img class="rich-img" ');
        if (activity.activityType === 2) {
          that.getPoi(activity.activityArea + activity.activityAddress)
        }
        that.setData({
          activity: activity,
          isFollow: activity.hasFollowed === 1
        })
      }
    })
  },

  getPoi(address) {
    var that = this;
    qqmapsdk.geocoder({
      address: address,
      success: function (res) {
        console.log(res);
        var res = res.result;
        var latitude = res.location.lat;
        var longitude = res.location.lng;
        that.setData({
          poi: {
            latitude: latitude,
            longitude: longitude
          }
        });
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },

  goLocation() {
    wx.openLocation({
      latitude: this.data.poi.latitude,
      longitude: this.data.poi.longitude,
    })
  },

  contact() {
    let that = this
    wx.showModal({
      title: '提示',
      content: '\n管理员微信：' + this.data.activity.customerSupport + '\n\n',
      showCancel: false,
      confirmText: '复制',
      success(res) {
        if (res.confirm) {
          wx.setClipboardData({
            data: that.data.activity.customerSupport,
          })
        }
      }
    })
  },

  follow() {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.request({
            url: app.globalData.requestUrlCms + '/group/activities/follow',
            data: {
              activityId: that.data.activityId,
              userId: app.globalData.userId
            },
            method: that.data.isFollow ? 'DELETE' : "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
              if (res.data.success) {
                wx.showToast({
                  title: that.data.isFollow ? '已取消关注' : "已关注",
                  duration: 2000,
                  icon: 'none',
                  mask: true
                })
                that.setData({
                  isFollow: !that.data.isFollow
                })
              }
            }
          })
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },

  apply() {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          if (that.data.activity.activityShouldVerify === 1) {
            if (that.data.activity.isAuthenticated === 1 && that.data.activity.isAnswered === 0 && that.data.activity.activityShouldQuestionnaire === 1) {
              wx.navigateTo({
                url: '/pages/circle/questionnaire/index?data=' + encodeURIComponent(JSON.stringify(that.data.activity)) + "&activityId=" + that.data.activity.id + "&questionnaireId=" + that.data.activity.questionnaireId + "&delta=1",
              })
            } else if (that.data.activity.isAuthenticated === 1 && that.data.activity.activityShouldQuestionnaire === 0 || that.data.activity.isAuthenticated === 1 && that.data.activity.isAnswered === 1 && that.data.activity.activityShouldQuestionnaire === 1) {
              wx.navigateTo({
                url: '/pages/circle/apply/index?data=' + encodeURIComponent(JSON.stringify(that.data.activity)) + "&delta=1",
              })
            } else {
              wx.navigateTo({
                url: '/pages/mine/identify/identify?fromType=activity&data=' + encodeURIComponent(JSON.stringify(that.data.activity)) +
                  "&activityId=" + that.data.activity.id + "&questionnaireId=" + (that.data.activity.activityShouldQuestionnaire === 1 ?
                    that.data.activity.questionnaireId : '') + "&delta=1",
              })
            }
          } else if (that.data.activity.activityShouldQuestionnaire === 1 && that.data.activity.isAnswered === 0) {
            wx.navigateTo({
              url: '/pages/circle/questionnaire/index?data=' + encodeURIComponent(JSON.stringify(that.data.activity)) + "&activityId=" + that.data.activity.id + "&questionnaireId=" + that.data.activity.questionnaireId + "&delta=1",
            })
          } else {
            wx.navigateTo({
              url: '/pages/circle/apply/index?data=' + encodeURIComponent(JSON.stringify(that.data.activity)) + "&delta=1",
            })
          }
        } else {
          that.setData({
            showFilter: true
          })
        }
      }
    })
  },

  cancelLogin: function () {
    this.setData({
      showFilter: false
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
        showFilter: false,
        isAuthorized: true,
        userInfo: app.globalData.userInfo
      })
      return;
    }
    //完善用户信息
    this.data.userId = app.globalData.userId;
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
                            showFilter: false,
                            isAuthorized: true,
                            userInfo: app.globalData.userInfo,
                          })
                        }
                      })
                    }
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
                      icon: 'none',
                      duration: 3000
                    })
                    console.log(res)
                  }
                })

              } else {
                wx.showToast({
                  title: '登录失败，请点击我的底部栏，来到个人中心吐个槽',
                  icon: 'none',
                  duration: 3000
                })
                console.log("服务器配置微信环境出错，请检查APPID和APPSECRT是否匹配！")
              }
            }
          })
        }
      }
    })
  },

  clickMask() {
    this.setData({
      showMask: false
    })
  },

  getAddPoint() {
    let that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/pointStatement',
      data: {
        userId: app.globalData.userId,
        channel: 6,
        targetId: that.data.activityId
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        if (res.data.success) {
          if (res.data.data > 0) {
            that.setData({
              showMask: true,
              addPointValue: res.data.data
            })
          }
        }
      }
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
    this.getActivity()
    if (this.data.isGetPoint) {
      this.getAddPoint()
      this.data.isGetPoint = false
    }
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
    this.data.isGetPoint = true
    return {
      title: this.data.activity.activityTitle,
      imageUrl: this.data.activity.activityBanner,
      path: '/pages/circle/activityDetail/index?id=' + this.data.activity.id,
    }
  }
})