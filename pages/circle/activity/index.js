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
    activities: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.groupId = options.groupId
    this.getCircles()
    this.getActivities()
  },

  getCircles: function () {
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
      that.getActivities()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})