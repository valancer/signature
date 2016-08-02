'use strict';

var	gulp = require('gulp'),
	clean = require('gulp-clean'),
	fileinclude = require('gulp-file-include'),
	sass = require('gulp-sass'),
	buffer = require('vinyl-buffer'),
	csso = require('gulp-csso'),
	imagemin = require('gulp-imagemin'),
	merge = require('merge-stream'),
	spritesmith = require('gulp.spritesmith'),
	autoprefixer = require('gulp-autoprefixer'),
	csscomb = require('gulp-csscomb'),
	newer = require('gulp-newer'),
	jshint = require('gulp-jshint'),
	connect = require('gulp-connect'),
	livereload = require('gulp-livereload'),
	watch = require('gulp-watch');


var paths = {
	sources: 'sources/**',
	build: 'build/',
	release: 'release/',
	html: {
		src: 'sources/html/*.html',
		base: 'sources/html/includes/',
		dest: 'build/'
	},
	sprites : {
		mobile: {
			src: 'sources/assets/images/mobile/sprites/*.png',
			filter: 'sources/assets/images/mobile/sprites/*@2x.png',
			dest: {
				img: 'sources/assets/images/mobile/',
				css: 'sources/assets/styles/scss/'
			}
		},
		desktop: {
			src: 'sources/assets/images/sprites/*.png',
			dest: {
				img: 'sources/assets/images/',
				css: 'sources/assets/styles/scss/'
			}
		}
	},
	scss: {
		src: 'sources/assets/styles/scss/**/*.scss',
		dest: 'sources/assets/styles/'
	},
	styles: {
		src: ['sources/assets/styles/*.css', '!sources/assets/styles/*.min.css'],
		dest: 'sources/assets/styles/'
	},
	scripts: {
		src: 'sources/assets/scripts/*.js',
		gulp: 'gulpfile.js',
		libs: '!sources/assets/scripts/libs/*'
	}
};







/* html */
gulp.task('includes', function() {
	gulp.src([paths.html.src])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: paths.html.base,
			indent: true
		}))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(livereload());
});


/* styles */
gulp.task('sprites:desktop', function () {
	var spriteData = gulp.src(paths.sprites.desktop.src).pipe(spritesmith({
		imgPath: '/assets/images/sprites.png',
		imgName: 'sprites.png',
		cssName: '_sprites.scss',
		padding: 6,
		cssVarMap: function (sprite) {
			sprite.name = 'sd-' + sprite.name;
		}
	}));

	var imgStream = spriteData.img
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest(paths.sprites.desktop.dest.img));

	var cssStream = spriteData.css
		.pipe(gulp.dest(paths.sprites.desktop.dest.css));

	return merge(imgStream, cssStream).pipe(livereload());
});

gulp.task('sprites:mobile', function () {
	var spriteData = gulp.src(paths.sprites.mobile.src).pipe(spritesmith({
		retinaSrcFilter: paths.sprites.mobile.filter,
		imgPath: '/assets/images/mobile/sprites_mobile.png',
		imgName: 'sprites_mobile.png',
		retinaImgPath: '/assets/images/mobile/sprites_mobile@2x.png',
		retinaImgName: 'sprites_mobile@2x.png',
		cssName: '_sprites_mobile.scss',
		padding: 6,
		cssVarMap: function (sprite) {
			sprite.name = 'sm-' + sprite.name;
		}
	}));

	var imgStream = spriteData.img
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest(paths.sprites.mobile.dest.img));

	var cssStream = spriteData.css
		.pipe(gulp.dest(paths.sprites.mobile.dest.css));

	return merge(imgStream, cssStream).pipe(livereload());
});



gulp.task('sass', function () {
	return gulp.src(paths.scss.src)
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(paths.scss.dest))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'ie 9', 'ie 8'],
			expand: true,
			flatten: true
		}))
		// .pipe(csscomb('config/csscomb.json'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(livereload());
});

