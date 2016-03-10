'use strict';

var gulp = require('gulp');
var stylus = require( 'gulp-stylus' );
var nib = require( 'nib' );
var csso = require('gulp-csso');
var browserify = require('browserify');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var bs = require('browser-sync').create();
var del = require('del');

gulp.task('clean', function(done){
    del.sync('./dist/', {force: true});
    return done();
});

gulp.task('styles', function(){
    return gulp.src('./src/css/index.styl')
        .pipe(stylus())
        .pipe(csso())
        .pipe(gulp.dest('./dist/css/'))
        .pipe(bs.stream());
});

gulp.task('scripts', function(){
    var bundler = browserify('./src/js/index.js', {
        debug: true,
        cache: {}
    });
    var rebundle = function() {
        return bundler.bundle()
            .pipe(source('main.build.js'))
            .pipe(buffer()) // do we need this?
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(streamify(uglify()))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist/js/'))
            .pipe(bs.stream());
    };
    bundler.on('update', rebundle);
    return rebundle();
});

gulp.task('static', function(){
    return gulp.src('./src/static/**/*')
        .pipe(gulp.dest('./dist/'))
        .pipe(bs.stream());
});

gulp.task('watch', function(){
    bs.init({
        server: {
            baseDir: './dist/'
        },
        port: 8000,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
    gulp.watch('./src/css/**/*', gulp.series( 'styles' ));
    gulp.watch('./src/js/**/*', gulp.series( 'scripts' ));
    gulp.watch('./src/static/**/*', gulp.series( 'static' ));
});

gulp.task('default', gulp.series( 'clean', 'styles', 'scripts', 'static', 'watch' ));