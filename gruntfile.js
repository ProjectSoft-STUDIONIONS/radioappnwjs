module.exports = function(grunt){
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	var gc = {
		sdk: 'normal', // sdk, normal
		version: '0.36.4',
		app: 'radio'
	};
	
	var tasks = {
		default: [
			'notify:start',
			'clean:dev',
			'imagemin',
			'tinyimg',
			'webfont',
			'ttf2woff2',
			'less',
			'autoprefixer',
			'group_css_media_queries',
			'replace',
			'cssmin',
			'requirejs',
			'uglify',
			'pug',
			//'exec:app_main',
			'exec:test',
			'notify:cancel'
		],
		build: [
			'notify:start',
			'clean:nwjs',
			'clean:all',
			'imagemin',
			'tinyimg',
			'webfont',
			'ttf2woff2',
			'less',
			'autoprefixer',
			'group_css_media_queries',
			'replace',
			'cssmin',
			'requirejs',
			'uglify',
			'pug',
			//'exec:app_main',
			'nwjs',
			'copy',
			'exec:install',
			'notify:cancel'
		],
		test: [
			'notify:start',
			'clean:all',
			'imagemin',
			'tinyimg',
			'webfont',
			'ttf2woff2',
			'less',
			'autoprefixer',
			'group_css_media_queries',
			'replace',
			'cssmin',
			'requirejs',
			'uglify',
			'pug',
			'copy',
			//'exec:app_main',
			'exec:test',
			'notify:cancel'
		],
		sdk: [
			'notify:start',
			'clean:nwjs',
			'nwjs',
			'copy',
			'exec:win32exe_normal',
			'exec:win64exe_normal',
			'exec:win32dll_normal',
			'exec:win64dll_normal',
			'exec:win32exe_sdk',
			'exec:win64exe_sdk',
			'exec:win32dll_sdk',
			'exec:win64dll_sdk',
			'notify:cancel'
		]
	};
	
	grunt.initConfig({
		globalConfig : gc,
		pkg : grunt.file.readJSON('package.json'),
		clean: {
			options: {
				force: true
			},
			all: [
				'test/',
				'tests/',
				'package/assets/',
				'installer/'
			],
			dev: [
				'test/',
				'tests/',
				'package/assets/images/',
				'package/assets/css/',
				'package/assets/js/',
			],
			nwjs: [
				'.nwjs/'
			]
		},
		copy: {
			normal: {
				expand: true,
				cwd: "src/ffmpeg",
				src: "**",
				dest: ".nwjs/normal/radio"
			},
			sdk: {
				expand: true,
				cwd: "src/ffmpeg",
				src: "**",
				dest: ".nwjs/sdk/radio"
			}
		},
		ttf2woff2: {
			default: {
				src: ["src/fonts/*"],
				dest: "package/assets/fonts",
				dest: "src/less/fonts"
			},
		},
		notify: {
			start: {
				options: {
					title: "<%= pkg.name %> v<%= pkg.version %>",
					message: 'Запуск',
					image: __dirname+'\\favicon.png'
				}
			},
			cancel: {
				options: { 
					title: "<%= pkg.name %> v<%= pkg.version %>",
					message: "Успешно Завершено",
					image: __dirname+'\\favicon.png'
				}
			}
		},
		imagemin: {
			base: {
				options: {
					optimizationLevel: 3,
					svgoPlugins: [
						{
							removeViewBox: false
						}
					]
				},
				files: [
					{
						expand: true,
						flatten : true,
						src: [
							'src/images/*.{png,jpg,gif,svg}'
						],
						dest: 'test/images/',
						filter: 'isFile'
					}
				],
			}
		},
		tinyimg: {
			dynamic: {
				files: [
					{
						expand: true,
						cwd: 'test/images', 
						src: ['**/*.{png,jpg,jpeg,svg}'],
						dest: 'package/assets/images/'
					}
				]
			}
		},
		webfont: {
			radioapp: {
				src: 'src/glyph/*.svg',
				dest: 'src/less/fonts',
				options: {
					hashes: false,
					destLess: 'src/less/fonts',
					font: 'radioapp',
					types: 'woff2',
					fontFamilyName: 'Radi App',
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
					embed: ['woff2'],
					template: 'src/radioapp.template'
				}
			},
			lineas: {
				src: 'src/svg/*.svg',
				dest: 'src/less/fonts',
				options: {
					hashes: false,
					destLess: 'src/less/fonts',
					font: 'linea',
					types: 'woff2',
					fontFamilyName: 'Linea',
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
						classPrefix: 'linea-'
					},
					embed: ['woff2'],
					template: 'src/radioapp.template'
				}
			}
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
						'bower_components/Croppie/croppie.css',
					],
					'test/css/preload.css': [
						'src/less/preload.less'
					],
					'test/css/stationitem.css': [
						'src/less/stationitem/stationitem.less'
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
					'tests/css/main.css' : ['test/css/main.css'],
					'tests/css/preload.css' : ['test/css/preload.css'],
				}
			},
		},
		group_css_media_queries: {
			group: {
				files: {
					'tests/css/media.main.css': ['tests/css/main.css'],
					'tests/css/media.preload.css': ['tests/css/preload.css']
				}
			}
		},
		replace: {
			dist: {
				options: {
					patterns: [
						{
							match: /\/\* *(.*?) *\*\//g,
							replacement: ' '
						}
					]
				},
				files: {
					'tests/css/replace.main.css': 'tests/css/media.main.css',
					'tests/css/replace.preload.css': 'tests/css/media.preload.css'
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
					'src/pug/main.css' : ['tests/css/replace.main.css'],
					'src/pug/preload.css' : ['tests/css/replace.preload.css'],
					'package/assets/css/stationitem.css': ['test/css/stationitem.css']
				}
			}
		},
		pug: {
			files: {
				options: {
					pretty: '\t',
					separator:  '\n'
				},
				files: {
					"package/index.html": ['src/pug/index.pug'],
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
					out: "tests/js/jquery.ui.js",
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
				//beautify: true
			},
			main: {
				files: {
					/*'project/assets/js/app.js': [
						'prejscss/app.js'
					],*/
					'package/assets/js/background.js': 'src/background/background.js',
					//'package/assets/js/main.js''test/js/main.js'
					'package/assets/js/main.js': [
						'bower_components/jquery/dist/jquery.js',
						'tests/js/jquery.ui.js',
						'bower_components/jquery.scrollTo/jquery.scrollTo.js',
						'bower_components/Croppie/croppie.js',
						'src/js/jquery.psmodal.js',
						'src/js/require.js',
						'src/js/stationitem.js',
						'src/js/main.js'
					]
				}
			},
			modules: {
				files: [
					{
						expand: true,
						cwd: 'src/modules', 
						src: ['**/*.js'],
						dest: 'package/modules/'
					}
				]
			}
		},
		nwjs: {
			sdk: {
				options: {
					platforms: ['win'],
					buildDir: __dirname+'/.nwjs/sdk',
					flavor: 'sdk',
					version: gc.version,
					cacheDir: __dirname+'/.cache',
					zip: true,
					
				},
				src: [__dirname+'/package/**/*']
			},
			normal: {
				options: {
					platforms: ['win'],
					buildDir: __dirname+'/.nwjs/normal',
					flavor: 'normal',
					version: gc.version,
					cacheDir: __dirname+'/.cache',
					zip: true,
					
				},
				src: [__dirname+'/package/**/*']
			},
		},
		exec: {
			//rc_dll: "start \"ResHacker\" /wait ResourceHacker  -open src/dll/nw.rc -save src/dll/nw.res -action compile -log NUL",
			//rc_exe: "start \"ResHacker\" /wait ResourceHacker  -open src/exe/nw.rc -save src/exe/nw.res -action compile -log NUL",
			win32exe_normal: "ResourceHacker -open .cache/" + gc.version + "-normal/win32/nw.exe, -save .cache/" + gc.version + "-normal/win32/nw.exe, -action modify, -resource src/exe/nw.res, ,,",
			win64exe_normal: "ResourceHacker -open .cache/" + gc.version + "-normal/win64/nw.exe, -save .cache/" + gc.version + "-normal/win64/nw.exe, -action modify, -resource src/exe/nw.res, ,,",
			win32dll_normal: "ResourceHacker -open .cache/" + gc.version + "-normal/win32/nw.dll, -save .cache/" + gc.version + "-normal/win32/nw.dll, -action modify, -resource src/dll/nw.res, ,,",
			win64dll_normal: "ResourceHacker -open .cache/" + gc.version + "-normal/win64/nw.dll, -save .cache/" + gc.version + "-normal/win64/nw.dll, -action modify, -resource src/dll/nw.res, ,,",
			win32exe_sdk:    "ResourceHacker -open .cache/" + gc.version +    "-sdk/win32/nw.exe, -save .cache/" + gc.version + "-sdk/win32/nw.exe, -action modify, -resource src/exe/nw.res, ,,",
			win64exe_sdk:    "ResourceHacker -open .cache/" + gc.version +    "-sdk/win64/nw.exe, -save .cache/" + gc.version + "-sdk/win64/nw.exe, -action modify, -resource src/exe/nw.res, ,,",
			win32dll_sdk:    "ResourceHacker -open .cache/" + gc.version +    "-sdk/win32/nw.dll, -save .cache/" + gc.version + "-sdk/win32/nw.dll, -action modify, -resource src/dll/nw.res, ,,",
			win64dll_sdk:    "ResourceHacker -open .cache/" + gc.version +    "-sdk/win64/nw.dll, -save .cache/" + gc.version + "-sdk/win64/nw.dll, -action modify, -resource src/dll/nw.res, ,,",
			// app_main: __dirname+'/.cache/' + gc.version + '-sdk/win32/nwjc.exe ' + __dirname+'/test/js/main.js ' + __dirname+'/package/main.bin',
			test: {
				cmd: 'start "" /wait  .cache/' + gc.version + '-sdk/win64/nw.exe package/'
			},
			install: {
				cmd: 'iscc ' + __dirname+'/install.iss'
			}
		},
		// Изменения файлов
		watch: {
			dev : {
				files: [
					'src/**/*',
				],
				tasks: tasks.test
			}
		},
	});
	
	/**
	 *  default
	 */
	grunt.registerTask('default',tasks.default);
	/**
	 *  build
	 */
	grunt.registerTask('sdk', tasks.sdk);
	/**
	 *  build
	 */
	grunt.registerTask('build', tasks.build);
	/**
	 *  build
	 */
	grunt.registerTask('test', tasks.test);
	/**
	 *  dev
	 */
	grunt.registerTask('dev', ['watch']);
};