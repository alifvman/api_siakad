

'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');
var _ = require('lodash');

class ReportController {
	async HasilUjian({ response, params }) {
		const data = await Database
			.select('t1.noujian', 't1.tanggal', 't2.nama', 't1.kd_pelajaran', 't3.nm_pelajaran', 't4.jumlah_soal', 't4.nilai', 't1.kelas', 't1.jenis_ujian', 't1.tanggal as tgl_ambil', 't1.ujianke')
			.table('ujian as t1')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('pelajaran as t3', 't1.kd_pelajaran', 't3.kd_pelajaran')
			.leftJoin('ujianhasil as t4', 't1.noujian', 't4.noujian')
			.where('t1.jenis', 'tryout')
			.where('t1.uid', params.id)
			.orderBy('t1.kd_pelajaran', 'ASC')
			.orderBy('t1.noujian', 'ASC')

		for (var keyWaktu = 0; keyWaktu < data.length; keyWaktu++) {
			const Waktu = await Database
				.select('waktu')
				.table('soal_ujian')
				.where('kd_pelajaran', data[keyWaktu].kd_pelajaran)
				.where('kelas', data[keyWaktu].kelas)
				.where('jenis_ujian', data[keyWaktu].jenis_ujian)
				.limit(1)
				.first()

			data[keyWaktu]['waktu'] = Waktu;
		}
		return response.json(data)
	}

	async HasilUjianMobile({ response, params }) {
		try {
			const Alldata = await Database
				.select('t1.noujian', 't1.tanggal', 't2.nama', 't1.kd_pelajaran', 't3.nm_pelajaran', 't4.jumlah_soal', 't4.nilai', 't1.kelas', 't1.jenis_ujian', 't1.tanggal as tgl_ambil', 't1.ujianke')
				.table('ujian as t1')
				.leftJoin('peserta as t2', 't1.uid', 't2.uid')
				.leftJoin('pelajaran as t3', 't1.kd_pelajaran', 't3.kd_pelajaran')
				.leftJoin('ujianhasil as t4', 't1.noujian', 't4.noujian')
				.where('t1.jenis', 'tryout')
				.where('t1.uid', params.id)
				.orderBy('t1.kd_pelajaran', 'ASC')
				.orderBy('t1.noujian', 'ASC')
				.paginate(params.page, 5)

			const data = Alldata.data

			for (var keyWaktu = 0; keyWaktu < data.length; keyWaktu++) {
				const Waktu = await Database
					.select('waktu')
					.table('soal_ujian')
					.where('kd_pelajaran', data[keyWaktu].kd_pelajaran)
					.where('kelas', data[keyWaktu].kelas)
					.where('jenis_ujian', data[keyWaktu].jenis_ujian)
					.limit(1)
					.first()

				data[keyWaktu]['waktu'] = Waktu;
			}
			return response.json({
				response: 200,
				data: data
			})
		} catch (e) {
			return response.json({
				response: 500,
				data: [],
			})
		}
	}

