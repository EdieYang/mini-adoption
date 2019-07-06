const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../../utils/util.js')

const app = getApp()
var userId
var petId
var context
var destHeight

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
          images.push(photoPrefix + mediaList[i].mediaPath)
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
    var that=this
    var petInfo = this.data.petInfo
    context = wx.createCanvasContext("post-adoption", this)
    context.drawImage('../../../images/post-adoption.png', 16, 0, 345, 613)
    wx.getImageInfo({
      src: photoPrefix + petInfo.mediaList[0].mediaPath,
      success(res) {
        var petPhoto = res.path;
        context.drawImage(petPhoto, 45, 60, 112, destHeight)
        context.setFontSize(16)
        context.fillText('Hi，我叫 ' + petInfo.petName, 70, 260)
        context.fillText(that.genInfo2(), 70, 288)
        context.fillText(petInfo.address, 70, 320)
        that.drawText(context, petInfo.story, 45, 350, 280)
        context.fillText('长按识别右侧二维码', 45, 520)
        context.setFillStyle('#fc6653')
        context.fillRect(45, 538, 150, 32)
        context.setFillStyle("#ffffff")
        context.fillText('查看待领养宠物详情', 48, 560)
        wx.request({
          url: app.globalData.requestUrlWechat + '/miniSystemApi/generateWxACode',
          dataType: "json",
          method: "GET",
          data: {
            path: 'pages/adoption/detail/detail',
            scene: petId
          },
          success: function (res) {
            var wxAcodeUrl = photoPrefix + res.data.data;
            wx.getImageInfo({
              src: wxAcodeUrl,
              success(res) {
                wxAcodeUrl = res.path;
                context.drawImage(wxAcodeUrl, 220, 490, 90, 90)
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
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高
    destHeight = oImgH / oImgW * 112
    console.log(destHeight)
    if (destHeight > 150) {
      destHeight = 150
    }
    this.generatePost()
  },
  genInfo1: function() {
    var petInfo = this.data.petInfo
    var phrase = ''
    if (petInfo.petFrom == 1) {
      phrase += '我在家，期待新主人领养'
    } else {
      phrase += '我被好心人暂时收养，好期待一个家~'
    }
    return phrase
  },
  genInfo2: function() {
    var petInfo = this.data.petInfo
    var phrase = '发布时间：' + petInfo.createDate
    return phrase
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
      if (i >= 80) {
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
    var width = wx.getSystemInfoSync().windowWidth
    var contextHidden = wx.createCanvasContext('post-adoption-hidden', this)
    contextHidden.draw(false, wx.canvasToTempFilePath({
      x: 15,
      y: 0,
      width: 345,
      height: 613,
      destWidth: 345 * 750 / width,
      destHeight: 613 * 750 / width,
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
  onShareAppMessage: function() {

  }
})