nw.App.clearCache();

var GUI = require('nw.gui'),
	fs = require('fs'),
	os = require('os'),
	rimraf = require('rimraf'),
	mime = require("mime"),
	_ = require("underscore"),
	dialog = require('./modules/nwdialog'),
	zip = require('node-zip-dir'),
	unzip = require('file-zip'),
	readChunk = require('read-chunk'),
	fileType = require('file-type'),
	
	Parser = require('icecast-parser'),
	
	extend = require("./modules/extend"),
	helper = require("./modules/helper"),
	AudioPlayer = require("./modules/audioplayer"),
	DirectoryApp = require("./modules/dirs");
	
nw.App.clearCache();

window.styleSheetWriter = (
	function () {
		var selectorMap = {},
			supportsInsertRule;	
		return {
			getSheet: (function () {
				var sheet = false;
				return function () {
					if (!sheet) {
						var style = document.createElement("style");
						style.appendChild(document.createTextNode(""));
						//style.title = "bodysettings";
						document.head.appendChild(style);
						sheet = style.sheet;
						supportsInsertRule = (sheet.insertRule == undefined) ? false : true;
					}
					return sheet;
				};
			})(),
			setRule: function (selector, property, value) {
				var sheet = this.getSheet(),
					rules = sheet.rules || sheet.cssRules;
				property = property.replace(/([A-Z])/g, function($1){return "-"+$1.toLowerCase();});
				if (!selectorMap.hasOwnProperty(selector)){
					var index = rules.length;
					sheet.insertRule([selector, " {", property, ": ", value, ";}"].join(""), index);
					selectorMap[selector] = index;
				} else {
					rules[selectorMap[selector]].style.setProperty(property, value);
				}
			},
			clear: function(){
				var sheet = this.getSheet();
				if(sheet.rules.length){
					while(sheet.rules.length){
						sheet.deleteRule(0);
					}
				}
				selectorMap = [];
			}
		};
	}
)();

styleSheetWriter.clear();

const bd = document.querySelector('body');

// Ready style Application
//parser('assets/css/main.css').then(function(data){
	/*data.stylesheet.rules.forEach(function(rule){
		
		if(rule.type == "rule"){
			var selectors = rule.selectors;
			selectors.forEach(function(selector){
				rule.declarations.forEach(function(declaration){
					const regex = /(-moz|-ms|-opera)/;
					let m;
					if((m = regex.exec(selector + "{" + declaration.property + ":" + declaration.value +";}")) !== null){}else{
						if(declaration.type == 'declaration'){
							styleSheetWriter.setRule(selector, declaration.property, declaration.value);
						}
					}
				});
			});
		}else if(rule.type == "font-face"){
			var sheet = styleSheetWriter.getSheet(),
				rules = sheet.rules || sheet.cssRules,
				index = rules.length;
				values = [];
				rule.declarations.forEach(function(declaration){
					if(declaration.type == 'declaration'){
						values.push(declaration.property + ":" + declaration.value);
					}
				});
				if(values.length)
					sheet.insertRule('@font-face {' + values.join(';') + ';}', index);
		}else{
			//console.log(rule);
		}
	});*/
	// Initialize Application
	//initializeApp();
//});