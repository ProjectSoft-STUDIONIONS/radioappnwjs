const trunc = (v) => v - v % 1;
const ceil  = (v) => trunc(v % 1 > 0 ? v + 1 : v);
const floor = (v) => trunc(v % 1 < 0 ? v - 1 : v);
const round = (v) => trunc(v < 0 ? v - 0.5 : v + 0.5);
var capYPositionArray = [];
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
/* App Controls */
(function($){
	// svg paths button icons
	const   closePath = 'M 0,0 0,0.7 4.3,5 0,9.3 0,10 0.7,10 5,5.7 9.3,10 10,10 10,9.3 5.7,5 10,0.7 10,0 9.3,0 5,4.3 0.7,0 Z',
			restorePath = 'm 2,1e-5 0,2 -2,0 0,8 8,0 0,-2 2,0 0,-8 z m 1,1 6,0 0,6 -1,0 0,-5 -5,0 z m -2,2 6,0 0,6 -6,0 z',
			maximizePath = 'M 0,0 0,10 10,10 10,0 Z M 1,1 9,1 9,9 1,9 Z',
			minimizePath = 'M 0,5 10,5 10,6 0,6 Z',
	// get gui window
			gui = require('nw.gui'),
			win = nw.Window.get(),
	// get buttons app controls
			closeBtn = $(".app button.close"),
			miniBtn  = $(".app button.minimize"),
			maxiBtn  = $(".app button.maximize"),
			fullBtn  = $(".app button.fullscreen"),
			maxRes   = $("svg path", maxiBtn),
			canvas   = $("#canvas")[0],
	// set language
			getMessage = function(msg) {
				return chrome.i18n.getMessage(msg);
			};

	
	// state. minimized/maximized
	var state = false,
		win_state = false,
		winMinMax = false,
		tray_close = new nw.MenuItem({
			label: "  " + getMessage("close"),
			icon: "images/tray_close.png",
			click: function() {
				win.close();
			}
		}),
		tray_mini_restore = new nw.MenuItem({
			label: "  " + getMessage("minimize"),
			icon: "images/tray_minimize.png",
			click: function() {
				win_state ? (
					win.show(),
					tray_mini_restore.label = "  " + getMessage("minimize")
				) : (
					win.minimize(),
					tray_mini_restore.label = "  " + getMessage("restore")
				);
				//win_state = !win_state;
			}
		}),
		tray = new nw.Tray({
			title: getMessage("extTitle"),
			tooltip: getMessage("extTitle"),
			icon: 'favicon.png',
			/*click: function(e){
				console.log(e)
			}*/
		}),
		trayMenu = new nw.Menu();
	tray.on("click", function(e){
		win.show();
	});
	tray.menu = trayMenu;
	trayMenu.append(tray_mini_restore);
	trayMenu.append(tray_close);
	// set lang messages
	closeBtn.attr({title: getMessage('close')});
	miniBtn.attr({title: getMessage('minimize')});
	maxiBtn.attr({title: getMessage('maximize')});
	fullBtn.attr({title: getMessage('fullscreen')});
	// set svg paths
	$("svg path", closeBtn).attr({d: closePath});
	$("svg path", miniBtn).attr({d: minimizePath});
	maxRes.attr({d: maximizePath});
	// set events window state
	win.on('close', function () {
		if(nw.process.versions["nw-flavor"] == "sdk"){
			win.closeDevTools();
		}
		nw.App.quit();
	});
	win.on('minimize', function() {
		//console.log('Window is minimized');
		win_state = !0;
		tray_mini_restore.label = "  " + getMessage("restore");
		tray_mini_restore.icon = "images/tray_" + (winMinMax ? "maximize.png" : "normal.png");
		win.setShowInTaskbar(false);
	});
	win.on('maximize', function() {
		maxRes.attr({d: restorePath});
		maxiBtn.attr({title: getMessage('restore')});
		state = !0;
		winMinMax = !0;
		tray_mini_restore.label = "  " + getMessage("minimize");
		tray_mini_restore.icon = "images/tray_minimize.png";
		win.setShowInTaskbar(true);
		$([closeBtn, miniBtn, maxiBtn]).blur();
	});
	win.on('restore', function() {
		maxRes.attr({d: maximizePath});
		maxiBtn.attr({title: getMessage('maximize')});
		state = !1;
		winMinMax = !1;
		tray_mini_restore.label = "  " + getMessage("minimize");
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
		canvas.width = screen.width;
		canvas.height = screen.height;
		$(".header")[0].requestFullscreen();
		return !1;
	});
	// set event keyboard Esc or F11 exit fullscreen
	$(window).on('keydown', function(e){
		if(e.code == "Escape" || e.code == "F11"){
			e.preventDefault();
			if (document.exitFullscreen) {
				document.exitFullscreen();
				canvas.width = 400;
				canvas.height = 120;
				capYPositionArray.length = 0;
			}
			win.focus();
			return !1;
		}
	});
	// window restore, set focus app
	win.restore();
	win.focus();
}(jQuery));

