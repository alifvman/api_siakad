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
	Route.get('TampilPeraturan/:page', 'Admin/PeraturanController.TampilPeraturan')
	Route.post('TampilMateri/:page', 'Admin/PeraturanController.TampilMateri')
	Route.post('UpdateStatus', 'Admin/PeraturanController.UpdateStatus')
	Route.post('StorePeraturan', 'Admin/PeraturanController.StorePeraturan')
	Route.get('EditPeraturan/:id', 'Admin/PeraturanController.EditPeraturan')
	Route.post('UpdatePeraturan', 'Admin/PeraturanController.UpdatePeraturan')
}).prefix('api/migrasi/admin/peraturan')