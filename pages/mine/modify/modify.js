const util = require('../../../utils/util.js')

const app = getApp()
var userId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    isAuthorized: false,
    userInfo: {},
    tempPortrait: '../../../images/portrait-default.png',
    birthday: '选择你的生日',
    hasBirthday: false,
    hasArea: false,
    photoPrefix: app.globalData.staticResourceUrlPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    var that = this
    userId = app.globalData.userId
    // userId = '9e02dbdc2e0347ed899e056b6780f1a3'
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      method: "GET",
      data: {
        userId: userId
      },
      dataType: "json",
      success: function(res) {
        console.log(res)
        var result = res.data.data
        if (result == null) {
          return
        }
        var hasArea = false
        var location = ''
        if (result.location) {
          hasArea = true
        }
        var birthday = ''
        var hasBirthday = false
        if (result.birthday) {
          birthday = result.birthday
          hasBirthday = true
        } else {
          birthday = '选择你的生日'
        }
        that.setData({
          userInfo: result,
          tempPortrait: result.portrait,
          birthday: birthday,
          gender: result.gender,
          hasArea: hasArea,
          hasBirthday: hasBirthday,
          location: result.location,
        })
      }
    })
  },
  chooseGender: function(e) {
    var gender = e.currentTarget.dataset.gender;
    this.setData({
      gender: gender
    })
  },

  bindBirthdayChange: function(e) {
    this.setData({
      birthday: e.detail.value,
      birthdayDefault: e.detail.value,
      hasBirthday: true
    })
  },

  bindRegionChange: function(e) {
    var region = e.detail.value
    this.setData({
      location: region[0] + ' ' + region[1] + ' ' + region[2],
      hasArea: true
    })
  },
  addPhoto: function() {
    var that = this;

    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var fileSize = res.tempFiles[0].size
        if (fileSize > 1024 * 1024 * 5) {
          wx.showToast({
            title: '上传图片限制大小5M',
            icon: 'none',
            duration: 2000
          })
          return
        }
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 30000
        })
        that.uploadDIY(res.tempFilePaths);
      }
    })
  },
  uploadDIY(filePaths) {
    var that = this
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: filePaths[0],
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'users'
      },
      success: (resp) => {

        wx.hideToast();

        var returnUrl = JSON.parse(resp.data);
        var picUrl = returnUrl.data

        that.setData({
          tempPortrait: that.data.photoPrefix + picUrl
        })

      },
      fail: (res) => {
        console.log(res)
      }
    });
  },
  submit: function(e) {
    var that = this
    wx.showLoading({
      title: '正在提交',
    })

    //获取表单数据
    var nickName = e.detail.value.nickName;
    if (this.checkEmptyVar(nickName)) {
      wx.showToast({
        title: '请填写您的昵称',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var portrait = this.data.tempPortrait
    var gender = this.data.gender
    if (this.checkEmptyVar(gender)) {
      wx.showToast({
        title: '请填选择性别',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var intro = e.detail.value.intro
    var location = this.data.location
    if (this.checkEmptyVar(location)) {
      wx.showToast({
        title: '请填选择所在地',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var birthday = this.data.birthday
    if (birthday == 2000) {
      birthday = ''
    }
    if (this.checkEmptyVar(birthday)) {
      wx.showToast({
        title: '请选择生日',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    var userInfo = app.globalData.userInfo
    userInfo.portrait = portrait
    userInfo.gender = gender
    userInfo.intro = intro
    userInfo.locaion = location
    userInfo.birthday = birthday
    userInfo.nickName = nickName
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      data: {
        userId: userId,
        nickName: nickName,
        portrait: portrait,
        gender: gender,
        birthday: birthday,
        location: location,
        intro: intro
      },
      method: "PUT",
      dataType: "json",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideLoading();
        app.globalData.userInfo = userInfo
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },
  checkEmptyVar: function(param) {
    if (!param || typeof(param) == 'undefined' || param == "") {
      return true;
    } else {
      return false;
    }
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