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
	Route.get('tampil', 'Admin/HalamanDepanController.HalamanDepanTampil')	
	Route.get('TampilId/:id', 'Admin/HalamanDepanController.HalamanDepanId')	
	Route.post('update', 'Admin/HalamanDepanController.UpdateHalamanDepan')	
	Route.post('insert', 'Admin/HalamanDepanController.InsertHalamanDepan')	
	Route.get('delete/:id', 'Admin/HalamanDepanController.DeleteHalamanDepan')	

	Route.get('update_foto', 'Admin/HalamanDepanController.update_foto')

	Route.get('youtube', 'Admin/HalamanDepanController.youtube')	
	Route.post('StoreYoutube', 'Admin/HalamanDepanController.StoreYoutube')
	Route.get('StatusYoutube', 'Admin/HalamanDepanController.StatusYoutube')
	Route.get('EditYoutube/:id', 'Admin/HalamanDepanController.EditYoutube')
	Route.post('UpdateYoutube', 'Admin/HalamanDepanController.UpdateYoutube')
	Route.get('DeleteYoutube/:id', 'Admin/HalamanDepanController.DeleteYoutube')

}).prefix('api/migrasi/admin/halaman/depan')


