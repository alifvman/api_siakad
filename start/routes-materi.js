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
	Route.get('TampilMateri/:page', 'Admin/MateriController.TampilMateri')
	Route.post('TampilMateri/:page', 'Admin/MateriController.TampilMateri')
	Route.post('UpdateStatus', 'Admin/MateriController.UpdateStatus')
	Route.post('StoreMateri', 'Admin/MateriController.StoreMateri')
	Route.get('EditMateri/:id', 'Admin/MateriController.EditMateri')
	Route.post('UpdateMateri', 'Admin/MateriController.UpdateMateri')
}).prefix('api/migrasi/admin/materi')