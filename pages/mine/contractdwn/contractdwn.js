const util = require('../../../utils/util.js')

const app = getApp()
var userId
var agreementId
var applyId
var context;
var screenWidth = 370;
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
    var that = this
    userId = app.globalData.userId
    applyId = options.applyId
    context = wx.createCanvasContext('contract-page')
    wx.getSystemInfo({
      success(res) {
        that.setData({
          screenHeight: res.screenWidth * 6
        })
        that.getPetAdoptAgreementDetial()
      }
    })
  },
  getPetAdoptAgreementDetial: function() {
    wx.showLoading({
      title: '生成协议中',
    })
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/agreement/info',
      method: "GET",
      data: {
        applyId: applyId
      },
      success: function(res) {
        var contractInfo = res.data.data.contractInfo
        var petInfo = res.data.data.petInfo
        petInfo.petCharacteristic = JSON.parse(petInfo.petCharacteristic)
        that.drawContract(contractInfo, petInfo)
      }
    })
  },
  drawContract: function(contractInfo, petInfo) {
    var that = this
    var innerHeight = 0
    context.setFontSize(20)
    context.fillText('领养协议', (screenWidth - context.measureText('领养协议').width) / 2, 40)
    context.setFontSize(16)
    context.fillText('送养人将委托动物交由领养方领养', 15, 80)
    context.setFontSize(18)
    context.fillText('甲方（送养人）义务：', 15, 130)
    context.setFontSize(16)
    innerHeight = this.drawText('1、如实告知乙方被领养动物的健康状况，性格，行为习惯等。', 15, 160, 50, screenWidth)
    innerHeight = this.drawText('2、为乙方领养及日后喂养动物提供必要的咨询和协助。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('3、不以任何领养名义做商业行为甚至商业欺诈。', 15, innerHeight, 50, screenWidth)
    context.setFontSize(18)
    innerHeight = this.drawText('乙方（领养人）义务：', 15, innerHeight, 50, screenWidth)
    context.setFontSize(16)
    innerHeight = this.drawText('1、为领养动物提供适合的食物，提供洁净的饮用水，做到科学喂养。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('2、提供适当的活动空间，进行家庭喂养，并保证领养动物的安全，不得将所领养动物异用和商业用途。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('3、必要时为领养动物提供必要的医疗措施。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('4、接受领养后，协助甲方对喂养情况进行了解和回访。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('5、事先与家人或房东做好沟通，签署领养协议后，不得因为家人反对，婚姻，生育，工作变动，动物不听话，东湖生病等原因随意抛弃或售卖领养动物。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('6、由于特殊原因，无法继续喂养领养动物的情况下，必须将动物交回甲方；或与甲方协商，为动物寻找新的领养人，未经甲方同意不得自行转交他人。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('7、任何情况下，乙方不得虐待领养动物。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('8、带领养动物出门必须做好安全措施，如拴好牵引绳，保障宠物安全。出现意外情况必须及时向甲方反馈，不得隐瞒。', 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('9、定期（成年后每年一次）为领养动物注射疫苗。', 15, innerHeight, 50, screenWidth)

    innerHeight = this.drawText('补充协议', 15, innerHeight, 50, screenWidth)
    if (contractInfo.agreement != '') {
      innerHeight = this.drawText(contractInfo.agreement, 15, innerHeight, 50, screenWidth)

    } else {
      innerHeight = this.drawText('无', 15, innerHeight, 50, screenWidth)
    }

    innerHeight += 40
    context.setFontSize(18)
    innerHeight = this.drawText('宠物信息', 15, innerHeight, 50, screenWidth)
    context.setFontSize(16)
    innerHeight = this.drawText('宠物昵称：' + petInfo.petName, 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('宠物性别：' + this.petSex(petInfo.petSex), 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('宠物年龄：' + petInfo.petAge, 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('免疫情况：' + this.petVaccine(petInfo.petVaccine), 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('驱虫情况：' + this.petParasite(petInfo.petParasite), 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('绝育情况：' + this.petSterilization(petInfo.petSterilization), 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('体型：' + this.petSomatotype(petInfo.petSomatotype), 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('毛发：' + this.petHair(petInfo.petHair), 15, innerHeight, 50, screenWidth)
    innerHeight += 40

    context.setFontSize(18)
    innerHeight = this.drawText('甲方（送养人）信息', 15, innerHeight, 50, screenWidth)
    context.setFontSize(16)
    innerHeight = this.drawText('姓名：' + contractInfo.adopterName + '      手机号：' + contractInfo.adopterPhone, 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('联系地址：' + contractInfo.adopterAddress, 15, innerHeight, 50, screenWidth)
    innerHeight = this.drawText('签名：', 15, innerHeight, 50, screenWidth)
    wx.getImageInfo({
      src: that.data.photoPrefix + contractInfo.adopterSign,
      success(res) {
        context.drawImage(res.path, 50, innerHeight - 20, 100, 100)
        innerHeight += 100
        innerHeight = that.drawText('日期：' + contractInfo.signTime, 15, innerHeight, 50, screenWidth)

        innerHeight += 40
        context.setFontSize(18)
        innerHeight = that.drawText('乙方（领养人）信息', 15, innerHeight, 50, screenWidth)
        context.setFontSize(16)
        innerHeight = that.drawText('姓名：' + contractInfo.applyName + '      手机号：' + contractInfo.applyPhone, 15, innerHeight, 50, screenWidth)
        innerHeight = that.drawText('联系地址：' + contractInfo.applyAddress, 15, innerHeight, 50, screenWidth)
        innerHeight = that.drawText('签名：', 15, innerHeight, 50, screenWidth)
        wx.getImageInfo({
          src: that.data.photoPrefix + contractInfo.adopterSign,
          success(res) {
            context.drawImage(res.path, 50, innerHeight - 20, 100, 100)
            innerHeight += 100
            innerHeight = that.drawText('日期：' + contractInfo.signTime, 15, innerHeight, 50, screenWidth)
            context.draw()
            wx.hideLoading()
          }
        })
      }
    })
  },
  drawText: function(str, leftWidth, initHeight, titleHeight, canvasWidth) {
    var lineWidth = 0;
    var lastSubStrIndex = 0; //每次开始截取的字符串的索引
    for (let i = 0; i < str.length; i++) {
      lineWidth += context.measureText(str[i]).width;
      if (lineWidth > canvasWidth - leftWidth * 2) {
        context.fillText(str.substring(lastSubStrIndex, i), leftWidth, initHeight); //绘制截取部分
        initHeight += 26; //16为字体的高度
        lineWidth = 0;
        lastSubStrIndex = i;
        titleHeight += 30;
      }
      if (i == str.length - 1) { //绘制剩余部分
        context.fillText(str.substring(lastSubStrIndex, i + 1), leftWidth, initHeight);
      }
    }

    return initHeight + 32;

  },
  petSex: function(sex) {
    if (sex == 2) {
      return '男孩'
    } else if (sex == 3) {
      return '女孩'
    } else {
      return '未知'
    }

  },

  petVaccine: function(vaccine) {
    if (vaccine == 1) {
      return '已免疫'
    } else if (vaccine == 2) {
      return '未接种疫苗'
    } else if (vaccine == 3) {
      return '接种疫苗情况不详'
    } else {
      return '接种疫苗中'
    }
  },
  petParasite: function(parasite) {
    if (parasite == 1) {
      return '已驱虫'
    } else if (parasite == 2) {
      return '未驱虫'
    } else {
      return '驱虫情况不详'
    }
  },
  petSterilization: function(petSterilization) {
    if (petSterilization == 1) {
      return '已绝育'
    } else if (petSterilization == 2) {
      return '未绝育'
    } else {
      return '未知'
    }
  },
  petSomatotype: function(petSomatotype) {
    if (petSomatotype == 1) {
      return '迷你'
    } else if (petSomatotype == 2) {
      return '小型'
    } else if (petSomatotype == 3) {
      return '中型'
    } else {
      return '大型'
    }
  },
  petHair: function(petHair) {
    if (petHair == 1) {
      return '无毛'
    } else if (petHair == 2) {
      return '短毛'
    } else if (petHair == 3) {
      return '长毛'
    } else {
      return '卷毛'
    }
  },
  download: function() {
    var that = this
    var contextHidden = wx.createCanvasContext('contract-page-hidden', this)
    contextHidden.draw(false, wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: screenWidth,
      height: that.data.screenHeight,
      destWidth: screenWidth,
      destHeight: that.data.screenHeight,
      canvasId: 'contract-page',
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
    wx.hideShareMenu()
  }
})