// pages/circle/activityDetail/index.js
const util = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityId: '',
    activity: {},
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    isFollow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.activityId = options.id
    this.getActivity()
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
        var activity = res.data.data
        activity.activityBanner = that.data.photoPrefix + activity.activityBanner
        activity.activityStartTime = util.formatDayTime(new Date(Date.parse(activity.activityStartTime)))
        activity.activityEndTime = util.formatDayTime(new Date(Date.parse(activity.activityEndTime)))
        that.setData({
          activity: activity,
          isFollow: activity.hasFollowed === 1
        })
      }
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
    wx.request({
      url: app.globalData.requestUrlCms + '/group/activities/follow',
      data: {
        activityId: this.data.activityId,
        userId: app.globalData.userId
      },
      method: this.data.isFollow ? 'DELETE' : "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            isFollow: !that.data.isFollow
          })
        }
      }
    })
  },

  apply() {
    wx.navigateTo({
      url: '/pages/circle/apply/index?data=' +encodeURIComponent(JSON.stringify(this.data.activity)),
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})