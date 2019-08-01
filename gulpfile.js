'use strict';

const argv = require('yargs').version(false).argv;
const gulp = require('gulp');
gulp.plugins = require('gulp-load-plugins')();

const fs = require('fs-extra');

const bowerJson = require(__dirname + '/bower.json');
const name = bowerJson['name'];
const libFile = `./src/${name}.js`;

gulp.task('clean', function (done) {
  fs.removeSync(`./${name}.js`);
  fs.removeSync(`./${name}.min.js`);
  done();
});

gulp.task('setVersion', function (done) {
  let version = argv.version;

  if (!version) {
    throw new Error('--version=x.x.x param is required');
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

  done();
});

gulp.task('build.es5.js', gulp.series('clean', function () {
  return gulp.src(`./src/${name}.js`)
    .pipe(gulp.plugins.babel({presets: ['@babel/preset-env']}))
    .pipe(gulp.plugins.ngAnnotate())
    .pipe(gulp.dest(__dirname + '/'));
}));

gulp.task('build.min.js', gulp.series('build.es5.js', function () {
  return gulp.src(`./${name}.js`)
    .pipe(gulp.plugins.replace(/[ \t]*\$log\..*?[\n;]/g, ''))
    .pipe(gulp.plugins.rename(`${name}.min.js`))
    .pipe(gulp.plugins.uglify())
    .on('error', (err) => console.error('[Error]', err.toString()))
    .pipe(gulp.dest('./'));
}));


gulp.task('default', gulp.series('build.min.js', (done) => done()));


//TODO: tests
gulp.task('test', function (done) {
  done();
});
