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
	Route.get('TampilVideo/:page', 'Admin/VideoController.TampilVideo')
	Route.post('UpdateStatus', 'Admin/VideoController.UpdateStatus')
	Route.post('StoreVideo', 'Admin/VideoController.StoreVideo')
	Route.get('EditVideo/:id', 'Admin/VideoController.EditVideo')
	Route.get('delVideo/:id', 'Admin/VideoController.delVideo')
	Route.post('UpdateVideo', 'Admin/VideoController.UpdateVideo')
}).prefix('api/migrasi/admin/video')