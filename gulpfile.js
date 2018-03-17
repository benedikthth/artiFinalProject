/*
"use strict"

const gulp = require('gulp'),
      babelify = require('babelify'),
      browserify = require('browserify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer'),
      watchify = require('watchify'),
      rename = require('gulp-rename'),
      gutil = require('gulp-util');


const config = {
        src: './src/index.js',
        dest: './html/'
      };

let bundle = (bundler) => {
  bundler
    .bundle()
    .pipe(source('bundled-app.js'))
    .pipe(buffer())
    .pipe(rename('bundle.js'))
    .pipe(gulp.dest(config.dest))
    .on('end', () => gutil.log(gutil.colors.green('==> Successful Bundle!')));
}

gulp.task('default', () => {

  let bundler = browserify(config.src, {debug: true})
                  .plugin(watchify)
                  .transform(babelify);

  bundle(bundler);

  bundler.on('update', () => bundle(bundler));
});
*/

/*const gulp = require('gulp'),
      babel = require('gulp-babel'),
      concat = require('gulp-concat'),
      jasmine = require('gulp-jasmine'),
      sourcemaps = require('gulp-sourcemaps');

gulp.task('babel-js', () => {
  return gulp.src('src/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', () => {
  gulp.watch('src/*.js', ['babel-js']);
});

gulp.task('default', ['babel-js', 'watch' ]);
*/



var gulp = require('gulp'),
    //babel = require('babel-core/register'),
    concat = require('gulp-concat');

gulp.task('concat', ()=>{
  gulp.src('src/*.js')
  .pipe(concat('bundle.js'))
  .pipe(gulp.dest('html/'));
});

gulp.task('watch', ()=>{
  gulp.watch('src/*.js', ['concat']);
});


gulp.task('default', ['watch']);
