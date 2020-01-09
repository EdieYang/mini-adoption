// pages/circle/index/index.js
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
    circles: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '抓会儿蝴蝶~',
    })
    var that = this
    pageNum = 1
    bottomLast = false
    this.getBannerList()
    app.IfAccess().then(function (res) {
      if (res) {
        userId = app.globalData.userId;
        if (userId && typeof (userId) != 'undefined' && userId != '') {
          wx.hideLoading()
          that.getCircles()
          // that.getUnreadMessage()
          // that.getOrgList()
          // that.getActivities()
        }
      }
    })
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
    if (item.groupType === '1') {
      wx.navigateTo({
        url: '/pages/circle/activity/index?groupId=' + item.groupId,
      })
    }
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
      that.getCircles()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})