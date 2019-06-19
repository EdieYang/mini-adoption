const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId
var type
var pageNum=1
var pageSize=10
var bottomLast=false
var messageArr=[]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav:app.globalData.marginNav,
    photoPrefix: photoPrefix,
    navTitle:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    type = options.type
    if (type == 0) {
      var navTitle = '系统通知'
      this.setData({
        navTitle: navTitle,
        type: type
      })
    } else if (type == 1){

      var navTitle = '领养申请通知'
      this.setData({
        navTitle: navTitle,
        type: type
      })
    } else{

      var navTitle = '领养协议通知'
      this.setData({
        navTitle: navTitle,
        type: type
      })
    }
    userId = app.globalData.userId
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getDetailMessageList()
    this.uptDetailMessageList()
  },
  getDetailMessageList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/detailList',
      data: {
        userId: userId,
        type:type,
        pageNum:pageNum,
        pageSize:pageSize
      },
      method: "GET",
      success: function (res) {
        var messageList = res.data.data.list
        for(var i =0;i<messageList.length;i++){
          messageList[i].msgContent = JSON.parse(messageList[i].msgContent)
        }
        if(messageList.length<10){
          bottomLast=true
        }
        messageArr = messageArr.concat(messageList)
        that.setData({
          messageList: messageArr,
        })
      }
    })
  },
  uptDetailMessageList:function(){
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/detailList',
      data: {
        userId: userId,
        type: type
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      method: "PUT",
      success: function (res) {
        
      }
    })
  },
  applyDetail:function(e){
    var applyId = e.currentTarget.dataset.applyid
    wx.navigateTo({
      url: '../../mine/receiveapplydetail/receiveapplydetail?applyId=' + applyId,
    })
  },
  detail:function(e){
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../adoption/detail/detail?petId=' + petId,
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
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      that.getDetailMessageList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})