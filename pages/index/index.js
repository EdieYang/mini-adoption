const util = require('../../utils/util.js')

const app = getApp()
var userId;
var pageNum = 1
var pageSize = 10
var petType = 2

var age = 1;
var sex = 1
var healthStatus = 1
var petInfoListArr = []
let col1H = 0
let col2H = 0
let chosenId = 3
let bottomLast = false
var changingStatus = false
var loadingCount = 10
Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    tabFix: false,
    filtered:false,
    collectMini: true,
    chosenId: 3,
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
    images: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '抓会儿蝴蝶~',
    })
    var that = this
    petType = 2
    pageNum = 1
    bottomLast = false
    this.getBannerList()
    app.IfAccess().then(function(res) {
      if (res) {
        userId = app.globalData.userId;
        if (userId && typeof(userId) != 'undefined' && userId != '') {
          that.setData({
            userId: userId
          })
          wx.hideLoading()
          that.getPetAdoptList()
          that.getUnreadMessage()
          that.getOrgList()
        }
      }
    })
  },
  closeCollectTop: function() {
    wx.setStorageSync('collectMini', true)
    this.setData({
      collectMini: false
    })
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
    loadingCount = loadingCount - 1;

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
    if (loadingCount == 0) {
      data.petCols = [];
    }
    if (changingStatus) {
      this.setData({
        col1: [],
        col2: []
      })
      return
    }
    this.setData(data);
  },
  getPetAdoptList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/list',
      data: {
        petType: petType,
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
        var bottomLast = false
        if (res.data.data.list.length < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        petInfoListArr = petInfoListArr.concat(petInfoList)
        changingStatus = false
        that.setData({
          petInfoList: petInfoListArr,
          showLoading: false,
          petCols: petInfoList
        })
        wx.stopPullDownRefresh()
      }
    })
  },
  getOrgList:function(){
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/orgs/list',
      method: "GET",
      success: function (res) {
        that.setData({
          orgList: res.data.data
        })
      }
    })
  },
  getUnreadMessage: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/messages/unreadlist',
      data: {
        userId: userId
      },
      method: "GET",
      success: function(res) {
        var msgList = res.data.data
        if (msgList.length > 0) {
          wx.showTabBarRedDot({
            index: 2
          })
        }
      }
    })
  },
  getBannerList: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/banner/list',
      data: {

      },
      method: "GET",
      success: function(res) {
        var bannerlist = res.data.data
        that.setData({
          imgUrls: bannerlist
        })
      }
    })
  },
  getFollowAdoption: function() {
    var that = this
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/pets/' + userId + '/attention',
      data: {
        pageNum: pageNum,
        pageSize: pageSize
      },
      method: "GET",
      success: function(res) {
        var petInfoList = res.data.data.list
        var bottomLast = false
        if (petInfoList.length < pageSize) {
          bottomLast = true
        }
        for (var i = 0; i < petInfoList.length; i++) {
          petInfoList[i].petCharacteristic = JSON.parse(petInfoList[i].petCharacteristic)
        }
        changingStatus = false
        petInfoListArr = petInfoListArr.concat(petInfoList)
        that.setData({
          petInfoList: petInfoListArr,
          petCols: petInfoList,
          showLoading: false,
          bottomLast: bottomLast
        })
      }
    })
  },
  chooseTab: function(e) {
    var that = this
    chosenId = e.currentTarget.dataset.id;
    if (chosenId == 2) {
      petType = 1
    } else if (chosenId == 3) {
      petType = 2
    } else {
      petType = ''
    }
    this.setData({
      showLoading: true,
      chosenId: chosenId,
      petInfoList: [],
      col1: [],
      col2: [],
      petCols: [],
      loadingCount: 10
    })
    changingStatus = true
    petInfoListArr = []
    pageNum = 1
    col1H = 0
    col2H = 0
    if (chosenId == 1) {
      that.getFollowAdoption()
    } else {
      that.getPetAdoptList()
    }
  },
  filter: function() {
    this.setData({
      showFilter: true
    })
  },
  chooseAge: function(e) {
    age = e.currentTarget.dataset.type;
    this.setData({
      ageType: age
    })
  },
  chooseSex: function(e) {
    sex = e.currentTarget.dataset.type;
    this.setData({
      sexType: sex
    })
  },
  chooseHealth: function(e) {
    healthStatus = e.currentTarget.dataset.type;
    this.setData({
      healthStatus: healthStatus
    })
  },
  closeFilter: function() {
    this.setData({
      showFilter: false
    })
  },
  reset: function(e) {
    age = 1
    sex = 1
    healthStatus = 1
    this.setData({
      filtered:false,
      ageType: age,
      sexType: sex,
      healthStatus: healthStatus
    })
    this.genFormId(e.detail.formId)
  },
  submit: function(e) {
    var filtered=false
    var formId = e.detail.formId
    if (age == 1) {
      this.setData({
        ageArr: ''
      })
    } else if (age == 2) {
      filtered=true
      this.setData({
        ageArr: '0-3个月,4-6个月,7-12个月'
      })
    } else if (age == 3) {
      filtered = true
      this.setData({
        ageArr: '1岁,2岁,3岁,4岁,5岁,6岁,7岁,8岁'
      })
    } else {
      filtered = true
      this.setData({
        ageArr: '9岁，10岁，11岁，12岁，13岁，14岁，15岁，16岁，17岁，18岁，19岁，20岁'
      })
    }

    if (sex == 1) {
      this.setData({
        sexArr: ''
      })
    } else if (sex == 2) {
      filtered = true
      this.setData({
        sexArr: '2'
      })
    } else {
      filtered = true
      this.setData({
        sexArr: '3'
      })
    }

    if (healthStatus == 1) {
      this.setData({
        sterilization: '',
        vaccine: '',
        parasite: ''
      })
    } else if (healthStatus == 2) {
      filtered = true
      this.setData({
        sterilization: '1',
        vaccine: '',
        parasite: ''
      })
    } else if (healthStatus == 3) {
      filtered = true
      this.setData({
        sterilization: '',
        vaccine: '1',
        parasite: ''
      })
    } else {
      filtered = true
      this.setData({
        sterilization: '',
        vaccine: '',
        parasite: '1'
      })
    }
    petInfoListArr = []
    this.setData({
      showFilter: false,
      showLoading: true,
      petInfoList: [],
      petCols: [],
      col1: [],
      col2: [],
      filtered: filtered
    })
    col1H = 0
    col2H = 0
    pageNum = 1
    this.getPetAdoptList()
    this.genFormId(formId)
  },

  toAdoptionDetail: function(e) {
    var petId = e.currentTarget.dataset.petid
    wx.navigateTo({
      url: '../adoption/detail/detail?petId=' + petId,
    })
  },

  redirectUrl: function(e) {
    var index = e.currentTarget.dataset.index
    var url = this.data.imgUrls[index].bannerRedirectUrl
    wx.navigateTo({
      url: '../redirect/redirect?url=' + url,
    })
  },
  genFormId: function(formId) {
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/formId',
      data: {
        formId: formId,
        userId: userId
      },
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {}
    })
  },
  orgDetail:function(e){
    wx.navigateTo({
      url: '../organize/home/home?orgId='+e.currentTarget.dataset.orgid,
    })
  },


  onReachBottom: function() {
    var that = this
    //刷新页面
    if (!bottomLast) {
      pageNum++;
      if (chosenId == 1) {
        that.getFollowAdoption()
      } else {
        that.getPetAdoptList()
      }
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
  onPageScroll: function(res) {
    var that = this
    console.log(res);
    if (res.scrollTop > 40) {
      this.setData({
        collectMini: false
      })
    }
    if (res.scrollTop >= 185) {
      this.setData({
        tabFix: true
      })
    } else if (res.scrollTop < 185) {
      this.setData({
        tabFix: false
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this
    this.setData({
      showLoading: true,
      petInfoList: [],
      col1: [],
      col2: [],
      petCols: [],
    })
    petInfoListArr = []
    pageNum = 1
    col1H = 0
    col2H = 0
    if (chosenId == 1) {
      that.getFollowAdoption()
    } else {
      that.getPetAdoptList()
    }
    wx.stopPullDownRefresh()
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})