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
	Route.post('login', 'Admin/AdminController.login')


	Route.get('listAdmin/:page', 'Admin/AdminController.listAdmin')	
	Route.get('detailAdmin', 'Admin/AdminController.detailAdmin')	
	Route.get('lastCode', 'Admin/AdminController.lastCode')	
	Route.post('updateStatus', 'Admin/AdminController.updateStatus')	
	Route.post('StoreAdmin', 'Admin/AdminController.StoreAdmin')	
	Route.get('DeleteAdmin/:id', 'Admin/AdminController.DeleteAdmin')

	// ALIF OUTHER
	Route.get('Store-guru/:id/:idg', 'Admin/AdminController.Storeguru')
	Route.get('Del-Detail-Peserta/:id/:idg', 'Admin/AdminController.Deldetailpeserta')
	Route.get('filter', 'Admin/AdminController.filter')
	Route.get('get_peserta', 'Admin/AdminController.get_peserta')

}).prefix('api/migrasi/admin')


