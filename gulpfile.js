'use strict';

const argv = require('yargs').argv;
const gulp = require('gulp');
gulp.plugins = require('gulp-load-plugins')();
const gutil = require('gulp-util');

const fs = require('fs-extra');

const bowerJson = require(__dirname + '/bower.json');
const name = bowerJson['name'];
const libFile = `./src/${name}.js`;

gulp.task('clean', function () {
  fs.removeSync(`./${name}.js`);
  fs.removeSync(`./${name}.min.js`);
});

gulp.task('setVersion', function () {
  let version = argv.version;
  if (!version) {
    console.error('--version=x.x.x param is required');
    process.exit(1);
    return;
  }

  ['bower.json', 'package.json'].forEach(file => {
    file = __dirname + '/' + file;
    fs.writeFileSync(
      file,
      fs.readFileSync(file)
        .toString()
        .replace(/"version":\s*"[\d.]+?"/, `"version": "${version}"`)
    );
  });

  fs.writeFileSync(
    libFile,
    fs.readFileSync(libFile)
      .toString()
      .replace(/@version\s+[^\s\n]+/, `@version ${version}`)
  );
});

gulp.task('build.es5.js', ['clean'], function () {
  return gulp.src(`./src/${name}.js`)
    .pipe(gulp.plugins.babel({presets: ['es2015']}))
    .pipe(gulp.plugins.ngAnnotate())
    .pipe(gulp.dest(__dirname + '/'));
});

gulp.task('build.min.js', ['build.es5.js'], function () {
  return gulp.src(`./${name}.js`)
    .pipe(gulp.plugins.stripNgLog())
    .pipe(gulp.plugins.rename(`${name}.min.js`))
    .pipe(gulp.plugins.uglify())
    .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
    .pipe(gulp.dest('./'));
});


gulp.task('default', ['build.min.js'], function () {

});


//TODO: tests
gulp.task('test', function () {

});
