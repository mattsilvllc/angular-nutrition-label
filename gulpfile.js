var gulp = require('gulp');
var ngAnnotate = require('gulp-ng-annotate');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var stripNgLog = require('gulp-strip-ng-log');

var libFile = 'angular-nutrition-label.js';

//TODO: tests
gulp.task('test', function () {

});

gulp.task('build', ['test'], function () {
  return gulp.src(libFile)
    .pipe(stripNgLog())
    .pipe(ngAnnotate())
    .pipe(rename("angular-nutrition-label.min.js"))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['build'], function () {

});
