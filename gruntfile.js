module.exports = function(grunt){
	var cmd = grunt.option('type'),
		tasks = {
			default: [
				'clean',
				'ffmpeg_down',
				'webfont',
				'ttf2woff2',
				'less',
				'autoprefixer',
				'group_css_media_queries',
				'cssmin',
				'requirejs',
				'uglify',
				'pug',
				'copy:appcopy',
				'nwjs',
				'copy:ffmpeg',
				'reshack'
			],
			build: [
				'clean',
				'ffmpeg_down',
				'webfont',
				'ttf2woff2',
				'less',
				'autoprefixer',
				'group_css_media_queries',
				'cssmin',
				'requirejs',
				'uglify',
				'pug',
				'copy:appcopy',
				'nwjs',
				'copy:ffmpeg',
				'reshack'
			],
			test: [
				'ffmpeg_down',
				'webfont',
				'ttf2woff2',
				'less',
				'autoprefixer',
				'group_css_media_queries',
				'cssmin',
				'requirejs',
				'uglify',
				'pug',
				'copy:appcopy',
				'exec:test'
			],
			go: [
				'less',
				'autoprefixer',
				'group_css_media_queries',
				'cssmin',
				//'requirejs',
				'uglify',
				'pug',
				'copy:appcopy',
				'exec:test'
			],
			js: [
				//'requirejs',
				'uglify',
				'pug',
				'copy:appcopy',
				'exec:test'
			],
			css: [
				'less',
				'autoprefixer',
				'group_css_media_queries',
				'cssmin',
				'pug',
				'copy:appcopy',
				'exec:test'
			],
			html: [
				'pug',
				'copy:appcopy',
				'exec:test'
			]
		},
		gc = {
			sdk: 'sdk', // sdk, normal
			version: '0.48.1'
		};
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var pkg = grunt.file.readJSON('package.json'),
		getLogName = function(){
			date = new Date(),
			hour = date.getHours(),
			minute = date.getMinutes(),
			second = date.getSeconds(),
			millisec = date.getMilliseconds(),
			data = date.getDay(),
			month = date.getMonth() + 1,
			year = date.getFullYear(),
			format = function(len, str) {
				let string = String(str);
				return string.padStart(len, "0");
			};
			return format(2, data) + "-" + format(2, month) + "-" + year + "_" +
					format(2, hour) + "-" + format(2, minute)+ "-" +
					format(2, second) + "." + format(4, millisec);
		};
	grunt.initConfig({
		globalConfig: gc,
		pkg: pkg,
		clean: {
			options: {
				force: true
			},
			all: [
				'build/'
			]
		},
		webfont: {
			radioapp: {
				src: 'src/glyph/*.svg',
				dest: 'app/fonts',
				options: {
					hashes: false,
					destLess: 'src/less/fonts',
					relativeFontPath: "/fonts/",
					font: 'radioapp',
					types: 'woff2',
					fontFamilyName: 'Radio App',
					stylesheets: ['less'],
					syntax: 'bootstrap',
					execMaxBuffer: 1024 * 400,
					htmlDemo: false,
					version: '1.0.0',
					normalize: true,
					startCodepoint: 0xE900,
					iconsStyles: false,
					autoHint: false,
					templateOptions: {
						baseClass: '',
						classPrefix: 'radioapp-'
					},
					//embed: ['woff2'],
					template: 'src/radioapp.template'
				}
			}
		},
		ttf2woff2: {
			default: {
				src: ["src/font/*"],
				dest: "app/fonts",
			},
		},
		less: {
			main: {
				options : {
					compress: false,
					ieCompat: false
				},
				files: {
					'test/css/main.css': [
						'src/less/main.less',
						'bower_components/Croppie/croppie.css'
					]
				}
			}
		},
		autoprefixer:{
			options: {
				browsers: ['Chrome > 70'],
				cascade: true
			},
			css: {
				files: {
					'test/css/prefix-main.css' : [
						'test/css/main.css'
					]
				}
			},
		},
		group_css_media_queries: {
			group: {
				files: {
					'test/css/media-main.css': ['test/css/prefix-main.css']
				}
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			minify: {
				files: {
					'app/css/main.css' : ['test/css/media-main.css']
				}
			}
		},
		requirejs: {
			ui: {
				options: {
					baseUrl: __dirname+"/bower_components/jquery-ui/ui/widgets/",//"./",
					paths: {
						jquery: __dirname+'/bower_components/jquery/dist/jquery'
					},
					preserveLicenseComments: false,
					optimize: "uglify",
					findNestedDependencies: true,
					skipModuleInsertion: true,
					exclude: ["jquery"],
					include: [
						"../disable-selection.js",
						"sortable.js",
					],
					out: "src/js/jquery.ui.nogit.js",
					done: function(done, output) {
						grunt.log.writeln(output.magenta);
						grunt.log.writeln("jQueryUI Custom Build ".cyan + "done!\n");
						done();
					},
					error: function(done, err) {
						grunt.log.warn(err);
						done();
					}
				}
			}
		},
		uglify : {
			options: {
				ASCIIOnly: true,
				compress: false,
				//beautify: true
			},
			main: {
				files: {
					'app/js/main.js': [
						'src/js/inc/setposition.js',
						'bower_components/jquery/dist/jquery.js',
						'src/js/jquery.ui.nogit.js',
						'bower_components/jquery.scrollTo/jquery.scrollTo.js',
						'bower_components/Croppie/croppie.js',
						'src/js/jquery.psmodal.js',
						//'src/js/require.js',
						//'src/js/stationitem.js',
						'src/js/main.js'
					]
				}
			},
			modules: {
				files: [
					{
						expand: true,
						cwd: 'src/modules',
						src: ["**//*.js"],
						dest: 'app/modules/'
					}
				]
			}
		},
		pug: {
			files: {
				options: {
					pretty: '\t',
					separator:  '\n'
				},
				files: {
					"app/index.html": ['src/pug/index.pug'],
				}
			}
		},
		nwjs: {
			sdk: {
				options: {
					platforms: ['win32'],
					winIco: 'app/favicon.ico',
					buildDir: __dirname+'/build/sdk',
					flavor: 'sdk',
					version: gc.version,
					cacheDir: __dirname+'/.cache',
					zip: true,
					appName: pkg.appName,
					appVersion: pkg.version

				},
				src: [__dirname+'/app/**/*']
			},
			normal: {
				options: {
					platforms: ['win32'],
					winIco: 'app/favicon.ico',
					buildDir: __dirname+'/build/normal',
					flavor: 'normal',
					version: gc.version,
					cacheDir: __dirname+'/.cache',
					zip: true,
					appName: pkg.appName,
					appVersion: pkg.version
				},
				src: [__dirname+'/app/**/*']
			},
		},
		ffmpeg_down: {
			start: {
				options: {
					platforms: ["win32"],
					dest: "ffmpeg"
				}
			}
		},
		copy: {
			ffmpeg: {
				files: [
					{
						expand: true,
						cwd: "ffmpeg/win32",
						src: "*.dll",
						dest: "build/sdk/" + pkg.appName + "/win32"
					},
					{
						expand: true,
						cwd: "ffmpeg/win32",
						src: "*.dll",
						dest: "build/normal/" + pkg.appName + "/win32"
					},
					{
						expand: true,
						cwd: "ffmpeg/win32",
						src: "*.dll",
						dest: ".cache/" + gc.version + "-normal/win32"
					},
					{
						expand: true,
						cwd: "ffmpeg/win32",
						src: "*.dll",
						dest: ".cache/" + gc.version + "-sdk/win32"
					}
				]
			},
			appcopy: {
				files: [
					{
						expand: true,
						cwd: "src/icon",
						src: "**",
						dest: "app"
					},
					{
						expand: true,
						cwd: "src/pack",
						src: "*.radiopack",
						dest: "app"
					},
					{
						expand: true,
						cwd: "src/images",
						src: "**",
						dest: "app/images"
					},
					{
						expand: true,
						cwd: "src/_locales",
						src: "**",
						dest: "app/_locales"
					}
				]
			}
		},
		exec: {
			test_normal: {
				cmd: 'start "" /wait  .cache/' + gc.version + '-normal/win32/nw.exe app/ --dev'
			},
			test: {
				cmd: 'start "" /wait  .cache/' + gc.version + '-sdk/win32/nw.exe app/ --dev'
			}
		},
		reshack: {
			hack_normal_32_exe: {
				options: {
					resource: "resource/nw_exe.res",
					open: "build/normal/" + pkg.appName + "/win32/" + pkg.appName + ".exe",
					log: false,
					prefix_log: function(){
						return getLogName();
					}
				}
			},
			hack_sdk_32_exe: {
				options: {
					resource: "resource/nw_exe.res",
					open: "build/sdk/" + pkg.appName + "/win32/" + pkg.appName + ".exe"
				}
			},

			hack_normal_32_dll: {
				options: {
					resource: "resource/nw_dll.res",
					open: "build/normal/" + pkg.appName + "/win32/nw.dll"
				}
			},
			hack_sdk_32_dll: {
				options: {
					resource: "resource/nw_dll.res",
					open: "build/sdk/" + pkg.appName + "/win32/nw.dll"
				}
			}
		}
	});
	grunt.registerTask('res', ['reshack']);
	grunt.registerTask('default', tasks.default);
	grunt.registerTask('build', tasks.build);
	grunt.registerTask('test', tasks.test);
	grunt.registerTask('go', tasks.go);
	grunt.registerTask('js', tasks.js);
	grunt.registerTask('css', tasks.css);
	grunt.registerTask('html', tasks.html);
}
