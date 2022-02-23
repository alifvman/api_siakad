'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class PelajaranDetailController {
	async ListDetail ({response,params}){
		const data = await Database
			.select('t1.waktu','t1.kelas','t1.jenis_ujian','t1.kd_pelajaran','t2.jenis_ujian_desc','t3.kelas_desc','t4.nm_pelajaran',Database.raw('count(t1.kelas) as jml') )
			.table(params.table + ' as t1')
			.leftJoin('m_jenis_ujian as t2','t1.jenis_ujian','t2.jenis_ujian_id')
			.leftJoin('m_kelas as t3','t1.kelas','t3.kelas_id')
			.leftJoin('pelajaran as t4','t1.kd_pelajaran','t4.kd_pelajaran')
			.groupBy('t1.waktu','t1.kelas','t1.waktu','t1.jenis_ujian','t1.kd_pelajaran','t2.jenis_ujian_desc','t3.kelas_desc','t4.nm_pelajaran')
			.orderBy('t1.kd_pelajaran','ASC')
		return response.json(data)
	}

	async MateriPelajaran({response}){
		const data = await Database
			.table('pelajaran')
			.orderBy('nm_pelajaran','ASC')
		return response.json(data)
	}

	async JenisUjian({response}){
		const data = await Database	
			.table('m_jenis_ujian')
			.orderBy('jenis_ujian_id')
		return response.json(data)
	}

	async Kelas({response}){
		const kelas = await Database
			.table('m_kelas')
			.orderBy('kelas_id','ASC')
		return response.json(kelas)
	}

	async SoalLatihan({response,request,params}){
		const Inputs = request.only(['kd_pelajaran','jenis_ujian','kelas','table','page'])
		const data = await Database
			.table(Inputs.table)
			.select( Inputs.table == 'soal_latihan' ? 'kd_soal_latihan' : 'kd_soal_ujian','kd_soal','kd_pelajaran','no_urut','waktu')
			.where('kd_pelajaran',Inputs.kd_pelajaran)
			.where('jenis_ujian',Inputs.jenis_ujian)
			.where('kelas',Inputs.kelas)
			.orderBy('no_urut','ASC')
			.paginate(params.page, 20)
		
		let data_paginate = data.data
	
		for (var KeySoal = 0; KeySoal < data_paginate.length; KeySoal++) {
			const Soal = await Database
				.select('kunci','kd_soal_statis',Database.raw('CONCAT(LEFT(soal.soal,70),"...") as soal_len'))
				.table('soal')
				.where('kd_soal',data_paginate[KeySoal].kd_soal)
				.first()
			data_paginate[KeySoal]['Soal'] = Soal;
		}

		return response.json(data)
	}

	async DeleteSoalLatihan({request}){
		const Inputs = request.only(['kd_soal_latu','kd_soal','table'])
		const deleted = await Database
			.table(Inputs.table)
			.where('kd_soal',Inputs.kd_soal)
			.where( Inputs.table == 'soal_latihan' ? 'kd_soal_latihan' : 'kd_soal_ujian',Inputs.kd_soal_latu ) 
			.delete()
	}

	async DetailTambahSoal({request,response}){
		const Inputs = request.only(['kelas','rbPelajaran','rbJenis'])
		const pelajaran = await Database
			.select('nm_pelajaran','kd_pelajaran')
			.table('pelajaran')
			.where('kd_pelajaran',Inputs.rbPelajaran)
			.first()

		const jenisUjian = await Database
			.select('jenis_ujian_desc')
			.table('m_jenis_ujian')
			.where('jenis_ujian_id',Inputs.rbJenis)
			.first()

		const kelas = await Database
			.select('kelas_desc')
			.table('m_kelas')
			.where('kelas_id',Inputs.kelas)
			.first()

		const dataSoal = await Database
			.raw(`SELECT soal_latihan.kd_soal,soal.kd_soal_statis,soal_latihan.kd_pelajaran,CONCAT(LEFT(REPLACE(REPLACE(REPLACE(soal.soal, '\'', ''), '\"', ''), '&quot;', ''),70),'...') as soal_len,soal_latihan.waktu FROM soal_latihan, soal ORDER BY soal_latihan.kd_soal_latihan`)
		return dataSoal

		return response.json({
			pelajaran  : pelajaran,
			jenisUjian : jenisUjian,
			kelas      : kelas, 
		})
	}

}

module.exports = PelajaranDetailController

