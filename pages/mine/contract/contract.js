const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId
var agreementId
var applyId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    nvabarData: {
      showCapsule: 0, //是否显示左上角图标
      showCapsuleSingle: 1, //是否显示左上角图标
      showIndex: false,
      title: '领养协议', //导航栏 中间的标题
      background: '#fff',
      color: '#2d2d2d',
      share: true
    },
    // 此页面 页面内容距最顶部的距离
    height: app.globalData.height * 2 + 20,
    photoPrefix: photoPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userId = app.globalData.userId
    // agreementId = options.agreementId
    applyId = options.applyId
    this.getPetAdoptAgreementDetial()
  },
  getPetAdoptAgreementDetial: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/agreement/info',
      method: "GET",
      data:{
        applyId: applyId
      },
      success: function (res) {
        var contractInfo = res.data.data.contractInfo
        var petInfo = res.data.data.petInfo
        petInfo.petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        that.setData({
          contractInfo: contractInfo,
          petInfo: petInfo
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