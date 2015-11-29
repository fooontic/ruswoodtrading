'use strict';

/************/
/* Settings */
/************/

/* Gulp plugins */
var gulp = require('gulp'), // Task runner
	watch = require('gulp-watch'), // Watch, that actually is an endless stream
	rename = require("gulp-rename"), // Rename files
	size = require('gulp-size'), // Display the size of something
	del = require('del'), // Delete something
	browserSync = require("browser-sync"), // Synchronised browser testing
	less = require('gulp-less'), // Compile Less to CSS
    path = require('path'),
	sourcemaps = require('gulp-sourcemaps'), // Write source maps
	lessReporter = require('gulp-less-reporter'), // Error reporter for gulp-less
	autoprefixer = require('gulp-autoprefixer'), // Prefix CSS
	csscomb = require('gulp-csscomb'), // Coding style formatter for CSS
    minifycss = require('gulp-minify-css'), // Minify CSS
	jade = require('gulp-jade'), // Compile Jade to HTML
	newer = require('gulp-newer'),
	prettify = require('gulp-prettify'),
	streamqueue = require('streamqueue'), // Pipe queued streams progressively, keeping datas order.
	reload = browserSync.reload,
	imagemin = require('gulp-imagemin'), // Optimize images
    pngquant = require('imagemin-pngquant'), // PNG plugin for ImageMin
	gutil = require('gulp-util'),
	plumber = require('gulp-plumber'), // Report errors from gulp-plugins
	ghPages = require('gulp-gh-pages'), // Publish contents to Github pages
	runSequence = require('run-sequence').use(gulp); // Run a series of dependent gulp tasks in order



/* Path settings */
var projectPath = {
	Build: { // Set build paths
        html: 'build/',
        js: 'build/js/',
        jsMainFile: 'main.js',
        css: 'build/css/',
        img: 'build/img/'
    },
    Src: { // Set source paths
        jade: 'src/jade/**/*.jade',
        jsCustom: 'src/js/custom.js',
        jsVendor: 'src/js/vendor.js',
        style: 'src/less/style.less',
        img: 'src/img/**/*.*'
    },
    Watch: { // Set watch paths
        jade: 'src/jade/**/*.jade',
        js: 'src/js/**/*.js',
        style: 'src/less/**/*.less',
        img: 'src/img/**/*.*'
    },
    clean: ['build/**/*', '!build/.gitignore', '!build/humans.txt'], // Set paths and exludes for cleaning build dir
    ghPages: 'build/**/*' // Set dir that will be uploaded to GitHub Pages
};

/* BrowserSync local web server settings */
var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    injectChanges: true,
    logPrefix: "App Front-End"
};



/*********/
/* Tasks */
/*********/

/* BrowserSync local web server*/
gulp.task('webserver', function () {
    browserSync(config);
});


/* Jade */
gulp.task('jade', function() {
    return gulp.src(projectPath.Src.jade)
        .pipe(plumber(function(error) {
            gutil.log(gutil.colors.red(error.message));
            this.emit('end');
        }))
        .pipe(newer(projectPath.Build.html))
        .pipe(jade({
            pretty: true
        }))
        .pipe(prettify({indent_size: 2}))
        .pipe(gulp.dest(projectPath.Build.html))
        .pipe(reload({stream: true}));
});


/* Less */
gulp.task('less', function() {
    return gulp.src('src/less/style.less')
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .on('error', lessReporter)
        .pipe(autoprefixer('> 2%'))
        .pipe(csscomb())
        .pipe(gulp.dest(projectPath.Build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(size({
            title: 'CSS'
        }))
        .pipe(gulp.dest(projectPath.Build.css))
        .pipe(reload({stream: true}));
});


// /* JavaScript*/
// gulp.task('js', function () {
//     return streamqueue(
//         { objectMode: true },
//         gulp.src(projectPath.src.jsVendor).pipe(rigger()).pipe(size({title: 'Vendor JavaScript'})),
//         gulp.src(projectPath.src.jsCustom).pipe(rigger()).pipe(jshint()).pipe(jshint.reporter(stylish)).pipe(size({title: 'Custom JavaScript'}))
//     )
//         .pipe(concat(projectPath.build.jsMainFile))
//         .pipe(sourcemaps.init())
//         .pipe(gulp.dest(projectPath.build.js))
//         .pipe(rename({ suffix: '.min' }))
//         .pipe(uglify())
//         .pipe(sourcemaps.write('./'))
//         .pipe(size({
//             title: 'Total JavaScript'
//         }))
//         .pipe(gulp.dest(projectPath.build.js))
//         .pipe(reload({stream: true}));
// });


/* Images */
gulp.task('images', function () {
    return gulp.src(projectPath.Src.img)
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 5,
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(size({
            title: 'Images'
        }))
        .pipe(gulp.dest(projectPath.Build.img))
        .pipe(reload({stream: true}));
});


/* Clean build directory */
gulp.task('clean', function (cb) {
    del(projectPath.clean, cb);
});


/* Build */
gulp.task('build', function(callback) {
    runSequence(
        'clean',
        'jade',
        'js',
        'less',
        'images',
        // 'png-sprite',
        // 'svg-sprite',
        // 'svg',
        // 'fonts',
        'gh-pages',
        callback)
});


/* Github Pages */
gulp.task('gh-pages', function() {
    return gulp.src(projectPath.ghPages)
        .pipe(ghPages());
});


/* Watching */
gulp.task('watch',['webserver'], function(){
    watch([projectPath.Watch.jade], function(event, cb) {
        gulp.start('jade');
    });
    watch([projectPath.Watch.js], function(event, cb) {
        gulp.start('js');
    });
    watch([projectPath.Watch.style], function(event, cb) {
        gulp.start('less');
    });
    watch([projectPath.Watch.img], function(event, cb) {
        gulp.start('images');
    });
    // watch([projectPath.Watch.svg], function(event, cb) {
    //     gulp.start('svg');
    // });
    // watch([projectPath.Watch.pngSprite], function(event, cb) {
    //     gulp.start('png-sprite');
    // });
    // watch([projectPath.Watch.svgSprite], function(event, cb) {
    //     gulp.start('svg-sprite');
    // });
    // watch([projectPath.Watch.fonts], function(event, cb) {
    //     gulp.start('fonts');
    // });
});

/* Default */
gulp.task('default', ['watch'], function() {
});