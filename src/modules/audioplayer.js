var helper = require('./helper');
var EventDispatcher = function () {};
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
var _isPlaying = false,
	_isProgress = false,
	_net = false,
	_this,
	_volume = 1,
	_status = "online",
	_stream = "data:audio/mpeg;base64,/+MQwAAAAANIAYAAAExBTUUzLjkzVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/jEMAnAAADSAHAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/4xDATgAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
	timeupdate,
	audioEvents = [
		'emptied',
		'loadedmetadata',
		'loadeddata',
		'canplay',
		'canplaythrough',
		'playing',
		'ended',
		'waiting',
		'ended',
		'durationchange',
		'timeupdate',
		'play',
		'playing',
		'pause',
		'progress',
		'stalled',
		'suspend',
		'ratechange',
		'volumechange'
	],
	audioHandler = function(e){
		switch(e.type){
			case "volumechange":
				_this.dispatchEvent({type: e.type, volume: _volume});
				break;
			case 'play':
			case 'waiting':
				_isProgress = true;
				_isPlaying = true;
				_net = true;
				_this.dispatchEvent({type: 'statechange', audioev:'play', bufering: _isProgress, playing: _isPlaying});
				break;
			case 'canplay':
				
				break;
			case 'playing':
				timeupdate && clearTimeout(timeupdate);
				_isProgress = false;
				_isPlaying = true;
				_net = true;
				_this.dispatchEvent({type: 'statechange', audioev:'playing', bufering: _isProgress, playing: _isPlaying});
				break;
			case 'ended':
			case 'abort':
			case 'emptied':
			case 'error':
			case 'pause':
				timeupdate && clearTimeout(timeupdate);
				_net = _isPlaying = _isProgress = false;
				_this.dispatchEvent({type: 'statechange', audioev:'stop', bufering: _isProgress, playing: _isPlaying});
				break;
			case 'timeupdate':
				timeupdate && clearTimeout(timeupdate);
				if(_isProgress && audio.readyState==4){
					_isProgress = false;
					_this.dispatchEvent({type: 'statechange', audioev:'progress', bufering: _isProgress, playing: true});
					return;
				}
				_isProgress && (
					timeupdate = setTimeout(function(){
						_isProgress = true;
						_this.dispatchEvent({type: 'statechange', audioev:'progress', bufering: _isProgress, playing: true});
					}, 150)
				)
				break;
		}
	},
	audio;
	
function AudioPlayer(doc){
	var dispatchHandlers = [], i=0;
	_this = this;
	audio = new Audio();
	audio.crossOrigin="anonymous";
	audio.preload = "none";
	audioEvents.forEach(function(a, b){
		audio.addEventListener(a, audioHandler);
	});
	audio.controls = null;
	doc.body.appendChild(audio);
	function updateOnlineStatus(e){
		var net = _net;
		_status = e.type;
		if(e.type=="offline") {
			_this.stop();
		}else if(e.type=="online"){
			if(net){
				_this.play();
			}
		}
		_this.dispatchEvent({type:"networkchange", state: e.type});
		setTimeout(function(){
			_net = net;
		}, 200);
		e.preventDefault();
		return !1;
	}
	window.addEventListener('online',  updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
	return _this;
}

AudioPlayer.prototype = {
	isPlaying: function(){
		return _isPlaying;
	},
	isProgress: function(){
		return _isProgress;
	},
	toggle: function(){
		_isPlaying ? this.stop() : this.play();
	},
	set stream(value) {
		_stream = value;
		this.isPlaying() && (this.stop(), this.play());
	},
	get stream() {
		return _stream;
	},
	set volume(value) {
		_volume = helper.inInterval(value, 0, 1);
		if(_volume==audio.volume){
			return;
		}
		audio.volume = _volume;
	},
	get volume(){
		return _volume;
	},
	set audioElement(value){
		throw new Error('not audio');
	},
	get audioElement(){
		return audio;
	},
	play: function(){
		_isPlaying = true;
		audio.src = this.stream;
		// Play Promice
		setTimeout(function(){audio.play().then(function(){}).catch(function(){console.log('error promice')})},10);
	},
	stop: function(){
		audio.pause();
		audio.src = "data:audio/mpeg;base64,/+MQwAAAAANIAYAAAExBTUUzLjkzVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/jEMAnAAADSAHAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/4xDATgAAA0gAAAAAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
		audio.currentTime = 0;
	}
}
Object.assign(AudioPlayer.prototype, EventDispatcher.prototype);

if (typeof exports == 'undefined') {
    window.AudioPlayer = AudioPlayer;
} else {
    module.exports = AudioPlayer;
}