// --disable-raf-throttling --disable-devtools 
function initializeApp(){
	var app = new DirectoryApp(document),
		win = nw.Window.get(),
		menu = new nw.Menu(),
		screenHeight = win.window.screen.availHeight - (window.outerHeight - window.innerHeight),
		screenWidth = win.window.screen.availWidth,
		dataStation = null,
		stationMenu = new nw.Menu(),
		docMenu = new nw.Menu(),
		trayMenu = new nw.Menu(),
		audio = new AudioPlayer(document),
		radioStation = null;
		selectId = -1,
		savedInterval = 0,
		metaInterval = 0;
		_isShow = true,
		beforeTitl = "",
		notifyInterval = 0;
		
	window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
	
	var add_station_item = new nw.MenuItem(
			{
				label: '  Добавить станцию',
				icon: 'assets/images/context_add.png',
				click: function(){
					console.log('show add station');
					addStationHandle();
					dataStation = null;
				},
				key: "a",
				modifiers: "ctrl+alt"
			}
		),
		edit_station_item = new nw.MenuItem(
			{
				label: '  Редактировать',
				icon: 'assets/images/context_edit.png',
				click: function(){
					if(!dataStation){
						return;
					}
					console.log('show edit station');
					stationEdit(dataStation);
					dataStation = null;
				}
			}
		),
		delete_station_item = new nw.MenuItem(
			{
				label: '  Удалить',
				icon: 'assets/images/context_delete.png',
				click: function(){
					if(!dataStation){
						return;
					}
					console.log('show delete station');
					$.psmodal.open(
						'confirm',
						'Подтверлите удаление радиостанции - <h3>' + dataStation.name + '</h3>',
						'Удаление радиостанции',
						{
							yes: {
								text: 'Да, удалить',
								class: '',
								callback: function(e){
									stationDelete(dataStation);
									dataStation = null;
									return !0;
								}
							},
							no: {
								text: 'ОТМЕНА'
							}
						}
					).addClass('dialog--deleted');
				}
			}
		),
		export_stations_item = new nw.MenuItem(
			{
				label: '  Сохранить список радиостанций',
				icon: 'assets/images/context_export.png',
				click: function(){
					console.log('show export station');
					exportStationsHandle();
					dataStation = null;
				},
				key: "s",
				modifiers: "ctrl+alt"
			}
		),
		import_stations_item = new nw.MenuItem(
			{
				label: '  Загрузить список радиостанций',
				icon: 'assets/images/context_import.png',
				click: function(){
					console.log('show import station');
					importStationsHandle();
					dataStation = null;
				},
				key: "i",
				modifiers: "ctrl+alt"
			}
		),
		show_notifycation = new nw.MenuItem(
			{
				label: '  Отображать информацию о треке',
				type: "checkbox",
				click: function(){
					app.options.notify = show_notifycation.checked;
					app.saveOptions().then(function(){}).catch(function(){});
				}
			}
		),
		projectsoft_link = new nw.MenuItem(
			{
				label: '  Developer ProjectSoft',
				icon: 'assets/images/projectsoft.png',
				click: function(){
					nw.Shell.openExternal('https://demiart.ru/forum/index.php?showuser=1393929');
				}
			}
		);
	
	// Runtime Messagess
	chrome.runtime.onMessage.addListener(function(data){
		if(data.sender == 'settings'){
			if(data.reload){
				$("main.main").scrollTop(0);
				buildListStations();
				var vol = parseFloat(data.options.volume);
				$("#volume").prop('value', vol).trigger('change');
				audio.volume = vol;
				show_notifycation.checked = !!(data.options.notify);
			}
		}
		if(data.sender == "errorimport"){
			app.readOptions().then(function(options){
				$("main.main").scrollTop(0);
				buildListStations(true);
				var vol = parseFloat(options.volume);
				$("#volume").prop('value', vol).trigger('change');
				audio.volume = vol;
				show_notifycation.checked = !!(options.notify);
			}).catch(function(){
				$.psmodal.close();
				// Фигня короче с импортом ))
			});
		}
	});
	
	function blobToBuffer(blob) {
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
	}
	
	function hideNotify(done) {
		clearTimeout(notifyInterval);
		chrome.notifications.clear('radioapp_projectsoft', function() {
			done && done();
		});
	}

	function showNotify(data, delay){
		hideNotify(function() {
			if(show_notifycation.checked) {
				//fs.writeFileSync('D:\\ProjectSoft\\soft\\RadioApp\\.log.txt', "Сейчас играет:\n"+data.title);
				chrome.notifications.create(
					'radioapp_projectsoft',
					{
						iconUrl: data.icon,
						title: "Ваше Радио\n" + data.name,
						type: 'basic',//'image'
						message: "Сейчас играет:\n"+data.title,
						isClickable: true,
						priority: 2,
					},
					function() {
						notifyInterval = setTimeout(hideNotify, 5000);
					}
				);
			}
		});
	}
	// Audio
	audio.addEventListener('statechange', function(e){
		if(e.playing){
			if(e.bufering){
				win.setProgressBar(2);
				$("li#" + selectId).addClass('buffering');
			}else{
				$("li#" + selectId).removeClass('buffering');
				win.setProgressBar(0);
			}
			$("li#" + selectId).addClass('play select');
			var ttl = win.title;
			win.title = (ttl == "Ваше Радио") ? "Ваше Радио - " + app.options.stations[app.getStationIndex(selectId)].name : ttl;
		}else{
			$("li#" + selectId).removeClass("play");
			win.setProgressBar(0);
			clearTimeout(metaInterval);
			win.title = "Ваше Радио";
			beforeTitl = "";
		}
	});
	audio.addEventListener('networkchange', function(e){
		if(e.state=="online"){
			var nm = app.options.stations[app.getStationIndex(selectId)];
			beforeTitl = "";
			setTimeout(function(){getMetadata(nm);}, 5000);
		}else{
			beforeTitl = "";
		}
	});
	// Get Metadata
	function getMetadata(data){
		clearTimeout(metaInterval);
		var nm = app.options.stations[app.getStationIndex(selectId)];
		//win.title = "Ваше Радио - " + nm.name ;
		if(!radioStation){
			radioStation = new Parser({
				url: data.stream,
				keepListen: false,
				autoUpdate: false,
				url: data.stream, // URL to radio station
				errorInterval: 10 * 60, // retry connection after 10 minutes
				emptyInterval: 5 * 60, // retry get metadata after 5 minutes
				metadataInterval: 5 // update metadata after 5 seconds
			});
			radioStation.on('metadata', requestMetadata);
			radioStation.on('stream', requestStream);
			radioStation.on('error', requestErrorMetadata);
			radioStation.on('empty', requestEmptyMetadata);
			return;
		}else{
			radioStation.setConfig({
				url: data.stream, // URL to radio station
				keepListen: false,
				autoUpdate: false
			});
		}
		radioStation.queueRequest();
	}
	function requestStream(stream){
		//console.log(stream);
	}
	function requestMetadata(metadata){
		if(audio.isPlaying()){
			var nm = app.options.stations[app.getStationIndex(selectId)];
			var ttl = "Ваше Радио" + (nm ? " - " + nm.name : "");
			if(metadata.StreamTitle.length > 7){
				// No Suported win-1251
				// Проще говоря кряко-вопросы
				const regex = /�/;
				if(regex.exec(metadata.StreamTitle) === null){
					// Поддержка 101.ru. Где в title передаётся JSON объект
					const reg101ex = /{".+}/;
					let m = metadata.StreamTitle.match(reg101ex);
					if(m){
						let tT = helper.unpack(m[0]);
						if(tT && tT.t){
							metadata.StreamTitle = tT.t;
						}else{
							metadata.StreamTitle = "";
						}
					}
					
					if(beforeTitl !=  metadata.StreamTitle){
						showNotify({
							name: nm.name,
							icon: app.getIcon(selectId),
							title: metadata.StreamTitle
						}, 6000);
					}
					beforeTitl = metadata.StreamTitle;
					ttl += " - \"" + beforeTitl + "\"";
				}
			}else{
				beforeTitl = "";
			}
			win.title = ttl;
			metaInterval = setTimeout(function(){radioStation.queueRequest();}, 5000);
		}else{
			beforeTitl = "";
			win.title = "Ваше Радио" + (nm ? " - " + nm.name : "");;
		}
	}
	function requestErrorMetadata(error){
		beforeTitl = "";
		var nm = app.options.stations[app.getStationIndex(selectId)];
		win.title = "Ваше Радио - " + nm.name ;
		metaInterval = setTimeout(function(){win.title = "Ваше Радио - " + nm.name ; radioStation.queueRequest();}, 5000);
		//console.log('GET Metadata Error', nm);
	}
	function requestEmptyMetadata(){
		beforeTitl = "";
		var nm = app.options.stations[app.getStationIndex(selectId)];
		metaInterval = setTimeout(function(){win.title = "Ваше Радио - " + nm.name ; radioStation.queueRequest();}, 5000);
		win.title = "Ваше Радио" + (nm ? " - " + nm.name : "");
	}

	// Station Edit
	function stationEdit(data){
		var stationId = data.id,
			index = app.getStationIndex(stationId);
		var $li = $("#stations li#" + stationId);
		var $inputName = $("<input />",{
				type: 'text',
				class: '.station_name'
			}).val(data.name),
			$inputStream = $("<input />",{
				type: 'text',
				class: '.station_stream'
			}).val(data.stream),
			$divFile = $('<div></div>', {
				class: 'div--file linea-basic-picture'
			}).data({result: false}),
			$crp = $('<div></div>', {
				class: 'div--crop'
			});
		dataStation = null;
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
			mouseWheelZoom: 'ctrl',
			enableExif: true
		}).croppie('bind', {
			url: 'file:///' + app.getIcon(stationId)+"?" + (new Date()).getTime()
		});
		$divFile.on('click', function(ev){
			ev.preventDefault();
			dialog.openFileDialog(['.jpeg', '.jpg', '.png'], function(result){
				if(!result)
					return;
				result = "file:///" + result.split('\\').join('/');
				$divFile.data({result: result});
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
			}).append([$('<div></div>', {class: 'div--inputs'}).append([$('<span>Название станции:</span>'), $inputName, $('<span>Стрим:</span>'), $inputStream]), $divFile, $crp]),
			'Редактировать станцию',
			{
				yes: {
					text: '',
					class: 'linea-arrows-circle-check',
					callback: function(e){
						var name = $.trim($inputName.val()),
							stream = $.trim($inputStream.val());
						name = name.length < 2 ? 'Новая станция' : name
						stream = stream.length < 15 ? '' : stream;
						$crp.croppie('result', 'blob').then(function(blob) {
							blobToBuffer(blob).then(function(buffer){
								app.saveIcon(stationId, buffer);
								var _options = $.extend({}, app.options),
									_playing = audio.isPlaying(),
									dataSt = {
										name: name,
										stream: stream,
										id: stationId
									};
								_options.stations[index] = dataSt;
								$li.data(dataSt);
								$('img.image', $li).attr({src: 'file:///' + app.getIcon(stationId)+"?" + (new Date()).getTime()});
								$('span.text', $li).text(dataSt.name);
								app.options = _options;
								if(_playing){
									if(selectId == stationId){
										audio.stop();
										audio.stream = stream;
										audio.play();
									}
								}
							}).catch(function(err){
								console.log(error);
							});
						});
						return !0;
					}
				}
			}
		).addClass('dialog--edit-save');
		return !1;
	}
	
	// Station Delete
	function stationDelete(data) {
		var _options = app.options,
			removed = false;
		app.options.stations = [];
		$("#stations li").each(function(){
			var ds = $(this).data();
			if(ds.id == data.id){
				removed = $(this);
				app.removeIcon(data.id);
				if(selectId == data.id){
					audio.isPlaying() && audio.stop();
					app.options.station = -1;
				}
			}else{
				var opt = {
					id: ds.id,
					name: ds.name,
					stream: ds.stream
				}
				app.options.stations.push(opt);
			}
		});
		if(removed){
			if(selectId == data.id){
				audio.isPlaying() && audio.stop();
				app.options.station = -1;
			}
			removed.remove();
		}
		selectId = app.options.station;
		app.saveOptions().then(function(data){
			//console.log(data);
			if(selectId > -1){
				$("main.main").scrollTo('li#' + selectId);
			}
		}).catch(function(err){
			//console.log(err);
		});
	}

	// Station Item
	function buildItemListStation(station, favorite){
		favorite = favorite ? " favorite" : "";
		var pathIcon = 'file:///' + app.getIcon(station.id)+"?" + (new Date()).getTime(),
			stationName = station.name,
			$img = $("<img />", {
				class: "image"
			}).attr({src: pathIcon}),
			$imgLogo = $("<span></span>", {
				class: "item-station--image"
			}).append($img).append($("<span></span>", {class: 'icon'})),
			$text = $("<span></span>", {
				class: "text",
				text: stationName
			}),
			$spanText = $("<span></span>", {
				class: "item-station--text"
			}).append($text),
			$favorite =  $("<span></span>", {
				class: "item-station--favorite"
			}),
			$li = $("<li></li>", {
				class: "item-station" + favorite,
				id: station.id
			}).data(station).append([$imgLogo, $spanText, $favorite])
			.on('click', ".item-station--image", function(e){
				var target = e.delegateTarget,
					data = $(target).data();
				if(audio.isPlaying()) {
					audio.stop();
					win.title = "Ваше радио";
					$("ul#stations li").removeClass('play');
					if(data.id != selectId){
						$("ul#stations li").removeClass('play select');
						$('li#'+data.id).addClass('play select');
						selectId = data.id;
						audio.stream = data.stream;
						audio.play();
						win.title = "Ваше радио - " + data.name;
					}
					selectId = data.id;
				}else{
					$("ul#stations li").removeClass('play select');
					selectId = data.id;
					$('li#'+selectId).addClass('play select');
					audio.stream = data.stream;
					audio.play();
					win.title = "Ваше радио - " + data.name;
				}
				var _opt = $.extend({}, app.options);
				_opt.station = selectId;
				app.options = _opt;
				clearTimeout(metaInterval);
				getMetadata(data);
			});
		return $li;
	}

	// Station List
	function buildListStations(reload){
		reload = reload ? true : false;
		if($("#stations").data('sortableinit'))
			$("#stations").sortable('destroy');
		$("#stations").empty();
		var stations = app.options.stations;
		stations.forEach(function(station){
			var $li = buildItemListStation(station, 0);
			$('.text', $li).text(station.name);
			$("#stations").append($li);
			if(app.options.station == station.id) {
				$li.addClass('select');
				selectId = station.id;
				dataStation = $li.data();
			}
		});
		if(reload) {
			$("main.main").scrollTo('li:last-child');
		}
		if(app.options.station > -1 && !reload) {
			$("main.main").scrollTo('li#' + app.options.station);
		}
		$("#stations").sortable({
			axis: 'y',
			stop: function(e, u){
				var sts = [];
				$("#stations li").each(function(){
					var data = $(this).data();
					 sts.push({
						id: data.id,
						name: data.name,
						stream: data.stream
					});
				});
				app.options.stations = sts;
				app.saveOptions().then(function(out){});
			},
			cursor: 'n-resize',
			handle: '.item-station--favorite'
		}).data({sortableinit: true});
		$('body').removeClass('preload');
	}
	
	function addStationHandle(){
		var $inputName = $("<input />",{
				type: 'text',
				class: '.station_name'
			}),
			$inputStream = $("<input />",{
				type: 'text',
				class: '.station_stream'
			}),
			$divFile = $('<div></div>', {
				class: 'div--file linea-basic-picture'
			}).data({result: false}),
			$crp = $('<div></div>', {
				class: 'div--crop'
			});
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
			mouseWheelZoom: 'ctrl',
			enableExif: true
		}).croppie('bind', {
			url: 'assets/images/favicon.png'
		});
		$divFile.on('click', function(ev){
			ev.preventDefault();
			dialog.openFileDialog(['.jpeg', '.jpg', '.png'], function(result){
				if(!result)
					return;
				result = "file:///" + result.split('\\').join('/');
				$divFile.data({result: result});
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
			}).append([$('<div></div>', {class: 'div--inputs'}).append([$('<span>Название станции:</span>'), $inputName, $('<span>Стрим:</span>'), $inputStream]), $divFile, $crp]),
			'Добавить станцию',
			{
				yes: {
					text: '',
					class: 'linea-arrows-circle-check',
					callback: function(e){
						var name = $.trim($inputName.val()),
							stream = $.trim($inputStream.val()),
							id = (new Date()).getTime();
						name = name.length < 2 ? 'Новая станция' : name
						stream = stream.length < 15 ? '' : stream;
						$crp.croppie('result', 'blob').then(function(blob) {
							blobToBuffer(blob).then(function(buffer){
								app.saveIcon(id, buffer);
								var _options = $.extend({}, app.options);
								_options.stations.push({
									name: name,
									stream: stream,
									id: id
								});
								app.options = _options;
								buildListStations(true);
							}).catch(function(error){
								console.log(error);
							});
						});
						return !0;
					}
				}
			}
		).addClass('dialog--edit-save');
	}
	
	function dialogError(title, content, className){
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
	}
	
	function importStations(){
		$("body").addClass('preload');
		audio.stop();
		app.import().then(function(result){
			$("body").removeClass('preload');
			$.psmodal.open(
				'confirm',
				'Импор проведён успешно!',
				'Импорт',
				{
					yes: {
						text: 'ОК',
						class: "",
						callback: function(){
							return !0;
						}
					},
					no: false
				}
			).addClass('dialog--import success');
		}).catch(function(error){
			$("body").removeClass('preload');
			if(error == 'reloadlist'){
				dialogError('Ошибка импорта','Импор проведён с ошибкой!<br>Востановлен список по-умолчанию!','dialog--import error');
				return;
			}
			if(error){
				dialogError('Ошибка импорта','Импор проведён с ошибкой!','dialog--import error');
			} else {
				dialogError('Импорт','Импорт прерван пользователем!','dialog--import');
			}
		});
	}
	
	function importStationsHandle(){
		$.psmodal.open(
			'confirm',
			'Вы собираетесь произвести импорт настроек.<br>При импорте будут стёрты все радиостанции в вашеи списке и заменены на новые.<br><br>Продолжить?',
			'Импорт',
			{
				yes: {
					text: 'Да, оогласен',
					class: '',
					callback: function(e){
						$.psmodal.close();
						importStations();
						return !0;
					}
				},
				no: {
					text: 'ОТМЕНА'
				}
			}
		).addClass('dialog--import');
	}
	
	function exportStationsHandle(){
		$("body").addClass('preload');
		app.export().then(function(result){
			$("body").removeClass('preload');
			$.psmodal.open(
				'confirm',
				'Экспорт проведён Успешно!<br>',
				'Результат Экспорта',
				{
					yes: {
						text: 'Посмотреть',
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
				dialogError('Ошибка Экспорта', 'Экспорт проведён с ошибкой!', 'dialog--export error');
			}else{
				dialogError('Экспорт', 'Экспорт прерван пользователем!', 'dialog--export');
			}
		});
	}
	

	// Volume Change
	$("#volume").on('input change', function(e){
		clearTimeout(savedInterval);
		audio.volume = app.options.volume = helper.inInterval(parseFloat($(this).val()), 0, 1);
		var st = Math.round(audio.volume * 100) / 10;
			//stp = st < 0parseFloat(st)
		$(this).attr({
			'data-step': st
		});
		savedInterval = setTimeout(function(){
			app.saveOptions().then(function(options){
				
			});
		}, 500);
	});

	// Close
	nw.Window.get().on('close', function () {
		win.setAlwaysOnTop(false);
		nw.App.clearCache();
		this.hide();
		app.saveOptions().then(function(data){
			nw.App.clearCache();
			nw.App.quit();
		});
	});
	
	// Show Context Menu in Station Item
	// Context Menu Document
	
	$("#stations").on("contextmenu", 'li', function(e){
		e.preventDefault();
		var $li = $(e.currentTarget),
			data = $li.data(),
			iconPath = app.getIcon(data.id);
		dataStation = $.extend({}, data);
		edit_station_item.label = '  Редактировать: ' + dataStation.name;
		delete_station_item.label = '  Удалить: ' + dataStation.name;
		export_stations_item.enebled = !!(app.options.stations);
		add_station_item.enabled = export_stations_item.enabled = import_stations_item.enabled = !win.isKioskMode;
		stationMenu.popup(e.pageX, e.pageY);
		return !1;
	});
	
	$("body").on('contextmenu', function(e){
		e.preventDefault();
		if(!$(this).hasClass('preload') && !$(this).hasClass('open--modal')) {
			export_stations_item.enabled = !!(app.options.stations.length);
			add_station_item.enabled = export_stations_item.enabled = import_stations_item.enabled = !win.isKioskMode;
			docMenu.popup(e.pageX, e.pageY);
		}
		return !1;
	});
	
	
	// Shortcuts Document
	$(document).on('keydown', function(e){
		if(!$("body").hasClass('preload') && !$("body").hasClass('open--modal')){
			if(e.ctrlKey && e.altKey){
				if(!win.isKioskMode){
					switch(e.keyCode){
						// add
						case 65:
							e.preventDefault();
							addStationHandle();
							dataStation = null;
							return !1;
							break;
						// export
						case 83:
							e.preventDefault();
							exportStationsHandle();
							dataStation = null;
							return !1;
							break;
						// import
						case 73:
							e.preventDefault();
							importStationsHandle();
							dataStation = null;
							return !1;
							break;
					}
				}
			}
		}
	});
	
	// Spectrum Audio Analizer
	function initializeSpectrum() {
		var ctx = new AudioContext();
		var analyser = ctx.createAnalyser();
		var audioSrc = ctx.createMediaElementSource(audio.audioElement);
		// we have to connect the MediaElementSource with the analyser 
		audioSrc.connect(analyser);
		analyser.connect(ctx.destination);
		// we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
		analyser.fftSize = 256;
		analyser.maxDecibels = 20;
		analyser.smoothingTimeConstant = 0.6;
		// frequencyBinCount tells you how many values you'll receive from the analyser
		var frequencyData = new Uint8Array(analyser.frequencyBinCount);
		//var parent = $()
		// we're ready to receive some data!
		var canvas = document.getElementById('canvas'),
		   
		   cwidth = canvas.width,
			
			cheight = canvas.height - 2,
			
			gap = 2, //gap between meters
			
			capHeight = 2,
			
			capStyle = '#fff',
		   
		   meterNum = 59, //59,//1024 / (meterWidth + 2), //count of the meters
			
			meterWidth = parseInt(cwidth / meterNum) + 1, //width of the meters in the spectrum
			
			capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
		
		ctx = canvas.getContext('2d');
		gradient = ctx.createLinearGradient(0, 0, 0, 120);
		gradient.addColorStop(1, '#0f0');
		gradient.addColorStop(0.4, '#ff0');
		gradient.addColorStop(0, '#f00');
		// loop
		function renderFrame() {
			//canvas.width = parseInt($('.canvas').width());
			//canvas.height = parseInt($('.canvas').height());
			if(_isShow){
				cwidth = canvas.width;
				cheight = canvas.height - 2;
				meterWidth = parseInt(cwidth / meterNum) + 1
				var array = new Uint8Array(analyser.frequencyBinCount);
				analyser.getByteFrequencyData(array);
				var step = Math.round(array.length / 89); //sample limited data from the total array
				ctx.clearRect(0, 0, cwidth, cheight);
				var s = 2;
				for (var i = s; i < meterNum; i++) {
					var value = array[i * step];
					if (capYPositionArray.length < Math.round(meterNum)) {
						capYPositionArray.push(value);
					};
					ctx.fillStyle = capStyle;
					//draw the cap, with transition effect
					if (value < capYPositionArray[i-s]) {
						ctx.fillRect((i-s) * (meterWidth + 1), cheight - (--capYPositionArray[i-s]), meterWidth, capHeight);
					} else {
						ctx.fillRect((i-s) * (meterWidth + 1), cheight - value, meterWidth, capHeight);
						capYPositionArray[i-s] = value;
					};
					ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
					var yx = cheight - value + capHeight;
					yx < cheight ? cheight : yx;
					ctx.fillRect((i-s) * (meterWidth + 1) /*meterWidth+gap*/ , yx, meterWidth, cheight + 15); //the meter
				}
			}
			requestAnimationFrame(renderFrame);
		}
		renderFrame();
	};
	
	// Volume changes
	function volumeUp(){
		var step = parseFloat($("#volume").attr("step")),
			val = parseFloat($("#volume").val());
			val = helper.inInterval(val + step, 0, 1);
		$("#volume").val(val).trigger('change');
		return !1;
	}
	function volumeDown(){
		var step = parseFloat($("#volume").attr("step")),
			val = parseFloat($("#volume").val());
			val = helper.inInterval(val - step, 0, 1);
		$("#volume").val(val).trigger('change');
		return !1;
	}
	
	function toggleKioskMode(){
		win.toggleKioskMode();
		(win.isKioskMode) ? 
			(
				$("body").addClass('kiosk')
			) : (
				$("body").removeClass('kiosk')
			);
		setTimeout(function(){
			win.show(true);
			win.focus();
			_isShow = true;
			(audio.isPlaying() && audio.isProgress()) ? win.setProgressBar(2) : win.setProgressBar(0);
		}, 10);
	}
	
	// Shortcuts
	nw.App.registerGlobalHotKey(
		new nw.Shortcut({
			key : "Ctrl+Alt+Right",
			active : volumeUp,
			failed : function(msg){
				console.log("Not register ShortCut Ctrl+Alt+Right")
			}
		})
	);
	nw.App.registerGlobalHotKey(
		new nw.Shortcut({
			key : "Ctrl+Alt+Up",
			active : volumeUp,
			failed : function(msg){
				console.log("Not register ShortCut Ctrl+Alt+Up")
			}
		})
	);
	nw.App.registerGlobalHotKey(
		new nw.Shortcut({
			key : "Ctrl+Alt+Left",
			active : volumeDown,
			failed : function(msg){
				console.log("Not register ShortCut Ctrl+Alt+Left")
			}
		})
	);
	nw.App.registerGlobalHotKey(
		new nw.Shortcut({
			key : "Ctrl+Alt+Down",
			active : volumeDown,
			failed : function(msg){
				console.log("Not register ShortCut Ctrl+Alt+Down")
			}
		})
	);
	var shortcut = new nw.Shortcut({
		key : "Ctrl+Alt+F10",
		active : toggleKioskMode,
		failed : function(msg){
			$("canvas").on("dblclick", toggleKioskMode);
		}
	});
	nw.App.registerGlobalHotKey(shortcut);
	
	initializeSpectrum();
	_isShow = true;
	
	/*GUI.Screen.Init();
	win.show(true);
	win.restore();*/
	/*
	win.height = screenHeight;
	win.y = 0 + win.window.screen.availTop;
	win.x = screenWidth - win.width + win.window.screen.availLeft;
	win.setAlwaysOnTop(false);
	*/
	// Context menu
	stationMenu.append(add_station_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(edit_station_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(delete_station_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(export_stations_item);
	stationMenu.append(import_stations_item);
	
	docMenu.append(add_station_item);
	docMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	docMenu.append(export_stations_item);
	docMenu.append(import_stations_item);
	stationMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	docMenu.append(new nw.MenuItem(
		{
			type: "separator"
		}
	));
	stationMenu.append(show_notifycation);
	docMenu.append(show_notifycation);
	docMenu.append(new nw.MenuItem({type:'separator'}));
	docMenu.append(projectsoft_link);
	
	// Tray
	function appShow(){
		_isShow = !_isShow;
		(_isShow) ? (
			win.show(),
			win.focus(),
			((audio.isPlaying() && audio.isProgress()) ? win.setProgressBar(2) : win.setProgressBar(0)),
			(selectId > -1 && $("main.main").scrollTo('li#' + selectId))) : win.hide();
	}
	
	var tray = new GUI.Tray({
			title: 'Ваше радио',
			icon: 'favicon.png'
		}),
		restoreMenuItem = new nw.MenuItem({
			label: '  Ваше радио',
			icon: 'favicon.png',
			click: appShow
		});
	trayMenu.append(restoreMenuItem);
	trayMenu.append(show_notifycation);
	trayMenu.append(new nw.MenuItem({
			type: 'separator'
		})
	);
	trayMenu.append(new nw.MenuItem({
			label: '  Закрыть',
			icon: 'assets/images/close.png',
			click: function(){
				win.close();
			}
		})
	);
	trayMenu.append(new nw.MenuItem({
			type: 'separator'
		})
	);
	trayMenu.append(projectsoft_link);
	tray.menu = trayMenu;
	tray.on('click', appShow);
	win.on('minimize', function(e){
		_isShow = false;
		win.hide();
	});
	GUI.Screen.Init();
	win.show(true);
	win.restore();
	/*var itms = new StationItem();
	$("#testStations").append(itms);*/
};

initializeApp();