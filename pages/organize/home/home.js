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
    background: 'none',
    tabFix: false,
    filtered: false,
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
    var orgId = options.orgId
    this.getOrgDetail('1')
    this.getPetAdoptList()
  },

  getOrgDetail: function(orgId) {
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