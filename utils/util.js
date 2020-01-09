const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDay = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day].map(formatNumber).join('/')
}

const formatDayTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  return [month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatDayWeek = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const week = date.getDay()
  var weeks = ['日', '一', '二', '三', '四', '五', '六']
  return [month, day].map(formatNumber).join('/') + ' 周' + weeks[week]
}

const formatTimeYMD = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return year + '年' + month + '月' + day + '日'
}

function getLocalTime() {
  var date = new Date();
  var fmt ='yyyy-MM-dd hh:mm:ss'
  var o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "h+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    "S": date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


const formatDateDiff = date => {
  //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
  const dateBegin = new Date(date.replace(/-/g, "/")); //将-转化为/，使用new Date
  const dateEnd = new Date(); //获取当前时间
  const dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
  const dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
  return dayDiff;
}

function formatDateDiffMills(date) {
  //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
  const dateBegin = new Date(date.replace(/-/g, "/"));
  return dateBegin.getTime()
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const trimString = n => {
  n = n.toString()
  return n.replace(/(^\s*)|(\s*$)/g, "");
}

function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function() {
    let _nowTime = +new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments) //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}


module.exports = {
  formatTime: formatTime,
  formatTimeYMD: formatTimeYMD,
  trimString: trimString,
  throttle: throttle,
  getLocalTime: getLocalTime,
  formatDateDiff: formatDateDiff,
  formatDateDiffMills: formatDateDiffMills,
  formatDay: formatDay,
  formatDayWeek: formatDayWeek,
  formatDayTime: formatDayTime
}