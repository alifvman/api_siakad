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
	Route.get('ListPelajaran/:page', 'Admin/PelajaranController.ListPelajaran')
	Route.post('UpdateStatus', 'Admin/PelajaranController.UpdateStatus')
	Route.get('EditPelajaran/:id', 'Admin/PelajaranController.EditPelajaran')
	Route.get('lastCode', 'Admin/PelajaranController.lastCode')
	Route.post('StorePelajaran', 'Admin/PelajaranController.StorePelajaran')
	Route.post('UpdatePelajaran', 'Admin/PelajaranController.UpdatePelajaran')
	
}).prefix('api/migrasi/admin/pelajaran')