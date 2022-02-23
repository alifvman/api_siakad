'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class DataSoalController {

	async MateriPelajaran({response}){
		const data = await Database
			.table('pelajaran')
			.orderBy('nm_pelajaran','ASC')
		return response.json(data)
	}

	async MateriPelajaranId({response,params}){
		const data = await Database
			.table('pelajaran')
			.where('kd_pelajaran',params.id)
			.first()
		return response.json(data)
	}

	async JenisUjian({response}){
		const data = await Database	
			.table('m_jenis_ujian')
			.orderBy('jenis_ujian_id')
		return response.json(data)
	}

	async JenisUjianId({response,params}){
		const data = await Database	
			.table('m_jenis_ujian')
			.where('jenis_ujian_id',params.id)
			.first()
		return response.json(data)
	}

	async Kelas({response}){
		const kelas = await Database
			.table('m_kelas')
			.orderBy('kelas_id','ASC')
		return response.json(kelas)
	}

	async KelasId({response,params}){
		const kelas = await Database
			.table('m_kelas')
			.where('kelas_id',params.id)
			.first()
		return response.json(kelas)
	}

	async DataSoal({ request, response }){
		const Inputs = request.only(['pelajaran','jenis','kelas', 'table'])
		
		let data = []
		if (Inputs.table == 'latihan') {
			data = await Database
				.raw("SELECT soal_latihan.jenis_ujian,soal_latihan.kelas,soal_latihan.kd_soal_latihan,soal_latihan.kd_soal,soal_latihan.kd_pelajaran,soal_latihan.no_urut,CONCAT(LEFT(soal.soal,70),'...') as soal_len,soal_latihan.waktu,soal.kunci,soal.kd_soal_statis FROM soal_latihan, soal Where soal_latihan.kd_pelajaran='"+Inputs.pelajaran+"' AND soal_latihan.kd_soal = soal.kd_soal AND soal_latihan.jenis_ujian='"+Inputs.jenis+"' AND soal_latihan.kelas='"+Inputs.kelas+"' ORDER BY soal.kd_soal_statis asc, soal_latihan.no_urut asc")
		}else{
			data = await Database
				.raw("SELECT soal_ujian.jenis_ujian,soal_ujian.kelas,soal_ujian.kd_soal_ujian,soal_ujian.kd_soal,soal_ujian.kd_pelajaran,soal_ujian.no_urut,CONCAT(LEFT(soal.soal,70),'...') as soal_len,soal_ujian.waktu,soal.kunci, soal.kd_soal_statis FROM soal_ujian, soal  Where soal_ujian.kd_pelajaran='"+Inputs.pelajaran+"' AND soal_ujian.kd_soal = soal.kd_soal AND soal_ujian.jenis_ujian='"+Inputs.jenis+"' AND soal_ujian.kelas='"+Inputs.kelas+"' ORDER BY soal.kd_soal_statis asc, soal_ujian.no_urut asc")
		}

		return response.json({
			data  : data[0],
			waktu : data ? 0 : data[0][0].waktu 
		})
	}

	async HapusSoal({ params }){

		let hapus = []
		if (params.table == 'latihan') {
			hapus = await Database
				.table('soal_latihan')
				.where('kd_soal',params.kd)
				.delete()
		}else{
			hapus = await Database
				.table('soal_ujian')
				.where('kd_soal',params.kd)
				.delete()
		}

		return hapus
	} 

	async allSoal({request,response}){
		const Inputs = request.only(['pelajaran','jenis','kelas', 'table'])
		let soal = []
		if (Inputs.table == 'latihan') {		
			soal = await Database
				.raw("SELECT soal_latihan.kd_soal,soal.kd_soal_statis,soal_latihan.kd_pelajaran,CONCAT(LEFT(REPLACE(REPLACE(REPLACE(soal.soal, '\', ''), '\"', ''), '&quot;', ''),70),'...') as soal_len,soal_latihan.waktu FROM soal_latihan, soal WHERE soal_latihan.kd_pelajaran='"+Inputs.pelajaran+"' AND soal_latihan.kd_soal = soal.kd_soal AND soal_latihan.kelas='"+Inputs.kelas+"' AND soal_latihan.jenis_ujian='"+Inputs.jenis+"'ORDER BY soal_latihan.kd_soal_latihan")
		}else{
			soal = await Database
				.raw("SELECT soal_ujian.kd_soal,soal.kd_soal_statis,soal_ujian.kd_pelajaran, CONCAT(LEFT(REPLACE(REPLACE(REPLACE(REPLACE(soal.soal, \"'\", ''), '\"', ''), '&#39;', ''), '&quot;', ''),70),'...') as soal_len,soal_ujian.waktu FROM soal_ujian, soal WHERE soal_ujian.kd_pelajaran='"+Inputs.pelajaran+"' AND soal_ujian.kd_soal = soal.kd_soal AND soal_ujian.kelas='"+Inputs.kelas+"' AND soal_ujian.jenis_ujian='"+Inputs.jenis+"' ORDER BY soal_ujian.kd_soal_ujian")
		}

		let data = []
		if (soal[0].length < 1) {
		data = await Database
			.raw("SELECT soal.kd_soal, soal.kd_soal_statis, soal.kd_pelajaran, CONCAT(LEFT(REPLACE(REPLACE(REPLACE(REPLACE(soal.soal, \"'\", ''), '\"', ''), '&#39;', ''), '&quot;', ''),70),'...') as soal_len FROM soal ORDER BY soal.kd_soal_statis asc")
		}else{
			let kodeSoal = []
			for (var i = 0; i < soal[0].length; i++) {
				kodeSoal.push("'" + soal[0][i].kd_soal + "'")
			}

			data = await Database
				.raw("SELECT soal.kd_soal, soal.kd_soal_statis, soal.kd_pelajaran, CONCAT(LEFT(REPLACE(REPLACE(REPLACE(REPLACE(soal.soal, \"'\", ''), '\"', ''), '&#39;', ''), '&quot;', ''),70),'...') as soal_len FROM soal where soal.kd_soal not in ("+kodeSoal+") ORDER BY soal.kd_soal_statis asc")
		}

		return response.json({
			data   		: data[0],
			jumlah 		: data[0].length,
			soal   		: soal[0],
			Jumlahsoal  : soal[0].length,
		})
	}

	async DeleteSoal({request,response}){
		const Inputs = request.only(['pelajaran','jenis','kelas', 'table'])
		let tabel = []
		if(Inputs.table == 'latihan') { tabel = 'soal_latihan'}else{ tabel = 'soal_ujian'}

		const deletes = await Database
			.table(tabel)
			.where('kd_pelajaran',Inputs.pelajaran)
			.where('kelas',Inputs.kelas)
			.where('jenis_ujian',Inputs.jenis)
			.delete()
	}

	async tambahSoal({request,response}){
		const Inputs = request.only(['pelajaran','jenis','kelas', 'table','kd_soal','urutan','update_by','waktu'])
		let hari_ini = moment().format('Y-MM-D')
		let tabel = []
		let kode = [] 
		if(Inputs.table == 'latihan') { tabel = 'soal_latihan', kode = 'kd_soal_latihan' }else{ tabel = 'soal_ujian', kode = 'kd_soal_ujian'}

		const soal = await Database
			.select('kd_soal')
			.table( tabel)
			.where('kd_pelajaran',Inputs.pelajaran)
			.where('kelas',Inputs.kelas)
			.where('jenis_ujian',Inputs.jenis)
			.where('kd_soal',Inputs.kd_soal)
			.first()

		if (!soal) {
			const struktur = await Database
					.table(tabel)
					.max(kode)
					.first()

			let panjang = 9
			let angka_sementara =  struktur['max(`'+kode+'`)'].substring(1);
			let angka = String(parseInt(angka_sementara)).length
			let hasil = parseInt(angka_sementara) + 1
			
			let tmp = []
			for (var i = 0; i < parseInt(panjang) - parseInt(angka); i++) {
				tmp.push(0) 
			}
			let koma =  tmp.join()
			let nol = koma.replace(/,/g, '')
			let kode_soal = 'L'+ nol + hasil

			if(Inputs.table == 'latihan'){
				const insert = await Database
					.table(tabel)
					.insert({
						kd_soal_latihan  : kode_soal,
						kd_soal 		 : Inputs.kd_soal,
						kd_pelajaran 	 : Inputs.pelajaran,
						kelas 		 	 : Inputs.kelas,
						jenis_ujian  	 : Inputs.jenis,
						waktu		 	 : Inputs.waktu,
						no_urut      	 : Inputs.urutan,
						update_by        : Inputs.update_by,
						datetime_updated : hari_ini
					})
			}else{
				const insert = await Database
					.table(tabel)
					.insert({
						kd_soal_ujian    : kode_soal,
						kd_soal 		 : Inputs.kd_soal,
						kd_pelajaran 	 : Inputs.pelajaran,
						kelas 		 	 : Inputs.kelas,
						jenis_ujian  	 : Inputs.jenis,
						waktu		 	 : Inputs.waktu,
						no_urut      	 : Inputs.urutan,
						update_by        : Inputs.update_by,
						datetime_updated : hari_ini
					})
			}
		}

	}

}
module.exports = DataSoalController


