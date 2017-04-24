module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		exec: {
			tsCompileClient: 'tsc -p app/client/',
			tsCompileServer: 'tsc -p app/server/',
			tsCompileSW: 'tsc -p app/client/src/js/sw'
		},
		cssmin: {
			options: {
				report: 'gzip'
			},
			css: {
				files: [{
					'app/client/public/css/main.css': ['app/client/src/css/main.css'],
					'app/client/public/css/main_offline.css': ['app/client/src/css/main.css']
				}]
			}
		},
		concat: {
			css: {
				files: {
					'app/client/public/css/main.css': ['app/client/src/css/online_fonts.css',
						'app/client/public/css/main.css'],
					'app/client/public/css/main_offline.css': ['app/client/src/css/offline_fonts.css',
						'app/client/public/css/main.css']
				}
			},
		},
		uglify: {
			js: {
				files: {
					'app/client/public/js/main.js': 'app/client/src/js/main.js'
				}
			}
		},
		copy: {
			sw: {
				files: {
					'app/client/public/serviceworker.js': 'app/client/src/js/sw/serviceworker.js',
				}
			}
		},
		watch: {
			clientCss: {
				files: ['app/client/src/css/*.css', 'app/client/src/css/parts/*.css'],
				tasks: ['cssmin:css', 'concat'],
				options: {
					spawn: false
				}
			},
			clientTs: {
				files: ['app/client/**/*.ts'],
				tasks: ['compileClient', 'uglify:js', 'copy:sw'],
				options: {
					spawn: false
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-string-replace');
	grunt.loadNpmTasks('grunt-exec');

	//Compiles all files and prepares all bundles
	grunt.registerTask('compile', ['compileTs', 'cssmin:css', 'concat', 'uglify:js', 'copy:sw']);

	//Compiles the typescript for the client and server
	grunt.registerTask('compileTs', ['compileServer', 'compileClient', 'compileSW']);

	//Compiles the TypeScript for the client
	grunt.registerTask('compileClient', ['exec:tsCompileClient']);

	//Compiles the typescript for the serviceworker
	grunt.registerTask('compileSW', ['exec:tsCompileSW']);

	//Compiles the TypeScript for the server
	grunt.registerTask('compileServer', ['exec:tsCompileServer']);

	//Watches source files for changes and compiles as needed
	grunt.registerTask('watchCompile', ['watch']);
}