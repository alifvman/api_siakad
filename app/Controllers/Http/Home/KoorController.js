'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class KoorController {
	async MateriTopik ({params,response}){

		const peserta = await Database
			.select('gk.idg','gk.uid','p.nama')
			.table('guru_koordinasi as gk')
			.innerJoin('peserta as p', 'p.uid', 'gk.uid')
			.where('gk.idg',params.id)

		const topik = await Database
			.select(Database.raw("SUBSTRING(kd_soal_statis,1,3) as kd_soal_statis"))
			.table('soal')
			.groupBy(Database.raw("SUBSTRING(kd_soal_statis,1, 3)"))
			.orderBy(Database.raw("SUBSTRING(kd_soal_statis,1, 3)"), 'ASC')

		const kd_soal_statis = [];

		for (var i = 0; i < topik.length; i++) {
			if (topik[i].kd_soal_statis) {
				kd_soal_statis.push(topik[i].kd_soal_statis)
			}
		}


		const uid_mereka = []
		for (var i = 0; i < peserta.length; i++) {
			uid_mereka.push(peserta[i].uid)
			peserta[i].kd_soal_statis = kd_soal_statis
		}

		let nilai_mereka = await Database
			.select('jawab','kunci', Database.raw("SUBSTRING(s.kd_soal_statis,1, 3) as kd_soal_statis"), 'ud.noujian', 'u.uid')
			.table('ujian_detail as ud')
			.innerJoin('ujian as u', 'u.noujian', 'ud.noujian')
			.leftJoin('soal as s', 's.kd_soal', 'ud.kd_soal')
			.whereIn('uid', uid_mereka)
			.where('status', 'SELESAI')
			.whereNotIn('ujianke', [0])

		var betul = nilai_mereka.filter(function (e) {
			return e.jawab === e.kunci;
		});

		var merge_peserta = peserta.map((value) => {
			var merge_kd_soal_statis = kd_soal_statis.map((values) => {
				var acuh = betul.filter(obj => obj.uid == value.uid && obj.kd_soal_statis == values)   
				return acuh.length
			})
			return {
				...value,
				kd_soal_statis : merge_kd_soal_statis,
				total_nilai : merge_kd_soal_statis.length > 0 ? merge_kd_soal_statis.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0
			}
		});

		const result = {
			field : kd_soal_statis,
			jumlah: kd_soal_statis.length,
			data  : merge_peserta
		}		

		return response.json({
            status 		: true,
            responses 	: 200,
            data 		: result
        })
	}

	async SumHasil({response, params}){
		const gurukoor = await Database
			.select('koor.idg', 'koor.uid', 'peserta.nama')
			.table('guru_koordinasi as koor')
			.where('idg', params.id)
			.leftJoin('peserta', 'peserta.uid', 'koor.uid')

		const ujian = await Database
			.select('pelajaran.nm_pelajaran', 'ujian.ujianke', 'hasil.nilai', 'ujian.uid')
			.table('ujian')
			.leftJoin('pelajaran', 'pelajaran.kd_pelajaran', 'ujian.kd_pelajaran')
			.leftJoin('ujianhasil as hasil', 'hasil.noujian', 'ujian.noujian')
			.where('jenis', 'tryout')
			.where('status', 'SELESAI')

		var done = gurukoor.map((value) => {    
            const filtermid     = ujian.filter(obj => obj.uid == value.uid)   
            return {
                ...value,
                hasil    : filtermid
            }        
        }); 

		return response.json({
            status: true,
            responses: 200,
            data: done
        })
	}

	async vidcon({response,request})
	{

		const _request = request.only(['idg'])

		const data = await Database
			.select('title', 'kelas_desc', 'jenis_ujian_desc', 'jadwal', 'status', 'code', 'namag', 'userg')
			.table('vidcon')
			.where('vidcon.idg', _request.idg)
			.innerJoin('m_kelas', 'm_kelas.id', 'vidcon.id_kelas')
			.innerJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'vidcon.jenis_ujian_id')
			.innerJoin('guru', 'guru.idg', 'vidcon.idg')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].jadwal = moment(data[i].jadwal).format('LLLL')
            }
        }

        const submit = await Database
        	.table('vidcon_submit')

		var merge = data.map((value) => {
            const filterSiswa = submit.filter(obj => obj.id_vidcon == value.id_vidcon)    
            return {
                ...value,
                total_peserta : filterSiswa.length
            }        
        });

		return response.json({
            status: true,
            responses: 200,
            data: merge,
        })

	}

	async MateritopikDetail({params,response})
	{

		const peserta = await Database
			.select('gk.idg','gk.uid','p.nama')
			.table('guru_koordinasi as gk')
			.innerJoin('peserta as p', 'p.uid', 'gk.uid')
			.where('gk.idg',params.id)
			.orderBy('p.nama', 'ASC')

		const topik = await Database
			.select(Database.raw("SUBSTRING(kd_soal_statis,1,3) as kd_soal_statis"))
			.table('soal')
			.groupBy(Database.raw("SUBSTRING(kd_soal_statis,1, 3)"))
			.orderBy(Database.raw("SUBSTRING(kd_soal_statis,1, 3)"), 'ASC')

		const kd_soal_statis = [];

		for (var i = 0; i < topik.length; i++) {
			if (topik[i].kd_soal_statis) {
				kd_soal_statis.push(topik[i].kd_soal_statis)
			}
		}

		for (var i = 0; i < peserta.length; i++) {
			peserta[i].kd_soal_statis = kd_soal_statis

			let ujian = await Database
				.select('pel.nm_pelajaran', 'uji.*')
				.table('ujian as uji')
				.innerJoin('pelajaran as pel', 'pel.kd_pelajaran', 'uji.kd_pelajaran')
				.where('uid', peserta[i].uid)
				.where('status', 'SELESAI')
				.whereNotIn('ujianke', [0])
				.orderBy('kd_pelajaran', 'ASC', 'ujianke', 'ASC')

			for (var a = 0; a < ujian.length; a++) {
				let nilai_mereka = await Database
					.select('jawab','kunci', Database.raw("SUBSTRING(s.kd_soal_statis,1, 3) as kd_soal_statis"), 'ud.noujian')
					.table('ujian_detail as ud')
					.leftJoin('soal as s', 's.kd_soal', 'ud.kd_soal')
					.where('noujian', ujian[a].noujian)

				var betul = nilai_mereka.filter(function (e) {
					return e.jawab === e.kunci;
				});

				var merge_kd_soal_statis = kd_soal_statis.map((values) => {
					var acuh = betul.filter(obj => obj.kd_soal_statis == values)   
					return acuh.length
				})
				ujian[a].kd_soal_statis = merge_kd_soal_statis
				ujian[a].total_nilai 	= merge_kd_soal_statis.length > 0 ? merge_kd_soal_statis.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0
			}

			peserta[i].data = ujian

		}

		return response.json({
            status 		: true,
            responses 	: 200,
            data 		: peserta,
        })

	}

}


module.exports = KoorController