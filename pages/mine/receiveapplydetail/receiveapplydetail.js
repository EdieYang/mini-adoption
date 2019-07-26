const util = require('../../../utils/util.js')

const app = getApp()
var userId
var applyId
var actionSheetList = ['双方达成一致取消申请', '领养人资质不符合要求', '送养人不想送养了', '宠物已被领养']
var actionSheetList2 = ['双方达成一致取消申请', '领养人不想领养了', '宠物已被领养']
var reqPassTimeout,reqRefuseTimeout;
var interval;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
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
    applyId = options.applyId
    if (applyId == '' || typeof applyId == 'undefined' || applyId == null) {
      applyId = options.scene
      that.setData({
        homeIcon: true,
        backIcon: ''
      })
    }
    this.setData({
      userId: userId
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
    this.getPetAdoptApplyDetial()
  },
  getPetAdoptApplyDetial: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/' + applyId,
      method: "GET",
      success: function(res) {
        var applyInfo = res.data.data.applyInfo
        var applyId = applyInfo.applyId
        var applyDetailId = applyId.substring(0, 15)
        var userInfo = res.data.data.userInfo
        var petInfo = res.data.data.petInfo
        var adopterInfo = res.data.data.adopterInfo

        interval = setInterval(function() {
          //将时间传如 调用
          var clock = that.forea(util.formatDateDiffMills(applyInfo.applyTime))

          that.setData({ //正常倒计时        
            leftTime: clock
          });
        }.bind(this), 1000);

        petInfo.petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        that.setData({
          applyDetailId: applyDetailId,
          applyInfo: applyInfo,
          userInfo: userInfo,
          petInfo: petInfo,
          adoptUserInfo: adopterInfo
        })
      }
    })
  },
  userhome: function(e) {
    var targetUserId = e.currentTarget.dataset.targetuserid
    wx.navigateTo({
      url: '../home/home?userId=' + targetUserId,
    })
  },
  petdetail: function(e) {
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../adoption/detail/detail?petId=' + petId,
    })
  },
  refusePop: function(e) {
    var that = this
    wx.showActionSheet({
      itemList: actionSheetList,
      success(res) {
        that.refuse(e.currentTarget.dataset.applyid, actionSheetList[res.tapIndex])
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  cancelPop: function(e) {
    var that = this
    wx.showActionSheet({
      itemList: actionSheetList2,
      success(res) {
        that.refuse(e.currentTarget.dataset.applyid, actionSheetList[res.tapIndex])
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  refuse: function(applyId, applyResp) {
    wx.showLoading({
      title: '正在取消',
    })
    var that = this
    var applyId = applyId
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/info',
      data: {
        applyId: applyId,
        applyStatus: '5',
        applyResp: applyResp
      },
      method: "PUT",
      success: function(res) {
        wx.hideLoading()
        if (res.data.success) {
          wx.showToast({
            title: '取消成功',
            duration: 2000,
            mask: true,
            icon: 'none'
          })
          reqRefuseTimeout=setTimeout(function() {
            that.getPetAdoptApplyDetial()
          }, 2000)
        }
      }
    })
  },
  pass: function(e) {
    var that = this
    var applyId = e.currentTarget.dataset.applyid
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/apply/info',
      data: {
        applyId: applyId,
        applyStatus: '1'
      },
      method: "PUT",
      success: function(res) {
        if (res.data.success) {
          wx.showToast({
            title: '初审成功',
            duration: 2000,
            mask: true,
            icon: 'none'
          })
          reqPassTimeout=setTimeout(function() {
            that.getPetAdoptApplyDetial()
          }, 2000)
        }
      }
    })
  },
  contractDetail: function(e) {
    var applyId = e.currentTarget.dataset.applyid
    wx.navigateTo({
      url: '../contract/contract?applyId=' + applyId,
    })
  },
  signContract: function(e) {
    var applyId = e.currentTarget.dataset.applyid
    wx.navigateTo({
      url: '../../post/contract/contract?applyId=' + applyId,
    })
  },
  copyWx: function(e) {
    var wxId = e.currentTarget.dataset.wx
    if (wxId == '') {
      return
    }
    wx.setClipboardData({
      data: wxId,
      success(res) {
        wx.showToast({
          title: '复制成功',
          icon: 'success',
          duration: 2000
        })
      }
    })
  },
  call: function(e) {
    var phone = e.currentTarget.dataset.phone
    if (phone == '') {
      return
    }

    wx.makePhoneCall({
      phoneNumber: phone // 仅为示例，并非真实的电话号码
    })
  },
  chat: function(e) {
    var targetUserId = e.currentTarget.dataset.target
    wx.navigateTo({
      url: '../../adoption/chat/chat?userId=' + targetUserId,
    })
  },
  forea(timetot) {
    var timenow = Date.parse(new Date()) / 1000;
    var totalstart = timetot / 1000 + 60 * 60 * 24 * 7 - timenow;
    return this.dateformat(totalstart)
  },


  // 时间格式化输出，将时间戳转为 倒计时时间
  dateformat(micro_second) {

    var second = micro_second; //总的秒数

    // 天数位   
    var day = Math.floor(second / 3600 / 24);
    var dayStr = day.toString();
    if (dayStr.length == 1) dayStr = '0' + dayStr;

    // 小时位   
    var hr = Math.floor(second / 3600 % 24);
    var hrStr = hr.toString();
    if (hrStr.length == 1) hrStr = '0' + hrStr;

    // 分钟位  
    var min = Math.floor(second / 60 % 60);
    var minStr = min.toString();
    if (minStr.length == 1) minStr = '0' + minStr;

    // 秒位  
    var sec = Math.floor(second % 60);
    var secStr = sec.toString();
    if (secStr.length == 1) secStr = '0' + secStr;

    return dayStr + "天" + hrStr + "小时" + minStr + "分钟" + secStr + "秒";

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
    clearTimeout(reqPassTimeout)
    clearTimeout(reqRefuseTimeout)
    clearInterval(interval)
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