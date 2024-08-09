import browserSync from 'browser-sync';
import { dest, parallel, series, src, watch } from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import clean from 'gulp-clean';
import concat from 'gulp-concat';
import gulpInclude from 'gulp-include';
import gulpSass from 'gulp-sass';
import uglify from 'gulp-uglify-es';
import * as sass from 'sass';

// Инициализация BrowserSync и Sass
const bs = browserSync.create();
const scss = gulpSass(sass);

export function htmlIncludePages() {
	return src(['app/pages/**/*.html', 'app/*.html'])
		.pipe(
			gulpInclude({
				includePaths: ['app/components'],
			})
		)
		.pipe(dest('dist/pages'))
		.pipe(bs.stream());
}

export function htmlIncludeMain() {
	return src(['app/*.html'])
		.pipe(
			gulpInclude({
				includePaths: ['app/components'],
			})
		)
		.pipe(dest('dist/'))
		.pipe(bs.stream());
}

export function styles() {
	return src('app/scss/*.scss')
		.pipe(scss({ outputStyle: 'compressed' })) // Компиляция SCSS
		.pipe(autoprefixer({ overrideBrowserslist: ['last 5 versions'] })) // Применение автопрефиксов
		.pipe(concat('styles.min.css')) // Объединение файлов в один
		.pipe(dest('dist/css'))
		.pipe(bs.stream());
}

export function scripts() {
	return src(['app/js/*.js', '!app/js/main.min.js'])
		.pipe(concat('main.min.js'))
		.pipe(uglify.default())
		.pipe(dest('dist/js')) // Сохранение скриптов в dist/js
		.pipe(bs.stream());
}
export function watching() {
	bs.init({
		server: {
			baseDir: 'dist/',
		},
	});
	watch(['app/scss/*.scss', 'app/scss/**/*.scss'], styles);
	watch(['app/js/*.js', '!app/js/main.min.js'], scripts);
	watch(['app/components/**/*.html', 'app/pages/**/*.html'], htmlIncludePages);
	watch(['app/*.html'], htmlIncludeMain);

	watch('app/*.html').on('change', bs.reload);
	watch('app/**/*.html').on('change', bs.reload);
}

export function cleanDist() {
	return src('dist', { allowEmpty: true }).pipe(clean());
}

export function building() {
	return src(['dist/css/styles.min.css', 'dist/js/main.min.js'], {
		base: 'dist', // Используем 'dist' как базовый путь
	}).pipe(dest('dist'));
}

export const pages = htmlIncludePages;
export const main = htmlIncludeMain;

export const build = series(
	cleanDist,
	parallel(htmlIncludePages, htmlIncludeMain, styles, scripts),
	building
);
export default parallel(styles, scripts, pages, main, watching);
