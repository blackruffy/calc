var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var mocha = require('gulp-mocha');

gulp.task('browserify', function(){
  browserify({
    entries: ['src/main.js']
  })
  .bundle()
  .pipe(source('main.js'))
  .pipe(gulp.dest('webapp/js/'));
});

gulp.task('mocha', function() {
  return gulp.src(['test/*.js'], {read: false})
    .pipe(mocha({ reporter: 'spec'}))
});
