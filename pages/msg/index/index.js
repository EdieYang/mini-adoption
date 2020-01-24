const util = require('../../../utils/util.js')

const app = getApp()
var userId;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png',
    chatlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    userId = app.globalData.userId
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    app.globalData.socketStatus = 'HANDDOWN'
    wx.hideTabBarRedDot({
      index: 2
    })
    wx.onSocketOpen(function(res) {
      console.log('opening:' + res)
    })

    wx.onSocketClose(function(res) {
      console.log('closed:' + res)
    })
    wx.onSocketMessage(function(res) {
      //消息弹出提示
      if (app.globalData.socketStatus != 'AUTO') {
        //消息弹出提示
        wx.showTabBarRedDot({
          index: 2
        })
        //消息存入缓存
        var resJson = JSON.parse(res.data)
        wx.setStorageSync(resJson.userId, "SHOW_CHAT_MSG")
        that.getChatMessageList()
      }
    })
    this.getMessageList()
    this.getChatMessageList()
  },

  detaillist: function(e) {
    var type = e.currentTarget.dataset.type
    wx.navigateTo({
      url: '../detaillist/detaillist?type=' + type,
    })
  },
  getMessageList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/list',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var messageList = res.data.data
        that.setData({
          messageList: messageList,
        })
      }
    })
  },

  getChatMessageList() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/chatList',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var messageList = res.data.data
        var old = that.data.chatlist
        if (old.length == 0 && messageList != null) {
          for (var i = 0; i < messageList.length; i++) {
            //缓存消息识别是否为最新消息
            var msgLatest = wx.getStorageSync(messageList[i].userId)
            if (msgLatest == 'SHOW_CHAT_MSG') {
              messageList[i].fresh = true
            } else {
              messageList[i].fresh = false
            }
          }
          that.setData({
            chatlist: messageList,
          })
          return
        }
        if (messageList != null) {
          for (var j = 0; j < messageList.length; j++) {
            var msgLatest = wx.getStorageSync(messageList[j].userId)
            if (msgLatest == 'SHOW_CHAT_MSG') {
              messageList[j].fresh = true
            } else {
              messageList[j].fresh = false
            }
          }
        }

        that.setData({
          chatlist: messageList,
        })
      }
    })
  },
  chat: function(e) {
    var userId = e.currentTarget.dataset.userid
    wx.navigateTo({
      url: '../../adoption/chat/chat?userId=' + userId,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    app.globalData.socketStatus = 'AUTO'
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