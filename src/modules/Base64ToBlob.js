function Base64ToBlob(dataURI) {
	let arrUri = dataURI.split(','),
		byteString = atob(arrUri[1]),
		mimeString = arrUri[0].split(':')[1].split(';')[0],
		arrayBuffer = new ArrayBuffer(byteString.length),
		u8array = new Uint8Array(arrayBuffer);
	return new Promise(function(resolve, reject){
		try {
			for (var i = 0; i < byteString.length; i++) {
				u8array[i] = byteString.charCodeAt(i);
			}
			resolve(new Blob([u8array], {type: mimeString}));
		}catch(e){
			reject(false);
		}
	});
}

if (typeof exports == 'undefined') {
	window.Base64ToBlob = Base64ToBlob;
} else {
	module.exports = Base64ToBlob;
}