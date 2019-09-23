const util = require('../../../utils/util.js')

const app = getApp()
var userId
var petId
var context
var destHeight
var destWidth


Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    photoPrefix: app.globalData.staticResourceUrlPrefix
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.hideShareMenu()
    petId = options.petId
    // petId = '349ac45d6d624ad79baabc3c2c45adb7'
    userId = app.globalData.userId
    wx.showLoading({
      title: '生成海报中',
    })
    this.getAdoptionDetail()
  },
  getAdoptionDetail: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/' + petId,
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var petInfo = res.data.data.petInfo
        var userInfo = res.data.data.userInfo
        var mediaList = petInfo.mediaList
        var petCharacteristic = petInfo.petCharacteristic
        petInfo.petCharacteristic = JSON.parse(petCharacteristic)
        petInfo.adoptRequirements = JSON.parse(petInfo.adoptRequirements)
        var images = []
        for (var i = 0; i < mediaList.length; i++) {
          images.push(that.data.photoPrefix + mediaList[i].mediaPath)
        }
        that.setData({
          petInfo: petInfo,
          imgUrls: images,
          adoptUserInfo: userInfo
        })
      }
    })
  },
  generatePost: function() {
    var that = this
    var petInfo = this.data.petInfo
    context = wx.createCanvasContext("post-adoption", this)
    context.drawImage('../../../images/post-adoption.png', 15, 0, that.data.screenWidth - 30, 620)
    wx.getImageInfo({
      src: that.data.photoPrefix + petInfo.mediaList[0].mediaPath,
      success(res) {
        var petPhoto = res.path
        context.drawImage(petPhoto, (that.data.screenWidth - destWidth) / 2, 110, destWidth, destHeight)
        context.setFontSize(20)
        var header = 'Hi，我叫 ' + petInfo.petName
        var headerWidth = context.measureText(header).width
        context.fillText(header, (that.data.screenWidth - headerWidth) / 2, 395)
        var story = petInfo.story
        story = story.replace(/\s*/g, "");
        context.setFontSize(15)
        context.setFillStyle("#999999")
        that.drawText(context, story, 45, 420, 280)
        wx.request({
          url: app.globalData.requestUrlWechat + '/miniSystemApi/generateWxACode',
          dataType: "json",
          method: "GET",
          data: {
            path: 'pages/adoption/detail/detail',
            scene: petId
          },
          success: function(res) {
            var wxAcodeUrl = that.data.photoPrefix + res.data.data;
            wx.getImageInfo({
              src: wxAcodeUrl,
              success(res) {
                wxAcodeUrl = res.path;
                context.drawImage(wxAcodeUrl, 225, 490, 90, 90)
                context.draw()
                wx.hideLoading()
              }
            })
          }
        })
      }
    })


  },
  onImageLoad: function(e) {
    var that = this
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高

    if (oImgW > oImgH) {
      if (oImgW > 275) {
        destWidth = 275
        destHeight = oImgH / oImgW * 275
        if (destHeight > 255) {
          destHeight = 255
        }
      } else {
        destWidth = oImgW
        destHeight = oImgH
      }
    } else {
      if (oImgH > 255) {
        destHeight = 255
        destWidth = oImgW / oImgH * 255
      } else {
        destWidth = oImgW
        destHeight = oImgH
      }
    }

    that.generatePost()
  },
  drawText: function(ctx, str, leftWidth, initHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    for (let i = 0; i < str.length; i++) {
      lineWidth += ctx.measureText(str[i]).width;
      if (lineWidth > canvasWidth) {
        ctx.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
        initHeight += 24; //16为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
      }
      if (i >= 50) {
        ctx.fillText('...', leftWidth, initHeight);
        break
      }
      if (i == str.length - 1) { //绘制剩余部分
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
      }

    }

    return initHeight
  },

  download: function() {
    var that = this
    var width = wx.getSystemInfoSync().windowWidth
    var contextHidden = wx.createCanvasContext('post-adoption-hidden', this)
    contextHidden.draw(false, wx.canvasToTempFilePath({
      x: 15,
      y: 0,
      width: that.data.screenWidth - 30,
      height: 620,
      destWidth: that.data.screenWidth * 750 / width,
      destHeight: 620 * (that.data.screenWidth * 750 / width) / 350,
      canvasId: 'post-adoption',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
            });
          },
          fail() {
            wx.hideLoading()
          }
        })
      }
    }))
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