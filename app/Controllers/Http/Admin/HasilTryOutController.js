'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class HasilTryOutController {
	async TampilHasilTryOut({response,params}){
		const check = await Database
			.select('uid')
			.from('guru_koordinasi')
			.where('idg',params.id)

		if(check.length > 0){
			const uid = [];
			  	for (var i = 0; i < check.length; i++) {
			  		uid.push(check[i].uid);	  			  		
				}

			const quid =uid

			const data = await Database
				.select('t1.kd_pelajaran','t1.kelas','t1.jenis_ujian','t5.nm_pelajaran')
				.table('ujian as t1')
				.leftJoin('ujian_detail as t2','t2.noujian','t1.noujian')
				.leftJoin('soal as t3','t3.kd_soal','t2.kd_soal')
				.leftJoin('pelajaran as t5','t1.kd_pelajaran','t5.kd_pelajaran')
				.whereIn('t1.uid',quid)
				.where('t1.jenis','tryout')
				.groupBy('t1.kd_pelajaran','t1.kelas','t1.jenis_ujian','t5.nm_pelajaran')
				.orderBy('t5.nm_pelajaran')
				
			return response.json(data)
		}	
	}

	async DetailHasilTryOut({request,response}){
		const Inputs = request.only(['uid','kd_pelajaran','jenis_ujian','kelas','ke'])
		const check = await Database
			.select('uid')
			.from('guru_koordinasi')
			.limit(30)

		if(check.length > 0){

			const uid = [];
			const huid= []
		  	for (var i = 0; i < check.length; i++) {
		  		uid.push("'" + check[i].uid + "'");	
				huid.push(check[i].uid)  			  		
			}

			const quid = uid.join()

			const data = await Database
				.raw(`
					select 
						soal_ujian.kd_soal_ujian,
						soal_ujian.kd_soal,
						soal_ujian.kd_pelajaran,
						soal_ujian.no_urut,
						soal.soal as soal_len,
						soal_ujian.waktu,
						soal.kunci,soal.kd_soal_statis 
					FROM soal_ujian, soal 
					where soal_ujian.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' 
					AND soal_ujian.kd_soal = soal.kd_soal 
					AND soal_ujian.jenis_ujian='`+ Inputs.jenis_ujian +`' 
					AND soal_ujian.kelas='`+Inputs.kelas+`' 
					ORDER BY soal.kd_soal_statis asc, soal_ujian.no_urut asc
				`)

			const hasil = data[0]

			for (var i = 0; i < hasil.length; i++) {
				const query = await Database
					.raw(`
						SELECT 
							count(t1.noujian) as total_peserta,
							sum(if(t2.jawab = t3.kunci,1,0)) as jawab_benar 
						from ujian t1 
						LEFT JOIN ujian_detail t2 on t1.noujian=t2.noujian 
						AND t2.kd_soal='`+ hasil[i].kd_soal +`' 
						LEFT JOIN soal t3 on t3.kd_soal = t2.kd_soal
						where t1.kd_pelajaran='`+ hasil[i].kd_pelajaran +`' 
						AND t1.kelas='`+ Inputs.kelas +`' 
						AND t1.jenis_ujian='`+ Inputs.jenis_ujian +`' 
						AND t1.ujianke='`+ Inputs.ke +`' 
						AND t1.jenis='tryout' 
						AND t1.uid IN(`+ quid +`)  
						LIMIT 1 
					`)

				hasil[i]['hasil'] = query[0][0];
			}

			return response.json(hasil)

		}
		
	}

}
module.exports = HasilTryOutController