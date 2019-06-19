const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId;
var pageNum = 1
var pageSize = 10
var collectArr=[]

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav:app.globalData.marginNav,
    showLoading: true,
    photoPrefix: photoPrefix,
    bottomLast: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideShareMenu()
    userId = app.globalData.userId
    collectArr=[]
  },
  getPetCollectedList: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/'+userId+'/collect',
      data: {
        userId: userId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function (res) {
        var petInfoList = res.data.data.rows
        var bottomLast = false
        if (res.data.data.total < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        collectArr = collectArr.concat(petInfoList)
        that.setData({
          petInfoList: collectArr,
          showLoading: false,
          bottomLast: bottomLast
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
    collectArr=[]
    pageNum=1
    this.setData({
      petInfoList:[]
    })
    this.getPetCollectedList()
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
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      that.getPetAdoptList()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.hideShareMenu()
  }
})