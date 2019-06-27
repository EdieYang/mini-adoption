const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId;
var targetUserId;
var socketTask;
var socketStatus = 'CLOSE'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav:app.globalData.marginNav,
    navTitle:'',
    msgs: [],
    userId: '',
    userInfo: '',
    targetUserInfo: '',
    photoPrefix: photoPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    userId = app.globalData.userId
    targetUserId = options.userId
    this.getTargetUserInfo()
    this.getUserInfo()
    this.setData({
      userId: userId,
      targetUserId: targetUserId
    })

    this.getChannelMessage()
    socketTask = wx.connectSocket({
      url: 'wss://www.linchongpets.com/websocket?uid=' + userId,
      header: {
        'content-type': 'application/json'
      },
      method: 'GET'
    })

    socketTask.onOpen(function(res) {
      console.log(res)
      socketStatus = 'OPEN'
    })

    socketTask.onClose(function(res) {
      console.log(res)
      socketStatus = 'CLOSE'
    })

    socketTask.onMessage(function(res) {
      var msg = JSON.parse(res.data)
      var senderUserId = msg.userId
      if (senderUserId != targetUserId) {
        return
      }
      var mgds = that.data.msgs;
      mgds.push(msg);
      that.setData({
        msgs: mgds
      })
      that.setData({
        scrollTop: 1000 * mgds.length // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
      });
    })

  },

  getTargetUserInfo: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      method: "GET",
      data: {
        userId: targetUserId
      },
      dataType: "json",
      success: function(res) {
        var targetUserInfo = res.data.data
        var navTitle = targetUserInfo.nickName
        that.setData({
          targetUserInfo: targetUserInfo,
          navTitle: navTitle
        })
      }
    })
  },
  getUserInfo: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/users/user',
      method: "GET",
      data: {
        userId: userId
      },
      dataType: "json",
      success: function(res) {
        var userInfo = res.data.data
        that.setData({
          userInfo: userInfo
        })
      }
    })
  },
  bindKeyInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },
  chooseImage: function() {
    var that = this
    wx.chooseImage({
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        //本地显示
        var mgds = that.data.msgs
        for (var i = 0; i < res.tempFilePaths.length; i++) {
          var req = {}
          req.key = util.getLocalTime()
          req.userId = userId
          req.targetUserId = targetUserId
          req.data = res.tempFilePaths[i]
          req.type = 1
          req.width = 0
          req.height = 0
          req.fromOri = 0
          mgds.push(req)
          that.setData({
            msgs: mgds
          })
        }

        that.setData({
          scrollTop: 1000 * mgds.length // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
        });

        var length = res.tempFilePaths.length; //总共个数
        var i = 0; //第几个
        that.uploadDIY(res.tempFilePaths, i, length);
      }
    })
  },
  uploadDIY(filePaths, i, length) {
    var that = this
    wx.uploadFile({
      url: app.globalData.uploadImageUrl,
      filePath: filePaths[i],
      name: 'file',
      formData: {
        'userId': userId,
        'ossZone': 'adopt/chat/' + userId
      },
      success: (resp) => {

        var returnUrl = JSON.parse(resp.data);
        var picUrl = returnUrl.data

        var req = {}
        req.key = util.getLocalTime()
        req.userId = userId
        req.targetUserId = targetUserId
        req.data = picUrl
        req.type = 1
        socketTask.send({
          data: JSON.stringify(req),
          success: function(res) {
            console.log(res)
          }
        })

      },
      fail: (res) => {

      },
      complete: () => {
        i++;
        if (i != length) {
          that.uploadDIY(filePaths, i, length);
        }
      },
    });
  },
  imageLoad: function(e) {
    var $width = e.detail.width
    var $height = e.detail.height
    var ratio = $width / $height
    var viewWidth = 0
    var viewHeight = 0
    if ($width >= $height) {
      viewWidth = 200
      viewHeight = 200 / ratio
    } else {
      viewWidth = 200 * ratio
      viewHeight = 200
    }

    var msg = this.data.msgs
    msg[e.target.dataset.key].width = viewWidth
    msg[e.target.dataset.key].height = viewHeight
    this.setData({
      msgs: msg
    })
  },

  sendmsg: function(e) {
    if (this.checkEmptyVar(this.data.inputValue)) {
      return
    }
    var req = {}
    req.key = util.getLocalTime()
    req.userId = userId
    req.targetUserId = targetUserId
    req.data = this.data.inputValue
    req.type = 0
    req.formId=e.detail.formId
    var mgds = this.data.msgs
    mgds.push(req)
    this.setData({
      msgs: mgds,
      inputValue: ''
    })
    socketTask.send({
      data: JSON.stringify(req),
      success: function(res) {
        console.log(res)
      }
    })

    this.setData({
      scrollTop: 1000 * mgds.length // 这里我们的单对话区域最高1000，取了最大值，应该有方法取到精确的
    });

  },

  checkEmptyVar: function(param) {
    if (!param || typeof(param) == 'undefined' || param == "") {
      return true;
    } else {
      return false;
    }
  },
  previewImg: function(e) {
    var imageSrc = e.currentTarget.dataset.img
    wx.previewImage({
      current: imageSrc, // 当前显示图片的http链接
      urls: [imageSrc] // 需要预览的图片http链接列表
    })
  },
  getChannelMessage: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/chatListDetail',
      data: {
        userId: userId,
        targetUserId: targetUserId
      },
      method: "GET",
      success: function(res) {
        var messageList = res.data.data
        var mgds = that.data.msgs
        for (var i = 0; i < messageList.length; i++) {
          var req = {}
          req.key = messageList[i].key
          req.userId = messageList[i].userId
          req.targetUserId = messageList[i].targetUserId
          req.data = messageList[i].data
          req.type = messageList[i].type
          if (req.type == 1) {
            req.width = 0
            req.height = 0
          }
          mgds.push(req)
        }

        that.setData({
          msgs: mgds,
          scrollTop: 1000 * mgds.length
        })

      }
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
    //断开websocket
    wx.onSocketOpen(function () {
      wx.closeSocket()
    })

    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
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