Array.prototype.clone = function () {
	return this.slice(0);
};
Array.prototype.delete = function (i) {
	return this.splice(i, 1);
};
(function(proxied) {
	window.alert = function() {
		var arg = Array.from(arguments).join("\n");
		return new Promise(function(resolve, reject){
			proxied.apply(this, [arg]);
			resolve(arg);
		});
	};
})(window.alert);
(function(proxied) {
	window.console.log = function() {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			return proxied.apply(this, arguments);
		}else {
			return undefined;
		}
	};
})(window.console.log);
(function(proxied) {
	window.console.info = function() {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			return proxied.apply(this, arguments);
		}else {
			return undefined;
		}
	};
})(window.console.info);
(function(proxied) {
	window.console.error = function() {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			return proxied.apply(this, arguments);
		}else {
			return undefined;
		}
	};
})(window.console.error);
(function(proxied) {
	window.console.trace = function() {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			return proxied.apply(this, arguments);
		}else {
			return undefined;
		}
	};
})(window.console.trace);
(function($){
	var 	win_state = false,
			winMinMax = false;
	const   STATE_BACKGROUND = "background",
			STATE_PANEL = "panel",
			closePath = 'M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z',
			restorePath = 'm 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z',
			maximizePath = 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z',
			minimizePath = 'M 0,5 10,5 10,6 0,6 Z',
			fs =  require('fs'),
			os = require('os'),
			Parser = require('icecast-parser'),
			helper = require("./modules/helper.js"),
			AudioPlayer = require("./modules/audioplayer.js"),
			AppRadio = require("./modules/appjs.js"),
			dialog = require("./modules/nwdialog.js"),
			b2b = require("./modules/Base64ToBlob.js"),
			Menu = nw.Menu,
			MenuItem = nw.MenuItem;
	// get gui window
			gui = require('nw.gui'),
			win = nw.Window.get(),
	// controls
			closeBtn = $(".app button.close"),
			miniBtn  = $(".app button.minimize"),
			maxiBtn  = $(".app button.maximize"),
			fullBtn  = $(".app button.fullscreen"),
			maxRes   = $("svg path", maxiBtn),
			toggleBackground = $(".app button.toggle"),
			canvas = $("canvas#canvas")[0],
			play_state = false,
			parser = null,
			presets = Object.assign(
				butterchurnPresets.getPresets(),
				//butterchurnPresetsExtra2.getPresets(),
				//butterchurnPresetsProjectSoft.getPresets()
			),
			presetsKeys = Object.keys(presets),
			presetsIndex = 0,
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
				}
			}),
			tray = new nw.Tray({
				title: getMsg("extTitle"),
				tooltip: getMsg("extTitle"),
				icon: 'favicon.png'
			}),
			trayMenu = new nw.Menu();
	var timerVolumeChange = -1,
		timerMetaInterval = -1,
		timerNotifyInterval = -1,
		dataStation = null,
		idStation = 0,
		isNotify = false
		canvas_state = false,
		audioPlayer = new AudioPlayer(document),
		appRadio = new AppRadio(document),
		range = $('input#volume')[0],
		canvas = $('canvas#canvas')[0],
		$volume = $("input#volume"),
		$volchange = $("#volchange"),
		$applist = $(".appradio__list"),
		$expBtn = $(".btn--export"),
		$impBtn = $(".btn--import"),
		$template_add_dialog = $($("#addstation").html()),
		$template_station = $($("#stationitem").html()),
		audioElement = audioPlayer.audioElement,
		baseFav = "data:image/png;base64," + fs.readFileSync("images/favicon.png").toString('base64'),
		animateFrame = 0,
		audioContext = null,
		visualizer = null,
		notifyApp = null,
		titleApp = appRadio.title,
		stationTitle = "",
		playingTitle = "",
		timerRenderFrame = -1,
		timerStopAnimate = -1;
		clonePresetsKeys = presetsKeys.clone(),
		presetTime = 10000,
		timerPresetPlaying = -1;

	const setLocales = function(){
			$("title").text(getMsg("extTitle"));
			$("#title-settings").text(getMsg("title_settings"));
			$(".modal__add__statio_nname").text(getMsg("modal__add__statio_nname"));
			$(".modal__add__statio_stream").text(getMsg("modal__add__statio_stream"));
			$(".div--file.radioapp-picture").attr({"data-text": getMsg("modal__add__statio_logo")});
			$(".modal__add__statio_nname", $template_add_dialog).text(getMsg("modal__add__statio_nname"));
			$(".modal__add__statio_stream", $template_add_dialog).text(getMsg("modal__add__statio_stream"));
			$(".div--file.radioapp-picture", $template_add_dialog).attr({"data-text": getMsg("modal__add__statio_logo")});
			closeBtn.attr({title: getMsg('close')});
			miniBtn.attr({title: getMsg('minimize')});
			maxiBtn.attr({title: getMsg('maximize')});
			fullBtn.attr({title: getMsg('fullscreen')});
		},
		// Установка заголовка окна приложения
		setAppTitle = function(_title) {
			$("#appTitle").text(_title);
		},
		nextPreset = function(){
			if(clonePresetsKeys.length == 0){
				clonePresetsKeys = presetsKeys.clone();
			}
			presetsIndex = Math.floor(Math.random() * clonePresetsKeys.length);
			if(visualizer)
			{
				visualizer.setRendererSize(canvas.width, canvas.height);
				visualizer.loadPreset(presets[clonePresetsKeys[presetsIndex]], 2.7);
			}
			clonePresetsKeys.delete(presetsIndex);
		}
		loadPreset = function(pl = false) {
			clearTimeout(timerPresetPlaying);
			if(audioPlayer.isPlaying()){
				nextPreset();
				timerPresetPlaying = setTimeout(loadPreset, presetTime);
			}else{
				clearCanvas();
			}
		},
		// Сохранение настроек приложения
		saveAppOptions = function(){
			return new Promise(function(resolve, reject){
				var value = parseFloat($volume.val()),
					min = parseFloat($volume[0].min),
					max = parseFloat($volume[0].max),
					val = Math.min(max, Math.max(min, value)),
					sts = [];
				if(val != value){
					appRadio.options.volume = audioPlayer.volume = val;
				}
				$("li", $applist).each(function(){
					var data = $(this).data();
					sts.push({
						id: data.id,
						name: data.name,
						stream: data.stream
					});
				});
				appRadio.options.stations = sts;
				appRadio.options.station = idStation;
				appRadio.options.notify = isNotify;
				appRadio.options.canvas_state = canvas_state;
				localStorage.setItem('canvas_state', canvas_state);
				appRadio.saveOptions().then(function(a,b){
					resolve();
				}).catch(function(e){
					reject(e);
				});
			});
		},
		// Blob to Buffer
		blobToBuffer = function(blob) {
			return new Promise(function(resolve, reject){
				if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
					reject('first argument must be a Blob');
				}
				var reader = new FileReader();
				function onLoadEnd (e) {
					reader.removeEventListener('loadend', onLoadEnd, false);
					if (e.error) reject(e.error);
					else resolve(Buffer.from(reader.result));
				}
				reader.addEventListener('loadend', onLoadEnd, false);
				reader.readAsArrayBuffer(blob);
			});
		},
		dialogAlert = function(title, content, className){
			$.psmodal.open(
				'confirm',
				content,
				title,
				{
					yes: {
						text: 'Ok',
						class: "",
						callback: function(){
							return !0;
						}
					},
					no: false
				}
			).addClass(className);
		},
		setPoupText = function(value){
			$("#volchange").text(value);
		},
		// Диалог редактирования или добавления станции
		showPopupDialog = function(data, type = 'add'){
			var $dlg = $template_add_dialog.clone(),
				name = "",
				stream = "",
				icon = "images/favicon.png",
				ttl = "",
				icoDir = "file:///" + appRadio.iconsDir + "/",
				$crp = $(".div--crop", $dlg),
				$st_name = $(".station_name", $dlg),
				$st_stream = $(".station_stream", $dlg),
				$st_id = $(".station_id", $dlg),
				$divFile = $(".div--file", $dlg);
			switch(type){
				case 'add':
					data.id = (new Date()).getTime();
					ttl = getMsg("addStation");
					break;
				case 'edit':
					name = data.name;
					stream = data.stream;
					icon = icoDir + data.id + ".png";
					ttl = getMsg("editStation");
					break;
				default:
					return;
			}
			$st_name.val(name);
			$st_stream.val(stream);
			$st_id.val(data.id);
			$crp.croppie({
				viewport: {
					width: 100,
					height: 100,
					type: 'circle'
				},
				boundary: {
					width: 100,
					height: 100
				},
				showZoomer: true,
				enableOrientation: true,
				mouseWheelZoom: true,//'ctrl',
				enableExif: true
			}).croppie('bind', {
				url: icon
			});
			$divFile.on('click', function(ev){
				ev.preventDefault();
				dialog.openFileDialog(['.jpeg', '.jpg', '.png'], function(result){
					if(!result)
						return;
					result = "file:///" + result.split('\\').join('/');
					$crp.croppie('bind', {
						url: result
					});
				});
				return !1;
			});
			$.psmodal.open(
				'modal',
				$('<div></div>', {
					class: 'station-dialog'
				}).append($dlg),
				ttl,
				{
					yes: {
						text: '',
						class: 'radioapp-circle-check',
						callback: function(e){
							var stn_data = {
									id: parseInt($st_id.val()),
									name: $st_name.val(),
									stream: $st_stream.val()
								},
								ico = appRadio.iconsDir + "/" + stn_data.id + ".png";
							$crp.croppie('result', 'blob').then(function(blob) {
								blobToBuffer(blob).then(function(buffer){
									appRadio.saveIcon(stn_data.id, buffer);
									switch(type){
										case 'add':
											addStationOption(stn_data, true);
											break;
										case 'edit':
											let $li = $("li#id" + stn_data.id);
											$li.data(stn_data);
											$('.st__name__txt', $li).text(stn_data.name);
											if(fs.existsSync(ico)){
												let src = URL.createObjectURL(new Blob([fs.readFileSync(ico)], {type: 'image/png'}));
												$('.icon', $li).attr({"src": src});
											}
											// Если данная станция проигрывается - остановить, назначить стрим и запустить.
											break;
									}
									saveAppOptions();
								}).catch(function(err){
									console.log("Station type: " + type + ",\nSaveBlob:\n", err);
								});
							}).catch(function(err){
								console.log("Station type: " + type + ",\nCroppie:\n", err);
							});
							return !0;
						}
					}
				}
			).addClass('dialog--edit-save');
		},
		// Вывод оповещения браузера
		spawnNotification = function(body, icon, title) {
			var options = {
				body: body,
				icon: icon
			};
			clearTimeout(timerNotifyInterval);
			if(notifyApp) {
				notifyApp.close();
				notifyApp = null;
			}
			notifyApp = new Notification(title, options);
			timerNotifyInterval = setTimeout(spawnNotificationClose, 5000);
		},
		spawnNotificationClose = function() {
			clearTimeout(timerNotifyInterval);
			if(notifyApp) {
				notifyApp.close();
				notifyApp = null;
			}
		},
		// Сохранение уровня громкости
		saveVolume = function(){
			// Скрываем тайтл громкости и сохраняем опции приложения.
			//clearPopupText();
			appRadio.saveOptions();
		},
		// Удаление станции
		deleteStation = function(data){
			var $li = $("li#id" + data.id),
				stn_data = $li.data();
			$li.remove();
			if(idStation == data.id){
				appRadio.removeIcon(data.id);
				audioPlayer.isPlaying() && audioPlayer.stop();
				idStation = appRadio.options.station = -1;
			}
			saveAppOptions();
		},
		// Добавление станции
		addStationOption = function (obj, newstation = false){
			let stTemp = $($template_station.clone()),
				icon = appRadio.iconsDir + "/" + obj.id + ".png";
			stTemp.data(obj);
			$('.st__name__txt', stTemp).text(obj.name);
			if(fs.existsSync(icon)){
				let src = URL.createObjectURL(new Blob([fs.readFileSync(icon)], {type: 'image/png'}));
				$('.icon', stTemp).attr({"src": src});
			}
			if(obj.id == idStation) {
				stTemp.addClass('select');
			};
			stTemp.attr({id: "id"+obj.id});
			$applist.append(stTemp);
			if(newstation){
				$applist.scrollTo("li#id"+obj.id);
			}
		},
		// Импорт списка радиостанций и всех настроек приложения
		importStationsHandle = function(){
			$.psmodal.open(
				'confirm',
				getMsg("dialog_is_confirm"),
				getMsg("dialog_is_title"),
				{
					yes: {
						text: getMsg("btn_ok"),
						class: '',
						callback: function(e){
							$.psmodal.close();
							audioPlayer.stop();
							appRadio.import().then(function(result){
								$("body").addClass('preload');
								radioAppInit().then(function(){
									$("body").removeClass('preload');
									dialogAlert(getMsg("dialog_is_title"), getMsg('dialog_is_succes'), 'dialog--import success');
								}).catch(function(error) {
									$("body").removeClass('preload');
									dialogAlert(getMsg("dialog_is_title_error"), getMsg("dialog_is_error"), 'dialog--import error');
								});
							}).catch(function(error){
								$("body").removeClass('preload');
								if(error == 'reloadlist'){
									dialogAlert(getMsg("dialog_is_title_error"), getMsg("dialog_is_error") + '<br>' + getMsg("dialog_is_restored"), 'dialog--import error');
									return;
								}
								if(error){
									dialogAlert(getMsg("dialog_is_title_error"), getMsg("dialog_is_error"), 'dialog--import error');
								} else {
									dialogAlert(getMsg("dialog_is_title"), getMsg("dialog_is_break_user"), 'dialog--import');
								}
							});
							return !0;
						}
					},
					no: {
						text: getMsg("btn_cancel")
					}
				}
			).addClass('dialog--import');
		},
		// Экспорт списка радиостанций и всех настроек приложения
		exportStationsHandle = function(){
			appRadio.export().then(function(result){
				$.psmodal.open(
					'confirm',
					getMsg("dialog_exp_confirm") + '<br>',
					getMsg("dialog_exp_title"),
					{
						yes: {
							text: getMsg("dialog_exp_btn"),
							class: "",
							callback: function(){
								nw.Shell.showItemInFolder(result.replace(/\//g, '\\'));
								return !0;
							}
						},
						no: {
							text: 'ОК',
							class: "",
							callback: function(){
								$.psmodal.close();
							}
						}
					}
				).addClass('dialog--export success');
			}).catch(function(error){
				$("body").removeClass('preload');
				if(error){
					dialogAlert(getMsg("dialog_exp_title_error_01"), getMsg("dialog_exp_confirm_error_01"), 'dialog--export error');
				} else {
					dialogAlert(getMsg("dialog_exp_title_error_02"), getMsg("dialog_exp_confirm_error_02"), 'dialog--export');
				}
			});
		},
		updateSessionMetaData = function(radio, title) {
			let src = baseFav;
			if(audioPlayer.isPlaying())
				src = "data:image/png;base64," + fs.readFileSync(appRadio.getIcon(idStation)).toString('base64');
			navigator.mediaSession.metadata = new MediaMetadata({
				title: getMsg("extTitle"),
				artist: (title.length ? title : radio),
				album: title,
				artwork: [{src: src, type: "image/png", sizes: '128x128'}]
			});
		},
		// Получение метаданных проигрываемого трека
		getMetadata = function(){
			clearTimeout(timerMetaInterval);
			let stationTmp = appRadio.getStation(idStation);
			if(stationTmp) {
				stationTitle = stationTmp.name;
				if(!parser){
					parser = new Parser({
						url: stationTmp.stream,
						keepListen: false,
						autoUpdate: false,
						url: stationTmp.stream, // URL to radio station
						errorInterval: 10 * 60, // retry connection after 10 minutes
						emptyInterval: 5 * 60, // retry get metadata after 5 minutes
						metadataInterval: 5 // update metadata after 5 seconds
					});
					parser.on('metadata', requestMetadata);
					parser.on('stream', requestStream);
					parser.on('error', requestErrorMetadata);
					parser.on('empty', requestEmptyMetadata);
					return;
				}
				parser.setConfig({
					url: stationTmp.stream, // URL to radio station
					keepListen: false,
					autoUpdate: false
				});
				parser.queueRequest();
				//console.log('get meta');
			} else {
				stationTitle = "";
				playingTitle = "";
				$("#volchange").text("");
				setAppTitle(appRadio.title);
				updateSessionMetaData("", "");
			}
		},
		// Обработка результатов получения метаданных
		requestStream = function(stream) {
			//console.log('requestStream');
		},
		requestMetadata = function(metadata) {
			//console.log(metadata);
			if(play_state) {
				if(metadata.StreamTitle) {
					let streamTitle = $.trim(metadata.StreamTitle);
					const regex = /�/;
					if(streamTitle.length) {
						if(regex.exec(streamTitle) === null){
							if(playingTitle != streamTitle){
								// Show notify
								try {
									// 101.ru parse metatdata StreamTitle
									let regex = /}.*$/gms,
										st = streamTitle.replace(regex, '}'),
										jsup = helper.unpack(st);
									if(helper.isObject(jsup)){
										streamTitle = (helper.isString(jsup.result) && jsup.result.length > 3) ? "" : jsup.result;
									}
								}catch(e){}
								playingTitle = streamTitle.length > 7 ? streamTitle : "";
								setAppTitle(appRadio.title + " — " + stationTitle + (playingTitle.length ? " - " + playingTitle : ""));
								if(playingTitle.length) {
									updateSessionMetaData(stationTitle, playingTitle);
									if(visualizer){
										visualizer.launchSongTitleAnim(playingTitle);
									}
									if(isNotify){
										spawnNotificationClose();
										spawnNotification(getMsg("now_playing") + "\n" + playingTitle, appRadio.getIcon(idStation), stationTitle);
									}else{
										//setPoupText(stationTitle + "\n" + playingTitle, 5000);
									}
									setPoupText(playingTitle);
								}
							} else {
								setPoupText(playingTitle.length ? playingTitle : "");
								updateSessionMetaData(stationTitle, playingTitle.length ? playingTitle : "");
								setAppTitle(appRadio.title + " — " + stationTitle + (playingTitle.length ? " - " + playingTitle : ""));
								
							}
						}
					}
				}
				timerMetaInterval = setTimeout(getMetadata, 5000);
			} else {
				updateSessionMetaData("", "");
				stationTitle = "";
				playingTitle = "";
				setPoupText(playingTitle.length ? playingTitle : "");
				setAppTitle(appRadio.title);
			}
		},
		// Ошибка получения метаданных
		requestErrorMetadata = function(error) {
			//stationTitle = "";
			playingTitle = "";
			if(play_state) {
				setAppTitle(appRadio.title + " — " + stationTitle);
				timerMetaInterval = setTimeout(getMetadata, 5000);
				updateSessionMetaData(stationTitle, "");
			} else {
				setAppTitle(appRadio.title);
				stationTitle = "";
				playingTitle = "";
				setPoupText(playingTitle.length ? playingTitle : "");
				updateSessionMetaData("", "");
			}
		},
		// Получение пустых метаданных
		requestEmptyMetadata = function() {
			//stationTitle = "";
			playingTitle = "";
			if(play_state) {
				setAppTitle(appRadio.title + " — " + stationTitle);
				timerMetaInterval = setTimeout(getMetadata, 5000);
				updateSessionMetaData(stationTitle, "");
			} else {
				setAppTitle(appRadio.title);
				stationTitle = "";
				playingTitle = "";
				updateSessionMetaData("", "");
			}
			setPoupText(playingTitle.length ? playingTitle : "");
		},
		// Вывод данных о треке
		showNotify = function(data){
			spawnNotificationClose();
			spawnNotification(getMsg("now_playing") + "\n"+data.title, data.icon, getMsg("extTitle") + " - " + data.name)
		},
		next = function() {
			if(!idStation)
				return;
			let stID = appRadio.getStationIndex(idStation);
			stID = stID == appRadio.options.stations.length - 1 ? 0 : stID + 1;
			let obj = "#id" + appRadio.options.stations[stID].id;
			$('li' + obj + ' .st__btn').click();
			$applist.scrollTo('li' + obj);
		},
		prev = function() {
			if(!idStation)
				return;
			let stID = appRadio.getStationIndex(idStation);
			stID = stID == 0 ? appRadio.options.stations.length - 1 : stID - 1;
			let obj = "#id" + appRadio.options.stations[stID].id;
			$('li' + obj + ' .st__btn').click();
			$applist.scrollTo('li' + obj);
		},
		playStop = function(){
			if(!idStation)
				return;
			if(!audioPlayer.isPlaying()){
				$('li#id' + idStation + ' .st__btn').click();
			}
		},
		stopPlay = function(){
			if(!idStation)
				return;
			if(audioPlayer.isPlaying()){
				$('li#id' + idStation + ' .st__btn').click();
			}
		},
		initVisualizer = function() {
			if (!audioContext) {
				audioContext = new AudioContext();
			}
			if (!visualizer) {
				visualizer = butterchurn.default.createVisualizer(
					audioContext,
					canvas,
					{
						width: canvas.width,
						height: canvas.height
					}
				);
				var sourceAudio = audioContext.createMediaElementSource(
					audioElement
				);

				sourceAudio.connect(audioContext.destination);
				visualizer.connectAudio(sourceAudio);
			}
			visualizer.setRendererSize(canvas.width, canvas.height);
		},
		setCanvasState = function(cst){
			canvas_state = cst;
			if(cst){
				$(".appradio").append($(".header__canvas"));
				$("body").removeClass("panel").addClass("background");
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight - 32;
				win.setMinimumSize(600, 500)
				if(win.width < 600) {
					win.setInnerWidth(600);
				}
			}else{
				$("#header_canvas_wrapper").append($(".header__canvas"));
				$("body").removeClass("background").addClass("panel");
				canvas.width = 400;
				canvas.height = 120;
				win.setMinimumSize(400, 500)
			}
			saveAppOptions();
			resizedWindow();
		},
		toggleCanvasState = function(){
			canvas_state = !canvas_state;
			setCanvasState(canvas_state);
		},
		resizedWindow = function(){
			if(document.fullscreenElement){
				canvas.width = screen.width;
				canvas.height = screen.height;
				if(visualizer)
				{
					visualizer.setRendererSize(canvas.width, canvas.height);
				}
				return;
			}
			if(canvas_state){
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight - 32;
			}else {
				canvas.width = 400
				canvas.height = 120;
			}
			if(visualizer)
			{
				visualizer.setRendererSize(canvas.width, canvas.height);
			}
		},
		toggleFullscreenChange = function(){
			if (!document.fullscreenElement) {
				$("#header_canvas_wrapper").append($(".header__canvas"));
				$(".header")[0].requestFullscreen();
				canvas.width = screen.width;
				canvas.height = screen.height;
			}else{
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
				setCanvasState(canvas_state);
			}
			if(visualizer)
			{
				visualizer.setRendererSize(canvas.width, canvas.height);
				setTimeout(function(){
					clearCanvas();
				}, 10);
			}
		},
		clearCanvas = function(){
			if(visualizer)
			{
				var gl = visualizer.ctx3d();
				gl.clearColor(0, 0, 0, 0.01);
				gl.clear(gl.COLOR_BUFFER_BIT);
			}
		},
		renderFrames = function(){
			if (play_state) {
				if(!win_state){
					if (visualizer)
						visualizer.render();
					timerRenderFrame = window.requestAnimationFrame(renderFrames);
				}
			}else{
				window.cancelAnimationFrame(timerRenderFrame);
				clearCanvas();
			}
		},
		// Читаем опции
		radioAppInit = function(){
			setAppTitle(getMsg("extTitle"));
			return new Promise(function(resolve, reject){
				$("body").addClass('preload');
				$applist.empty();
				setDefaultPosition();
				appRadio.readOptions().then(function(options){
					window.appRadioApp = appRadio;
					range.value = audioPlayer.volume = Math.min(1, Math.max(0, options.volume));
					idStation = appRadio.options.station || [];
					isNotify = appRadio.options.notify || false;
					canvas_state = appRadio.options.canvas_state || false;
					setAppTitle(appRadio.title);
					//$notify_checbox.prop('checked', isNotify);
					appRadio.options.stations.forEach((obj) => {
						addStationOption(obj);
					});
					$applist.scrollTo("li#id"+idStation);
					navigator.mediaSession.setActionHandler('play', playStop);
					navigator.mediaSession.setActionHandler('pause', stopPlay);
					navigator.mediaSession.setActionHandler('previoustrack', prev);
					navigator.mediaSession.setActionHandler('nexttrack', next);
					setTimeout(function(){
						$("body").removeClass('preload');
						$(".app button.fullscreen").show();
						$(".footer .radioapp-settings").on("click", function(e){
							e.preventDefault();
							$(".appradio-panel").addClass("open");
							return !1;
						});
						$("#close-settings").on("click", function(e){
							e.preventDefault();
							$(".appradio-panel").removeClass("open");
							return !1;
						});
						updateSessionMetaData("", "");
						$("body").removeClass("background panel").addClass("panel");
						toggleBackground.on("click", (e)=>{
							e.preventDefault();
							toggleCanvasState();
							$(this).blur();
							return !1;
						});
						setCanvasState(canvas_state);
						nw.Screen.Init();
						let screen = nw.Screen.screens[0],
							x = parseInt(screen.bounds.x + (screen.bounds.width - win.width) / 2) || 0,
							y = parseInt(screen.bounds.y + (screen.bounds.height - 500) / 2) || 0;
						win.moveTo(x, y);
						win.resizeTo(win.width, 500);
						$(window).on('keydown', function(e){
							if(e.code == "Escape" || e.code == "F11"){
								e.preventDefault();
								if (document.exitFullscreen) {
									document.exitFullscreen();
									setCanvasState(canvas_state);
								}
								win.focus();
								return !1;
							}
						}).on("resize", resizedWindow);
						$(canvas).on("dblclick", function(e){
							e.preventDefault();
							toggleFullscreenChange();
							return !1;
						});
						audioPlayer.stop();
						resolve();
					}, 2000);
				}).catch(function(error){
					alert("Не установлен пакет!");
					reject(error);
				});
			});
		};

	dialog.context = document;
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	setLocales();
	initVisualizer();
	nextPreset();

	tray.on("click", function(e){
		win_state ? win.show() : win.minimize();
	});
	tray.menu = trayMenu;
	trayMenu.append(tray_mini_restore);
	trayMenu.append(tray_close);
	
	$applist.sortable({
		axis: 'y',
		stop: function(e, u){
			var sts = [];
			$("li", $applist).each(function(){
				var data = $(this).data();
				 sts.push({
					id: data.id,
					name: data.name,
					stream: data.stream
				});
			});
			appRadio.options.stations = sts;
			appRadio.saveOptions().then(function(out){});
		},
		cursor: 'grabbing',
		handle: '.st__sort'
	}).data({sortableinit: true});

	// set svg paths
	$("svg path", closeBtn).attr({d: closePath});
	$("svg path", miniBtn).attr({d: minimizePath});
	maxRes.attr({d: maximizePath});
	win.on('close', function () {
		win.restore();
		setDefaultPosition();
		saveAppOptions()
			.then(() => {
				if(nw.process.versions["nw-flavor"] == "sdk"){
					win.closeDevTools();
				}
				nw.App.quit()
			})
			.catch(() => {
				if(nw.process.versions["nw-flavor"] == "sdk"){
					win.closeDevTools();
				}
				nw.App.quit();
			});
	});
	win.on('minimize', function() {
		win_state = true;
		tray_mini_restore.label = "  " + getMsg("restore");
		tray_mini_restore.icon = "images/tray_" + (winMinMax ? "maximize.png" : "normal.png");
		//winMinMax = false;
		win.setShowInTaskbar(false);
		renderFrames();
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
		resizedWindow();
		renderFrames();
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
		resizedWindow();
		renderFrames();
	});
	win.on('resize', (width, height) => {
		resizedWindow();
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
		toggleFullscreenChange();
		return !1;
	});

	audioPlayer.addEventListener('statechange', function(e){
		let $id = $("#id" + idStation),
			stationTmp = appRadio.getStation(idStation),
			playing = false;
		e.bufering ? $id.addClass('progress') : $id.removeClass('progress');
		if(e.audioev == "stop"){
			play_state = false;
			$id.removeClass("play progress");
			clearTimeout(timerMetaInterval);
		}else{
			e.bufering ? (!$id.hasClass('progress') && $id.addClass('progress')) : ($id.removeClass('progress'));
			!$id.hasClass('play') && $id.addClass('play');
			play_state = true;
			getMetadata();
		}
		play_state = $id.hasClass('play');
		renderFrames();
	});
	
	// Open url in default browser
	$(document).on("click", "a[target='_blank']", function(e){
		e.preventDefault();
		nw.Shell.openExternal(this.href);
		return !1;
	}).on('click', 'li.station .st__btn', function(e){
		// Клик на кнопке станции.
		// Пуск/Стоп проигрывания
		e.preventDefault();
		setPoupText("");
		initVisualizer();
		clearTimeout(timerPresetPlaying);
		let st = $(e.target).closest('li.station'),
			is_play = st.hasClass('play'),
			is_select = st.hasClass('select'),
			stationTmp = appRadio.getStation(st.data('id'));
		$('li.station').removeClass('play select progress');
		st.addClass('select');
		spawnNotificationClose();
		stationTitle = "";
		play_state = false;
		if(stationTmp){
			idStation = stationTmp.id;
			if(!is_play) {
				// Play
				st.addClass('play');
				audioPlayer.stream = stationTmp.stream;
				audioPlayer.play();
				stationTitle = stationTmp.name;
				timerPresetPlaying = setTimeout(loadPreset, presetTime);
				play_state = true;
				setAppTitle(titleApp + " — " + stationTmp.name);
			} else {
				// Stop
				if(audioPlayer.playing) {
					audioPlayer.stop();
				}
				stationTitle = "";
				playingTitle = "";
				setAppTitle(titleApp);
			};
			if(!is_select) {
				idStation = appRadio.options.station = stationTmp.id;
				clearTimeout(timerVolumeChange);
				timerVolumeChange = setTimeout(saveVolume, 1500);
				audioPlayer.stream = stationTmp.stream;
				audioPlayer.play();
				stationTitle = stationTmp.name;
				timerPresetPlaying = setTimeout(loadPreset, presetTime);
				setAppTitle(titleApp + " — " + stationTmp.name);
				play_state = true;
			}
		}else{
			stationTitle = "";
			playingTitle = "";
			setAppTitle(titleApp);
		}
		updateSessionMetaData(stationTitle, "");
		renderFrames();
		saveAppOptions();
		return !1;
	}).on("input", "input#volume", function(e){
		appRadio.options.volume = audioPlayer.volume = this.value;
		//setVolumeText((this.value * 100));
	}).on('mousewheel', 'input#volume', function(e){
		// Регулирровка звука кол. мыши
		let evt = e.originalEvent,
			delta = evt.deltaY;
			step = delta > 0 ? parseFloat(this.step) : -parseFloat(this.step),
			value = parseFloat(this.value),
			val = Math.min(this.max, Math.max(this.min, step + value));
		if(val != value){
			appRadio.options.volume = this.value = audioPlayer.volume = val;
		}
		//setVolumeText((val * 100));
	});

	win.setAlwaysOnTop(true);
	setTimeout(() => {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			win.showDevTools();
		}
		win.setAlwaysOnTop(false);
		win.focus();
		radioAppInit().then(()=>{
			console.log('App Init');
			$expBtn.on('click', exportStationsHandle);
			$impBtn.on('click', importStationsHandle);
		}).catch((e)=>{console.log(e)});
	}, 200);
}(jQuery));