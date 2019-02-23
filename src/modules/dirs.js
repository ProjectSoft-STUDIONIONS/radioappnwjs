var helper = require('./helper'),
	extend = require('./extend'),
	fs =  require('fs'),
	os = require('os'),
	readChunk = require('read-chunk'),
	fileType = require('file-type'),
	rimraf = require('rimraf'),
	
	dialog = require('./nwdialog'),
	zip = require('node-zip-dir'),
	unzip = require('file-zip'),
	
	EventDispatcher = function () {}
	_options = null,
	_defaultOptions = {
		volume: 0.5,
		notify: true,
		station: -1,
		stations: [],
		favorites: []
	},
	_start = false;
fileType.minimumBytes = 4100;

Object.assign( EventDispatcher.prototype, {
	addEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) this._listeners = {};
		var listeners = this._listeners;
		if ( listeners[ type ] === undefined ) {
			listeners[ type ] = [];
		}
		if ( listeners[ type ].indexOf( listener ) === - 1 ) {
			listeners[ type ].push( listener );
		}
	},
	hasEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) return false;
		var listeners = this._listeners;
		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {
			return true;
		}
		return false;
	},
	removeEventListener: function ( type, listener ) {
		if ( this._listeners === undefined ) return;
		var listeners = this._listeners;
		var listenerArray = listeners[ type ];
		if ( listenerArray !== undefined ) {
			var index = listenerArray.indexOf( listener );
			if ( index !== - 1 ) {
				listenerArray.splice( index, 1 );
			}
		}
	},
	dispatchEvent: function ( event ) {
		if ( this._listeners === undefined ) return;
		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];
		if ( listenerArray !== undefined ) {
			event.target = this;
			var array = [], i = 0;
			var length = listenerArray.length;
			for ( i = 0; i < length; i ++ ) {
				array[ i ] = listenerArray[ i ];
			}
			for ( i = 0; i < length; i ++ ) {
				array[ i ].call( this, event );
			}
		}
	}
});
	
function DirectoryApp(doc){
	this.username = os.userInfo().username;
	this.dataPath  = nw.App.dataPath.split("\\").join("/");
	this.userDir = this.dataPath + '/temp';
	this.iconsDirextory = this.userDir + '/icons';
	this.userPath = this.userDir + "/";
	this.iconsPath = this.iconsDirextory + "/";
	fs.mkdirSync(this.iconsDirextory, {recursive: true});
	this.optionsFile = this.userPath + 'options.json';
	this.readOptions().then(function(options){
		_options = options;
	}).catch(function(errz){
		console.log('Error load options');
	});
	dialog.setContext(doc);
	return this;
}

DirectoryApp.prototype = {
	removeIcon: function(id){
		var path = this.iconsPath + id + '.png';
		if(fs.existsSync(path)){
			try {
				fs.unlinkSync(path);
			} catch(e){
				
			}
		};
	},
	getStationIndex: function(id){
		return _options.stations.findIndex(x => x.id==id);
	},
	getIcon: function(id){
		var path = this.iconsPath + id + ".png";
		if(fs.existsSync(path)){
			return path;
		} else {
			return 'assets/images/favicon.png';
		}
	},
	saveIcon: function(id, buffer){
		var path = this.iconsPath + id + '.png';
		fs.mkdirSync(this.iconsDirextory, {recursive: true});
		fs.writeFileSync(path, buffer);
	},
	saveOptions: function(){
		var _this = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(_this.iconsDirextory, {recursive: true});
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
	readOptions: function(reload){
		var self = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(self.iconsDirextory, {recursive: true});
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
						reject('reloadlist');
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
				rimraf(self.userPath, function(){
					setTimeout(
						function() {
							fs.mkdirSync(self.iconsDirextory, {recursive: true});
							unzip.unzip('radio-export.radiopack', self.userPath, function(err){
								if(err){
									reject('Ошибка распаковки дефолта. ' + err);
									return;
								}
								_start = false;
								self.readOptions().then(function(opt){
									resolve(_options);
									if(!_start){
										chrome.runtime.sendMessage(chrome.runtime.id, {
											sender: 'settings',
											reload: true,
											options: _options
										});
										_start = true;
									}
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
	isDev: function(){
		return (nw.App.argv.findIndex(x => x=='--dev') > -1);
	},
	export: function(){
		var _this = this;
		return new Promise(function(resolve, reject){
			_this.saveOptions().then(function(data){
				dialog.saveFileDialog('radio-export.radiopack', ['.radiopack'], function(result) {
					if(!result){
						reject(false);
						return;
					}
					result = result.split("\\").join("/");
					try{
						fs.unlinkSync(result);
					} catch (err) {}
					zip.zip(_this.userDir, result).then(function() {
						resolve(result);
					}).catch(function(err) {
						reject('Ошибка экспорта');    
					});
				});
			});
		});
	},
	import: function() {
		var _this = this;
		return new Promise(function(resolve, reject){
			fs.mkdirSync(_this.iconsDirextory, {recursive: true});
			dialog.openFileDialog(['.radiopack'], function(result) {
				if(!result){
					reject(false);
					return;
				}
				result = result.split("\\").join("/");
				var buffer = readChunk.sync(result, 0, fileType.minimumBytes);
				try{
					if(fileType(buffer).mime === 'application/zip'){
						try{
							rimraf(_this.userPath, function(){
								setTimeout(function(){
									fs.mkdirSync(_this.iconsDirextory, {recursive: true});
									unzip.unzip(result, _this.userPath, function(err){
										if(err){
											reject('Ошибка Импорта! Распаковка ' + err);
											return;
										}
										_start = false;
										_this.readOptions(true).then(function(options){
											resolve(options);
										}).catch(function(errz){
											reject(errz)
										});
									});
								}, 200);
							});
						} catch(err){
							reject('Ошибка Импорта! Создание директории');
						}
					} else {
						reject('Ошибка Импорта! Данный формат не поддерживается');
					}
				}catch(er){
					reject('Ошибка Импорта! Данный формат не поддерживается');
				}
			});
		});
	},
	get options(){
		if(!_options){
			_options = extend({}, _defaultOptions, _options);
			var data = new Uint8Array(Buffer.from(helper.pack(_options)));
			fs.writeFileSync(this.optionsFile, data);
		}
		return _options;
	},
	set options(value){
		_options = extend({}, _defaultOptions, value);
		var data = new Uint8Array(Buffer.from(helper.pack(_options)));
		fs.writeFileSync(this.optionsFile, data);
	}
};

Object.assign(DirectoryApp.prototype, EventDispatcher.prototype);

module.exports = DirectoryApp;