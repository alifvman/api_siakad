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
	Route.get('BeritaTampil/:page', 'Admin/BeritaController.BeritaTampil')
	Route.get('BeritaView/:id', 'Admin/BeritaController.BeritaView')
	Route.get('Category', 'Admin/BeritaController.Category')
	Route.get('TambahAkses/:id', 'Admin/BeritaController.TambahAkses')

	Route.get('pelanggan', 'Admin/BeritaController.pelanggan')
	Route.get('list_transaksi', 'Admin/BeritaController.list_transaksi')
	Route.get('edit_transaksi', 'Admin/BeritaController.edit_transaksi')
	Route.get('Update_transaksi', 'Admin/BeritaController.Update_transaksi')
	Route.get('paket_berita', 'Admin/BeritaController.paket_berita')
	Route.get('get_paket', 'Admin/BeritaController.get_paket')
	Route.get('store_paket', 'Admin/BeritaController.store_paket')
	Route.get('get_kategori', 'Admin/BeritaController.get_kategori')
	Route.get('edit_paket', 'Admin/BeritaController.edit_paket')
	Route.get('update_paket', 'Admin/BeritaController.update_paket')
	Route.post('bukti_bayar', 'Admin/BeritaController.bukti_bayar')
	Route.get('detail_langganan', 'Admin/BeritaController.detail_langganan')
	Route.get('set_status_aktif', 'Admin/BeritaController.set_status_aktif')

	Route.get('get_saham', 'Admin/BeritaController.get_saham')
	Route.get('store_saham', 'Admin/BeritaController.store_saham')
	Route.get('edit_saham', 'Admin/BeritaController.edit_saham')
	Route.get('update_saham', 'Admin/BeritaController.update_saham')

	Route.post('UpdateStatus', 'Admin/VideoController.UpdateStatus')
	Route.post('StoreVideo', 'Admin/VideoController.StoreVideo')
	Route.get('EditVideo/:id', 'Admin/VideoController.EditVideo')
	Route.post('UpdateVideo', 'Admin/VideoController.UpdateDokumentasi')

	Route.get('formeditor', 'Admin/EditorController.formeditor')
	Route.post('store_editor', 'Admin/EditorController.store_editor')
	Route.get('statusaktif', 'Admin/EditorController.statusaktif')
	Route.get('edit_editor', 'Admin/EditorController.edit_editor')
	Route.post('update_editor', 'Admin/EditorController.update_editor')
	Route.get('delete_editor', 'Admin/EditorController.delete_editor')
	Route.get('berita_editor', 'Admin/EditorController.berita_editor')
	Route.get('status_editor_berita', 'Admin/EditorController.status_editor_berita')

	Route.get('suara', 'Admin/EditorController.suara')
	Route.get('emiten', 'Admin/EditorController.emiten')
	Route.get('bursa', 'Admin/EditorController.bursa')
	Route.get('kolom', 'Admin/EditorController.kolom')

	Route.get('list_foto/:id', 'Admin/EditorController.list_foto')
	Route.get('foto', 'Admin/EditorController.foto')

}).prefix('api/migrasi/admin/berita')