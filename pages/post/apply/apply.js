var util = require('../../../utils/util.js');
const app = getApp()
const photoPrefix = 'https://melody.memorychilli.com/'

var userId;
var petId;
var job = ''
var phone = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    hasArea: false,
    obeyRules: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    petId = options.petId
    userId = app.globalData.userId
  },

  chooseGender: function(e) {
    var gender = e.currentTarget.dataset.type;
    this.setData({
      gender: gender
    })
  },
  chooseAge: function(e) {
    var age = e.currentTarget.dataset.type;
    this.setData({
      age: age
    })
  },
  chooseExper: function(e) {
    var experience = e.currentTarget.dataset.type;
    this.setData({
      experience: experience
    })
  },
  chooseMarriage: function(e) {
    var marriage = e.currentTarget.dataset.type;
    this.setData({
      marriage: marriage
    })
  },
  chooseHouseState: function(e) {
    var houseState = e.currentTarget.dataset.type;
    this.setData({
      houseState: houseState
    })
  },

  jobInput: function(event) {
    job = event.detail.value;
  },
  bindRegionChange: function(e) {
    console.log(e.detail.value);
    this.setData({
      region: e.detail.value,
      hasArea: true
    })
    if (this.data.region[0] != '上海市') {
      wx.showToast({
        title: '平台仅限居住在上海市区县的用户领养！',
        duration: 1000,
        icon: 'none'
      })
    }
  },
  phoneInput: function(event) {
    phone = event.detail.value;
  },
  verifyPhone: function(event) {
    var phone = event.detail.value
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请输入正确的手机号',
        duration: 1000,
        icon: 'none'
      })
      return;
    }
  },
  storyInput: function(event) {
    // 获取输入框的内容
    var value = event.detail.value;
    this.setData({
      story: value
    })
  },
  obeyRules: function() {
    var obey = this.data.obeyRules
    this.setData({
      obeyRules: !obey
    })
  },
  submitApply: function(e) {
    var formId = e.detail.formId
    var that = this
    wx.showLoading({
      title: '正在提交',
    })


    var gender = this.data.gender;
    if (this.checkEmptyVar(gender)) {
      wx.showToast({
        title: '须选择您的性别',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var age = this.data.age;
    if (this.checkEmptyVar(age)) {
      wx.showToast({
        title: '须选择您的年龄',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var experience = this.data.experience;
    if (this.checkEmptyVar(experience)) {
      wx.showToast({
        title: '须选择养宠经验',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var marriage = this.data.marriage;
    if (this.checkEmptyVar(marriage)) {
      wx.showToast({
        title: '须选择婚姻状况',
        icon: 'none',
        duration: 2000
      })
      return;
    }


    var houseState = this.data.houseState;
    if (this.checkEmptyVar(houseState)) {
      wx.showToast({
        title: '须选择住房情况',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    //获取表单数据
    var job = e.detail.value.job;
    if (this.checkEmptyVar(job)) {
      wx.showToast({
        title: '须填写职业',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    var region = this.data.region;
    if (this.checkEmptyVar(region)) {
      wx.showToast({
        title: '须选择所在地',
        icon: 'none',
        duration: 2000
      })
      return;
    } else if (region[0] != '上海市') {
      wx.showToast({
        title: '平台仅限居住在上海市区县的用户领养！',
        duration: 1000,
        icon: 'none'
      })
      return
    }

    var regionArr = region
    var regionDetail = region[0] + ' ' + region[1] + ' ' + region[2]

    var phone = e.detail.value.phone;
    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '须填写手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (!(/^1(3|4|5|7|8)\d{9}$/.test(phone))) {
      wx.showToast({
        title: '请输入正确的手机号',
        duration: 1000,
        icon: 'none'
      })
      return;
    }

    if (!this.data.obeyRules) {
      wx.showToast({
        title: '须同意邻宠领养平台送养规则',
        duration: 3000,
        icon: 'none'
      })
      return;
    }

    var dataReq = {
      petId: petId,
      applyBy: userId,
      sex: gender,
      age: age,
      keptPet: experience,
      maritalStatus: marriage,
      housingCondition: houseState,
      job: job,
      address: regionDetail,
      mobilePhone: phone,
      toAdopter: this.data.story,
      formId: formId
    }
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/info',
      data: dataReq,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var applyId = res.data.data
        wx.hideLoading();

        if (applyId != '') {
          wx.showToast({
            title: '提交成功',
            icon: 'none',
            duration: 2000
          })

          setTimeout(function() {
            that.toSendApply()
          }, 2000)

        } else {
          wx.showToast({
            title: '抱歉，您已申请过此领养',
            icon: 'none',
            duration: 2000
          })

          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      }
    })
  },
  toSendApply: function() {
    wx.redirectTo({
      url: '../../mine/sendapply/sendapply',
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