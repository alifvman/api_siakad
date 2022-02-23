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
	Route.get('TampilInformasi/:id', 'Admin/InformasiController.TampilInformasi')
	Route.post('StoreInformasi', 'Admin/InformasiController.StoreInformasi')
	Route.get('EditInformasi/:id', 'Admin/InformasiController.EditInformasi')
	Route.post('UpdateInformasi', 'Admin/InformasiController.UpdateInformasi')
	Route.get('DeleteInformasi/:id', 'Admin/InformasiController.DeleteInformasi')
}).prefix('api/migrasi/admin/informasi')


