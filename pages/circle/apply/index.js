// pages/circle/apply/index.js
const util = require('../../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity: {},
    pickTime: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      activity: JSON.parse(decodeURIComponent(options.data))
    })
    this.data.activity.activityStartTime = util.formatDayTime(new Date(Date.parse(this.data.activity.activityStartTime)))
    this.data.activity.activityEndTime = util.formatDayTime(new Date(Date.parse(this.data.activity.activityEndTime)))
    if (this.data.activity.activityPickTime) {
      this.data.activity.activityPickTime.split(',').map(item => {
        this.data.pickTime.push({
          time: item,
          isCheck: false
        })
      })
    }

    this.setData({
      pickTime: this.data.pickTime
    })
  },

  check(e) {
    this.data.pickTime.map((item, index) => {
      item.isCheck = e.currentTarget.dataset.index === index
    })
    this.setData({
      pickTime: this.data.pickTime
    })
  },

  confirmUse() {
    let selectArray = this.data.pickTime.filter(item => {
      return item.isCheck
    })
    if (selectArray.length === 0) {
      wx.showToast({
        title: '请选择参加活动时间',
        icon: 'none'
      })
    } else {
      var that = this
      wx.request({
        url: app.globalData.requestUrlCms + '/group/activity/register',
        data: {
          activityId: this.data.activity.id,
          userId: app.globalData.userId,
          involvementTime: selectArray[0].time
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          if (res.data.success) {
            wx.navigateBack({
              delta: 2
            })
          }
        }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})