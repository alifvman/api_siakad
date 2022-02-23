'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class LatihanController {


	async CekLatihan({request,response}){

		const Inputs = request.only(['uid','kd_pelajaran','kelas','jenis_ujian','jenis'])
		let hari_ini = moment().format('Y-MM-D')

		const hari = await Database
			.table('ujian')
			.where('uid',Inputs.uid)
			.where('kd_pelajaran',Inputs.kd_pelajaran)
			.where('kelas',Inputs.kelas)
			.where('jenis_ujian',Inputs.jenis_ujian)
			.where('jenis', Inputs.jenis)
			.whereIn('status',['SELESAI'])
			.count()
			.first()

		const dataUjian = await Database
			.table('ujian')
			.where('uid',Inputs.uid)
			.where('kd_pelajaran',Inputs.kd_pelajaran)
			.where('kelas',Inputs.kelas)
			.where('jenis_ujian',Inputs.jenis_ujian)
			.where('jenis', Inputs.jenis)
			.where('status', 'SELESAI')
			.orderBy('noujian','DESC')
			.first()

		const total = hari['count(*)']

		let ujianke = []
		if (total  == 0) {
			ujianke = 1
		}else{
			ujianke = dataUjian.ujianke + 1
		}

		let status = []
		if (total >= 1 && Inputs.jenis == 'latihan') {
			status = 'view'
		}else if (total >= 1 && Inputs.jenis == 'tryout'){
			status = 'view'
		}else{
			status = 'start'
		}

		let data = [];
		let noujian = [];
		let jumbenar = []

		if (status == 'view') {
			
			if (dataUjian) {
				noujian =  dataUjian.noujian
				const cek_jumbenar = await Database
					.select('t1.*','t2.tanggal', 't2.kd_pelajaran')
					.table('ujianhasil as t1')
					.innerJoin('ujian as t2','t1.noujian','t2.noujian')
					.where('t1.noujian',noujian)
					.where('t2.status','SELESAI')
					.first()

				if (cek_jumbenar) {

					jumbenar = cek_jumbenar
				
				}else{
				
					jumbenar = []
				
				}
			
			}
			
			const ceknoujian = await Database
				.table('ujian')
				.where('uid',Inputs.uid)
				.where('kd_pelajaran',Inputs.kd_pelajaran)
				.where('kelas',Inputs.kelas)
				.where('jenis_ujian',Inputs.jenis_ujian)
				.where('jenis', Inputs.jenis)
				.where('status','AKTIF')
				.orderBy('noujian','DESC')
				.first()

			const struktur = await Database
				.table('ujian')
				.max('noujian')
				.first()

			let panjang = 6
			let angka_sementara =  struktur['max(`noujian`)'].substring(1);
			let angka = String(parseInt(angka_sementara)).length
			let hasil = parseInt(angka_sementara) + 1
			
			let tmp = 0
			for (var i = 1; i <= 3; i++) {
				tmp = tmp + 0 
			}
			
			if (ceknoujian) {
				noujian = ceknoujian.noujian
			}else{
				noujian = 'U'+ tmp + hasil
			}

			if (Inputs.jenis == 'latihan') {
				data = await Database
					.raw(`
						SELECT 
							soal_latihan.kd_soal,
							soal_latihan.kd_pelajaran,
							soal_latihan.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis 
						FROM soal_latihan, pelajaran, soal 
						WHERE 
							soal_latihan.kd_pelajaran = pelajaran.kd_pelajaran AND 
							soal_latihan.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_latihan.kelas= '`+Inputs.kelas+`' AND 
							soal_latihan.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				data = data[0]
			}else{
				data = await Database
					.raw(`
						SELECT 
							soal_ujian.kd_soal,
							soal_ujian.kd_pelajaran,
							soal_ujian.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis
						FROM soal_ujian, pelajaran, soal 
						WHERE 
							soal_ujian.kd_pelajaran=pelajaran.kd_pelajaran AND 
							soal_ujian.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_ujian.kelas= '`+Inputs.kelas+`' AND 
							soal_ujian.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				data = data[0]
			}
		
		}else{

			if (Inputs.jenis == 'latihan') {
				data = await Database
					.raw(`
						SELECT 
							soal_latihan.kd_soal,
							soal_latihan.kd_pelajaran,
							soal_latihan.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis 
						FROM soal_latihan, pelajaran, soal 
						WHERE 
							soal_latihan.kd_pelajaran = pelajaran.kd_pelajaran AND 
							soal_latihan.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_latihan.kelas= '`+Inputs.kelas+`' AND 
							soal_latihan.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				data = data[0]
			}else{
				data = await Database
					.raw(`
						SELECT 
							soal_ujian.kd_soal,
							soal_ujian.kd_pelajaran,
							soal_ujian.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis
						FROM soal_ujian, pelajaran, soal 
						WHERE 
							soal_ujian.kd_pelajaran=pelajaran.kd_pelajaran AND 
							soal_ujian.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_ujian.kelas= '`+Inputs.kelas+`' AND 
							soal_ujian.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				data = data[0]
			}
			
			const ceknoujian = await Database
				.table('ujian')
				.where('uid',Inputs.uid)
				.where('kd_pelajaran',Inputs.kd_pelajaran)
				.where('kelas',Inputs.kelas)
				.where('jenis_ujian',Inputs.jenis_ujian)
				.where('jenis', Inputs.jenis)
				.where('status','AKTIF')
				.orderBy('noujian','DESC')
				.first()

			const struktur = await Database
				.table('ujian')
				.max('noujian')
				.first()

			let panjang = 6
			let angka_sementara =  struktur['max(`noujian`)'].substring(1);
			let angka = String(parseInt(angka_sementara)).length
			let hasil = parseInt(angka_sementara) + 1
			
			let tmp = 0
			for (var i = 1; i <= 3; i++) {
				tmp = tmp + 0 
			}
			
			if (ceknoujian) {
				noujian = ceknoujian.noujian
			}else{
				noujian = 'U'+ tmp + hasil
			}
			jumbenar 	= []
					
		}

		const waktu = await Database
			.raw(`
				SELECT 
					soal_latihan.waktu 
				FROM 
					soal_latihan, soal 
				WHERE 
					soal_latihan.kd_soal = soal.kd_soal AND 
					soal_latihan.kd_pelajaran='`+ Inputs.kd_pelajaran +`' AND 
					soal_latihan.kelas='`+Inputs.kelas+`' AND 
					soal_latihan.jenis_ujian='`+ Inputs.jenis_ujian +`'
			`)
			
		return response.json({
			status     : status,
			jumlahSoal : data.length,
			dataujian  : dataUjian,
			jumlahBenar: jumbenar,
			waktu      : waktu[0][0],
			ujianke    : ujianke,
			noujian    : noujian,
		})
	}

	
	async DataSoalLatihan({ request,response }){
		const Inputs = request.only(['uid','kd_pelajaran','kelas','jenis_ujian','jenis','status','noujian','ujianke'])
		let hari_ini = moment().format('Y-MM-D')
		let data = []
		let awal = []

		if (Inputs.status == 'start') {
			let soal = []
			if (Inputs.jenis == 'latihan') {
				soal = await Database
					.raw(`
						SELECT 
							soal_latihan.kd_soal,
							soal_latihan.kd_pelajaran,
							soal_latihan.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis 
						FROM soal_latihan, pelajaran, soal 
						WHERE 
							soal_latihan.kd_pelajaran=pelajaran.kd_pelajaran AND 
							soal_latihan.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_latihan.kelas= '`+Inputs.kelas+`' AND 
							soal_latihan.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				soal = soal[0]
			}else{
				soal = await Database
					.raw(`
						SELECT 
							soal_ujian.kd_soal,
							soal_ujian.kd_pelajaran,
							soal_ujian.waktu,
							soal.soal,
							soal.soalgambar,
							soal.pil_a,
							soal.pil_b,
							soal.pil_c,
							soal.pil_d,
							soal.pil_e,
							soal.kunci,
							soal.solusi,
							soal.kd_soal_statis 
						FROM soal_ujian, pelajaran, soal 
						WHERE 
							soal_ujian.kd_pelajaran=pelajaran.kd_pelajaran AND 
							soal_ujian.kd_soal = soal.kd_soal AND 
							pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
							soal_ujian.kelas= '`+Inputs.kelas+`' AND 
							soal_ujian.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
						order by RAND()
					`)
				soal = soal[0]
			}

			const cek = await Database
				.table('ujian')
				.where('noujian',Inputs.noujian)

			if (cek.length < 1) {
				const insert = await Database
					.table('ujian')
					.insert({
						noujian 	 : Inputs.noujian,
						uid 		 : Inputs.uid,
						tanggal 	 : hari_ini,
						kelas 		 : Inputs.kelas,
						kd_pelajaran : Inputs.kd_pelajaran,
						jenis_ujian  : Inputs.jenis_ujian,
						jenis 		 : Inputs.jenis,
						ujianke 	 : Inputs.ujianke,
					})

				const simpan = await Database
					.table('ujianhasil')
					.insert({
						noujian     : Inputs.noujian,
						jumbenar    : 0,
						nilai	    : 0,
						jumlah_soal : soal.length,
						tgl_ambil   : hari_ini,
					})
			}

			const hitung = await Database
					.table('ujian_detail')
					.where('noujian',Inputs.noujian)
					.count()
					.first()

			if (hitung['count(*)'] < 1) {
				if (Inputs.jenis == 'latihan') {
					awal = await Database
						.raw(`
							SELECT 
								soal_latihan.kd_soal,
								soal_latihan.kd_pelajaran,
								soal_latihan.waktu,
								soal.soal,
								soal.soalgambar,
								soal.pil_a,
								soal.pil_b,
								soal.pil_c,
								soal.pil_d,
								soal.pil_e,
								soal.kunci,
								soal.solusi,
								soal.kd_soal_statis 
							FROM soal_latihan, pelajaran, soal 
							WHERE 
								soal_latihan.kd_pelajaran=pelajaran.kd_pelajaran AND 
								soal_latihan.kd_soal = soal.kd_soal AND 
								pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
								soal_latihan.kelas= '`+Inputs.kelas+`' AND 
								soal_latihan.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
							order by RAND()
						`)
					awal = awal[0]
				}else{
					awal = await Database
						.raw(`
							SELECT 
								soal_ujian.kd_soal,
								soal_ujian.kd_pelajaran,
								soal_ujian.waktu,
								soal.soal,
								soal.soalgambar,
								soal.pil_a,
								soal.pil_b,
								soal.pil_c,
								soal.pil_d,
								soal.pil_e,
								soal.kunci,
								soal.solusi,
								soal.kd_soal_statis 
							FROM soal_ujian, pelajaran, soal 
							WHERE 
								soal_ujian.kd_pelajaran=pelajaran.kd_pelajaran AND 
								soal_ujian.kd_soal = soal.kd_soal AND 
								pelajaran.kd_pelajaran= '`+ Inputs.kd_pelajaran +`' AND 
								soal_ujian.kelas= '`+Inputs.kelas+`' AND 
								soal_ujian.jenis_ujian= '`+ Inputs.jenis_ujian +`' 
							order by RAND()
						`)
					awal = awal[0]
				}

				for (var i = 0; i < awal.length; i++) {
					const simpan = await Database
						.table('ujian_detail')
						.insert({
							noujian : Inputs.noujian,
							kd_soal : awal[i].kd_soal,
							no      : i,
							kelas   : 0,

						})
				}
			}
			
			data = await Database
					.table('ujian_detail as t1')
					.innerJoin('soal as t2','t1.kd_soal','t2.kd_soal')
					.where('noujian',Inputs.noujian)
					.orderBy('t1.no','ASC')
		}else{
			data = await Database
				.select('t1.kd_soal','t1.jawab','t1.no','t3.kd_pelajaran','t2.soal','t2.soalgambar','t2.pil_a','t2.pil_b','t2.pil_c','t2.pil_d','t2.pil_e','t2.kunci','t2.solusi','t2.kd_soal_statis')
				.table('ujian_detail as t1')
				.leftJoin('soal as t2','t2.kd_soal','t1.kd_soal')
				.leftJoin('ujian as t3','t3.noujian',' t1.noujian')
				.leftJoin('pelajaran as t4','t3.kd_pelajaran','t4.kd_pelajaran')
				.where('t1.noujian',Inputs.noujian)

		}

		return response.json(data)
	}

	async storejawaban({request,response}){
		const Inputs = request.only(['noujian','kd_soal','jawab'])
		const update = await Database
			.table('ujian_detail')
			.where('noujian',Inputs.noujian)
			.where('kd_soal',Inputs.kd_soal)
			.update({
				jawab : Inputs.jawab
			})
	
		// return response.json(data)
	}

	async hitungHasil({request,response}){
		const Inputs = request.only(['noujian', 'status'])

		const update = await Database
			.table('ujian')
			.where('noujian',Inputs.noujian)
			.update({
				status : Inputs.status
			})

		const data = await Database
			.select('t1.kd_soal','t1.jawab','t2.kunci')
			.table('ujian_detail as t1')
			.innerJoin('soal as t2','t1.kd_soal','t2.kd_soal')
			.where('noujian',Inputs.noujian)

		var betul = data.filter(function(d) {
		    return d.jawab === d.kunci;
		});

		const updates = await Database
			.table('ujianhasil')
			.where('noujian',Inputs.noujian)
			.update({
				jumbenar : betul.length,
				nilai	 : betul.length
			})

	}

	async list_link({request,response})
	{

		const _request = request.only(['uid'])

		const data = await Database
			.select('id_vidcon_submit', 'submit.id_vidcon', 'title', 'namag', 'kelas_desc', 'jenis_ujian_desc', 'jadwal', 'status', 'code', 'nama', 'userid','submit.masuk')
			.table('vidcon_submit as submit')
			.where('submit.uid', _request.uid)
			.innerJoin('vidcon', 'vidcon.id_vidcon', 'submit.id_vidcon')
			.innerJoin('guru', 'guru.idg', 'vidcon.idg')
			.innerJoin('m_kelas', 'm_kelas.id', 'vidcon.id_kelas')
			.innerJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'vidcon.jenis_ujian_id')
			.innerJoin('peserta', 'peserta.uid', 'submit.uid')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].jadwal = moment(data[i].jadwal).format('LLLL')
            }
        }

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: data,
        })	

	}

	async update_vidcon({request,response})
	{

		const _request = request.only(['uid', 'id_vidcon_submit', 'id_vidcon', 'masuk', 'keluar'])

		const update = await Database
			.table('vidcon_submit')
			.where('uid', _request.uid)
			.where('id_vidcon_submit', _request.id_vidcon_submit)
			.where('id_vidcon', _request.id_vidcon)
			.update({
				masuk : _request.masuk,
				keluar: _request.keluar,
			})
			.returning('masuk')


        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: update[0],
        })	

	}

}

module.exports = LatihanController
