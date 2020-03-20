const cleanCSS = require("gulp-clean-css");
const uglify = require("uglify-js");
const fs = require("fs-extra");
const gulp = require("gulp");
const path = require("path");

gulp.task(
    "bundle",
    gulp.parallel(
		function cssMin() {
			return gulp
				.src("app/client/src/css/main.css")
				.pipe(cleanCSS())
				.pipe(gulp.dest("app/client/public/css"));
		},
        async function uglifyJS() {
            const file = await fs.readFile("app/client/src/js/main.js", {
                encoding: "utf8",
            });
            const minified = uglify.minify(file).code;
            await fs.writeFile("app/client/public/js/main.js", minified, {
                encoding: "utf8",
            });
		},
		function serviceWorker() {
			return gulp.src('app/client/src/js/sw/serviceworker.js')
				.pipe(gulp.dest('app/client/public'));
		}
    )
);
