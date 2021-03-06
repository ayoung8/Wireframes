var getQueryString = function ( field, url ) {
    var href = url ? url : window.location.href;
    var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
    var string = reg.exec(href);
    return string ? string[1] : null;
};

var username = getQueryString('u');
var password = getQueryString('p');
console.log(username + " " + password);

function start() {
  $.ajax({
    url: "https://elastic-gate.hres.ca/_cat/indices?format=json",
    method: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader ("Authorization", "Basic " + btoa(username + ":" + password));
    },
    success: function(response) {
      console.log(response);
    }
  });
}
