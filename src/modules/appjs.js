var path = require('path'),
	fs =  require('fs'),
	os = require('os'),
	zip = require('node-zip-dir'),
	unzip =  require('file-zip'),
	rimraf =  require('rimraf'),
	readChunk = require('read-chunk'),
	fileType = require('file-type'),
	helper = require('./helper'),
	extend = require('./extend'),
	openDialog = require("./nwdialog"),
	EventDispatcher = require(path.resolve(__dirname, "./eventdispatcher.js")),
	appDir = nw.App.dataPath.split("\\").join("/"),
	_options = null,
	_defaultOptions = {
		volume: 0.5,
		notify: true,
		color: 'lime',
		station: -1,
		analizer: "bar",
		strokeColor: true,
		stations: [],
		favorites: []
	},
	_start = false;

fileType.minimumBytes = 4100;

function AppRadio(document){
	var _this = this;
	openDialog.context = document;
	fs.mkdirSync(_this.iconsDir + "/", {recursive: true});
	this.readOptions().then(function(options){
		_options = options;
	}).catch(function(errz){
		console.log('Error load options');
	});
	return _this;
}

AppRadio.prototype = {
	set name(value) {
		throw "Нельзя установить имя!";
	},
	get name() {
		return chrome.i18n.getMessage("extTitle");
	},
	set dataPath(value) {
		throw new Error("property dataPath readonly");
	},
	get dataPath(){
		return appDir;
	},
	set userDir(value) {
		throw new Error("property userDir readonly");
	},
	get userDir() {
		return this.dataPath + "/temp";
	},
	set iconsDir(value) {
		throw new Error("property iconsDir readonly");
	},
	get iconsDir() {
		return this.userDir + "/icons";
	},
	set optionsFile(value) {
		throw new Error("property optionsFile readonly");
	},
	get optionsFile() {
		return this.userDir + "/options.json";
	},
	get options(){
		let data;
		if(!_options){
			_options = extend({}, _defaultOptions, _options);
			data = new Uint8Array(Buffer.from(helper.pack(_options)));
			fs.writeFileSync(this.optionsFile, data);
		}
		return _options;
	},
	set options(value){
		_options = extend({}, _defaultOptions, value);
		var data = new Uint8Array(Buffer.from(helper.pack(_options)));
		fs.writeFileSync(this.optionsFile, data);
	},
	get title() {
		return chrome.i18n.getMessage("extTitle");
	},
	set title(value){
		throw new Error("property title readonly");
	},
	saveIcon: function(id, buffer){
		var path = this.iconsDir + "/" + id + '.png';
		fs.mkdirSync(this.iconsDir, {recursive: true});
		fs.writeFileSync(path, buffer);
	},
	removeIcon: function(id){
		var path = this.iconsDir + "/" + id + '.png';
		if(fs.existsSync(path)){
			try {
				fs.unlinkSync(path);
			} catch(e){
				console.log("Error delete icon: " + path);
			}
		};
	},
	getStationIndex: function(id){
		return _options.stations.findIndex(x => x.id==id);
	},
	getStation: function(id) {
		let stID = this.getStationIndex(id);
		if(stID > -1){
			return this.options.stations[stID];
		}
		return !1;
	},
	getIcon: function(id){
		var path = this.iconsDir + "/" + id + ".png";
		if(fs.existsSync(path)){
			return path;
		} else {
			return 'images/favicon.png';
		}
	},
	readOptions: function(reload){
		var self = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(self.iconsDir + "/", {recursive: true});
			try {
				if(reload){
					try {
						fs.accessSync(self.optionsFile, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
					}catch(epr){
						chrome.runtime.sendMessage(chrome.runtime.id, {
							sender: 'errorimport',
							reload: true,
							options: false
						});
						reject('reloadlist 1');
					}
				}
				fs.accessSync(self.optionsFile, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
				// Читаем
				var _opt = helper.unpack(fs.readFileSync(self.optionsFile, "utf8"));
				_options = extend({}, _defaultOptions, _opt);
				resolve(_options);
				if(!_start){
					chrome.runtime.sendMessage(chrome.runtime.id, {
						sender: 'settings',
						reload: true,
						options: _options
					});
					_start = true;
				}
			} catch (err) {
				rimraf(self.userDir + "/", function(){
					setTimeout(
						function() {
							fs.mkdirSync(self.iconsDir + "/", {recursive: true});
							unzip.unzip('radio.radiopack', self.userDir + "/", function(err){
								if(err){
									reject(chrome.i18n.getMessage("reject_unpack_error") + '. ' + err);
									return;
								}
								_start = false;
								self.readOptions().then(function(opt){
									if(!_start){
										chrome.runtime.sendMessage(chrome.runtime.id, {
											sender: 'settings',
											reload: true,
											options: _options
										});
										_start = true;
									}
									resolve(_options);
								}).catch(function(errz){
									reject(errz);
								});
							});
						},
						200
					);
				});
			}
		});
	},
	saveOptions: function(){
		var _this = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(_this.iconsDir + "/", {recursive: true});
			_options = extend({}, _defaultOptions, _options);
			var data = new Uint8Array(Buffer.from(helper.pack(_options)));
			fs.writeFile(_this.optionsFile, data, function(err){
				if(err){
					reject(err);
					return;
				}
				resolve(_options);
			});
		});
	},
	import: function() {
		var _this = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(_this.iconsDir + "/", {recursive: true});
			openDialog.openFileDialog(['.radiopack'], function(result) {
				if(!result){
					openDialog.context.body.classList.remove("preload");
					reject(false);
					return;
				}
				openDialog.context.body.classList.add("preload");
				result = result.split("\\").join("/");
				var buffer = readChunk.sync(result, 0, fileType.minimumBytes);
				try{
					if(fileType(buffer).mime === 'application/zip'){
						try{
							rimraf(_this.userDir + "/", function(){
								setTimeout(function(){
									fs.mkdirSync(_this.iconsDir + "/", {recursive: true});
									unzip.unzip(result, _this.userDir + "/", function(err){
										if(err){
											reject(chrome.i18n.getMessage("reject_unpack_error") + ' ' + err);
											return;
										}
										_start = false;
										_this.readOptions(true).then(function(options){
											resolve(options);
											openDialog.context.body.classList.remove("preload");
										}).catch(function(errz){
											reject(errz);
											openDialog.context.body.classList.remove("preload");
										});
									});
								}, 200);
							});
						} catch(err){
							openDialog.context.body.classList.remove("preload");
							reject(chrome.i18n.getMessage("reject_error_01"));
						}
					} else {
						openDialog.context.body.classList.remove("preload");
						reject(chrome.i18n.getMessage("reject_error_02"));
					}
				}catch(er){
					openDialog.context.body.classList.remove("preload");
					reject(chrome.i18n.getMessage("reject_error_03"));
				}
			});
		});
	},
	export: function(){
		var _this = this;
		return new Promise(function(resolve, reject){
			_this.saveOptions().then(function(data){
				openDialog.saveFileDialog('radio.radiopack', ['.radiopack'], function(result) {
					if(!result){
						reject(false);
						return;
					}
					result = result.split("\\").join("/");
					try{
						fs.unlinkSync(result);
					} catch (err) {}
					openDialog.context.body.classList.add("preload");
					setTimeout(function(){
						zip.zip(_this.userDir, result).then(function() {
							openDialog.context.body.classList.remove("preload");
							resolve(result);
						}).catch(function(err) {
							openDialog.context.body.classList.remove("preload");
							reject(chrome.i18n.getMessage("dialog_exp_title_error_01"));
						});
					}, 1000);

				});
			});
		});
	},
}

Object.assign(AppRadio.prototype, EventDispatcher.prototype);

if (typeof exports == 'undefined') {
	window.AppRadio = AppRadio;
} else {
	module.exports = AppRadio;
}
