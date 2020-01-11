// pages/circle/activity/index.js
const app = getApp()
var pageSize = 10
var pageNum = 1
let bottomLast = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupId: '',
    circle: {},
    circleDesc: '',
    showExpand: false,
    activities: [],
    posts: [],
    isActivityCircle: false,
    prefix: '',
    userId: '',
    showFilter: false,
    showMask: false,
    addPointValue: '',
    isGetPoint: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      groupId: options.groupId,
      isActivityCircle: options.groupType === '1',
      prefix: app.globalData.staticResourceUrlPrefix,
      userId: app.globalData.userId
    })
    this.getCircleDetail()
    if (this.data.isActivityCircle) {
      this.getActivities()
    }
  },

  getCircleDetail: function () {
    if (!this.data.groupId) {
      return
    }
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group',
      data: {
        groupId: this.data.groupId,
        userId: app.globalData.userId,
      },
      method: "GET",
      success: function (res) {
        let data = res.data.data
        data.groupBanner = app.globalData.staticResourceUrlPrefix + data.groupBanner
        that.setData({
          circle: data,
          circleDesc: data.groupInfo.length > 40 ? data.groupInfo.substring(0, 40) + '...' : data.groupInfo,
          showExpand: data.groupInfo.length > 40
        })
      }
    })
  },

  getActivities: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/activities/page',
      data: {
        activityType: 1,
        isActive: 1,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function (res) {
        var activityList = res.data.data.list
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        activityList.map(item => {
          item.activityBanner = app.globalData.staticResourceUrlPrefix + item.activityBanner
        })
        that.setData({
          activities: activityList,
          bottomLast: bottomLast
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  getPosts: function () {
    var that = this
    let queryData = {
      isValid: 1,
      pageNum: pageNum,
      pageSize: pageSize
    }
    if (this.data.groupId) {
      queryData.groupId = this.data.groupId
    } else {
      queryData.userId = app.globalData.userId
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post/page',
      data: queryData,
      method: "GET",
      success: function (res) {
        var posts = res.data.data.list
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        posts.map(item => {
          item.showAll = item.postContent.length < 48
        })
        that.setData({
          posts: posts,
          bottomLast: bottomLast
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  showAll(e) {
    this.data.posts[e.currentTarget.dataset.index].showAll = true
    this.setData({
      posts: this.data.posts
    })
  },

  switchLike(e) {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          let obj = that.data.posts[e.currentTarget.dataset.index]
          wx.request({
            url: app.globalData.requestUrlCms + '/group/post/like',
            data: {
              postId: obj.postId,
              type: !obj.isLiked ? 1 : 0,
              userId: app.globalData.userId
            },
            method: "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded' // 默认值
            },
            success: function (res) {
              if (res.data.success) {
                if (!obj.isLiked) {
                  obj.likeAmount++
                } else {
                  obj.likeAmount--
                }
                obj.isLiked = !obj.isLiked
                that.setData({
                  posts: that.data.posts
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

  switchFollow(e) {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          let obj = that.data.posts[e.currentTarget.dataset.index]
          wx.request({
            url: app.globalData.requestUrlCms + '/users/attention',
            data: {
              followBy: obj.userId,
              userId: app.globalData.userId
            },
            method: obj.isFollowed ? "DELETE" : "POST",
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function (res) {
              if (res.data.success) {
                obj.isFollowed = !obj.isFollowed
                that.setData({
                  posts: that.data.posts
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

  followCircle() {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.request({
            url: app.globalData.requestUrlCms + '/group/follow',
            data: {
              groupId: that.data.groupId,
              userId: that.data.userId
            },
            method: that.data.circle.isFollowed ? "DELETE" : "POST",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              if (res.data.success) {
                that.data.circle.isFollowed = !that.data.circle.isFollowed
                that.setData({
                  circle: that.data.circle
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

  expand() {
    this.setData({
      circleDesc: this.data.circle.groupInfo,
      showExpand: false
    })
  },

  goDetail(e) {
    wx.navigateTo({
      url: '/pages/circle/activityDetail/index?id=' + this.data.activities[e.currentTarget.dataset.index].id,
    })
  },

  showSheet(e) {
    let that = this
    wx.showActionSheet({
      itemList: ['删除'],
      success(res) {
        that.deletePost(e.currentTarget.dataset.index)
      }
    })
  },

  deletePost(index) {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post',
      data: {
        postId: that.data.posts[index].postId,
        memo: '用户删帖',
      },
      method: "DELETE",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        that.data.posts.splice(index, 1)
        that.setData({
          posts: that.data.posts
        })
      }
    })
  },

  clickMask() {
    this.setData({
      showMask: false
    })
  },

  joinCircle() {
    var that = this
    app.IfAccess().then(function (res) {
      if (res) {
        //only authorized user can get platform information
        if (app.globalData.authorized) {
          wx.navigateTo({
            url: '/pages/circle/post/index?groupId=' + that.data.groupId,
          })
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

  getAddPoint() {
    let that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/pointStatement',
      data: {
        userId: app.globalData.userId,
        channel: 8
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
    if (!this.data.isActivityCircle) {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      })
      pageNum = 1
      bottomLast = false
      this.getPosts()
      if (this.data.isGetPoint) {
        this.getAddPoint()
        this.data.isGetPoint = false
      }
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
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      wx.showLoading({
        title: '抓会儿蜜蜂~',
      })
      if (that.data.isActivityCircle) {
        that.getActivities()
      } else {
        that.getPosts()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.circle.groupName,
      imageUrl: this.data.circle.groupBanner,
      path: '/pages/circle/activity/index?groupId=' + this.data.circle.groupId + "&groupType=" + this.data.circle.groupType
    }
  }
})