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
	Route.get('MataPelajaran', 'Admin/BanksoalController.MataPelajaran')
	Route.post('ListSoal/:page', 'Admin/BanksoalController.ListSoal')
	Route.post('StoreSoal', 'Admin/BanksoalController.StoreSoal')
	Route.get('EditSoal/:id', 'Admin/BanksoalController.EditSoal')
	Route.get('delete/:id', 'Admin/BanksoalController.DeleteSoal')
	Route.post('UpdateSoal', 'Admin/BanksoalController.UpdateSoal')
}).prefix('api/migrasi/admin/bank/soal')