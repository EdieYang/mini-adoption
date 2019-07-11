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
    marginNav: app.globalData.marginNav,
    photoPrefix: photoPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    userId = app.globalData.userId
    applyId = options.applyId
    this.getPetAdoptAgreementDetial()
  },
  getPetAdoptAgreementDetial: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/agreement/info',
      method: "GET",
      data: {
        applyId: applyId
      },
      success: function(res) {
        var contractInfo = res.data.data.contractInfo
        var petInfo = res.data.data.petInfo
        var petImg = photoPrefix + petInfo.mediaList[0].mediaPath
        petInfo.petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        that.setData({
          petImg: petImg,
          contractInfo: contractInfo,
          petInfo: petInfo
        })
      }
    })
  },
  download: function(e) {
    this.genFormId(e.detail.formId)
    wx.showLoading({
      title: '协议制作中',
    })
    wx.navigateTo({
      url: '../contractdwn/contractdwn?applyId=' + e.detail.value.applyId,
    })
    wx.hideLoading()
  },
  addFormId: function(e) {
    this.genFormId(e.detail.formId)
  },
  genFormId: function(formId) {
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/formId',
      data: {
        formId: formId,
        userId: userId
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {}
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