	async AnalisaHasil({ response, params }) {

		const jenis_ujian = await Database
			.select('t1.nilai_lulus', 't2.jenis_ujian', 't2.kelas', 'nama as nama', 'uid')
			.table('peserta as t2')
			.leftJoin('m_jenis_ujian as t1', 't2.jenis_ujian', 't1.jenis_ujian_id')
			.where('t2.uid', params.id)
			.first()

		// buat loop acordion
		const hasilPel = await Database
			.select('t1.noujian', 't1.tanggal', 't1.kd_pelajaran', 't2.nama', 't3.nm_pelajaran', 't2.uid')
			.table('ujian as t1')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('pelajaran as t3', 't1.kd_pelajaran', 't3.kd_pelajaran')
			.where('t1.jenis', 'tryout')
			.where('t1.uid', params.id)
			.where('t1.jenis_ujian', jenis_ujian.jenis_ujian)
			.where('t1.kelas', jenis_ujian.kelas)
			.orderBy('t1.kd_pelajaran', 'ASC')

		let Allpelajaran = []
		let num = 1;
		let kd_pelajaran = []

		let countRataRata = 0

		for (var i = 0; i < hasilPel.length; i++) {

			hasilPel[i].tanggal = moment(hasilPel[i].tanggal).format('D-MM-Y');

			kd_pelajaran[i] = hasilPel[i].kd_pelajaran;

			if (kd_pelajaran[i] == kd_pelajaran[(i - 1)]) {
				num++;
			} else {
				num = 1;
			}

			hasilPel[i].ujianke = num

			let sql_statis = await Database
				.select(Database.raw("SUBSTRING(t4.kd_soal_statis,1,3) as kd_soal_statis"))
				.table('ujian_detail as t1')
				.leftJoin('soal as t4', 't1.kd_soal', 't4.kd_soal')
				.leftJoin('ujianhasil as t6', 't6.noujian', 't1.noujian')
				.where('t1.noujian',hasilPel[i].noujian)
				.groupBy(Database.raw("SUBSTRING(t4.kd_soal_statis,1, 3)"))


			hasilPel[i]['kodeStatis'] = sql_statis

			let nilai 		= []
			let TotalSoal 	= []
			let TotalBetul 	= []
			let Allbetul 	= []
			let Allrata2 	= []
			let TotalRata2 	= []

			for (var a = 0; a < sql_statis.length; a++) {
				Allpelajaran.push("'" + sql_statis[a].kd_soal_statis + "'")

				let nilai = await Database
					.select('jawab','kunci')
					.table('ujian_detail as t1')
					.leftJoin('soal as t2', 't2.kd_soal', 't1.kd_soal')
					.where('t1.noujian',hasilPel[i].noujian)
					.where(Database.raw("SUBSTRING(t2.kd_soal_statis,1, 3)"), sql_statis[a].kd_soal_statis)

				let nilairata = await Database
					.select('t5.kd_soal', 't1.kd_pelajaran', 't3.nm_pelajaran', Database.raw("LEFT(t4.kd_soal_statis,3) as kd_soal_statis"), 't5.jawab', 't4.kd_soal_statis', 't4.kunci')
					.table('ujian as t1')
					.leftJoin('peserta as t2', 't1.uid', 't2.uid')
					.leftJoin('pelajaran as t3', 't1.kd_pelajaran', ' t3.kd_pelajaran')
					.leftJoin('ujian_detail as t5', 't1.noujian', 't5.noujian')
					.leftJoin('soal as t4', 't5.kd_soal', 't4.kd_soal')
					.where('t1.jenis', 'tryout')
					.where('t1.uid', params.id)
					.where('t1.kd_pelajaran', hasilPel[i].kd_pelajaran)
					.where('t1.noujian', '<=', hasilPel[i].noujian)
					.where(Database.raw("LEFT(t4.kd_soal_statis,3)"), sql_statis[a].kd_soal_statis)



				var betul = nilai.filter(function (e) {
					return e.jawab === e.kunci;
				});

				var betulrata = nilairata.filter(function (d) {
					return d.jawab === d.kunci;
				});

				let rata = parseFloat(betul.length) / parseFloat(hasilPel[i].ujianke)
				// return betul.length 
				let rata2 = parseFloat(betulrata.length) / parseFloat(hasilPel[i].ujianke)

				sql_statis[a]['betul'] = betul.length
				sql_statis[a]['rata2'] = rata2
				sql_statis[a]['jumlahSoal'] = nilai.length

				TotalSoal.push(nilai.length)
				TotalRata2.push(rata2)
				TotalBetul.push(betul.length)
				Allrata2.push(sql_statis[a].rata2)
				Allbetul.push(sql_statis[a].betul)

			}

			countRataRata += TotalRata2.reduce((a, b) => a + b, 0)

			hasilPel[i]['totalsoal'] = TotalSoal.reduce((a, b) => a + b, 0)
			hasilPel[i]['totalbetul'] = TotalBetul.reduce((a, b) => a + b, 0)
			hasilPel[i]['totalRata2'] = TotalRata2.reduce((a, b) => a + b, 0)
			hasilPel[i]['nilaibetul'] = "{ name:" + "'Nilai Akhir'" + ",data : [" + Allbetul.join() + ',' + TotalBetul.reduce((a, b) => a + b, 0) + "]}"
			hasilPel[i]['nilairata2'] = "{ name :" + "'Nilai Rata2'" + ",data : [" + Allrata2.join() + ',' + TotalRata2.reduce((a, b) => a + b, 0) + "]}"
		}
		
		const rata_rata = countRataRata / hasilPel.length
		
		jenis_ujian.rata_rata = rata_rata.toFixed(2)
	

		return response.json({
			jenis_ujian: jenis_ujian,
			hasilPel: hasilPel,
			pelajaran: "[" + Allpelajaran.join() + "," + "'Total'" + "]",

		})
	}

	async AnalisaHasilPelajaran({ response, params }) {
		const jenis_ujian = await Database
			.select('t1.nilai_lulus', 't2.jenis_ujian', 't2.kelas')
			.table('peserta as t2')
			.leftJoin('m_jenis_ujian as t1', 't2.jenis_ujian', 't1.jenis_ujian_id')
			.where('t2.uid', params.id)
			.first()

		// buat loop acordion
		const hasilPel = await Database
			.select('t1.noujian', 't1.tanggal', 't1.kd_pelajaran', 't2.nama', 't3.nm_pelajaran')
			.table('ujian as t1')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('pelajaran as t3', 't1.kd_pelajaran', 't3.kd_pelajaran')
			.where('t1.jenis', 'tryout')
			.where('t1.uid', params.id)
			.where('t1.jenis_ujian', jenis_ujian.jenis_ujian)
			.where('t1.kelas', jenis_ujian.kelas)
			.orderBy('t1.kd_pelajaran', 'ASC')

		let num = 1;
		let kd_pelajaran = []
		for (var i = 0; i < hasilPel.length; i++) {
			hasilPel[i].tanggal = moment(hasilPel[i].tanggal).format('D-MM-Y');

			kd_pelajaran[i] = hasilPel[i].kd_pelajaran;
			if (kd_pelajaran[i] == kd_pelajaran[(i - 1)]) {
				num++;
			} else {
				num = 1;
			}

			hasilPel[i].ujianke = num
		}

		return response.json({
			jenis_ujian: jenis_ujian,
			hasilPel: hasilPel,
		})
	}

