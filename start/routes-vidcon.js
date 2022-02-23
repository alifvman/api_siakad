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
	Route.get('TampilJadwal', 'Admin/VidconController.TampilJadwal')
	Route.get('Get_Guru', 'Admin/VidconController.Get_Guru')
	Route.get('get_siswa', 'Admin/VidconController.get_siswa')
	Route.get('Get_kelas', 'Admin/VidconController.Get_kelas')
	Route.get('Get_jenis_ujian', 'Admin/VidconController.Get_jenis_ujian')
	Route.post('store_vidcon', 'Admin/VidconController.store_vidcon')
	Route.get('list_peserta', 'Admin/VidconController.list_peserta')
	Route.get('add_peserta', 'Admin/VidconController.add_peserta')
	Route.get('remove_peserta', 'Admin/VidconController.remove_peserta')
	Route.get('del_vidcon', 'Admin/VidconController.del_vidcon')
	Route.get('edit_vidcon', 'Admin/VidconController.edit_vidcon')
	Route.post('update_vidcon', 'Admin/VidconController.update_vidcon')
	
}).prefix('api/migrasi/admin/vidcon')