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
	Route.get('ListDetail/:table', 'Admin/PelajaranDetailController.ListDetail')	
	Route.get('MateriPelajaran', 'Admin/PelajaranDetailController.MateriPelajaran')	
	Route.get('JenisUjian', 'Admin/PelajaranDetailController.JenisUjian')	
	Route.get('Kelas', 'Admin/PelajaranDetailController.Kelas')	
	Route.post('SoalLatihan/:page', 'Admin/PelajaranDetailController.SoalLatihan')	
	Route.post('DeleteSoalLatihan', 'Admin/PelajaranDetailController.DeleteSoalLatihan')	
	Route.post('DetailTambahSoal', 'Admin/PelajaranDetailController.DetailTambahSoal')	
}).prefix('api/migrasi/admin/pelajaran/detail')