//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

function ajax(url, callback) {
	var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
	xhr.open('GET', url);
	xhr.onreadystatechange = function() {
		if (xhr.readyState>3) {
			var isfileprotocol = (xhr.responseURL && (xhr.responseURL.substr(0, 4) == 'file'));
			if (xhr.status==200 || isfileprotocol) {
				callback(200, xhr.responseText);
			} else {
				callback(xhr.status);
			}
		}
	}
	xhr.send();
}
