const photoPrefix = 'https://melody.memorychilli.com/';
const util = require('../../utils/util.js')

const app = getApp()
var userId;
var pageNum = 1
var pageSize = 10
var petType = 1

var age = 1;
var sex = 1
var healthStatus = 1
var petInfoListArr = []
let col1H = 0
let col2H = 0
let chosenId = 2
let bottomLast = false
var changingStatus=false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    marginNav: app.globalData.marginNav,
    tabFix: false,
    chosenId: 2,
    userId: '',
    photoPrefix: photoPrefix,
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
    autoplay: false,
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
    loadingCount: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    this.getBannerList()

    app.IfAccess().then(function(res) {
      if (res) {
        userId = app.globalData.userId;
        if (userId && typeof(userId) != 'undefined' && userId != '') {
          that.setData({
            userId: userId
          })
          that.getPetAdoptList()
          that.getUnreadMessage()
        }
      }
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
    let loadingCount = this.data.loadingCount - 1;
    this.setData({
      loadingCount: loadingCount
    })
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
        col1:[],
        col2:[]
      })
      return
    }
    this.setData(data);
  },

  loadImage: function(e) {
    var vm = this;
    var windowWidth = wx.getSystemInfoSync().windowWidth;
    var index = e.currentTarget.dataset.index;
    vm.data.petInfoList[index].height = windowWidth / 2 / e.detail.width * e.detail.height;
    var count = 0;
    for (var i = (pageNum - 1) * vm.data.length; i < vm.data.petInfoList.length; i++) {
      if (vm.data.petInfoList[i].height) {
        count++;
      }
    }

    var descHeight = 109
    // if (vm.data.petInfoList[index].petCharacteristic.length==0){
    //   descHeight=100
    // } else if (vm.data.petInfoList[index].petCharacteristic.length < 3){
    //   descHeight=120
    // }else{
    //   descHeight = 109
    // }

    if (count == vm.data.petInfoList.length) {
      for (var i = (pageNum - 1) * vm.data.length; i < vm.data.petInfoList.length; i++) {
        if (vm.data.leftHeight <= vm.data.rightHeight) {
          vm.data.petInfoList[i].top = vm.data.leftHeight;
          vm.data.petInfoList[i].left = windowWidth * 0.005;
          vm.setData({
            leftHeight: vm.data.leftHeight + vm.data.petInfoList[i].height + descHeight
          });
        } else {
          vm.data.petInfoList[i].top = vm.data.rightHeight;
          vm.data.petInfoList[i].left = windowWidth / 2 - windowWidth * 0.005;
          vm.setData({
            rightHeight: vm.data.rightHeight + vm.data.petInfoList[i].height + descHeight
          });
        }
      }
      vm.setData({
        petInfoList: vm.data.petInfoList
      });
    }
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
        changingStatus=false
        that.setData({
          petInfoList: petInfoListArr,
          showLoading: false,
          bottomLast: bottomLast,
          petCols: petInfoList
        })
        wx.stopPullDownRefresh()
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
    changingStatus=true
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
      ageType: age,
      sexType: sex,
      healthStatus: healthStatus
    })
    this.genFormId(e.detail.formId)
  },
  submit: function(e) {
    var formId=e.detail.formId
    if (age == 1) {
      this.setData({
        ageArr: ''
      })
    } else if (age == 2) {
      this.setData({
        ageArr: '0-3个月,4-6个月,7-12个月'
      })
    } else if (age == 3) {
      this.setData({
        ageArr: '1岁,2岁,3岁,4岁,5岁,6岁,7岁,8岁'
      })
    } else {
      this.setData({
        ageArr: '9岁，10岁，11岁，12岁，13岁，14岁，15岁，16岁，17岁，18岁，19岁，20岁'
      })
    }

    if (sex == 1) {
      this.setData({
        sexArr: ''
      })
    } else if (sex == 2) {
      this.setData({
        sexArr: '2'
      })
    } else {
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
      this.setData({
        sterilization: '1',
        vaccine: '',
        parasite: ''
      })
    } else if (healthStatus == 3) {
      this.setData({
        sterilization: '',
        vaccine: '1',
        parasite: ''
      })
    } else {
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
  genFormId: function (formId){
    wx.request({
      url: app.globalData.requestUrlCms + '/adopt/formId',
      data: {
        formId:formId,
        userId:userId
      },
      method: "POST",
      header:{
        "content-type":"application/x-www-form-urlencoded"
      },
      success: function (res) {
      }
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

  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})