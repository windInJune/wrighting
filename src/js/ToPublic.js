

function isTel(Tel) {
	var re = /^1\d{10}$/
	var retu = Tel.match(re);
	if (retu) {
		return true;
	} else {
		return false;
	}
}

export {
	isTel
}