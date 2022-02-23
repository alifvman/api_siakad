'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment')
const Mail = use('Mail')

class LoginController {

	async login_api({ request, response }) {
		const Inputs = request.only(['username', 'password', 'WaktuMulai', 'WaktuEnd' , 'ip'])

		const cek = await Database.raw(`
		SELECT 'peserta' as stt, uid, nama, noinduk, kelas, jenis_ujian,statusaktif
		FROM peserta
		WHERE userid='${Inputs.username}'
		union select 'koordinator' as stt, idg as uid, namag as nama, '' as noinduk, '' as kelas, '' as jenis_ujian, statusaktif
		FROM guru
		WHERE userg='${Inputs.username}' and access = 'Koordinator'
		limit 1
		`);

		if (!cek[0][0]) {

			return response.json({
				status: 201,
				data: 'Akun Belum Terdaftar',
				count: [],
			})

		} else if (cek[0][0].statusaktif == 'YES') {

			const login = await Database.raw(`
				SELECT 'peserta' as stt, uid, nama, noinduk, kelas, jenis_ujian 
				FROM peserta 
				WHERE userid='${Inputs.username}' 
				AND PASSWORD= '${Inputs.password}'  
				AND statusaktif = 'YES' 
				union select 'koordinator' as stt, 
				idg as uid, 
				namag as nama,
				'' as noinduk,
				'' as kelas,
				'' as jenis_ujian 
				FROM guru 
				WHERE userg='${Inputs.username}' 
				AND passg= '${Inputs.password}' 
				AND access = 'Koordinator' 
				limit 1
			`);

			if (login[0].length > 0) {

				const waktu = await Database
					.table('waktu')
					.insert({
						uid 		: login[0][0].uid,
						start_time 	: Inputs.WaktuMulai,
						ip 			: Inputs.ip,
						end_time 	: Inputs.WaktuEnd,
						waktu 		: '0 jam, 15 menit, 0 detik',
						jam 		: 0,
						menit 		: 15,
						detik 		: 0,
					})
					.returning('id')

				return response.json({
					status: 200,
					data: login[0][0],
					count: login[0].length,
					id_waktu: waktu[0]
				})
			} else {
				return response.json({
					status: 500,
					data: 'Username Dan Password Salah',
					count: login[0].length
				})
			}
		} else {
			return response.json({
				status: 204,
				data: 'Akun Belum Di Aktifkan',
				count: 0
			})
		}
	}


	async Registrasi({ request, response }) {
		const Inputs = request.only(['nama', 'kelamin', 'institusi', 'alamat', 'tgl', 'statusaktif', 'telepon', 'email', 'jenis', 'kelas', 'kelas_temp', 'userid', 'password', 'passworddec', 'verification'])

		try {
			const cek = await Database
				.table('peserta')
				.where('userid', Inputs.userid)
				.first()
				.count()

			const uid = await Database
				.table('peserta')
				.first()
				.count()

			let kode = uid['count(*)'] + 14
			let hariini = moment().format('Y-MM-D hh:mm:ss');

			if (cek['count(*)'] < 1) {
				const insert = await Database
					.table('peserta')
					.insert({
						uid: 'UID' + kode,
						nama: Inputs.nama,
						kelamin: Inputs.kelamin,
						institusi: Inputs.institusi,
						alamat: Inputs.alamat,
						tgl_lahir: Inputs.tgl,
						telepon: Inputs.telepon,
						email: Inputs.email,
						statusaktif: 'NO',
						kelas: 'I',
						kelas_temp: Inputs.kelas_temp,
						jenis_ujian_temp: Inputs.jenis,
						jenis_ujian: Inputs.jenis,
						verification: Inputs.verification,
						userid: Inputs.userid,
						password: Inputs.password,
						tgl_daftar: hariini,
					})

				let Ajenis = ['WPPE', 'WPEE', 'WMI', 'WAPERD', 'Pemasaran', 'Pemasaran Terbatas']
				let Akelas = { 'I': 'Biasa', 'II': 'Khusus A', 'III': 'Khusus B', 'IV': 'Khusus C', 'V': 'Khusus D', 'IV': 'Khusus E', 'VII': 'Khusus F', 'VII': 'Khusus G', 'IX': 'Khusus H', 'X': 'Khusus I', 'XI': 'Khusus J' }
				let Akelamin = { 'P': 'Pria', 'W': 'Wanita' }

				let kelas = Akelas[Inputs.kelas_temp]
				let jenis = Ajenis[Inputs.jenis]
				let kelamin = Akelamin[Inputs.kelamin]


				let data = {
					nama: Inputs.nama,
					kelamin: kelamin,
					institusi: Inputs.institusi,
					alamat: Inputs.alamat,
					tgl: Inputs.tgl,
					telepon: Inputs.telepon,
					email: Inputs.email,
					jenis: jenis,
					kelas: kelas,
					uid: 'UID' + kode,
					userid: Inputs.userid,
					password: Inputs.passworddec,
				}

				await Mail.send('registrasi.registrasi', data, (message) => {
					message
						.to(Inputs.email)
						.from('admin@investalearning.com')
						.subject('Investalearning Account Activation')
				})

				return response.json({
					status: 200,
					title: "data telah disimpan"
				})
			} else {
				return response.json({
					status: 201,
					title: "User Telah Terdaftar"
				})
			}
		} catch (e) {
			return response.json({
				status: 500,
				data: e,
			})
		}
	}

