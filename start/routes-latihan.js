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

Route.group(() => {
	Route.post('CekLatihan', 'Home/LatihanController.CekLatihan')
	Route.post('CekTryout', 'Home/LatihanController.CekTryout')
	Route.post('DataSoalLatihan', 'Home/LatihanController.DataSoalLatihan')
	Route.post('storejawaban', 'Home/LatihanController.storejawaban')
	Route.post('hitungHasil', 'Home/LatihanController.hitungHasil')

	// ALIF VIDCON PESERTA
	Route.get('list_link', 'Home/LatihanController.list_link')
	Route.get('update_vidcon', 'Home/LatihanController.update_vidcon')

}).prefix('api/migrasi/home/latihan')


Route.group(() => {
	Route.post('CekLatihan', 'Home/LatihanMobileController.CekLatihan')
	Route.post('DataSoalLatihan', 'Home/LatihanMobileController.DataSoalLatihan')
	Route.post('storejawaban', 'Home/LatihanMobileController.storejawaban')
	Route.post('hitungHasil', 'Home/LatihanMobileController.hitungHasil')
}).prefix('api/migrasi/home/latihan/mobile')