/**
*** Application
**/
(function($){
	// develop run DevTool
	if(nw.App.argv.findIndex(x => x=='--dev') > -1 && nw.process.versions["nw-flavor"] == "sdk"){
		nw.Window.get().showDevTools();
	}
	// Open url in default browser
	$(document).on("click", "a[target='_blank']", function(e){
		e.preventDefault();
		nw.Shell.openExternal(this.href);
		return !1;
	});
	
	const gui = require('nw.gui')
		win = nw.Window.get(),
		fs =  require('fs'),
		os = require('os'),
		Parser = require('icecast-parser'),
		helper = require("./modules/helper.js"),
		AudioPlayer = require("./modules/audioplayer.js"),
		AppRadio = require("./modules/appjs.js"),
		dialog = require("./modules/nwdialog.js"),
		b2b = require("./modules/Base64ToBlob.js"),
		stations = [],
		Menu = nw.Menu,
		MenuItem = nw.MenuItem;
	dialog.context = document;
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	var tVolAudio,
		dataStation = null,
		idStation = 0,
		isNotify = false,
		typeAnalizer = "bar",
		typesAnalizer = ["bar", "spec", 'spec_full', "milkdrop"],
		audioPlayer = new AudioPlayer(document),
		appRadio = new AppRadio(document),
		range = $('input#volume')[0],
		canvas = $('canvas#canvas')[0],
		$volume = $("input#volume"),
		$volchange = $("#volchange"),
		$applist = $(".appradio__list"),

		$notify_checbox = $("input[name=notify]"),

		$template_add_dialog = $($("#addstation").html()),
		$template_station = $($("#stationitem").html()),
		ctx = canvas.getContext('2d'),
		bufferLength,
		dataArray,
		strokeColor = false,
		parser,
		metaInterval,
		notifyInterval,
		notifyApp,
		titleApp = appRadio.title,
		stationTitle = "",
		playingTitle = "",
		audioElement = audioPlayer.audioElement,
		audioContext = new AudioContext(),
		analyser = audioContext.createAnalyser(),
		audioSrc = audioContext.createMediaElementSource(audioElement),
		getMessage = function(msg) {
			return chrome.i18n.getMessage(msg);
		},
		strokeStyleColor = 'lime',
		baseFav = "data:image/png;base64," + fs.readFileSync("images/favicon.png").toString('base64'),
		animateFrame = 0;
	window.ctx = ctx;
	var disconnectAudio = function(){
			cancelAnimationFrame(animateFrame);
			analyser.disconnect();
			audioSrc.disconnect();
			
			//types 
			audioSrc.connect(analyser);
			analyser.connect(audioContext.destination);
			renderFrames();
		},
		setLocales = function(){
			$("title").text(getMessage("extTitle"));
			$("#title-settings").text(getMessage("title_settings"));
			$(".modal__add__statio_nname").text(getMessage("modal__add__statio_nname"));
			$(".modal__add__statio_stream").text(getMessage("modal__add__statio_stream"));
			$(".div--file.radioapp-picture").attr({"data-text": getMessage("modal__add__statio_logo")});
			$(".modal__add__statio_nname", $template_add_dialog).text(getMessage("modal__add__statio_nname"));
			$(".modal__add__statio_stream", $template_add_dialog).text(getMessage("modal__add__statio_stream"));
			$(".div--file.radioapp-picture", $template_add_dialog).attr({"data-text": getMessage("modal__add__statio_logo")});
		},
		// Сохранение настроек приложения
		saveAppOptions = function(){
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
			appRadio.options.analizer = typeAnalizer;
			appRadio.options.color = strokeStyleColor;
			appRadio.options.strokeColor = strokeColor;
			appRadio.saveOptions();
		},
		clearPopupText = function(){
			$volchange.hasClass('view') && $volchange.removeClass('view');
			tVolAudio = setTimeout(function(){
				$volchange.empty();
			}, 300);
		},
		// Сохранение уровня громкости
		saveVolume = function(){
			// Скрываем тайтл громкости и сохраняем опции приложения.
			clearPopupText();
			appRadio.saveOptions();
		},
		//
		setPoupText = function(value, time = 1500){
			clearTimeout(tVolAudio);
			value = value.replace(/([^>])\n/g, '$1<br>');
			$volchange.html(value);
			!$volchange.hasClass('view') && $volchange.addClass('view');
			tVolAudio = setTimeout(clearPopupText, time);
		}
		// Вывод процентов уровня громкости
		setVolumeText = function(value){
			// Установка значения громкости в тайтл
			clearTimeout(tVolAudio);
			let text = "";
			val = parseInt(value).toString();
			switch(val.length){
				case 1:
					text = "\xA0\xA0" + val + "%";
					break;
				case 2:
					text = "\xA0" + val + "%";
					break;
				default:
					text = val + "%";
					break;
			}
			$volchange.text(text);
			// Показываем тайтл громкости
			!$volchange.hasClass('view') && $volchange.addClass('view');
			tVolAudio = setTimeout(saveVolume, 1500);
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
		// Установка заголовка окна приложения
		setAppTitle = function(_title) {
			$("#appTitle").text(_title).attr({title: _title});
		},
		// Собственный диалог сообщений
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
					ttl = getMessage("addStation");
					break;
				case 'edit':
					name = data.name;
					stream = data.stream;
					icon = icoDir + data.id + ".png";
					ttl = getMessage("editStation");
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
			clearTimeout(notifyInterval);
			if(notifyApp) {
				notifyApp.close();
				notifyApp = null;
			}
			notifyApp = new Notification(title, options);
			notifyInterval = setTimeout(spawnNotificationClose, 5000);
		},
		spawnNotificationClose = function() {
			clearTimeout(notifyInterval);
			if(notifyApp) {
				notifyApp.close();
				notifyApp = null;
			}
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
				getMessage("dialog_is_confirm"),
				getMessage("dialog_is_title"),
				{
					yes: {
						text: getMessage("btn_ok"),
						class: '',
						callback: function(e){
							$.psmodal.close();
							audioPlayer.stop();
							appRadio.import().then(function(result){
								$("body").addClass('preload');
								radioAppInit().then(function(){
									$("body").removeClass('preload');
									dialogAlert(getMessage("dialog_is_title"), getMessage('dialog_is_succes'), 'dialog--import success');
								}).catch(function(error) {
									$("body").removeClass('preload');
									dialogAlert(getMessage("dialog_is_title_error"), getMessage("dialog_is_error"), 'dialog--import error');
								});
							}).catch(function(error){
								$("body").removeClass('preload');
								if(error == 'reloadlist'){
									dialogAlert(getMessage("dialog_is_title_error"), getMessage("dialog_is_error") + '<br>' + getMessage("dialog_is_restored"), 'dialog--import error');
									return;
								}
								if(error){
									dialogAlert(getMessage("dialog_is_title_error"), getMessage("dialog_is_error"), 'dialog--import error');
								} else {
									dialogAlert(getMessage("dialog_is_title"), getMessage("dialog_is_break_user"), 'dialog--import');
								}
							});
							return !0;
						}
					},
					no: {
						text: getMessage("btn_cancel")
					}
				}
			).addClass('dialog--import');
		},
		// Экспорт списка радиостанций и всех настроек приложения
		exportStationsHandle = function(){
			appRadio.export().then(function(result){
				$.psmodal.open(
					'confirm',
					getMessage("dialog_exp_confirm") + '<br>',
					getMessage("dialog_exp_title"),
					{
						yes: {
							text: getMessage("dialog_exp_btn"),
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
					dialogAlert(getMessage("dialog_exp_title_error_01"), getMessage("dialog_exp_confirm_error_01"), 'dialog--export error');
				} else {
					dialogAlert(getMessage("dialog_exp_title_error_02"), getMessage("dialog_exp_confirm_error_02"), 'dialog--export');
				}
			});
		},
		updateSessionMetaData = function(radio, title) {
			let src = baseFav;
			if(audioPlayer.isPlaying())
				src = "data:image/png;base64," + fs.readFileSync(appRadio.getIcon(idStation)).toString('base64');
			navigator.mediaSession.metadata = new MediaMetadata({
				title: getMessage("extTitle"),
				artist: (title.length ? title : radio),
				album: title,
				artwork: [{src: src, type: "image/png", sizes: '128x128'}]
			});
		},
		// Получение метаданных проигрываемого трека
		getMetadata = function(){
			clearTimeout(metaInterval);
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
				}else{
					parser.setConfig({
						url: stationTmp.stream, // URL to radio station
						keepListen: false,
						autoUpdate: false
					});
				}
				parser.queueRequest();
			} else {
				stationTitle = "";
				playingTitle = "";
				setAppTitle(appRadio.title);
				updateSessionMetaData("", "");
			}
		},
		// Обработка результатов получения метаданных
		requestStream = function(stream) {},
		requestMetadata = function(metadata) {
			if(audioPlayer.isPlaying()) {
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
									if(isNotify){
										spawnNotificationClose();
										spawnNotification(getMessage("now_playing") + "\n" + playingTitle, appRadio.getIcon(idStation), stationTitle);
									}else{
										setPoupText(stationTitle + "\n" + playingTitle, 5000);
									}
								}
							} else {
								updateSessionMetaData(stationTitle, playingTitle.length ? playingTitle : "");
								setAppTitle(appRadio.title + " — " + stationTitle + (playingTitle.length ? " - " + playingTitle : ""));
							}
						}
					}
				}
				metaInterval = setTimeout(getMetadata, 5000);
			} else {
				setAppTitle(appRadio.title);
				updateSessionMetaData("", "");
				stationTitle = "";
				playingTitle = "";
			}
		},
		// Ошибка получения метаданных
		requestErrorMetadata = function(error) {
			//stationTitle = "";
			playingTitle = "";
			if(audioPlayer.isPlaying()) {
				setAppTitle(appRadio.title + " — " + stationTitle);
				metaInterval = setTimeout(getMetadata, 5000);
				updateSessionMetaData(stationTitle, "");
			} else {
				setAppTitle(appRadio.title);
				stationTitle = "";
				playingTitle = "";
				updateSessionMetaData("", "");
			}
		},
		// Получение пустых метаданных
		requestEmptyMetadata = function() {
			//stationTitle = "";
			playingTitle = "";
			if(audioPlayer.isPlaying()) {
				setAppTitle(appRadio.title + " — " + stationTitle);
				metaInterval = setTimeout(getMetadata, 5000);
				updateSessionMetaData(stationTitle, "");
			} else {
				setAppTitle(appRadio.title);
				stationTitle = "";
				playingTitle = "";
				updateSessionMetaData("", "");
			}
		},
		// Вывод данных о треке
		showNotify = function(data){
			spawnNotificationClose();
			spawnNotification(getMessage("now_playing") + "\n"+data.title, data.icon, getMessage("extTitle") + " - " + data.name)
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
		// Меню
		documentMenu = new Menu(),
		stationMenu = new Menu(),
		canvasMenu = new Menu(),
		analizatorMenu = new Menu(),
		colorMenu = new Menu(),
		add_item = new MenuItem({
			label: '  ' + getMessage("menu_add"),
			icon: 'images/context_add.png',
			click: function(){
				dataStation = {};
				showPopupDialog(dataStation, 'add');
				dataStation = null;
			},
			key: "n",
			modifiers: "ctrl+alt"
		}),
		copy_item = new MenuItem({
			label: '  ' + getMessage("copy_url_stream"),
			icon: 'images/copy.png',
			click: function(){
				if(!dataStation)
					return;
				let text = dataStation.stream;
				navigator.clipboard.writeText(text).then(() => {
					setPoupText("Скопировано:\n" + text);
				}).catch(err => {
					console.log('Something went wrong', err);
				});
				dataStation = null;
			}
		}),
		edit_item = new MenuItem({
			label: '  ' + getMessage("menu_edit"),
			icon: 'images/context_edit.png',
			click: function(){
				if(!dataStation)
					return;
				showPopupDialog(dataStation, 'edit');
				dataStation = null;
			}
		}),
		delete_item = new MenuItem({
			label: '  ' + getMessage("menu_delete"),
			icon: 'images/context_delete.png',
			click: function(){
				if(!dataStation)
					return;
				$.psmodal.open(
					'confirm',
					getMessage("dialog_del_confirm") + ' - <h3>' + dataStation.name + '</h3>',
					getMessage("dialog_del_title"),
					{
						yes: {
							text: getMessage("btn_ok"),
							class: '',
							callback: function(e){
								deleteStation(dataStation);
								dataStation = null;
								return !0;
							}
						},
						no: {
							text: getMessage("btn_cancel")
						}
					}
				).addClass('dialog--deleted');
			}
		}),
		import_pack = new MenuItem({
			label: "  " + getMessage("menu_import"),
			icon: 'images/context_import.png',
			click: function(){
				importStationsHandle();
				dataStation = null;
			},
			key: "i",
			modifiers: "ctrl+alt"
		}),
		export_pack = new MenuItem({
			label: "  " + getMessage("menu_export"),
			icon: 'images/context_export.png',
			click: function(){
				exportStationsHandle();
				dataStation = null;
			},
			key: "s",
			modifiers: "ctrl+alt"
		}),
		types_analizer = new MenuItem({
			label: '  ' + getMessage("menu_analizer"),
			submenu: analizatorMenu
		}),
		stroke_colors = new MenuItem({
			label: '  ' + getMessage("color"),
			submenu: colorMenu
		}),
		milkdrop_analizer = new MenuItem({
			label: "  " + getMessage("menu_bar_milkdrop"),
			checked: false,
			type: 'checkbox',
			click: function(){
				typeAnalizer = typesAnalizer[3];
				milkdrop_analizer.checked = true;
				bar_analizer.checked = false;
				spec_analizer.checked = false;
				spec_full_analizer.checked = false;
				scep_stroke_color.enabled = false;
				appRadio.options.analizer = typeAnalizer;
				appRadio.saveOptions();
			}
		}),
		bar_analizer = new MenuItem({
			label: "  " + getMessage("menu_bar_analizer"),
			checked: false,
			type: 'checkbox',
			click: function(){
				setBarAudio();
				dataArray = new Uint8Array(analyser.frequencyBinCount);
				bufferLength = analyser.frequencyBinCount;
				typeAnalizer = typesAnalizer[0];
				milkdrop_analizer.checked = false;
				bar_analizer.checked = true;
				spec_analizer.checked = false;
				spec_full_analizer.checked = false;
				scep_stroke_color.enabled = false;
				checkStrokeColor(strokeStyleColor);
				appRadio.options.analizer = typeAnalizer;
				appRadio.saveOptions();
			}
		}),
		spec_analizer = new MenuItem({
			label: '  ' + getMessage("menu_spec_analizer"),
			checked: false,
			type: 'checkbox',
			click: function(){
				setSpecAudio();
				dataArray = new Uint8Array(analyser.frequencyBinCount);
				bufferLength = analyser.frequencyBinCount;
				typeAnalizer = typesAnalizer[1];
				bar_analizer.checked = false;
				spec_analizer.checked = true;
				spec_full_analizer.checked = false;
				scep_stroke_color.enabled = true;
				appRadio.options.analizer = typeAnalizer;
				checkStrokeColor(strokeStyleColor);
				ctx.strokeStyle = strokeStyleColor;
				appRadio.saveOptions();
			}
		}),
		spec_full_analizer = new MenuItem({
			label: '  ' + getMessage("menu_spec_full_analizer"),
			checked: false,
			type: 'checkbox',
			click: function(){
				setSpecAudio();
				dataArray = new Uint8Array(analyser.frequencyBinCount);
				bufferLength = analyser.frequencyBinCount;
				typeAnalizer = typesAnalizer[2];
				bar_analizer.checked = false;
				spec_analizer.checked = false;
				spec_full_analizer.checked = true;
				scep_stroke_color.enabled = true;
				appRadio.options.analizer = typeAnalizer;
				checkStrokeColor(strokeStyleColor);
				ctx.strokeStyle = strokeStyleColor;
				appRadio.saveOptions();
			}
		}),
		scep_stroke_color = new MenuItem({
			label: "  " + getMessage("menu_scep_stroke_color"),
			type: "checkbox",
			enabled: false,
			checked: false,
			click: function(){
				strokeColor = !strokeColor;
				scep_stroke_color.checked = strokeColor;
				appRadio.options.strokeColor = strokeColor;
				checkStrokeColor(strokeStyleColor);
				appRadio.saveOptions();
			}
		}),
		stroke_color_00 = new MenuItem({
			label: "  " + getMessage("color_00"),
			type: "checkbox",
			enabled: true,
			checked: true,
			click: function(){
				checkStrokeColor('white');
				appRadio.saveOptions();
			}
		}),
		stroke_color_01 = new MenuItem({
			label: "  " + getMessage("color_01"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('red');
				appRadio.saveOptions();
			}
		}),
		stroke_color_02 = new MenuItem({
			label: "  " + getMessage("color_02"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('orange');
				appRadio.saveOptions();
			}
		}),
		stroke_color_03 = new MenuItem({
			label: "  " + getMessage("color_03"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('yellow');
				appRadio.saveOptions();
			}
		}),
		stroke_color_04 = new MenuItem({
			label: "  " + getMessage("color_04"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('lime');
				appRadio.saveOptions();
			}
		}),
		stroke_color_05 = new MenuItem({
			label: "  " + getMessage("color_05"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('aqua');
				appRadio.saveOptions();
			}
		}),
		stroke_color_06 = new MenuItem({
			label: "  " + getMessage("color_06"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('blue');
				appRadio.saveOptions();
			}
		}),
		stroke_color_07 = new MenuItem({
			label: "  " + getMessage("color_07"),
			type: "checkbox",
			enabled: true,
			checked: false,
			click: function(){
				checkStrokeColor('violet');
				appRadio.saveOptions();
			}
		}),
		checkStrokeColor = function(color){
			switch(color){
				case 'white':
				case 'red':
				case 'orange':
				case 'yellow':
				case 'lime':
				case 'aqua':
				case 'blue':
				case 'violet': 
					strokeStyleColor = color;
					break;
				default: 
					strokeStyleColor = 'white';
					break;
			}
			stroke_color_00.checked = (strokeStyleColor == 'white') ? true : false;
			stroke_color_01.checked = (strokeStyleColor == 'red') ? true : false;
			stroke_color_02.checked = (strokeStyleColor == 'orange') ? true : false;
			stroke_color_03.checked = (strokeStyleColor == 'yellow') ? true : false;
			stroke_color_04.checked = (strokeStyleColor == 'lime') ? true : false;
			stroke_color_05.checked = (strokeStyleColor == 'aqua') ? true : false;
			stroke_color_06.checked = (strokeStyleColor == 'blue') ? true : false;
			stroke_color_07.checked = (strokeStyleColor == 'violet') ? true : false;
			
			//stroke_colors.enabled = 
			stroke_color_00.enabled = 
			stroke_color_01.enabled = 
			stroke_color_02.enabled = 
			stroke_color_03.enabled = 
			stroke_color_04.enabled = 
			stroke_color_05.enabled = 
			stroke_color_06.enabled = 
			stroke_color_07.enabled = 
			scep_stroke_color.enabled && !scep_stroke_color.checked;
			appRadio.options.analizer = typeAnalizer;
			appRadio.options.color = strokeStyleColor;
			appRadio.options.strokeColor = strokeColor;
		},
		setBarAudio = function(){
			analyser.fftSize = 128;
			analyser.maxDecibels = 80;
			analyser.smoothingTimeConstant = .6;
		},
		setSpecAudio = function(){
			analyser.fftSize = 4096;
			analyser.maxDecibels = 20;
			analyser.smoothingTimeConstant = 0.1;
		};
	setLocales();
	documentMenu.append(add_item);
	documentMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	documentMenu.append(types_analizer);
	documentMenu.append(stroke_colors);
	documentMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	documentMenu.append(export_pack);
	documentMenu.append(import_pack);
	// Station Menu
	stationMenu.append(add_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(copy_item);
	stationMenu.append(edit_item);
	stationMenu.append(delete_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(export_pack);
	stationMenu.append(import_pack);
	// Canvas Menu
	canvasMenu.append(types_analizer);
	canvasMenu.append(stroke_colors);
	// Analizer
	colorMenu.append(scep_stroke_color);
	colorMenu.append(new MenuItem({
		type: 'separator'
	}));
	colorMenu.append(stroke_color_00);
	colorMenu.append(stroke_color_01);
	colorMenu.append(stroke_color_02);
	colorMenu.append(stroke_color_03);
	colorMenu.append(stroke_color_04);
	colorMenu.append(stroke_color_05);
	colorMenu.append(stroke_color_06);
	colorMenu.append(stroke_color_07);
	analizatorMenu.append(milkdrop_analizer);
	analizatorMenu.append(bar_analizer);
	analizatorMenu.append(spec_analizer);
	analizatorMenu.append(spec_full_analizer);

	$(document).on('mousewheel', 'input#volume', function(e){
		// Регулирровка звука кол. мыши
		let evt = e.originalEvent,
			delta = evt.deltaY;
			step = delta > 0 ? parseFloat(this.step) : -parseFloat(this.step),
			value = parseFloat(this.value),
			val = Math.min(this.max, Math.max(this.min, step + value));
		if(val != value){
			appRadio.options.volume = this.value = audioPlayer.volume = val;
		}
		setVolumeText((val * 100));
	}).on("input", "input#volume", function(e){
		// Регулировка звука
		appRadio.options.volume = audioPlayer.volume = this.value;
		setVolumeText((this.value * 100));
	}).on('mousewheel', 'input.cr-slider', function(e) {
		let ed = 0.005,
			evt = e.originalEvent,
			delta = evt.deltaY;
			step = delta > 0 ? ed : -ed,
			value = parseFloat(this.value),
			val = Math.min(this.max, Math.max(this.min, step + value));
		if(val != value){
			this.value = val;
		}
		this.dispatchEvent(new Event('input'));
	}).on('click', 'li.station .st__btn', function(e){
		// Клик на кнопке станции.
		// Пуск/Стоп проигрывания
		e.preventDefault();
		let st = $(e.target).closest('li.station'),
			is_play = st.hasClass('play'),
			is_select = st.hasClass('select'),
			stationTmp = appRadio.getStation(st.data('id'));
		$('li.station').removeClass('play select progress');
		st.addClass('select');
		spawnNotificationClose();
		stationTitle = "";
		if(stationTmp){
			idStation = stationTmp.id;
			if(!is_play) {
				// Play
				st.addClass('play');
				audioPlayer.stream = stationTmp.stream;
				audioPlayer.play();
				stationTitle = stationTmp.name;
				setAppTitle(titleApp + " — " + stationTmp.name);
			} else {
				// Stop
				if(audioPlayer.isPlaying()) {
					audioPlayer.stop();
				}
				stationTitle = "";
				playingTitle = "";
				setAppTitle(titleApp);
			};
			if(!is_select) {
				idStation = appRadio.options.station = stationTmp.id;
				clearTimeout(tVolAudio);
				tVolAudio = setTimeout(saveVolume, 1500);
				audioPlayer.stream = stationTmp.stream;
				audioPlayer.play();
				stationTitle = stationTmp.name;
				setAppTitle(titleApp + " — " + stationTmp.name);
			}
		}else{
			stationTitle = "";
			playingTitle = "";
			setAppTitle(titleApp);
		}
		updateSessionMetaData(stationTitle, "");
		saveAppOptions();
		return !1;
	}).on('contextmenu', 'body, ul.appradio__list li, canvas', function(e){
		let $curTarget = $(e.currentTarget),
			pageX = Number(e.pageX.toFixed()),
			pageY = Number(e.pageY.toFixed());
		if(!$("body").hasClass('open--modal')){
			if($curTarget.hasClass('station')){
				e.preventDefault();
				// Show Popup Menu Station
				dataStation = $.extend({}, $curTarget.data());
				edit_item.label = "  " + getMessage("menu_edit") + " " + dataStation.name;
				delete_item.label = "  " + getMessage("menu_delete") + " " + dataStation.name;
				copy_item.label = "  " + getMessage("copy_url_stream") + ": " + dataStation.name;
				stationMenu.popup(pageX, pageY);
				console.log('canvas', `x = ${pageX}`, `y = ${pageY}`);
				return !1;
			} else if($curTarget.hasClass('canvas')) {
				// Show Popup Menu Canvas
				e.preventDefault();
				canvasMenu.popup(pageX, pageY);
				console.log('canvas', `x = ${pageX}`, `y = ${pageY}`);
				return !1;
			}else{
				e.preventDefault();
				if(!$("body").hasClass('preload')){
					documentMenu.popup(pageX, pageY);
				}
				console.log('canvas', `x = ${pageX}`, `y = ${pageY}`);
				return !1;
			}
		}
	});
	$(canvas).on('dblclick', function(e){
		//win.toggleFullscreen();
		//canvas.width = win.isFullscreen ? screen.width : 400;
		//canvas.height = win.isFullscreen ? screen.height : 120;
		//$(document.body).toggleClass('kiosk__mode');
		if (!document.fullscreenElement) {
			canvas.width = screen.width;
			canvas.height = screen.height;
			$(".header")[0].requestFullscreen();
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
				canvas.width = 400;
				canvas.height = 120;
			}
		}
		capYPositionArray.length = 0;
	});
	$notify_checbox.on("input", function(e){
		isNotify = appRadio.options.notify = $(this).is(':checked');
		appRadio.saveOptions().then(function(out){
			if(audioPlayer.isPlaying()){
				spawnNotificationClose();
				isNotify && (
					spawnNotification(getMessage("now_playing") + "\n" + playingTitle, appRadio.getIcon(idStation), stationTitle)
				);
			}
		});
	});
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

	audioPlayer.addEventListener('statechange', function(e){
		let $id = $("#id" + idStation),
			stationTmp = appRadio.getStation(idStation);
		e.bufering ? $id.addClass('progress') : $id.removeClass('progress');
		if(e.audioev == "stop"){
			$id.removeClass("play progress");
			//win.setProgressBar(0);
		}else{
			e.bufering ? (!$id.hasClass('progress') && $id.addClass('progress')/*, win.setProgressBar(2)*/) : ($id.removeClass('progress')/*, win.setProgressBar(0)*/);
			!$id.hasClass('play') && $id.addClass('play');
		}
		if(e.playing){
			getMetadata();
		}else{
			clearTimeout(metaInterval);
		}
	});

	// Track Info Ice Cast

	var startRender = false;

	// Analizers
	function renderFrames(){
		switch(typeAnalizer){
			case typesAnalizer[1]:
			case typesAnalizer[2]:
				renderSpec();
				break;
			case typesAnalizer[3]:
				renderBar();
				break;
			default:
				renderBar();
				break;
		}
		animateFrame = requestAnimationFrame(renderFrames, canvas);
	}

	function renderMilk() {

	}

	// Bars
	function renderBar() {
		var cwidth = ctx.canvas.width,
			cheight = ctx.canvas.height,
			s = 36,//parseInt(128 / 2) - 30,
			ww = document.fullscreenElement ? 5 : 2,
			bsw = cwidth / s,//parseInt(cwidth / s),
			bw = bsw - ww,
			val = 0,
			vh = 0,
			gradient = ctx.createLinearGradient(0, 0, 0, cheight);
		gradient.addColorStop(1, '#0f0');
		gradient.addColorStop(0.4, '#ff0');
		gradient.addColorStop(0, '#f00');
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, cwidth, cheight);
		analyser.getByteFrequencyData(dataArray);
		for (var i = 0; i < dataArray.length; i++) {
			val = dataArray[i] * (cheight/120);
			ctx.fillStyle = gradient;
			vh = cheight - val;
			ctx.fillRect(i * bsw, vh, bw, cheight + val);
			// Cap
			if (capYPositionArray.length < s) {
				capYPositionArray.push(val);
			};
			ctx.fillStyle = '#fff';
			var cp = document.fullscreenElement ? 6 : 2;
			if (val < capYPositionArray[i]) {
				capYPositionArray[i] = capYPositionArray[i] - (!document.fullscreenElement ? .5 : 2);
				ctx.fillRect(i * bsw, cheight - capYPositionArray[i], bw, cp);
			} else {
				ctx.fillRect(i * bsw, cheight - val - (cp * 2), bw, cp);
				capYPositionArray[i] = val;
			};
		}
	};
	// oscilloscope
	function renderSpec(){
		var cwidth = ctx.canvas.width,
			cheight = ctx.canvas.height,
			x = 0,
			sliceWidth = cwidth * 1.0 / bufferLength;;
		analyser.getByteTimeDomainData(dataArray);
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, cwidth, cheight);
		ctx.lineWidth = 1;
		//ctx.strokeStyle = '#0f0';
		ctx.beginPath();
		ctx.moveTo(0, cheight/2);
		for(var i = 0; i < bufferLength; i++) {
			var v = dataArray[i] / 128.0,
				y = v * cheight/2;
			if(strokeColor) {
				let hue = (dataArray[i] * 259) / 100;
				let sat = '100%';//Math.round((rat * 120) + 280 % 360);
				let lit = '50%';

				ctx.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
			} else {
				ctx.strokeStyle = strokeStyleColor;
			}
			if(i === 0) {
				//ctx.moveTo(x, y);
				ctx.moveTo(0, cheight/2);
			} else {
					//ctx.moveTo(x, cheight/2);
				ctx.lineTo(x, y);
			}
			if(typeAnalizer == typesAnalizer[2]){
				ctx.moveTo(x, cheight/2);
			}
			x += sliceWidth;
		}
		ctx.lineTo(cwidth, cheight/2);
		ctx.stroke();
		//ctx.translate(-1, -1);
	}
	// Читаем опции
	function radioAppInit(){
		setAppTitle(getMessage("extTitle"));
		return new Promise(function(resolve, reject){
			$("body").addClass('preload');
			$applist.empty();
			appRadio.readOptions().then(function(options){
				strokeStyleColor = appRadio.options.color || strokeStyleColor;
				range.value = audioPlayer.volume = Math.min(1, Math.max(0, options.volume));
				setVolumeText((range.value * 100));
				idStation = appRadio.options.station;
				isNotify = appRadio.options.notify;
				stations = appRadio.options.stations;
				strokeColor = appRadio.options.strokeColor || false;
				scep_stroke_color.checked = strokeColor;
				console.log(typeAnalizer);
				typeAnalizer = typesAnalizer.indexOf(appRadio.options.analizer) > -1 ? appRadio.options.analizer : typesAnalizer[0];
				$notify_checbox.prop('checked', isNotify);
				switch(typeAnalizer){
					// spec
					case typesAnalizer[1]:
					case typesAnalizer[2]:
						if(typesAnalizer[1]){
							spec_analizer.checked = true;
							spec_full_analizer.checked = false;
						}else{
							spec_analizer.checked = false;
							spec_full_analizer.checked = true;
						}
						milkdrop_analizer.checked = false;
						bar_analizer.checked = false;
						scep_stroke_color.enabled = true;
						setSpecAudio();
						dataArray = new Uint8Array(analyser.frequencyBinCount);
						ctx.strokeStyle = appRadio.options.color || strokeStyleColor;
						bufferLength = analyser.frequencyBinCount;
						break;
					// MilkDrop
					case typesAnalizer[3]:
						milkdrop_analizer.checked = true;
						bar_analizer.checked = false;
						scep_stroke_color.enabled = false;
						spec_analizer.checked = false;
						spec_full_analizer.checked = false;
						setBarAudio();
						dataArray = new Uint8Array(analyser.frequencyBinCount);
						bufferLength = analyser.frequencyBinCount;
						break;
					// bar
					default:
						milkdrop_analizer.checked = false;
						bar_analizer.checked = true;
						spec_analizer.checked = false;
						spec_analizer.checked = false;
						scep_stroke_color.enabled = false;
						setBarAudio();
						dataArray = new Uint8Array(analyser.frequencyBinCount);
						bufferLength = analyser.frequencyBinCount;
						break;
				}
				checkStrokeColor(strokeStyleColor);
				stations.forEach((obj) => {
					addStationOption(obj);
				});
				$applist.scrollTo("li#id"+idStation);

				disconnectAudio();
				//!startRender && renderFrames();
				//startRender = true;
				navigator.mediaSession.setActionHandler('play', playStop);
				navigator.mediaSession.setActionHandler('pause', stopPlay);
				navigator.mediaSession.setActionHandler('previoustrack', prev);
				navigator.mediaSession.setActionHandler('nexttrack', next);
				setTimeout(function(){
					$("body").removeClass('preload');
					$(".app button.fullscreen").show();
					$(".footer .radioapp-settings").on("click", function(e){
						e.preventDefault();
						$(".appradio-panel").toggleClass("open");
						return !1;
					});
					$("#close-settings").on("click", function(e){
						e.preventDefault();
						$(".appradio-panel").removeClass("open");
						return !1;
					});
					updateSessionMetaData("", "");
					/**alert("Good", "ProjectSoft").then(function(r){
						console.log(r);
					}).catch(function(e){});**/
					resolve();
				}, 2000);
			}).catch(function(error){
				alert("Не установлен пакет!");
				reject();
			});
		});
	};
	function renderSettings()
	{
		strokeStyleColor = appRadio.options.color || strokeStyleColor;
		isNotify = appRadio.options.notify;
		strokeColor = appRadio.options.strokeColor || false;
		typeAnalizer = typesAnalizer.indexOf(appRadio.options.analizer) > -1 ? appRadio.options.analizer : typesAnalizer[0];

	}
	radioAppInit();
	$(".app-control").on('contextmenu', function(e){
		e.preventDefault();
		return !1;
	})
}(jQuery));

