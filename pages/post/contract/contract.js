const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId
var contractId
var applyId
var name
var phone
var agreement
var formId
var status = 0
var applySign
var adopterSign

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
    this.getPetAdoptApplyDetial()
    this.getUserInfo()
  },
  getUserInfo: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var userInfo = res.data.data
        that.setData({
          userInfo: userInfo,
          isAuthorized: true,
        })
      }
    })
  },
  getPetAdoptApplyDetial: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/agreement/info',
      method: "GET",
      data: {
        applyId: applyId
      },
      success: function(res) {
        var applyInfo = res.data.data.applyInfo
        var contractInfo = res.data.data.contractInfo
        var petInfo = res.data.data.petInfo
        var applyUser = res.data.data.applyUser
        var adopterUser = res.data.data.adopterUser

        if (contractInfo == null) {
          status = 1
        } else if (contractInfo.signStatus == 0) {
          status = 2
        } else if (contractInfo.signStatus == 1) {
          status = 3
        } else {
          status = 4
        }

        petInfo.petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        that.setData({
          applyInfo: applyInfo,
          petInfo: petInfo,
          contractInfo: contractInfo,
          adopterUser: adopterUser,
          applyUser: applyUser,
          status: status
        })

        if (that.data.userInfo.authenticated === 0) {
          //弹出实名认证窗口
          that.setData({
            showFilter: true
          })
        }
      }
    })
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
  submitForm: function(e) {
    var that = this
    name = e.detail.value.name
    phone = e.detail.value.phone
    agreement = e.detail.value.agreement
    formId = e.detail.formId
    if (this.checkEmptyVar(name)) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    wx.showModal({
      title: '',
      content: '协议发送后，将无法再修改补充条款和宠物信息',
      success(res) {
        if (res.confirm) {
          that.uploadForm()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  submitFormApplyer: function(e) {
    var that = this
    name = e.detail.value.name
    phone = e.detail.value.phone
    formId = e.detail.formId
    if (this.checkEmptyVar(name)) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    if (this.checkEmptyVar(phone)) {
      wx.showToast({
        title: '请填写手机号',
        icon: 'none',
        duration: 2000
      })
      return;
    }



    if (this.checkEmptyVar(this.data.contractInfo.applySign)) {
      wx.showToast({
        title: '请签下您的大名',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    applySign = this.data.contractInfo.applySign



    wx.showLoading({
      title: '协议正在上传',
    })

    //上传签名图片
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: applySign,
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'adopt/' + applyId + '/agreement'
      },
      success: (resp) => {
        var result = resp.data;
        var returnUrl = JSON.parse(result).data
        var dataReq = {
          agreementId: this.data.contractInfo.agreementId,
          applyId: applyId,
          applyName: name,
          applyPhone: phone,
          applySign: returnUrl,
          signStatus: 1,
        }

        wx.request({
          url: app.globalData.requestUrlCms + '/adopt/agreement/info/' + formId,
          data: dataReq,
          method: "PUT",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            if (res.data.success) {
              wx.hideLoading();
              wx.showToast({
                title: '协议已发送给送养人',
                icon: 'none',
                duration: 2000
              })
              setTimeout(function() {
                that.redirectPage(applyId)
              }, 2000)
            }
          }
        })
      }
    })
  },

  submitFormAdopter: function(e) {
    var that = this
    formId = e.detail.formId


    if (this.checkEmptyVar(this.data.contractInfo.adopterSign)) {
      wx.showToast({
        title: '请签下您的大名',
        icon: 'none',
        duration: 2000
      })
      return;
    }

    adopterSign = this.data.contractInfo.adopterSign



    wx.showLoading({
      title: '协议正在上传',
    })

    //上传签名图片
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: adopterSign,
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'adopt/' + applyId + '/agreement'
      },
      success: (resp) => {
        var result = resp.data;
        var returnUrl = JSON.parse(result).data
        var dataReq = {
          agreementId: this.data.contractInfo.agreementId,
          applyId: applyId,
          adopterSign: returnUrl,
          signStatus: 2,
        }

        wx.request({
          url: app.globalData.requestUrlCms + '/adopt/agreement/info/' + formId,
          data: dataReq,
          method: "PUT",
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function(res) {
            if (res.data.success) {
              wx.hideLoading();
              wx.showToast({
                title: '协议签署成功',
                icon: 'none',
                duration: 2000
              })
              setTimeout(function() {
                that.redirectPage(applyId)
              }, 2000)
            }
          }
        })
      }
    })
  },


  uploadForm: function() {
    var that = this
    wx.showLoading({
      title: '协议正在上传',
    })

    var dataReq = {
      applyId: applyId,
      adopterId: this.data.adopterUser.userId,
      petId: this.data.petInfo.petId,
      applyBy: this.data.applyInfo.applyBy,
      agreement: agreement,
      adopterName: name,
      adopterPhone: phone,
      signStatus: 0,
      createBy: this.data.adopterUser.userId
    }

    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/agreement/info/' + formId,
      data: dataReq,
      method: "POST",
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        var agreementId = res.data.data
        wx.hideLoading();
        wx.showToast({
          title: '协议发送成功',
          icon: 'none',
          duration: 2000
        })
        setTimeout(function() {
          that.redirectPage(applyId)
        }, 2000)
      }
    })

  },
  redirectPage: function(applyId) {
    wx.redirectTo({
      url: '../../mine/contract/contract?applyId=' + applyId,
    })
  },
  checkEmptyVar: function(param) {
    if (!param || typeof(param) == 'undefined' || param == "") {
      return true;
    } else {
      return false;
    }
  },
  sign: function() {
    wx.navigateTo({
      url: '../sign/sign?type=0',
    })
  },
  signAdopter: function() {
    wx.navigateTo({
      url: '../sign/sign?type=1',
    })
  },
  authorize: function() {
    wx.redirectTo({
      url: '../../mine/identify/identify',
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
  onShow: function() {},

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