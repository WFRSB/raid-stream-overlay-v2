var lastUpdate = 0;
var lastData = [];
var infoURL = 'Info.txt';

function getInfoText(callback) {
  $.get(infoURL, function (data) {
  var nonEmptyLines = data.split('\n').filter(function (n) { return n != undefined && n.length > 0 });
  callback(nonEmptyLines);
  });
}

function getRaidData(platform, username, callback) {
  if (lastUpdate + 20 * 1000 < $.now()) {
  lastUpdate = $.now();
  return $.get('https://api.trials.wf/api/player/' + platform + '/' + username + '/latest/1', function (data) {
    lastData = data;
    callback(data);
  });
  }
  callback(lastData);
}

function timeToSeconds(time) {
  if (time === undefined) {
  return 0;
  }
  var a = time.split(":");
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  return seconds;
}

function updateTags(platform, username) {
  getRaidData(platform, username, function (raidData) {
  if (!raidData.length) {
    $('.progressBar').css('width',  '0');
    $('.leftPanel').css('right',  '-500px');
    $('.rightPanel').css('left',  '-500px');
    return;
  }

  var c = raidData.sort(function (a, b) {
    if (a.objective === b.objective) {
    return 0;
    }
    if (a.objective === 'VICTORY' || a.objective === 'FAILED') {
    return 1;
    }
    if (b.objective === 'VICTORY' || b.objective === 'FAILED') {
    return a.leaderboardGenerated - b.leaderboardGenerated;
    }
    return 0;
  })[0];

  var leaderboardGenerated = Date.parse(c.leaderboardGenerated);

  if (Date.now() - leaderboardGenerated > 300000) {
    $('.progressBar').css('width',  '0');
    $('.leftPanel').css('right',  '-500px');
    $('.rightPanel').css('left',  '-500px');
    return;
  }

  $('.progressBar').css('width',  '40px');
  $('.leftPanel').css('right',  '0');
  $('.rightPanel').css('left',  '0');

  var currentTimeInSeconds = timeToSeconds(c.time);

  if (c.objective !== 'VICTORY' && c.objective !== 'FAILED') {
    var raidStarted = new Date(leaderboardGenerated - currentTimeInSeconds * 1000);
    var delta = (new Date() - raidStarted) / 1000;
    currentTimeInSeconds = delta;
  }

  var players = c.players.join(', ');

  $('.objtext').text(c.objective).attr('data-content', c.objective);
  $('#Time').text(SecondsTohhmmss(Math.round(currentTimeInSeconds))).attr('data-content', SecondsTohhmmss(Math.round(currentTimeInSeconds)));
  $('#Kills').text(c.kills).attr('data-content', c.kills);
  $('#Deaths').text(c.deaths).attr('data-content', c.deaths);
  $('.value').css('height', c.progressValue + '%');
  //c.progressValue < 100 ? $('.ui-progressbar-value').addClass('loading') : $('.ui-progressbar-value').removeClass('loading');
  });
}

function customColour(hexValue) {
  if (!hexValue) {
  return
  }
  var selectDom = $('.time, .deaths, .kills');
  var progressC = $('.value');
  var bigint = parseInt(hexValue, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  var rbg = `rgb(${r}, ${g}, ${b})`;
  selectDom.css('color', rbg);
  progressC.css('background', `linear-gradient(to bottom,  rgba(${r}, ${g}, ${b}, 0.85) 0%, rgba(${r}, ${g}, ${b}, 0.5) 100%`);
}

var SecondsTohhmmss = function (totalSeconds) {
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (hours < 10 ? '0' + hours : hours);
  result += ':' + (minutes < 10 ? '0' + minutes : minutes);
  result += ':' + (seconds < 10 ? '0' + seconds : seconds);
  return result;
}

function onDocumentReady() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const username = params.get('user');
  const colour = params.get('color') || params.get('colour');
  const platform = params.get('platform') || 'pc';

  customColour(colour);

  setInterval(updateTags, 250, platform, username);
}

$(document).ready(function () { onDocumentReady(); });