	async get_paket({ request, response }){

		const data = await Database
			.select('paket.id_berita_paket', 'id_price', 'nama_paket', 'duration', 'type', 'price')
			.table('berita_paket as paket')
			.innerJoin('berita_price as price', 'price.id_berita_paket', 'paket.id_berita_paket')
			.where('kategori', 'berbayar')
			.where('aktif', 'true')

		return response.json(data)

	}

	async logOut({ request }) {
		const Inputs 	= request.only(['id', 'uid', 'endtime', 'startime', 'waktu', 'jam', 'menit', 'detik'])

		if (Inputs.endtime) {
			const update = await Database
				.table('waktu')
				.where('id', Inputs.id)
				.update({
					end_time 	: Inputs.endtime,
					start_time 	: Inputs.startime,
					waktu 		: Inputs.waktu,
					jam 		: Inputs.jam,
					menit 		: Inputs.menit,
					detik 		: Inputs.detik,
				})
			
		}

	}

	async registrasi_berita({ request, response })
	{

		const _request = request.only(['nama','pekerjaan','institusi','telepon','email','verification','userid','password','passworddec','status','paket'])

		const cek = await Database
			.table('langganan_berita')
			.where('username', _request.userid)
			.first()

		const cek_editor = await Database
			.table('user_editor')
			.where('username', _request.userid)
			.first()

		if (!cek && !cek_editor) {
		// if (!cek) {

			const insert = await Database
				.insert({
					nama 		: _request.nama,
					pekerjaan 	: _request.pekerjaan,
					institusi 	: _request.institusi,
					no_telp 	: _request.telepon,
					email 		: _request.email,
					verification: _request.verification,
					username 	: _request.userid,
					password 	: _request.password,
					created_at 	: new Date(),
				})
				.into('langganan_berita')
				.returning('id_langganan')

			if (_request.status == "gratis") {

				const dataPaket = await Database
					.select('nama_paket', 'id_price', 'price.id_berita_paket', 'duration', 'type', 'price')
					.table('berita_price as price')
					.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'price.id_berita_paket')
					.where('id_price', 5)
					.first()

				var year 	 = moment().format('YYYY').substr(2,2);
				var monthDay = moment().format('MMDD');
				const count  = await Database
					.table('berita_order')
					.count('id_order')

				const kode   = count.count ? count.count : 1
				function minTwoDigits(n) {
				  	return (n < 100 ? n < 10 ? '00' : '0' : '') + n;
				}

				const automateCode = 'PB'+year+monthDay+insert[0]+minTwoDigits(kode)+0+dataPaket.id_berita_paket+0+dataPaket.id_price+'BRTIL'

				const tab_order 	= "selesai"
				const status_order 	= "approved"
				let inputHari 		= 1
				if (dataPaket.type == "hari") {
					inputHari 	= dataPaket.duration
				}else if (dataPaket.type == "minggu") {
					inputHari 	= dataPaket.duration * 7
				}else if (dataPaket.type == "bulan") {
					inputHari 	= dataPaket.duration * 30
				}else if (dataPaket.type == "tahun") {
					inputHari 	= dataPaket.duration * 365
				}	
				let expired 	= new Date(new Date().getTime()+(inputHari*24*60*60*1000));

				let data = {
					nama 		: _request.nama,
					institusi 	: _request.institusi,
					telepon 	: _request.telepon,
					pekerjaan 	: _request.pekerjaan,
					email 		: _request.email,
					username	: _request.userid,
					password 	: _request.passworddec,
				}

				const transaksi = await Database
					.insert({
						invoice 		: automateCode,
						id_langganan 	: insert[0],
						id_berita_paket : dataPaket.id_berita_paket,
						id_price 		: dataPaket.id_price,
						tab_order  		: tab_order,
						status_order 	: status_order,
						expired 		: expired,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.into('berita_order')

				const order_deal = await Database
					.insert({
						invoice 		: automateCode,
						price 			: dataPaket.price,
						total_payment 	: dataPaket.price,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.into('berita_order_deal')

				await Mail.send('registrasi.registrasi_gratis', data, (message) => {
					message
						.to(_request.email)
						.from('admin@investalearning.com')
						.subject('Investalearning Account Activation')
				})

				return response.json({
					status 	: 200,
					title 	: "data telah disimpan",
					data 	: data,
				})

			}else{

				const dataPaket = await Database
					.select('nama_paket', 'id_price', 'price.id_berita_paket', 'duration', 'type', 'price')
					.table('berita_price as price')
					.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'price.id_berita_paket')
					.where('id_price', _request.paket)
					.first()

				var year 	 = moment().format('YYYY').substr(2,2);
				var monthDay = moment().format('MMDD');
				const count  = await Database
					.table('berita_order')
					.count('id_order')

				const kode   = count.count ? count.count : 1
				function minTwoDigits(n) {
				  	return (n < 100 ? n < 10 ? '00' : '0' : '') + n;
				}

				const automateCode = 'PB'+year+monthDay+insert[0]+minTwoDigits(kode)+0+dataPaket.id_berita_paket+0+dataPaket.id_price+'BRTIL'

				let tab_order 		= 'checkout';
				let status_order 	= 'requested';
				let inputHari 		= 2 * 7
				let expired 		= new Date(new Date().getTime()+(inputHari*24*60*60*1000))

				// if (dataPaket.kategori == "Gratis" || total_price <= 0 ) {
				// 	tab_order 		= "selesai"
				// 	status_order 	= "approved"
				// 	if (dataPaket.type == "hari") {
				// 		expired 		= new Date().add(dataPaket.duration, 'days');
				// 	}else if (dataPaket.type == "minggu") {
				// 		expired 		= new Date().add(dataPaket.duration, 'weeks');
				// 	}else if (dataPaket.type == "bulan") {
				// 		expired 		= new Date().add(dataPaket.duration, 'months');
				// 	}else if (dataPaket.type == "tahun") {
				// 		expired 		= new Date().add(dataPaket.duration, 'years');
				// 	}	

				// }

				const transaksi = await Database
					.insert({
						invoice 		: automateCode,
						id_langganan 	: insert[0],
						id_berita_paket : dataPaket.id_berita_paket,
						id_price 		: dataPaket.id_price,
						expired 		: expired,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.into('berita_order')

				const order_deal = await Database
					.insert({
						invoice 		: automateCode,
						price 			: dataPaket.price,
						total_payment 	: dataPaket.price,
						created_at 		: new Date(),
						updated_at 		: new Date(),
					})
					.into('berita_order_deal')

				let data = {
					nama 		: _request.nama,
					institusi 	: _request.institusi,
					telepon 	: _request.telepon,
					pekerjaan 	: _request.pekerjaan,
					email 		: _request.email,
					username	: _request.userid,
					password 	: _request.passworddec,
					nama_paket 	: dataPaket.nama_paket,
					duration 	: dataPaket.duration,
					type 		: dataPaket.type,
					price 		: dataPaket.price,
				}

				await Mail.send('registrasi.registrasi_berbayar', data, (message) => {
					message
						.to(_request.email)
						.from('admin@investalearning.com')
						.subject('Investalearning Account Activation')
				})

				return response.json({
					status 	: 300,
					title 	: "data telah disimpan",
					data 	: data,
				})

			}

		} else {
			return response.json({
				status: 201,
				title: "User Telah Terdaftar"
			})
		}

	}

	async login_berita_api({ request, response })
	{

		const _request = request.only(['username', 'password'])

		const cek_berita = await Database
			.table('langganan_berita')
			.where('username', _request.username)
			.first()

		const cek_editor = await Database
			.table('user_editor')
			.where('username', _request.username)
			.first()

		if (cek_berita) {

			const langganan_berita = await Database
				.table('langganan_berita')
				.where('username', _request.username)
				.where('password', _request.password)
				.first()

			if (langganan_berita) {

				const cek_berbayar = await Database
					.select('order.*', 'nama_paket', 'kategori')
					.table('berita_order as order')
					.where('id_langganan', langganan_berita.id_langganan)
					.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'order.id_berita_paket')
					.first()

				if (cek_berbayar) {
	    		
	    			cek_berbayar.expired = moment(cek_berbayar.expired).format('LL')

				}

				return response.json({
					status 	: 200,
					data 	: langganan_berita,
					berbayar: cek_berbayar.status_order == 'approved' ? true : false,
					paket 	: cek_berbayar ? cek_berbayar : [],
				})

			}else{

				return response.json({
					status 	: 300,
					data 	: 'Password yang anda masukkan salah',
				})

			}

		}
		else if(cek_editor){

			if (cek_editor.statusaktif == 'true' && cek_editor.password == _request.password) {

				return response.json({
					status 	: 205,
					data 	: cek_editor,
				})

			}else if(cek_editor.password == _request.password){

				return response.json({
					status: 400,
					data: 'Akun anda belum aktif, silahkan hubungi admin untuk mengaktifkan akun',
				})

			}else{

				return response.json({
					status 	: 300,
					data 	: 'Password yang anda masukkan salah',
				})

			}

		}
		else{

			return response.json({
				status: 400,
				data: 'Username yang anda masukkan salah',
			})

		}

	}

}

module.exports = LoginController