gulp.task('csscomb', function() {
	return gulp.src('build/assets/styles/*.css')
		.pipe(csscomb('config/csscomb.json'))
		.pipe(gulp.dest('build/assets/styles/'));
});

/*
gulp.task('autoprefixer', function () {
	return gulp.src(paths.styles.src)
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			expand: true,
			flatten: true
		}))
		.pipe(gulp.dest(paths.styles.dest));
});
*/


/* scripts */
gulp.task('jshint', function() {
  return gulp.src([paths.scripts.gulp, paths.scripts.src, paths.scripts.libs])
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')))
    .pipe(livereload());
});


/* files - clean */
gulp.task('clean:build', function () {
	return gulp.src('build/', {read: false})
	.pipe(clean());
});
gulp.task('clean:release', function () {
	return gulp.src('release/', {read: false})
	.pipe(clean());
});


/* files - copy */
gulp.task('copy:assets', function () {
	return gulp.src(['sources/assets/**', '!**/scss', '!**/scss/**', '!**/psd/**', '!**/sprites', '!**/sprites/**'])
	.pipe(gulp.dest('build/assets/'));
});
gulp.task('copy:scripts', function () {
	return gulp.src([paths.scripts.src, paths.scripts.libs])
	.pipe(gulp.dest('build/assets/scripts/'));
});
gulp.task('copy:styles', function () {
	return gulp.src('sources/assets/styles/*.css')
	.pipe(gulp.dest('build/assets/styles/'));
});
gulp.task('copy:images', function () {
	return gulp.src(['sources/assets/images/**', 'sources/assets/images/mobile/**', '!**/sprites', '!**/sprites/**'])
	.pipe(gulp.dest('build/assets/images/'));
});
gulp.task('copy:release', function () {
	return gulp.src(['build/**/*'])
	.pipe(gulp.dest('release/'));
});



/* watch */
gulp.task('check', function() {
	return gulp.src([paths.scripts.gulp, paths.scripts.src, paths.scripts.libs, 'sources/assets/images/*', ])
		.pipe(livereload());
});

gulp.task('watch', function () {
	livereload.listen();
	gulp.watch(['sources/html/**/*.html'], ['includes']);
	gulp.watch(['sources/assets/styles/scss/*.scss'], ['sass', 'copy:styles']);
	gulp.watch(['sources/assets/styles/*.css'], ['sass', 'copy:styles']);
	gulp.watch([paths.scripts.gulp, paths.scripts.src, paths.scripts.libs], ['copy:scripts']);
	gulp.watch(['sources/assets/images/*'], ['check', 'copy:images']);
	gulp.watch(['sources/assets/images/sprites/*'], ['sprites:desktop', 'copy:images']);
	gulp.watch(['sources/assets/images/mobile/*'], ['check', 'copy:images']);
	gulp.watch(['sources/assets/images/mobile/sprites/*'], ['sprites:mobile', 'copy:images']);
});


/* connect */
gulp.task('connect', function () {
	connect.server({
		root: paths.build,
		port: 9001,
		livereload: true
	});
});



gulp.task('sass-build', ['sprites:desktop', 'sprites:mobile', 'sass'], function() { });
gulp.task('sass-release', ['sprites:desktop', 'sprites:mobile', 'sass'], function() { });
gulp.task('scripts-build', ['jshint'], function() { });
gulp.task('html-build', ['includes'], function() { });

gulp.task('build', ['clean:build'], function() {
	gulp.run(['sass-build', 'scripts-build', 'html-build', 'copy:assets', 'connect', 'watch']);
});
gulp.task('build:mobile', ['clean:build'], function() {
	gulp.run(['sass-build', 'scripts-build', 'html-build', 'copy:assets', 'connect', 'watch']);
});
gulp.task('release', ['clean:release'], function() {
	gulp.run(['sass-release', 'scripts-build', 'html-build', 'copy:assets', 'csscomb', 'copy:release']);
});
gulp.task('release-after', [], function() {
	gulp.run(['csscomb', 'copy:release']);
});

