const util = require('../../../utils/util.js')

const app = getApp()
var userId
var targetUserId
var pageNum = 1
var pageSize = 10
var followlistArr = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    showLoading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    userId = app.globalData.userId
    targetUserId = options.targetUserId
    followlistArr = []
  },
  getFollowList: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/users/' + targetUserId + '/followers',
      data: {
        userId: userId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function (res) {
        var followlist = res.data.data.rows
        var bottomLast = false
        if (res.data.data.total < pageSize) {
          bottomLast = true
        }
        followlistArr = followlistArr.concat(followlist)
        that.setData({
          followlist: followlistArr,
          showLoading: false,
          bottomLast: bottomLast
        })
      }
    })
  },
  cancelFollow: function (e) {
    var that = this
    var followUserId = e.currentTarget.dataset.followid
    if(followUserId==userId){
      wx.showToast({
        title: '不能对自己取消关注',
        icon:'none'
      })
      return
    }
    wx.showModal({
      title: '',
      content: '确定不再关注此用户？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.requestUrlCms + '/users/follow',
            data: {
              userId: followUserId,
              attentBy: userId,
            },
            method: "DELETE",
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            success: function (res) {
              followlistArr = []
              that.getFollowList()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  follow: function (e) {
    var that = this
    var followUserId = e.currentTarget.dataset.followid
    wx.request({
      url: app.globalData.requestUrlCms + '/users/follow',
      data: {
        userId: followUserId,
        attentBy: userId,
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        followlistArr = []
        that.getFollowList()
      }
    })
  },
  onReachBottom: util.throttle(function () {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      that.getFollowList()
    }
  }),
  home:function(e){
    var followUserId = e.currentTarget.dataset.followid
    wx.navigateTo({
      url: '../home/home?userId=' + followUserId,
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
    followlistArr=[]
    this.getFollowList()
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