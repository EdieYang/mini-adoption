// pages/circle/index/index.js
const util = require('../../../utils/util.js')
const app = getApp()
var pageSize = 10
var pageNum = 1
var userId;
let bottomLast = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    indicatorColor: '#ffffff',
    marginNav: app.globalData.marginNav,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    imgUrls: [],
    userId: '',
    circles: [],
    toLeft: true,
    activities: [],
    followedCircles: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerList()
  },

  getBannerList: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/banner/list',
      data: {

      },
      method: "GET",
      success: function (res) {
        var bannerlist = res.data.data
        that.setData({
          imgUrls: bannerlist
        })
      }
    })
  },

  redirectUrl: function (e) {
    var index = e.currentTarget.dataset.index
    var url = this.data.imgUrls[index].bannerRedirectUrl
    wx.navigateTo({
      url: '../redirect/redirect?url=' + url,
    })
  },

  getCircles: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/page',
      data: {
        isActive: 1,
        orderBy: 0,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function (res) {
        var circleList = res.data.data.list
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        circleList.map(item => {
          item.groupBanner = that.data.photoPrefix + item.groupBanner
        })
        that.setData({
          showLoading: false,
          circles: circleList,
          bottomLast: bottomLast
        })
        wx.stopPullDownRefresh()
      }
    })
  },

  goDetail(e) {
    let item = this.data.circles[e.currentTarget.dataset.index]
    wx.navigateTo({
      url: '/pages/circle/activity/index?groupId=' + item.groupId + "&groupType=" + item.groupType,
    })
  },

  getActivities: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/activities/follow/list',
      data: {
        userId: app.globalData.userId
      },
      method: "GET",
      success: function (res) {
        res.data.data.map(item => {
          item.activityBanner = that.data.photoPrefix + item.activityBanner
          item.time = item.activityType === '1' ? util.formatDay(new Date(Date.parse(item.activityStartTime))) + '-' + util.formatDay(new Date(Date.parse(item.activityEndTime))) : util.formatDayWeek(new Date(Date.parse(item.activityStartTime)))
        })
        that.setData({
          activities: res.data.data
        })
      }
    })
  },

  getFollowedCircles: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/group/follow',
      data: {
        userId: app.globalData.userId
      },
      method: "GET",
      success: function (res) {
        res.data.data.map(item => {
          item.groupBanner = that.data.photoPrefix + item.groupBanner
        })
        res.data.data.unshift({
          groupBanner: '/images/add-circle.png',
          groupName: '新建圈子'
        })
        that.setData({
          followedCircles: res.data.data
        })
      }
    })
  },

  goFollowedCircle(e) {
    let index = e.currentTarget.dataset.index
    if (index === 0) {
      wx.showToast({
        title: '暂未开放，敬请期待',
        icon: 'none'
      })
    } else {
      let item = this.data.followedCircles[index]
      wx.navigateTo({
        url: '/pages/circle/activity/index?groupId=' + item.groupId + "&groupType=" + item.groupType,
      })
    }
  },

  goFollowedActivity(e) {
    wx.navigateTo({
      url: '/pages/circle/activityDetail/index?id=' + this.data.activities[e.currentTarget.dataset.index].id,
    })
  },

  handleScroll: function (e) {
    this.setData({
      toLeft: e.detail.scrollLeft <= 10
    })
  },

  goMoreActivity() {
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
    pageNum = 1
    bottomLast = false
    this.getCircles()
    this.getActivities()
    this.getFollowedCircles()
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
      that.getCircles()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})