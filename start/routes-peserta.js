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
	Route.get('ListPeserta', 'Admin/PesertaController.ListPeserta')
	Route.get('DetailPeserta/:id', 'Admin/PesertaController.DetailPeserta')
	Route.post('UpdatePeserta', 'Admin/PesertaController.UpdatePeserta')
	Route.get('DeletePeserta/:id', 'Admin/PesertaController.DeletePeserta')
	Route.get('UpdateStatus/:status/:uid', 'Admin/PesertaController.UpdateStatus')	
	Route.get('LogPeserta/:uid', 'Admin/PesertaController.LogPeserta')	

}).prefix('api/migrasi/admin/peserta')