const gulp = require("gulp");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
const imagemin = require("gulp-imagemin");
const RevAll = require("gulp-rev-all");
const babel = require("gulp-babel");
const gulpIf = require("gulp-if");
const del = require("del");
const uglify = require("gulp-uglify");
// const minifyCss = require("gulp-clean-css");
const htmlmin = require("gulp-htmlmin");
const connect = require("gulp-connect");
const revdel = require("gulp-rev-delete-original");
const browserify = require("gulp-browserify");

gulp.task("server", (done) => {
  connect.server({
    root: "dist",
    livereload: true,
    port: 9090,
  });
  done();
});

gulp.task("clean", function () {
  return del(["dist"]);
});

gulp.task("html", function () {
  return gulp
    .src("src/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest("dist"))
    .pipe(connect.reload());
});

gulp.task("css", function () {
  return gulp
    .src(["src/css/*.css", "src/lib/css/**/*.css"])
    .pipe(postcss([tailwindcss("./tailwind.config.js"), autoprefixer()]))
    .pipe(gulp.dest("dist/css"))
    .pipe(connect.reload());
});

gulp.task("js", function () {
  return gulp
    .src(["src/js/**/*.js", "src/lib/js/**/*.js"])
    .pipe(
      babel({
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-transform-runtime"],
      })
    )
    .pipe(browserify())
    .pipe(gulp.dest("dist/js"))
    .pipe(connect.reload());
});

gulp.task("images", function () {
  return gulp
    .src("src/images/**/*.+(png|jpg|jpeg|gif|svg)")
    .pipe(gulp.dest("dist/images"));
});

let isImage = function (file) {
  if (file.history[0].match(/\.jpg|\.jpeg|\.png/i)) {
    return true;
  } else {
    return false;
  }
};

gulp.task("hash", (done) => {
  gulp
    .src("dist/**")
    .pipe(gulpIf("*.js", uglify()))
    .pipe(gulpIf(isImage, imagemin()))
    .pipe(
      RevAll.revision({
        dontRenameFile: [/\.html$/],
      })
    )
    .pipe(
      revdel({
        exclude: function (file) {
          if (/\.html$/.test(file.name)) {
            return true;
          }
        },
      })
    )
    .pipe(gulp.dest("dist"));

  done();
});

gulp.task("watch", (done) => {
  gulp.watch("src/css/**/*.css", gulp.series("css"));
  gulp.watch("src/*.html", gulp.series("html"));
  gulp.watch("src/js/**/*.js", gulp.series("js"));
  gulp.watch("src/images/**/*", gulp.series("images"));

  done();
});

gulp.task(
  "init",
  gulp.series("clean", gulp.parallel("css", "html", "js", "images"))
);

gulp.task("default", gulp.series("init", "server", "watch"));

gulp.task("build", gulp.series("hash"));
