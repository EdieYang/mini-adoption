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
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    waterPrint: '?x-oss-process=image/resize,w_200,h_200/auto-orient,1/quality,q_90/format,jpg/watermark,type_d3F5LXplbmhlaQ,size_10,text_5LuF5L6b6YK75a6g5bmz5Y-w5L2_55So,color_2d2d2d,t_90,g_center,voffset_0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
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
        var petImg = that.data.photoPrefix + petInfo.mediaList[0].mediaPath
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
    wx.showLoading({
      title: '协议制作中',
    })
    wx.navigateTo({
      url: '../contractdwn/contractdwn?applyId=' + e.detail.value.applyId,
    })
    wx.hideLoading()
  },
  previewIdcard: function() {
    var imageUrl = []
    imageUrl.push(this.data.contractInfo.idCardFrontUrl + this.data.waterPrint)
    imageUrl.push(this.data.contractInfo.idCardBackUrl + this.data.waterPrint)
    wx.previewImage({
      current: this.data.contractInfo.idCardFrontUrl + this.data.waterPrint,
      urls: imageUrl
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
  onShareAppMessage: function() {}
})