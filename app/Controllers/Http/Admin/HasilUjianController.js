'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class HasilUjianController {

	async TampilHasilUjian({ response, params }) {
		const data = await Database
			.select('t1.noujian', 't2.uid', 't2.nama', 't4.nm_pelajaran', 't5.jenis_ujian_desc', 't6.kelas_desc', 't5.nilai_lulus')
			.table('ujian as t1')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('ujianhasil as t3', 't3.noujian', 't1.noujian')
			.leftJoin('pelajaran as t4', 't4.kd_pelajaran', 't1.kd_pelajaran')
			.leftJoin('m_jenis_ujian as t5', 't5.jenis_ujian_id', 't1.jenis_ujian')
			.leftJoin('m_kelas as t6', 't6.kelas_id', 't1.kelas')
			.where('t1.jenis', 'tryout')
			// .groupBy('t1.noujian')
			.orderBy('t1.noujian', 'DESC')
			.paginate(params.page, 30)

		const query = data.data

		for (var i = 0; i < query.length; i++) {
			const nilai = await Database
				.select('kd_soal', 'jawab')
				.table('ujian_detail')
				.where('noujian', query[i].noujian)
			query[i]['nilai'] = nilai;

			for (var a = 0; a < nilai.length; a++) {
				const kunci = await Database
					.select('kunci')
					.table('soal')
					.where('kd_soal', nilai[a].kd_soal)
					.first()

				let jawaban = []
				if (kunci.kunci == nilai[a].jawab) {
					jawaban = 1
				} else {
					jawaban = 0
				}

				nilai[a]['kunci'] = kunci;
				nilai[a]['jawaban'] = jawaban;
			}
		}

		return response.json(data)
	}

	async DetailHasilUjian({ params, response }) {
		const data = await Database
			.select('t1.noujian', 't2.uid', 't2.nama', 't4.nm_pelajaran', 't5.jenis_ujian_desc', 't6.kelas_desc', 't5.nilai_lulus', 't3.jumbenar', 't3.jumlah_soal', 't3.nilai')
			.table('ujian as t1')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('ujianhasil as t3', 't3.noujian', 't1.noujian')
			.leftJoin('pelajaran as t4', 't4.kd_pelajaran', 't1.kd_pelajaran')
			.leftJoin('m_jenis_ujian as t5', 't5.jenis_ujian_id', 't1.jenis_ujian')
			.leftJoin('m_kelas as t6', 't6.kelas_id', 't1.kelas')
			.where('t1.jenis', 'tryout')
			.where('t1.noujian', params.id)
			.groupBy('t1.noujian')
			.first()

		const soal = await Database
			.raw(`
				SELECT 
					soal.*, 
					ujian.noujian 
				FROM soal,ujian,ujian_detail 
				WHERE 
					soal.kd_soal = ujian_detail.kd_soal AND 
					ujian.noujian=ujian_detail.noujian  AND 
					ujian.status='SELESAI' AND 
					ujian.noujian='` + params.id + `' 
				ORDER BY  ujian_detail.no
			`)
		let qSoal = soal[0]

		if (qSoal.length < 1) {
			return response.json({
				data: data,
				soal: [],
			})
		} else {
			let qSoal = soal[0]

			for (var i = 0; i < qSoal.length; i++) {
				const jawaban = await Database
					.raw(`
						SELECT 
							ujian_detail.jawab 
						FROM soal,ujian,ujian_detail 
						WHERE 
							soal.kd_soal=ujian_detail.kd_soal AND 
							soal.kd_soal='` + qSoal[i].kd_soal + `' AND 
							ujian.noujian=ujian_detail.noujian AND 
							ujian.noujian='` + params.id + `'
					`)
				qSoal[i]['jawaban'] = jawaban[0][0];
			}
		}

		return response.json({
			data: data,
			soal: soal,
		})
	}

}
module.exports = HasilUjianController
