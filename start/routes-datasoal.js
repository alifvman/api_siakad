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
	Route.get('MateriPelajaran', 'Admin/DataSoalController.MateriPelajaran')
	Route.get('MateriPelajaranId/:id', 'Admin/DataSoalController.MateriPelajaranId')
	Route.get('JenisUjian', 'Admin/DataSoalController.JenisUjian')
	Route.get('JenisUjianId/:id', 'Admin/DataSoalController.JenisUjianId')
	Route.get('Kelas', 'Admin/DataSoalController.Kelas')
	Route.get('KelasId/:id', 'Admin/DataSoalController.KelasId')
	Route.post('DataSoal', 'Admin/DataSoalController.DataSoal')
	Route.get('HapusSoal/:table/:kd', 'Admin/DataSoalController.HapusSoal')
	Route.post('allSoal', 'Admin/DataSoalController.allSoal')
	Route.post('DeleteSoal', 'Admin/DataSoalController.DeleteSoal')
	Route.post('tambahSoal', 'Admin/DataSoalController.tambahSoal')
}).prefix('api/migrasi/admin/data/soal')
