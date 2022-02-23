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

	Route.get('paket_subscribe', 'LanggananController.paket_subscribe')
	Route.get('tambah_paket', 'LanggananController.tambah_paket')
	Route.post('bukti_bayar', 'LanggananController.bukti_bayar')

}).prefix('api/migrasi/langganan').namespace('Home')