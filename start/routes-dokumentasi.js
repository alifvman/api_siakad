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
	Route.get('TampilDokumentasi/:page', 'Admin/DokumentasiController.TampilDokumentasi')
	Route.post('UpdateStatus', 'Admin/DokumentasiController.UpdateStatus')
	Route.post('StoreDokumentasi', 'Admin/DokumentasiController.StoreDokumentasi')
	Route.get('EditDokumentasi/:id', 'Admin/DokumentasiController.EditDokumentasi')
	Route.post('UpdateDokumentasi', 'Admin/DokumentasiController.UpdateDokumentasi')
}).prefix('api/migrasi/admin/dokumentasi')