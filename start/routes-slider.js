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
	
	Route.get('slide/:page', 'Admin/SlideerController.slide')
	Route.post('updatestatus', 'Admin/SlideerController.updatestatus')
	Route.get('editSlider/:id', 'Admin/SlideerController.editSlider')
 	Route.post('store_slider', 'Admin/SlideerController.store_slider')
 	Route.get('edit_slider', 'Admin/SlideerController.edit_slider')
 	Route.post('update_slider', 'Admin/SlideerController.update_slider')

}).prefix('api/migrasi/admin/slider')