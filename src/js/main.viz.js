(function(proxied) {
	window.alert = function() {
		var arg = Array.from(arguments).join("\n");
		return new Promise(function(resolve, reject){
			proxied.apply(this, [arg]);
			resolve(arg);
			//setTimeout(function(){resolve(arg)}, 20);
		});
	};
})(window.alert);
(function($){
	var 	win_state = false,
			winMinMax = false;
	const   closePath = 'M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z',
			restorePath = 'm 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z',
			maximizePath = 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z',
			minimizePath = 'M 0,5 10,5 10,6 0,6 Z',
	// get gui window
			gui = require('nw.gui'),
			win = nw.Window.get(),
	// controls
			closeBtn = $(".app button.close"),
			miniBtn  = $(".app button.minimize"),
			maxiBtn  = $(".app button.maximize"),
			fullBtn  = $(".app button.fullscreen"),
			maxRes   = $("svg path", maxiBtn),
	// set languages
			getMsg = function(msg, def){
				let strm = (typeof msg === "string") ? msg.trim() : "",
					str = (typeof def === "string") ? def.trim() : "",
					strd = str.length ? str : `No set "${msg}" default`, 
					msgt = chrome.i18n.getMessage(strm),
					value = msgt.length ? msgt : strd
				return value;
			},
			tray_close = new nw.MenuItem({
				label: "  " + getMsg("close"),
				icon: "images/tray_close.png",
				click: function() {
					win.close();
				}
			}),
			tray_mini_restore = new nw.MenuItem({
				label: "  " + getMsg("minimize"),
				icon: "images/tray_minimize.png",
				click: function() {
					win_state ? (
						win.show(),
						tray_mini_restore.label = "  " + getMsg("minimize")
					) : (
						win.minimize(),
						tray_mini_restore.label = "  " + getMsg("restore")
					);
					//win_state = !win_state;
				}
			}),
			tray = new nw.Tray({
				title: getMsg("extTitle"),
				tooltip: getMsg("extTitle"),
				icon: 'favicon.png'
			}),
			trayMenu = new nw.Menu();
	tray.on("click", function(e){
		win_state ? win.show() : win.minimize();
	});
	tray.menu = trayMenu;
	trayMenu.append(tray_mini_restore);
	trayMenu.append(tray_close);
	closeBtn.attr({title: getMsg('close')});
	miniBtn.attr({title: getMsg('minimize')});
	maxiBtn.attr({title: getMsg('maximize')});
	fullBtn.attr({title: getMsg('fullscreen')});
	// set svg paths
	$("svg path", closeBtn).attr({d: closePath});
	$("svg path", miniBtn).attr({d: minimizePath});
	maxRes.attr({d: maximizePath});
	win.on('close', function () {
		win.restore();
		if(nw.process.versions["nw-flavor"] == "sdk"){
			win.closeDevTools();
		}
		nw.App.quit();
	});
	win.on('minimize', function() {
		//console.log('Window is minimized');
		win_state = true;
		tray_mini_restore.label = "  " + getMsg("restore");
		tray_mini_restore.icon = "images/tray_" + (winMinMax ? "maximize.png" : "normal.png");
		//winMinMax = false;
		win.setShowInTaskbar(false);
	});
	win.on('maximize', function() {
		maxRes.attr({d: restorePath});
		maxiBtn.attr({title: getMsg('restore')});
		win_state = false;
		winMinMax = true;
		tray_mini_restore.label = "  " + getMsg("minimize");
		tray_mini_restore.icon = "images/tray_minimize.png";
		win.setShowInTaskbar(true);
		$([closeBtn, miniBtn, maxiBtn]).blur();
	});
	win.on('restore', function() {
		maxRes.attr({d: maximizePath});
		maxiBtn.attr({title: getMsg('maximize')});
		win_state = false;
		winMinMax = false;
		tray_mini_restore.label = "  " + getMsg("minimize");
		tray_mini_restore.icon = "images/tray_minimize.png";
		win.setShowInTaskbar(true);
		$([closeBtn, miniBtn, maxiBtn]).blur();
	});
	// set buttons events change window state
	closeBtn.on("click", function(e){
		e.preventDefault();
		$(this).blur();
		win.close();
		return !1;
	});
	miniBtn.on('click', function(e){
		e.preventDefault();
		$(this).blur();
		win.minimize();
		return !1;
	});
	maxiBtn.on('click', function(e){
		e.preventDefault();
		$(this).blur();
		winMinMax ? win.restore() : win.maximize();
		return !1;
	});
	fullBtn.on('click', function(e){
		e.preventDefault();
		$(this).blur();
		//canvas.width = screen.width;
		//canvas.height = screen.height;
		//$(".header")[0].requestFullscreen();
		return !1;
	});
	// Open url in default browser
	$(document).on("click", "a[target='_blank']", function(e){
		e.preventDefault();
		nw.Shell.openExternal(this.href);
		return !1;
	});
	win.setAlwaysOnTop(true);
	setTimeout(() => {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			win.showDevTools();
		}
		win.setAlwaysOnTop(false);
		win.focus();
	}, 200);




	
}(jQuery));