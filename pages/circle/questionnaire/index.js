// pages/circle/questionnaire/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    homeIcon: false,
    backIcon: '../../images/back-pre-black.png',
    questionnaire: {},
    questionnaireItemList: [],
    activityId: '',
    activityData: '',
    questionnaireId: ''
  },

  // questionnaire_item_type 问题类型 1：填空 2：单选 3：多选

  getQuestionnaire: function () {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/questionnaire',
      data: {
        questionnaireId: that.data.questionnaireId
      },
      method: "GET",
      success: function (res) {
        res.data.data.questionnaireItemList.map(item => {
          item.questionnaireItemContent = JSON.parse(item.questionnaireItemContent)
        })
        res.data.data.questionnaire.questionnaireContent = res.data.data.questionnaire.questionnaireContent.replace(/\<img/gi, '<img class="rich-img" ');
        that.setData({
          questionnaire: res.data.data.questionnaire,
          questionnaireItemList: res.data.data.questionnaireItemList
        })
      }
    })
  },

  checkAnswer(e) {
    let parent = this.data.questionnaireItemList[e.currentTarget.dataset.parentindex]
    if (parent.questionnaireItemType === 2) {
      parent.questionnaireItemContent.map((item, index) => {
        item.isCheck = index === e.currentTarget.dataset.index
      })
    } else {
      parent.questionnaireItemContent[e.currentTarget.dataset.index].isCheck = !parent.questionnaireItemContent[e.currentTarget.dataset.index].isCheck
    }
    this.setData({
      questionnaireItemList: this.data.questionnaireItemList
    })
  },

  inputValue(e) {
    this.data.questionnaireItemList[e.currentTarget.id].questionnaireItemContent = e.detail.value
  },

  submit() {
    let jsonData = []
    this.data.questionnaireItemList.map(item => {
      if (item.questionnaireItemType === 1) {
        if (!item.questionnaireItemContent) {
          wx.showToast({
            title: '请完成题目',
            icon: 'none'
          })
          return
        } else {
          jsonData.push({
            id: item.questionnaireItemId,
            content: item.questionnaireItemContent
          })
        }
      } else {
        let checkArray = []
        item.questionnaireItemContent.map(i => {
          if (i.isCheck) {
            checkArray.push(i.content)
          }
        })
        if (checkArray.length === 0) {
          wx.showToast({
            title: '请完成题目',
            icon: 'none'
          })
          return
        } else {
          jsonData.push({
            id: item.questionnaireItemId,
            content: checkArray.join(',')
          })
        }
      }
    })
    this.postAnswer(jsonData)
  },

  postAnswer(answerDetail) {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.request({
      url: app.globalData.requestUrlCms + '/questionnaire/answer',
      data: {
        activityId: that.data.activityId,
        answerDetail: JSON.stringify(answerDetail),
        questionnaireId: this.data.questionnaire.questionnaireId,
        userId: app.globalData.userId
      },
      method: "POST",
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.success) {
          wx.navigateTo({
            url: '/pages/circle/apply/index?data=' + that.data.activityData,
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.activityId = options.activityId
    this.data.activityData = options.data
    this.data.questionnaireId = options.questionnaireId
    this.getQuestionnaire()
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