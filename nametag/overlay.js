function updateTags(username) {
  $('.objtext').text(username).attr('data-content', username);
}

function customColour(hexValue) {
  if (!hexValue) {
    return
  }
  var selectDom = $('.textFormat');
  var bigint = parseInt(hexValue, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  var rbg = `rgb(${r}, ${g}, ${b})`;
  selectDom.css('color', rbg);
}


function onDocumentReady() {
  const params = new URLSearchParams(document.location.search.substring(1));
  const username = params.get('user');
  const colour = params.get('color') || params.get('colour');

  customColour(colour);

  updateTags(username);
}

$(document).ready(function () { onDocumentReady(); });
