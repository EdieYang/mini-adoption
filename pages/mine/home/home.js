const util = require('../../../utils/util.js')

const app = getApp()
var userId;
var targetUserId
var pageNum = 1
var pageSize = 10


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    isAuthorized: false,
    userInfo: {},
    showLoading: true,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    bottomLast: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    targetUserId = options.userId
    userId = app.globalData.userId
    if (typeof targetUserId != 'undefined') {
      this.getAdoptUserInfo(targetUserId)
    } else {
      this.getAdoptUserInfo(userId)
    }

    if (targetUserId != userId) {
      this.getFollowedStatus()
    }
  },

  getAdoptUserInfo: function(targetUserId) {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/adoptUser',
      data: {
        userId: targetUserId
      },
      method: "GET",
      success: function(res) {
        var adoptUserInfo = res.data.data
        that.setData({
          targetUserId: targetUserId,
          userId: userId,
          userInfo: adoptUserInfo
        })
      }
    })
  },

  getPetAdoptList: function() {
    var that = this
    var creaetBy = ''
    if (typeof targetUserId != 'undefined') {
      creaetBy = targetUserId
    } else {
      creaetBy = userId
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/list',
      data: {
        createBy: creaetBy,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var petInfoList = res.data.data.list
        var bottomLast = false
        if (res.data.data.total < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        that.setData({
          petInfoList: petInfoList,
          showLoading: false,
          bottomLast: bottomLast
        })
      }
    })
  },
  getFollowedStatus: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/attention',
      data: {
        userId: userId,
        targetUserId: targetUserId
      },
      method: "GET",
      success: function(res) {
        that.setData({
          followed: res.data.data
        })
      }
    })
  },
  follow: function() {
    var that = this
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/attention',
      data: {
        userId: targetUserId,
        attentBy: userId,
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        that.getAdoptUserInfo(targetUserId)
        that.setData({
          followed: true
        })
        wx.hideLoading()
        wx.showToast({
          title: '关注成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  cancelFollow: function() {
    var that = this
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/attention',
      data: {
        userId: targetUserId,
        attentBy: userId,
      },
      method: "DELETE",
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function(res) {
        that.getAdoptUserInfo(targetUserId)
        that.setData({
          followed: false
        })
        wx.hideLoading()
        wx.showToast({
          title: '已取消关注',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  modify: function() {
    wx.navigateTo({
      url: '../modify/modify',
    })
  },
  followlist: function() {
    wx.navigateTo({
      url: '../followlist/followlist?targetUserId=' + targetUserId,
    })
  },
  followedlist: function() {
    wx.navigateTo({
      url: '../followedlist/followedlist?targetUserId=' + targetUserId,
    })
  },
  detail: function(e) {
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../adoption/detail/detail?petId=' + petId,
    })
  },
  chat: function(e) {
    var userId = e.currentTarget.dataset.userid
    wx.navigateTo({
      url: '../../adoption/chat/chat?userId=' + userId,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getPetAdoptList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})