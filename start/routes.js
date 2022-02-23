'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')
require('./routes-admin')
require('./routes-slider')
require('./routes-peserta')
require('./routes-pelajaran')
require('./routes-pelajarandetail')
require('./routes-banksoal')
require('./routes-informasi')
require('./routes-materi')
require('./routes-peraturan')
require('./routes-dokumentasi')
require('./routes-video')
require('./routes-berita')
require('./routes-agreement')
require('./routes-halamandepan')
require('./routes-Btamu')
require('./routes-hasilujian')
require('./routes-hasiltryout')
require('./routes-latihan')
require('./routes-datasoal')
require('./routes-koor')
require('./routes-vidcon')
require('./routes-langganan')
require('./routes-editor')



Route.group(() => {
	Route.get('InfoPeserta/:id', 'Home/HomeController.InfoPeserta')
	Route.get('slider', 'Home/HomeController.slider')
	Route.get('info', 'Home/HomeController.info')
	Route.get('slider_berita', 'Home/HomeController.slider_berita')
	Route.get('saham', 'Home/HomeController.saham')
	Route.get('text_agreement', 'Home/HomeController.text_agreement')
	Route.get('artikel', 'Home/HomeController.artikel')
	Route.get('kolom', 'Home/HomeController.kolom')
	Route.get('youtube', 'Home/HomeController.youtube')

	Route.get('materi/:id', 'Home/HomeController.materi')
	Route.get('data_materi', 'Home/HomeController.data_materi')
	Route.get('peraturan/:id', 'Home/HomeController.peraturan')
	Route.get('dokumentasi/:id', 'Home/HomeController.dokumentasi')
	Route.get('video/:id', 'Home/HomeController.video')
	Route.get('berita/:id', 'Home/HomeController.berita')
	Route.get('mobile/berita/:id', 'Home/HomeController.beritaMobile')
	Route.post('mobile/Latihan', 'Home/HomeController.LatihanMobile')
	Route.get('subscriber', 'Home/HomeController.subscriber')
	Route.get('cekusername', 'Home/HomeController.cekusername')
	Route.get('submit_materi', 'Home/HomeController.submit_materi')
	Route.get('close_Read', 'Home/HomeController.close_Read')
	Route.get('question', 'Home/HomeController.question')

	Route.get('list_suara', 'Home/HomeController.list_suara')
	Route.get('list_kolom', 'Home/HomeController.list_kolom')

	Route.get('baru/:id', 'Home/HomeController.baru')
	
}).prefix('api/migrasi/home')


Route.group(() => {
	Route.post('Registrasi', 'Home/LoginController.Registrasi')
	Route.post('login_api', 'Home/LoginController.login_api')
	Route.post('waktuLogin', 'Home/LoginController.waktuLogin')
	Route.post('logOut', 'Home/LoginController.logOut')
	Route.post('registrasi_berita', 'Home/LoginController.registrasi_berita')
	Route.get('get_paket', 'Home/LoginController.get_paket')
	Route.post('login_berita_api', 'Home/LoginController.login_berita_api')
}).prefix('api/migrasi/login')

Route.group(() => {
	Route.get('HasilUjian/:id', 'Home/ReportController.HasilUjian')
	Route.get('HasilUjianMobile/:id/:page', 'Home/ReportController.HasilUjianMobile')
	Route.get('AnalisaHasil/:id', 'Home/ReportController.AnalisaHasil')
	Route.get('AnalisaHasilPelajaran/:id', 'Home/ReportController.AnalisaHasilPelajaran')
	Route.post('AnalisaHasilPelajaranTable', 'Home/ReportController.AnalisaHasilPelajaranTable')

	// ALIF OUTHER
	Route.get('AnalisaRata/:id', 'Home/ReportController.AnalisaRata')
	Route.get('HasilUjianKoor/:id', 'Home/ReportController.HasilUjianKoor')
	Route.get('SiswaAnalis/:id', 'Home/ReportController.SiswaAnalis')
	Route.get('summary_all/:id', 'Home/ReportController.summary_all')
	Route.get('peserta_summary_all/:id', 'Home/ReportController.peserta_summary_all')
	Route.get('SummaryPertryout', 'Home/ReportController.SummaryPertryout')
	Route.get('Pel_SummaryPertryout/:id', 'Home/ReportController.Pel_SummaryPertryout')

	Route.get('mobile/analis/jenis-ujian', 'Home/ReportController.MobileAnalisJenisUjian')
	Route.get('mobile/analis/ujian', 'Home/ReportController.MobileAnalisUjian')


}).prefix('api/migrasi/report')
