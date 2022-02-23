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

	Route.get('index', 'Home/EditorController.index')
	Route.post('store_berita', 'Home/EditorController.store_berita')
	Route.get('upload/:id', 'Home/EditorController.upload')
	Route.post('store_image', 'Home/EditorController.store_image')
	Route.get('hapus_foto/:id', 'Home/EditorController.hapus_foto')
	Route.get('suara', 'Home/EditorController.suara')
	Route.post('store_suara', 'Home/EditorController.store_suara')
	Route.get('edit_suara/:id', 'Home/EditorController.edit_suara')
	Route.post('update_suara', 'Home/EditorController.update_suara')
	Route.get('emiten', 'Home/EditorController.emiten')
	Route.post('store_emiten', 'Home/EditorController.store_emiten')
	Route.get('bursa', 'Home/EditorController.bursa')
	Route.post('store_bursa', 'Home/EditorController.store_bursa')
	Route.get('kolom', 'Home/EditorController.kolom')
	Route.post('store_kolom', 'Home/EditorController.store_kolom')

}).prefix('api/migrasi/editor')