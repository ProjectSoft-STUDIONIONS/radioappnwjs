var runtimePort;
nw.App.clearCache();
chrome.runtime.onConnect.addListener(function(port) {
	runtimePort = port;
    runtimePort.onMessage.addListener(function(message) {
		
	});
});