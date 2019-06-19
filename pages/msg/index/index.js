const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav:app.globalData.marginNav
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    userId = app.globalData.userId
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getMessageList()
    this.getChatMessageList()
  },

  detaillist:function(e){
    var type=e.currentTarget.dataset.type
    wx.navigateTo({
      url: '../detaillist/detaillist?type='+type,
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

  getChatMessageList(){
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/chatList',
      data: {
        userId: userId
      },
      method: "GET",
      success: function (res) {
        var messageList = res.data.data
        that.setData({
          chatlist: messageList,
        })
      }
    })
  },
  chat:function(e){
    var userId=e.currentTarget.dataset.userid
    wx.navigateTo({
      url: '../../adoption/chat/chat?userId='+userId,
    })
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