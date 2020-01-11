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
    userId: ''
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
    } else {
      this.getPosts()
    }
  },

  getCircleDetail: function () {
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
    wx.request({
      url: app.globalData.requestUrlCms + '/group/post/page',
      data: {
        groupId: this.data.groupId,
        isValid: 1,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function (res) {
        var posts = res.data.data.list
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
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
    let obj = this.data.posts[e.currentTarget.dataset.index]
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
  },

  switchFollow(e) {
    var that = this
    let obj = this.data.posts[e.currentTarget.dataset.index]
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
  },

  followCircle() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/follow',
      data: {
        groupId: this.data.groupId,
        userId: this.data.userId
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

  joinCircle() {
    wx.navigateTo({
      url: '/pages/circle/post/index?groupId=' + this.data.groupId,
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

  }
})