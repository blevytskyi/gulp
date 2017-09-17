"use strict";

const gulp = require("gulp"),
    sass = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    cssnano = require("gulp-cssnano"),
    browserSync = require("browser-sync").create(),
    imagemin = require("gulp-imagemin"),
    plumber = require("gulp-plumber"),
    notify = require("gulp-notify"),
    cache = require("gulp-cached"),
    del = require("del"),
    jsmin = require('gulp-jsmin'),
    rename = require('gulp-rename'),
    runSequence = require("run-sequence");

gulp.task("serve", ["sass"], function () {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
});
gulp.task('scripts', function () {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/popper.js/dist/umd/popper.js',
        'node_modules/bootstrap/dist/js/bootstrap.js'
    ])
        .pipe(gulp.dest('src/js'));
});
gulp.task("sass", function () {
    return gulp.src("src/style/*.scss")
        .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
        .pipe(sass().on("error", sass.logError))
        .pipe(plumber.stop())
        .pipe(autoprefixer())
        .pipe(gulp.dest("src/style"))
        .pipe(browserSync.stream());
});


// build
gulp.task("build:img", function () {
    gulp.src("src/img/*")
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({plugins: [{removeViewBox: true}]})
        ])))
        .pipe(gulp.dest("build/img"))
});
gulp.task("build:css", function () {
    return gulp.src("src/style/*.css")
        .pipe(gulp.dest("build/style"))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest("build/style"))
});
gulp.task("build:fonts", function () {
    return gulp.src("src/fonts/*")
        .pipe(gulp.dest("build/fonts"));
});
gulp.task("build:js", function () {
    return gulp.src('src/js/**/*.js')
        .pipe(gulp.dest("build/js"))
        .pipe(jsmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('build/js'));
});
gulp.task("build:html", function () {
    return gulp.src("src/*.html")
        .pipe(gulp.dest("build"));
});
gulp.task("clean", function () {
    return del("build");
});

var callback = function () {
};
gulp.task("build", function (callback) {
    runSequence("clean", ["build:css", "build:fonts", "build:js", "build:html", "build:img"], callback);
});
// watch
gulp.task("watch", function () {
    gulp.watch("src/style/**/*.scss", ["sass"]);
    gulp.watch("src/*.html").on("change", browserSync.reload);
    gulp.watch("src/js/*.js").on("change", browserSync.reload);
});

gulp.task("default", ["serve", "watch", "scripts"]);