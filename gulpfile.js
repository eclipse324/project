const gulp = require('gulp');
const scss = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const nodemon = require('gulp-nodemon');
const concat = require('gulp-concat');
const fileinclude = require('gulp-file-include');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync');

// 소스 파일 경로 
var PATH = {
    INDEX: './src',
    HTML: './src/html',
    ASSETS: {
        FONTS: './src/assets/font',
        IMAGES: './src/assets/images',
        STYLE: './src/assets/scss',
        SCRIPT: './src/assets/js',
        LIB: './src/assets/lib',
    }
};

// 산출물 경로 
var DEST_PATH = {
    INDEX: './dist',
    HTML: './dist/html',
    ASSETS: {
        FONTS: './dist/assets/font',
        IMAGES: './dist/assets/images',
        STYLE: './dist/assets/css',
        SCRIPT: './dist/assets/js',
        LIB: './dist/assets/lib',
    }
};

gulp.task('scss:compile', () => {
    return new Promise(resolve => {
        var options = {
            outputStyle: "nested", // nested, expanded, compact, compressed 
            indentType: "space", // space, tab
            indentWidth: 4,
            precision: 8,
            sourceComments: true // 코멘트 제거 여부 
        };
        gulp.src(PATH.ASSETS.STYLE + '/*.scss')
            .pipe(sourcemaps.init())
            .pipe(scss(options))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(DEST_PATH.ASSETS.STYLE))
            .pipe(browserSync.reload({
                stream: true
            }));

        resolve();
    });
});

gulp.task('fileinclude', () => {
    return new Promise(resolve => {
        gulp.src(PATH.INDEX + '/*.html')
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))

        gulp.src(PATH.HTML + '/**/*.html')
            .pipe(fileinclude({
                prefix: '@@',
                basepath: '@file'
            }))
        resolve();
    });
});

gulp.task('html', () => {
    return new Promise(resolve => {
        gulp.src(PATH.INDEX + '/*.html')
            .pipe(gulp.dest(DEST_PATH.INDEX))
            .pipe(browserSync.reload({
                stream: true
            }));

        gulp.src(PATH.HTML + '/**/*.html')
            .pipe(gulp.dest(DEST_PATH.HTML))
            .pipe(browserSync.reload({
                stream: true
            }));

        resolve();
    });
});

gulp.task('script:concat', () => {
    return new Promise(resolve => {
        gulp.src(PATH.ASSETS.SCRIPT + '/common/*.js') // src 경로에 있는 모든 js 파일을 common.js 라는 이름의 파일로 합친다. 
            .pipe(concat('common.js'))
            .pipe(gulp.dest(DEST_PATH.ASSETS.SCRIPT))
            .pipe(browserSync.reload({
                stream: true
            }));

        resolve();
    })
});

gulp.task('library', () => {
    return new Promise(resolve => {
        gulp.src(PATH.ASSETS.LIB + '/*.js')
            .pipe(gulp.dest(DEST_PATH.ASSETS.LIB))
            .pipe(browserSync.reload({
                stream: true
            }));

        resolve();
    });
});

gulp.task('imagemin', () => {
    return new Promise(resolve => {
        gulp.src(PATH.ASSETS.IMAGES + '/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES))
        .pipe(browserSync.reload({stream: true}));

        resolve();
    });
});


gulp.task('nodemon:start', () => {
    return new Promise(resolve => {
        nodemon({
            script: 'app.js',
            watch: 'app'
        });

        resolve();
    })
});

gulp.task('watch', () => {
    return new Promise(resolve => {
        gulp.watch(PATH.INDEX + "/**/*.html", gulp.series(['html']));
        gulp.watch(PATH.ASSETS.STYLE + "/**/*.scss", gulp.series(['scss:compile']));
        gulp.watch(PATH.ASSETS.SCRIPT + "/**/*.js", gulp.series(['script:concat']));
        gulp.watch(PATH.ASSETS.IMAGES + "/**/*.*", gulp.series(['imagemin']));

        resolve();
    });
});

gulp.task('browserSync', () => {
    return new Promise(resolve => {
        browserSync.init(null, {
            proxy: 'http://localhost:3000',
            port: 8006
        });

        resolve();
    });
});

gulp.task('clean', () => {
    return new Promise(resolve => {
        del.sync(DEST_PATH.HTML);

        resolve();
    });
});

var allSeries = gulp.series([
    'clean',
    'scss:compile',
    'fileinclude',
    'html',
    'script:concat',
    'library',
    'imagemin',
    //    'fonts',
    'library',
    'nodemon:start',
    'browserSync',
    'watch'
]);

gulp.task('default', allSeries);