	async AnalisaHasilPelajaranTable({ response, request }) {
		const Inputs = request.only(['uid', 'kd_pelajaran', 'no_ujian', 'ujianke'])

		let sql_statis = await Database
			.select(Database.raw("LEFT(t4.kd_soal_statis,3) as kd_soal_statis"), 't6.jumlah_soal')
			.table('ujian as t1')
			.leftJoin('ujian_detail as t5', 't1.noujian', 't5.noujian')
			.leftJoin('soal as t4', 't5.kd_soal', 't4.kd_soal')
			.leftJoin('ujianhasil as t6', 't6.noujian', 't1.noujian')
			.whereNotNull('t4.kd_soal_statis')
			.where('t1.jenis', 'tryout')
			.where('uid', Inputs.uid)
			.groupBy(Database.raw("LEFT(t4.kd_soal_statis,3)"), 'ASC')

		let Allpelajaran = []
		let Allrata2 = []
		let Allbetul = []
		let TotalSoal = []
		let TotalRata2 = []
		let TotalBetul = []

		for (var a = 0; a < sql_statis.length; a++) {
			Allpelajaran.push("'" + sql_statis[a].kd_soal_statis + "'")

			let nilai = await Database
				.select('t5.kd_soal', 't1.kd_pelajaran', 't3.nm_pelajaran', Database.raw("LEFT(t4.kd_soal_statis,3) as kd_soal_statis"), 't5.jawab', 't4.kd_soal_statis', 't4.kunci')
				.table('ujian as t1')
				.leftJoin('peserta as t2', 't1.uid', 't2.uid')
				.leftJoin('pelajaran as t3', 't1.kd_pelajaran', ' t3.kd_pelajaran')
				.leftJoin('ujian_detail as t5', 't1.noujian', 't5.noujian')
				.leftJoin('soal as t4', 't5.kd_soal', 't4.kd_soal')
				.where('t1.jenis', 'tryout')
				.where('t1.uid', Inputs.uid)
				.where('t1.kd_pelajaran', Inputs.kd_pelajaran)
				.where('t1.noujian', Inputs.no_ujian)
				.where(Database.raw("LEFT(t4.kd_soal_statis,3)"), sql_statis[a].kd_soal_statis)

			var betul = nilai.filter(function (d) {
				return d.jawab === d.kunci;
			});

			let rata2 = parseFloat(betul.length) / parseFloat(Inputs.ujianke)

			sql_statis[a]['betul'] = betul.length
			sql_statis[a]['rata2'] = rata2
			sql_statis[a]['jumlahSoal'] = nilai.length


			TotalSoal.push(nilai.length)
			TotalRata2.push(rata2)
			TotalBetul.push(betul.length)

			Allrata2.push(sql_statis[a].rata2)
			Allbetul.push(sql_statis[a].betul)

		}

		return response.json({
			data: sql_statis,
			totalSoal: TotalSoal.reduce((a, b) => a + b, 0),
			totalRata2: TotalRata2.reduce((a, b) => a + b, 0),
			totalBetul: TotalBetul.reduce((a, b) => a + b, 0),
			pelajaran: "[" + Allpelajaran.join() + "," + "'Total'" + "]",
			nilai: "[{ name :" + "'Nilai Rata2'" + ",data : [" + Allrata2.join() + ',' + TotalRata2.reduce((a, b) => a + b, 0) + "]},{ name:" + "'Nilai Akhir'" + ",data : [" + Allbetul.join() + ',' + TotalBetul.reduce((a, b) => a + b, 0) + "]}]",
		})
	}

