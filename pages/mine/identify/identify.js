const util = require('../../../utils/util.js')

const app = getApp()
var userId
var imageFronDefault = '../../../images/identity-back.png'
var imagebackDefault = '../../../images/identity-front.png'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    imageFront: imageFronDefault,
    imageBack: imagebackDefault,
    status: 0,
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    wx.hideShareMenu()
    userId = app.globalData.userId
    var scene = options.scene
    if (scene == 1) {
      that.setData({
        homeIcon: true,
        backIcon: ''
      })
    }

  },

  chooseImage: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.img
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showLoading({
          title: '上传中',
        })
        that.uploadDIY(res.tempFilePaths, index);
      }
    })
  },
  uploadDIY(filePaths, index) {
    var that = this
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: filePaths[0],
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'certification'
      },
      success: (resp) => {
        wx.hideLoading()

        var fielObj = JSON.parse(resp.data);
        var returnUrl = fielObj.data
        if (index == 1) {
          that.setData({
            imageFront: that.data.photoPrefix + returnUrl
          })
        } else {
          that.setData({
            imageBack: that.data.photoPrefix + returnUrl
          })
        }
      },
      fail: (res) => {

      },
      complete: () => {

      },
    });
  },

  uploadCheck: function(e) {
    var that = this
    var realName = e.detail.value.realName
    var idCard = e.detail.value.idCard
    if (realName == '') {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (idCard == '') {
      wx.showToast({
        title: '请输入真实身份证',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (this.data.imageFront != imageFronDefault && this.data.imageBack != imagebackDefault) {
      wx.showLoading({
        title: '上传中',
      })
      wx.request({
        url: app.globalData.requestUrlCms + '/adopt/certification',
        data: {
          imageFront: that.data.imageFront,
          imageBack: that.data.imageBack,
          userId: userId,
          idCard: idCard,
          realName: realName,
          formId: e.detail.formId
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function(res) {
          wx.hideLoading()
          if (res.data.success) {
            that.getCertification()
          }
        }
      })
    } else {
      wx.showToast({
        title: '请点击身份证图片上传身份信息',
        icon: 'none',
        duration: 2000
      })
    }
  },
  getCertification: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/certification',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var checkInfo = res.data.data
        if (checkInfo == null) {
          that.setData({
            status: 1
          })
        } else {
          that.setData({
            status: 2,
            checkInfo: checkInfo
          })
        }
      }
    })
  },

  reUpload: function() {
    var that = this
    wx.showLoading({
      title: '取消此审核中',
    })
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/certification',
      data: {
        userId: userId,
        id: that.data.checkInfo.id,
        status: 3
      },
      method: "PUT",
      success: function(res) {
        wx.hideLoading()
        if (res.data.success) {
          that.setData({
            status: 1
          })
        }
      }
    })
  },
  example:function(){
    wx.navigateTo({
      url: '../identifyexample/identifyexample',
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
  onShow: function(e) {
    this.getCertification()
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