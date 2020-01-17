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
    backIcon: '../../images/back-pre-black.png',
    fromType: '',
    activityData: '',
    activityId: '',
    questionnaireId: '',
    countDown: 0,
    tel: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.hideShareMenu()
    userId = app.globalData.userId
    var scene = options.scene
    this.data.fromType = options.fromType
    this.data.activityData = options.data
    this.data.activityId = options.activityId
    this.data.questionnaireId = options.questionnaireId
    if (scene == 1) {
      that.setData({
        homeIcon: true,
        backIcon: ''
      })
    }

  },

  chooseImage: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.img
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
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

  uploadCheck: function (e) {
    var that = this
    var realName = e.detail.value.realName
    var idCard = e.detail.value.idCard
    var wxAccount = e.detail.value.wxAccount
    var mobilePhone = e.detail.value.mobilePhone
    var verifyCode = e.detail.value.verifyCode
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
    if (wxAccount == '') {
      wx.showToast({
        title: '请输入微信号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (mobilePhone == '') {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if (verifyCode == '') {
      wx.showToast({
        title: '请输入验证码',
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
          wxAccount: wxAccount,
          mobilePhone: mobilePhone,
          verifyCode: verifyCode,
          formId: e.detail.formId
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
        success: function (res) {
          wx.hideLoading()
          if (res.data.success) {
            if (that.data.fromType === 'activity') {
              if (that.data.questionnaireId) {
                wx.navigateTo({
                  url: '/pages/circle/questionnaire/index?data=' + that.data.activityData + "&activityId=" + that.data.activityId + "&questionnaireId=" + that.data.questionnaireId,
                })
              } else {
                wx.navigateTo({
                  url: '/pages/circle/apply/index?data=' + that.data.activityData,
                })
              }
            } else {
              that.getCertification()
            }
          } else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
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
  getCertification: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/certification',
      data: {
        userId: userId
      },
      method: "GET",
      success: function (res) {
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

  reUpload: function () {
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
      success: function (res) {
        wx.hideLoading()
        if (res.data.success) {
          that.setData({
            status: 1
          })
        }
      }
    })
  },
  example: function () {
    wx.navigateTo({
      url: '../identifyexample/identifyexample',
    })
  },
  inputTel(e) {
    this.data.tel = e.detail.value
  },
  sendCode() {
    var self = this
    if (this.data.countDown !== 0) {
      return
    } else if (!this.data.tel || !this.data.tel.match(/^1\d{10}$/)) {
      wx.showToast({
        title: '请输入正确的手机号码！',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/sms/verifyCode',
      data: {
        userId: userId,
        mobilePhone: this.data.tel
      },
      method: "GET",
      success: function (res) {
        if (res.data.success) {
          wx.showToast({
            title: '验证码已发送',
            duration: 1000
          })
        }
      }
    })
    var tempInterval
    var countNum = 60
    self.data.countDown = countNum
    tempInterval = setInterval(function () {
      if (countNum === 0) {
        clearInterval(tempInterval)
        countNum = 60
        return
      }
      countNum -= 1
      self.setData({
        countDown: countNum
      })
    }, 1000)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    this.getCertification()
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
  onShareAppMessage: function () { }
})