	// ALIF OUTHER
	async HasilUjianKoor({ response, params }){
		const data = await Database
			.select('t1.noujian', 't1.tanggal', 't2.nama', 't1.kd_pelajaran', 't3.nm_pelajaran', 't4.jumlah_soal', 't4.nilai', 't1.kelas', 't1.jenis_ujian', 't1.tanggal as tgl_ambil', 't1.ujianke')
			.table('guru_koordinasi as guru')
			.leftJoin('ujian as t1', 't1.uid', 'guru.uid')
			.leftJoin('peserta as t2', 't1.uid', 't2.uid')
			.leftJoin('pelajaran as t3', 't1.kd_pelajaran', 't3.kd_pelajaran')
			.leftJoin('ujianhasil as t4', 't1.noujian', 't4.noujian')
			.where('t1.jenis', 'tryout')
			.where('guru.idg', params.id)
			.where('t1.status', 'SELESAI')
			.orderBy('t2.nama', 'ASC')
			.orderBy('t1.ujianke', 'ASC')


		for (var keyWaktu = 0; keyWaktu < data.length; keyWaktu++) {
			const Waktu = await Database
				.select('waktu')
				.table('soal_ujian')
				.where('kd_pelajaran', data[keyWaktu].kd_pelajaran)
				.where('kelas', data[keyWaktu].kelas)
				.where('jenis_ujian', data[keyWaktu].jenis_ujian)
				.limit(1)
				.first()

			data[keyWaktu]['waktu'] = Waktu;
		}

		if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal = moment(data[i].tanggal).format('DD MMMM Y')
                data[i].tgl_ambil = moment(data[i].tgl_ambil).format('DD MMMM Y')
            }
        }

        const guru = await Database
        	.select('namag')
        	.table('guru')
        	.where('idg', params.id)

        return response.json({
            status: true,
            responses: 200,
            data: data,
            guru: guru,
        })

	}

	async SiswaAnalis({response, params}){

		const data = await Database
			.select('t2.nama', 'guru.uid')
			.table('guru_koordinasi as guru')
			.leftJoin('peserta as t2', 'guru.uid', 't2.uid')
			.where('guru.idg', params.id)

		const ujian = await Database
			.select('uid', 'status')
			.table('ujian') 
			.where('jenis', 'tryout')

		var result = data.map((value) => {
            const filter = ujian.filter(obj => obj.uid == value.uid & obj.status == 'SELESAI') 
            return {
                ...value,
                hasil : filter.length > 0 ? true : false
            }        
        });

		return response.json({
            status: true,
            responses: 200,
            data: result,
        })
	}

	async MobileAnalisJenisUjian({response, request}){

		const Inputs = request.only(['uid','jenis'])


		if (!Inputs.uid || !Inputs.jenis) {
			return response.json({
	            status: 500,
	            responses: false,
	            data: [],
	        })
		}

		const jenis_ujian = await Database
			.select('kd_pelajaran')
			.table('ujian')
			.where('uid', Inputs.uid)
			.where('status', 'SELESAI')
			.where('jenis', Inputs.jenis)
			.groupBy('kd_pelajaran')
			.orderBy('kd_pelajaran','ASC')

		const pelajaran = await Database
			.table('pelajaran')

		var result = jenis_ujian.map((value) => {
            const filter = pelajaran.find(obj => obj.kd_pelajaran == value.kd_pelajaran) 
            return {
                ...value,
                nm_pelajaran : filter.nm_pelajaran
            }        
        });

        result.push({kd_pelajaran : 'ALL', nm_pelajaran: 'SUMMARY'})

        return response.json({
            status: 200,
            responses: true,
            data: result,
        })
	}

	async MobileAnalisUjian({response, request}){

		const Inputs = request.only(['uid','jenis','kd_pelajaran'])


		if (!Inputs.uid || !Inputs.jenis) {
			return response.json({
	            status: 500,
	            responses: false,
	            data: [],
	        })
		}

		const jenis_ujian = await Database
			.select('kd_pelajaran')
			.table('ujian')
			.where('uid', Inputs.uid)
			.where('status', 'SELESAI')
			.where('jenis', Inputs.jenis)
			.groupBy('kd_pelajaran')
			.orderBy('kd_pelajaran','ASC')
			.limit(1)
		const kd_pelajaran = Inputs.kd_pelajaran ? Inputs.kd_pelajaran : jenis_ujian.length > 0 ? jenis_ujian[0].kd_pelajaran : 'ALL'

		if (kd_pelajaran == 'ALL') {
			return this.summaryData(Inputs.uid, Inputs.jenis, Inputs.kd_pelajaran, {response})
		}


		let ujian = await Database
			.select('ujian.*','ujian_detail.kd_soal','soal.kd_soal_statis','ujian_detail.jawab','soal.kunci')
			.table('ujian')
			.innerJoin('ujianhasil', 'ujianhasil.noujian', 'ujian.noujian')
			.innerJoin('ujian_detail', 'ujian_detail.noujian', 'ujian.noujian')
			.innerJoin('soal', 'soal.kd_soal', 'ujian_detail.kd_soal')
			.where('ujian.uid', Inputs.uid)
			.where('ujian.status', 'SELESAI')
			.where('ujian.jenis', Inputs.jenis)
			.where('ujian.kd_pelajaran', kd_pelajaran)
			.orderBy('ujianke','ASC')


		// master ujian ====================================================================
		let ujian_data = []
		for (var i = 0; i < ujian.length; i++) {
			const dataTemp = {
				noujian : ujian[i].noujian,
				uid : ujian[i].uid,
				ujianke : ujian[i].ujianke,
				tanggal : ujian[i].tanggal,
				status : ujian[i].status,
				kd_pelajaran : ujian[i].kd_pelajaran,
				kelas : ujian[i].kelas,
				jenis_ujian : ujian[i].jenis_ujian,
				keputusan : ujian[i].keputusan,
				jenis : ujian[i].jenis,
			}
			ujian_data.push(dataTemp)
		}
		function uniqueUjian(arr) {
		    var cleaned = [];
		    ujian_data.forEach(function(itm) {
		        var unique = true;
		        cleaned.forEach(function(itm2) {
		            if (_.isEqual(itm, itm2)) unique = false;
		        });
		        if (unique)  cleaned.push(itm);
		    });
		    return cleaned;
		}
		var result_ujian = uniqueUjian(ujian_data);

		//header chart =============================================================================
		let chart_header = []
		for (var i = 0; i < ujian.length; i++) {
			const dataTemp = {
				noujian : ujian[i].noujian,
				kd_soal_statis : ujian[i].kd_soal_statis.substr(0, 3),
			}
			chart_header.push(dataTemp)
		}

		function uniqueKodeSoal(arr) {
		    var cleaned = [];
		    chart_header.forEach(function(itm) {
		        var unique = true;
		        cleaned.forEach(function(itm2) {
		            if (_.isEqual(itm, itm2)) unique = false;
		        });
		        if (unique)  cleaned.push(itm);
		    });
		    return cleaned;
		}
		var chart_result_header = uniqueKodeSoal(chart_header);		


		//data chart =============================================================================
		let chart_data_rata_rata = []
		for (var i = 0; i < ujian.length; i++) {
			const dataTemp = {
				noujian : ujian[i].noujian,
				kd_soal_statis : ujian[i].kd_soal_statis.substr(0, 3),
				userid : ujian[i].jawab == ujian[i].kunci ? true : false,
			}
			chart_data_rata_rata.push(dataTemp)
		}


		var result = result_ujian.map((value) => {
            const filter_chart_header = chart_result_header.filter(obj => obj.noujian == value.noujian) 
            const result_chart_header = filter_chart_header.map((header) => {
            	return header.kd_soal_statis
            });

            const result_chart_data_Rata_rata = filter_chart_header.map((header) => {
            	return {
            		y: chart_data_rata_rata.filter(objRata => objRata.noujian == value.noujian && objRata.kd_soal_statis == header.kd_soal_statis && objRata.benar == true).length /  value.ujianke
            	}
            });

            const result_chart_data_nilai_terakhir = filter_chart_header.map((header) => {
            	return {
            		y: chart_data_rata_rata.filter(objRata => objRata.noujian == value.noujian && objRata.kd_soal_statis == header.kd_soal_statis && objRata.benar == true).length
            	}
            });

            const result_table_data = filter_chart_header.map((header, key) => {
            	return [
            		key + 1, 
            		header.kd_soal_statis,
            		chart_data_rata_rata.filter(objRata => objRata.noujian == value.noujian && objRata.kd_soal_statis == header.kd_soal_statis).length,
            		chart_data_rata_rata.filter(objRata => objRata.noujian == value.noujian && objRata.kd_soal_statis == header.kd_soal_statis && objRata.benar == true).length /  value.ujianke,
            		chart_data_rata_rata.filter(objRata => objRata.noujian == value.noujian && objRata.kd_soal_statis == header.kd_soal_statis && objRata.benar == true).length
            	]
            });
            return {
                ...value,
                table : {
                	header : ['No','Topik','JML SOAL','Nilai Rata2','Nilai Terakhir'],
                	data   : result_table_data
                },
                chart : {
                	header : result_chart_header,
                	data : [
                		{
                			label 	: 'Nilai Rata Rata',
                			values	: result_chart_data_Rata_rata,
                			config: {
					            drawValues: false,
					            colors: [-8604180],
				          	}
                		},
                		{
                			label 	: 'Nilai Akhir',
                			values	: result_chart_data_nilai_terakhir,
                			config: {
					            drawValues: false,
					            colors: [-12369080],
				          	}
                		}
                	]
                }
            }        
        });


        return response.json({
            status: 200,
            responses: true,
            summary : false,
            data: result,
        })


	}


	async summaryData(uid, jenis, kd_pelajaran, {response}){   

		const ujian = await Database
			.table('ujian')
			.where('uid',uid)
			.where('jenis',jenis)
			.orderBy('kd_pelajaran','ASC')


		const pelajaran = await Database
			.table('pelajaran')
		const ujian_hasil = await Database
			.table('ujianhasil')
		const jenis_ujian = await Database
			.table('m_jenis_ujian')

		const ujian_pelajaran = ujian.map((value) => {
            const filter = pelajaran.find(obj => obj.kd_pelajaran == value.kd_pelajaran) 
            const hasil = ujian_hasil.find(obj => obj.noujian == value.noujian) 
            const jns_ujian = jenis_ujian.find(obj => obj.jenis_ujian_id == value.jenis_ujian) 

            const filter_result = filter ? filter.nm_pelajaran : ''
            const hasil_result = hasil ? hasil.nilai : 0
            const nilai_lulus = jns_ujian ? jns_ujian.nilai_lulus : 0

            return {
                ...value,
                pelajaran : filter_result,
                hasil : hasil_result,
                status_ : hasil_result >= nilai_lulus ? 'PASS' : 'NO PASS',
            }        
        });


        const result_table_data = ujian_pelajaran.map((data, key) => {
        	return [
        		data.pelajaran,
        		data.ujianke,
        		data.hasil,
        		data.status_,
        	]
        });

        //header chart =============================================================================
		let chart_header = []
		for (var i = 0; i < ujian_pelajaran.length; i++) {
			if (ujian_pelajaran[i].pelajaran.substr(0,6) == "TryOut") {
				chart_header.push(ujian_pelajaran[i].pelajaran.substr(6,100))
			}
		}
		
		function uniqueHeader(arr) {
		    var cleaned = [];
		    chart_header.forEach(function(itm) {
		        var unique = true;
		        cleaned.forEach(function(itm2) {
		            if (_.isEqual(itm, itm2)) unique = false;
		        });
		        if (unique)  cleaned.push(itm);
		    });
		    return cleaned;
		}
		var chart_result_header = uniqueHeader(chart_header);		

		/// bottom chart ============================================================================
		let chart_bottom = []
		for (var i = 0; i < ujian_pelajaran.length; i++) {
			chart_bottom.push(ujian_pelajaran[i].ujianke)
		}

		function uniqueBottom(arr) {
		    var cleaned = [];
		    chart_bottom.forEach(function(itm) {
		        var unique = true;
		        cleaned.forEach(function(itm2) {
		            if (_.isEqual(itm, itm2)) unique = false;
		        });
		        if (unique)  cleaned.push(itm);
		    });
		    return cleaned;
		}
		var chart_result_bottom = uniqueBottom(chart_bottom);	

		const color = [[-8604180],[-12369080],[-7279235],[-548004],[-8354327]]
		var resultData = chart_result_bottom.map((value, key) => {
			const filter = ujian_pelajaran.filter(obj => obj.ujianke == value) 
			const nilai  = filter.map((nilai_value, nilai_key) => {
				return nilai_value.hasil
			})
            return {
                label : 'Ke '+value,
                values : nilai,
                config: {
		            drawValues: false,
		            colors: color[key] ? color[key] : '#F00',
	          	}
            }        
        });

		const result = [{
			summary : true,
            chart : {
            	header : chart_result_header,
            	data   : resultData
            },
			table : {
            	header : ['Tryout','Ke','Total','Status'],
            	data   : result_table_data
            },
		}]

		return response.json({
            status: 200,
            responses: true,
            summary : true,
            data: result,
        })         
  	}

  	async summary_all({response, params}){

  		const cek = await Database
  			.table('guru_koordinasi as koor')
  			.where('idg', params.id)
  			.first()

  		if (cek) {

  			const peserta = await Database
	  			.select('peserta.uid', 'userid', 'nama', 'jenis_ujian', 'peserta.kelas')
	  			.table('guru_koordinasi as koor')
	  			.innerJoin('peserta', 'peserta.uid', 'koor.uid')
	  			.where('idg', params.id)

	  		const ujian = await Database
	  			.select('noujian', 'uid', 'jenis')
	  			.table('ujian')
	  			.where('status', 'SELESAI')

	  		const ujianhasil = await Database
	  			.select('noujian', 'nilai')
	  			.table('ujianhasil')

	  		const waktu = await Database
	  			.select('uid', 'jam', 'menit', 'detik')
	  			.table('waktu')
	  			.whereNotNull('jam')
	  			.whereNotNull('menit')
	  			.whereNotNull('detik')

	  		const data_peserta = await Database
	  			.select('peserta.uid', 'peserta.jenis_ujian', 'peserta.kelas')
	  			.table('peserta')
	  			.innerJoin('ujian', 'ujian.uid', 'peserta.uid')
	  			.where('status', 'SELESAI')
	  			.where('jenis', 'tryout')
	  			.groupBy('peserta.uid', 'peserta.jenis_ujian', 'peserta.kelas')


	  		const data_peserta_pelajaran = await Database
	  			.select('peserta.uid', 'peserta.jenis_ujian', 'peserta.kelas', 'ujian.kd_pelajaran')
	  			.table('peserta')
	  			.innerJoin('ujian', 'ujian.uid', 'peserta.uid')
	  			.where('status', 'SELESAI')
	  			.where('jenis', 'tryout')
	  			.groupBy('peserta.uid', 'peserta.jenis_ujian', 'peserta.kelas', 'ujian.kd_pelajaran')

			var jenis_ujian 	= data_peserta.map((ujian) => {

	        	const pelajaran = data_peserta_pelajaran.filter(data => data.uid == ujian.uid)
				return {
					...ujian,
					matpel : pelajaran.length

				}
			})

	  		var nilai = ujian.map((value) => {
	  			const total_nilai 	= ujianhasil.filter(obj => obj.noujian == value.noujian)
	        	var total			= total_nilai.map((value_nilai) => {
	        		return value_nilai.nilai
	        	})
	  			return {
	  				...value,
	        		nilai : total.length > 0 ? total.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	  			}

	  		})

	  		var vidcon_submit = await Database
	  			.table('vidcon_submit as submit')
	  			.innerJoin('vidcon', 'vidcon.id_vidcon', 'submit.id_vidcon')
	  			.whereNotNull('masuk')
	  			.where('idg', params.id)

	        var jumlah = peserta.map((value) => {
	        	const tryout 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'tryout')
	        	const latihan 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'latihan')
	        	const jumlah_all= nilai.filter(obj => obj.uid == value.uid)
	        	const total_to 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'tryout')
	        	const total_lt  = nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'latihan')
	        	const jam 		= waktu.filter(obj => obj.uid == value.uid)
	        	const jumlahlt	= jenis_ujian.filter(obj => obj.uid == value.uid)
	        	const vidcon 	= vidcon_submit.filter(obj => obj.uid == value.uid)
	        	var jam_akses	= jam.map((value_jam) => {
	        		return value_jam.jam
	        	})
	        	var menit_akses	= jam.map((value_menit) => {
	        		return value_menit.menit
	        	})
	        	var detik_akses	= jam.map((value_detik) => {
	        		return value_detik.detik
	        	})
	        	var all_nilai_to= total_to.map((value_nilai_to) => {
	        		return value_nilai_to.nilai
	        	})
	        	var all_nilai_lt= total_lt.map((value_nilai_lt) => {
	        		return value_nilai_lt.nilai
	        	})
	        	var jumlah_lat	= jumlahlt.map((value_jumlahlt) => {
	        		return value_jumlahlt.matpel
	        	})
	        	return{
	        		...value,
	        		total_tryout 		: tryout.length,
	        		total_latihan 		: latihan.length,
	        		total_jumlah_all	: jumlah_all.length,
	        		jumlah_lat		 	: jumlah_lat,
	        		total_nilai_to		: all_nilai_to.length > 0 ? all_nilai_to.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	        		total_nilai_lt		: all_nilai_lt.length > 0 ? all_nilai_lt.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	        		total_akses_jam		: jam_akses.length > 0 ? jam_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	        		total_akses_menit	: menit_akses.length > 0 ? menit_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	        		total_akses_detik	: detik_akses.length > 0 ? detik_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
	        		total_vidcon 		: vidcon.length,
	        	}
	        })

	       	for (let i = 0; i < jumlah.length; i++) {
	            jumlah[i].total_akses_menit	= jumlah[i].total_akses_jam * 60 + jumlah[i].total_akses_menit + jumlah[i].total_akses_detik / 60
	            jumlah[i].total_nilai_to	= jumlah[i].total_nilai_to / jumlah[i].total_tryout
	            jumlah[i].total_nilai_lt	= jumlah[i].total_nilai_lt / jumlah[i].total_latihan
	        }


			let result = []
			for (var a = 0; a < jumlah.length; a++) {
				const dataTemp = {
					uid 				: jumlah[a].uid,
					userid 				: jumlah[a].userid,
					nama 				: jumlah[a].nama,
					total_tryout 		: jumlah[a].total_tryout,
					total_latihan 		: jumlah[a].total_latihan,
					jumlah_to 			: jumlah[a].jumlah_lat.toString(),
					total_rata	 		: jumlah[a].total_nilai_to.toString().substr(0, 5),
					total_akses_menit 	: jumlah[a].total_akses_menit.toString().substr(0, 5),
					total_vidcon 		: jumlah[a].total_vidcon,
				}
				result.push(dataTemp)
			}

	  		return response.json({
	            status 		: 200,
	            responses 	: true,
	            summary 	: true,
	            data 		: result,
	        })

  		}else{

  			let result = []

	  		return response.json({
	            status 		: 500,
	            responses 	: false,
	            summary 	: false,
	            data 		: result,
	        })

  		}

  	}

  	async peserta_summary_all({response, params})
  	{

  		const koor = await Database
  			.select('idg')
  			.table('guru_koordinasi')
  			.where('uid', params.id)
  			.first()

  		if (koor) {

	  		const cek = await Database
	  			.table('guru_koordinasi as koor')
	  			.where('idg', koor.idg)
	  			.first()

			if (cek) {

	  			const peserta = await Database
		  			.select('peserta.uid', 'userid', 'nama')
		  			.table('guru_koordinasi as koor')
		  			.innerJoin('peserta', 'peserta.uid', 'koor.uid')
		  			.where('idg', koor.idg)

		  		const ujian = await Database
	  			.select('noujian', 'uid', 'jenis')
	  			.table('ujian')
	  			.where('status', 'SELESAI')

		  		const ujianhasil = await Database
		  			.select('noujian', 'nilai')
		  			.table('ujianhasil')

		  		const waktu = await Database
		  			.select('uid', 'jam', 'menit', 'detik')
		  			.table('waktu')
		  			.whereNotNull('jam')
		  			.whereNotNull('menit')
		  			.whereNotNull('detik')

				const data_peserta = await Database
					.table('peserta')

				const data_tryout = await Database
					.select('t2.nm_pelajaran', 'jenis_ujian', 'kelas')
					.table('soal_ujian as t1')
					.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
					.where('t2.status_pelajaran', '1')
					.groupBy('t2.nm_pelajaran', 'jenis_ujian', 'kelas')

				var jenis_ujian 	= data_peserta.map((ujian) => {
					const matpel 	= data_tryout.filter(data => data.jenis_ujian == ujian.jenis_ujian && data.kelas == ujian.kelas)
					var val_matpel	= matpel.map((value_matpel) => {
		        		return value_matpel.nm_pelajaran
		        	})
					return {
						...ujian,
						matpel : val_matpel.length

					}
				})

		  		var nilai = ujian.map((value) => {
		  			const total_nilai 	= ujianhasil.filter(obj => obj.noujian == value.noujian)
		        	var total			= total_nilai.map((value_nilai) => {
		        		return value_nilai.nilai
		        	})
		  			return {
		  				...value,
		        		nilai : total.length > 0 ? total.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		  			}

		  		})

		  		var vidcon_submit = await Database
		  			.table('vidcon_submit as submit')
		  			.innerJoin('vidcon', 'vidcon.id_vidcon', 'submit.id_vidcon')
		  			.whereNotNull('masuk')
		  			.where('idg', koor.idg)

		        var jumlah = peserta.map((value) => {
		        	const tryout 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'tryout')
		        	const latihan 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'latihan')
		        	const jumlah_all= nilai.filter(obj => obj.uid == value.uid)
		        	const total_to 	= nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'tryout')
		        	const total_lt  = nilai.filter(obj => obj.uid == value.uid & obj.jenis == 'latihan')
		        	const jam 		= waktu.filter(obj => obj.uid == value.uid)
		        	const vidcon 	= waktu.filter(obj => obj.uid == value.uid)
		        	const jumlahlt	= jenis_ujian.filter(obj => obj.uid == value.uid)
		        	var jam_akses	= jam.map((value_jam) => {
		        		return value_jam.jam
		        	})
		        	var menit_akses	= jam.map((value_menit) => {
		        		return value_menit.menit
		        	})
		        	var detik_akses	= jam.map((value_detik) => {
		        		return value_detik.detik
		        	})
		        	var all_nilai_to= total_to.map((value_nilai_to) => {
		        		return value_nilai_to.nilai
		        	})
		        	var all_nilai_lt= total_lt.map((value_nilai_lt) => {
		        		return value_nilai_lt.nilai
		        	})
		        	var jumlah_lat	= jumlahlt.map((value_jumlahlt) => {
		        		return value_jumlahlt.matpel
		        	})
		        	return{
		        		...value,
		        		total_tryout 		: tryout.length,
		        		total_latihan 		: latihan.length,
		        		total_jumlah_all	: jumlah_all.length,
		        		jumlah_lat		 	: jumlah_lat,
		        		total_nilai_to		: all_nilai_to.length > 0 ? all_nilai_to.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		        		total_nilai_lt		: all_nilai_lt.length > 0 ? all_nilai_lt.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		        		total_akses_jam		: jam_akses.length > 0 ? jam_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		        		total_akses_menit	: menit_akses.length > 0 ? menit_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		        		total_akses_detik	: detik_akses.length > 0 ? detik_akses.reduce((acc, bill) => parseFloat(bill) + parseFloat(acc)) : 0,
		        		total_vidcon 		: vidcon.length,
		        	}
		        })

		       	for (let i = 0; i < jumlah.length; i++) {
		            jumlah[i].total_akses_menit	= jumlah[i].total_akses_jam * 60 + jumlah[i].total_akses_menit + jumlah[i].total_akses_detik / 60
		            jumlah[i].total_nilai_to	= jumlah[i].total_nilai_to / jumlah[i].total_tryout
		            jumlah[i].total_nilai_lt	= jumlah[i].total_nilai_lt / jumlah[i].total_latihan
		        }

				let result = []
				for (var a = 0; a < jumlah.length; a++) {
					const dataTemp = {
						uid 				: jumlah[a].uid,
						userid 				: jumlah[a].userid,
						nama 				: jumlah[a].nama,
						total_tryout 		: jumlah[a].total_tryout,
						total_latihan 		: jumlah[a].total_latihan,
						jumlah_to 			: jumlah[a].jumlah_lat.toString(),
						total_rata	 		: jumlah[a].total_nilai_to.toString().substr(0, 5),
						total_akses_menit 	: jumlah[a].total_akses_menit.toString().substr(0, 5),
						total_vidcon 		: jumlah[a].total_vidcon,
					}
					result.push(dataTemp)
				}

		  		return response.json({
		            status 		: 200,
		            responses 	: true,
		            summary 	: true,
		            data 		: result,
		        })

	  		}else{

	  			let result = []

		  		return response.json({
		            status 		: 500,
		            responses 	: false,
		            summary 	: false,
		            data 		: result,
		        })

	  		}
  		}else{

  			let result = []

	  		return response.json({
	            status 		: 500,
	            responses 	: false,
	            summary 	: false,
	            data 		: result,
	        })

  		}

  		

  	}

  	async Pel_SummaryPertryout({response, params})
  	{

		const gurukoor = await Database
			.select('peserta.jenis_ujian','peserta.kelas')
			.table('guru_koordinasi as koor')
			.where('idg', params.id)
			.leftJoin('peserta', 'peserta.uid', 'koor.uid')
			.first()

		const data_tryout = await Database
			.select('t1.kd_pelajaran', 't2.nm_pelajaran')
			.table('soal_ujian as t1')
			.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
			.where('t1.jenis_ujian', gurukoor.jenis_ujian)
			.where('t1.kelas', gurukoor.kelas)
			.where('t2.status_pelajaran', '1')
			.groupBy('t1.kd_pelajaran', 't2.nm_pelajaran')

		return response.json({
            status: true,
            responses: 200,
            data: data_tryout
        })

  	}

  	async SummaryPertryout({response, request})
  	{

  		const _request = request.only(['idg', 'kd_pelajaran'])

  		const kd_pelajaran 	= _request.kd_pelajaran ? `ujian.kd_pelajaran = '${_request.kd_pelajaran}'` : 'ujian.kd_pelajaran IS NULL'
  		const kd_pel 		= _request.kd_pelajaran ? `kd_pelajaran = '${_request.kd_pelajaran}'` : 'kd_pelajaran IS NULL'

		const gurukoor = await Database
			.select('koor.idg', 'koor.uid', 'peserta.nama')
			.table('guru_koordinasi as koor')
			.where('idg', _request.idg)
			.leftJoin('peserta', 'peserta.uid', 'koor.uid')
			.innerJoin('ujian', 'ujian.uid', 'peserta.uid')
			.whereRaw(kd_pelajaran)
			.where('jenis', 'tryout')
			.where('status', 'SELESAI')
			.groupBy('koor.idg', 'koor.uid', 'peserta.nama')

		for (var i = 0; i < gurukoor.length; i++) {

			const ujian = await Database
				.select('pelajaran.nm_pelajaran', 'ujian.ujianke', 'hasil.nilai', 'ujian.uid','ujian.noujian')
				.table('ujian')
				.innerJoin('pelajaran', 'pelajaran.kd_pelajaran', 'ujian.kd_pelajaran')
				.leftJoin('ujianhasil as hasil', 'hasil.noujian', 'ujian.noujian')
				.where('jenis', 'tryout')
				.where('status', 'SELESAI')
				.where('uid', gurukoor[i].uid)
				.whereRaw(kd_pelajaran)
				.limit(3)

			let TotalRata2 	= []
			for (var a = 0; a < ujian.length; a++) {

				const hasil = await Database
					.table('ujianhasil')
					.where('noujian', ujian[a].noujian)
					.first()

				ujian[a].total = hasil ? hasil.nilai : 0
				TotalRata2.push(hasil.nilai)

			}
			var ratarata 			= TotalRata2.reduce((a, b) => a + b, 0) / ujian.length 
			gurukoor[i].totalrata 	= ratarata.toString().substr(0, 5);
			gurukoor[i].hasil 		= ujian

		}

		const pelajaran = await Database
			.select('nm_pelajaran')
			.table('pelajaran')
			.whereRaw(kd_pel)
			.first()

		return response.json({
            status: true,
            responses: 200,
            data: gurukoor,
            pelajaran: pelajaran ? pelajaran.nm_pelajaran : 0
        })

  	}

}

module.exports = ReportController
