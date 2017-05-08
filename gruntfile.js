module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		exec: {
			tsCompile: 'tsc -p app/js/',
		},
		uglify: {
			js: {
				files: {
					'build/js/main.js': 'app/js/main.js'
				}
			}
		},
		copy: {
			build: {
				files: [
					{ expand: true, cwd: 'app/', src: ['css/*'], dest: 'build/' },
					{ expand: true, cwd: 'app/', src: ['html/*'], dest: 'build/' },
					{ expand: true, cwd: 'app/', src: ['resources/*'], dest: 'build/' },
					{ expand: true, cwd: 'app/', src: ['manifest.json'], dest: 'build/' }
				]
			}
		},
		zip: {
			'using-cwd': {
				cwd: 'build/',
				src: ['build/**', '!build/iedereenlagineendeuk.zip'],
				dest: 'build/iedereenlagineendeuk.zip'
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-zip');

	//Compiles all files and copies it to /build
	grunt.registerTask('build', ['exec:tsCompile', 'uglify:js', 'copy:build']);

	//Zips /build up
	grunt.registerTask('zip', ['zip']);

	//Builds the project and copies it to /build
	grunt.registerTask('buildZip', ['build', 'zip']);
}