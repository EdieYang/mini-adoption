const util = require('../../../utils/util.js')

const app = getApp()
var userId;
var pageNum = 1
var pageSize = 10
var petType = 2

var age = 1;
var sex = 1
var healthStatus = 1
var petInfoListArr = []
var galleryListArr = []
var activityListArr = []
let col1H = 0
let col2H = 0
let chosenId = 1
var bottomLast = false
var images = []
var orgId = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    background: '',
    orgIcon: '',
    orgIconShow: true,
    backIcon: '../../images/back-pre.png',
    posFix: '',
    tabFix: false,
    filtered: false,
    collectMini: true,
    chosenId: 1,
    userId: '',
    photoPrefix: app.globalData.staticResourceUrlPrefix,
    showFilter: false,
    ageType: 1,
    sexType: 1,
    healthStatus: 1,
    ageArr: '',
    sexArr: '',
    sterilization: '',
    vaccine: '',
    parasite: '',
    showLoading: true,
    imgUrls: [],
    indicatorDots: true,
    indicatorColor: '#ffffff',
    autoplay: true,
    interval: 5000,
    duration: 1000,
    leftHeight: 0,
    rightHeight: 0,
    length: 10,
    pageNum: 1,
    descHeight: 130, //图片文字描述的高度
    pageStatus: true,
    col1: [],
    col2: [],
    images: [],
    homeIcon: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    orgId = options.orgId
    if (options.orgId == '' || typeof options.orgId == 'undefined' || options.orgId == null) {
      orgId = options.scene
      that.setData({
        homeIcon: true,
        backIcon: ''
      })
    }
    app.IfAccess().then(function(res) {
      if (res) {
        userId = app.globalData.userId;
        if (userId && typeof(userId) != 'undefined' && userId != '') {
          that.setData({
            userId: userId
          })
          wx.hideLoading()
          that.getOrgStatistic()
        }
      }
    })
    this.getOrgDetail()
    this.getOrgPetAdoptList()
  },

  getOrgDetail: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/info',
      data: {
        orgId: orgId
      },
      method: "GET",
      success: function(res) {
        that.setData({
          orgDetail: res.data.data
        })
      }
    })
  },
  getOrgStatistic: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/statistic',
      data: {
        orgId: orgId,
        userId: userId
      },
      method: "GET",
      success: function(res) {
        that.setData({
          orgStatistic: res.data.data
        })
      }
    })
  },
  getOrgPetAdoptList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/pets',
      data: {
        orgId: orgId,
        petType: '',
        ageArr: this.data.ageArr,
        sexArr: this.data.sexArr,
        sterilization: this.data.sterilization,
        vaccine: this.data.vaccine,
        parasite: this.data.parasite,
        adoptStatus: '3',
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var petInfoList = res.data.data.list
        bottomLast = false
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        petInfoListArr = petInfoListArr.concat(petInfoList)
        that.setData({
          petInfoList: petInfoListArr,
          showLoading: false,
          petCols: petInfoList
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  getOrgGalleryList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/gallery',
      data: {
        orgId: orgId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var galleryList = res.data.data.list
        bottomLast = false
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        galleryListArr = galleryListArr.concat(galleryList)
        that.setData({
          galleryList: galleryListArr,
          showLoading: false,
          galleryCols: galleryList
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  getOrgActivityList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/activity',
      data: {
        orgId: orgId,
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var activityList = res.data.data.list
        bottomLast = false
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        activityListArr = activityListArr.concat(activityList)
        that.setData({
          activityList: activityListArr,
          showLoading: false
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  chooseTab: function(e) {
    var that = this
    chosenId = e.currentTarget.dataset.id;
    wx.pageScrollTo({
      scrollTop: 130 + this.data.marginNav,
      duration: 100
    })
    this.setData({
      showLoading: true,
      chosenId: chosenId,
      petInfoList: [],
      col1: [],
      col2: [],
      petCols: [],
      galleryCols: [],
      activityList:[]
    })
    petInfoListArr = []
    galleryListArr = []
    activityListArr = []
    pageNum = 1
    col1H = 0
    col2H = 0
    if (chosenId == 1) {
      that.getOrgPetAdoptList()
    } else if (chosenId == 2) {
      that.getOrgGalleryList()
    } else {
      that.getOrgActivityList()
    }
  },
  onImageLoad: function(e) {
    let petId = e.currentTarget.id;
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高度
    let imgWidth = 155.5; //图片设置的宽度
    let scale = imgWidth / oImgW; //比例计算
    let imgHeight = oImgH * scale; //自适应高度
    let petObj = null;

    let petList = this.data.petInfoList;
    for (let i = 0; i < petList.length; i++) {
      let pet = petList[i];
      if (pet.petId === petId) {
        petObj = pet;
        break;
      }
    }

    let col1 = this.data.col1;
    let col2 = this.data.col2;
    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(petObj);
    } else {
      col2H += imgHeight;
      col2.push(petObj);
    }
    let data = {
      col1: col1,
      col2: col2
    };
    this.setData(data);
  },

  onGalleryImageLoad: function(e) {
    let id = e.currentTarget.id;
    let oImgW = e.detail.width; //图片原始宽度
    let oImgH = e.detail.height; //图片原始高度
    let imgWidth = 155.5; //图片设置的宽度
    let scale = imgWidth / oImgW; //比例计算
    let imgHeight = oImgH * scale; //自适应高度
    let galleryObj = null;

    let galleryList = this.data.galleryList
    for (let i = 0; i < galleryList.length; i++) {
      let gallery = galleryList[i]
      if (gallery.id === id) {
        galleryObj = gallery
        break;
      }
    }

    let col1 = this.data.col1;
    let col2 = this.data.col2;
    if (col1H <= col2H) {
      col1H += imgHeight;
      col1.push(galleryObj);
    } else {
      col2H += imgHeight;
      col2.push(galleryObj);
    }
    let data = {
      col1: col1,
      col2: col2
    };
    this.setData(data);
  },
  viewGallery: function(e) {
    var src = e.currentTarget.dataset.image
    for (var i = 0; i < galleryListArr.length; i++) {
      images.push(galleryListArr[i].image)
    }
    wx.previewImage({
      current: src, // 当前显示图片的http链接
      urls: images // 需要预览的图片http链接列表
    })
  },
  cancelFollow: function() {
    var that = this
    wx.showModal({
      title: '',
      content: '确定不再关注？',
      success(res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.requestUrlCms + '/adopt/orgs/follow',
            data: {
              userId: userId,
              orgId: orgId,
            },
            method: "DELETE",
            header: {
              'content-type': 'application/x-www-form-urlencoded',
            },
            success: function(res) {
              that.getOrgStatistic()
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  follow: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/follow',
      data: {
        userId: userId,
        orgId: orgId,
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        that.getOrgStatistic()
      }
    })
  },
  orgPostCard: function() {
    wx.showLoading({
      title: '生成名片中',
    })
    wx.navigateTo({
      url: '../card/card?orgId=' + orgId,
    })
  },
  toActivityDetail: function(e) {
    var url = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../redirect/redirect?url=' + encodeURIComponent(url),
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

  toAdoptionDetail: function(e) {
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../../adoption/detail/detail?petId=' + petId,
    })
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
  onPageScroll: function(res) {
    var that = this
    console.log(res.scrollTop)
    console.log(130 + that.data.marginNav)
    if (res.scrollTop >= 130) {
      var backIcon = '../../images/back-pre-black.png'
      if (that.data.homeIcon) {
        backIcon = ''
      }
      this.setData({
        navTitle: that.data.orgDetail.orgName,
        background: 'rgba(255, 255, 255, 255)',
        orgIcon: that.data.orgDetail.logo,
        orgIconShow: false,
        backIcon: backIcon,
        posFix: 'position: fixed;top:' + that.data.marginNav + 'px;left:0;'
      })
    }

    if (res.scrollTop < 130) {
      var backIcon = '../../images/back-pre.png'
      if (that.data.homeIcon) {
        backIcon = ''
      }
      this.setData({
        backIcon: backIcon,
        posFix: '',
        navTitle: '',
        background: '',
        orgIcon: '',
        orgIconShow: true
      })
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      if (chosenId == 1) {
        that.getOrgPetAdoptList()
      } else if (chosenId == 2) {
        that.getOrgGalleryList()
      } else {
        that.getOrgActivityList()
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})