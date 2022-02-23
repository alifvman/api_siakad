'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class HomeController {

	async baru({ response, params }){

		const insert = await Database
			.table('namatable')
			.insert({
				id: params.id
			})

	}

	async text_agreement({ response }) {
		const agreement = await Database
			.table('agreement')
			.first()
		return response.json(agreement)
	}

	async slider({ response }) {
		const slider = await Database
			.table('t_image_slide')
			.where('status_image', '1')
		return response.json(slider)
	}

	async InfoPeserta({ response, params }) {
		let hari_ini = moment().format('Y-MM-D')
		const data_peserta = await Database
			.select('t1.*', 't2.kelas_desc')
			.table('peserta as t1')
			.leftJoin('m_kelas as t2', 't1.kelas', 't2.kelas_id')
			.where('t1.uid', params.id)
			.first()

		const data_ujian = await Database
			.table('m_jenis_ujian')
			.where('jenis_ujian_id', data_peserta.jenis_ujian)
			.first()

		const soal_latihan = await Database
			.select('t1.kd_pelajaran', 't2.nm_pelajaran')
			.table('soal_latihan as t1')
			.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
			.where('t1.jenis_ujian', data_peserta.jenis_ujian)
			.where('t1.kelas', data_peserta.kelas)
			.where('t2.status_pelajaran', '1')
			.groupBy('t1.kd_pelajaran', 't2.nm_pelajaran')

		for (var i = 0; i < soal_latihan.length; i++) {
			const hasil = await Database
				.select('ujianke')
				.table('ujian')
				.where('uid', params.id)
				.where('kd_pelajaran', soal_latihan[i].kd_pelajaran)
				.where('tanggal', hari_ini)
				.where('status', 'SELESAI')
				.orderBy('ujianke', 'DESC')
				.first()

			let status = []
			if (hasil) {
				status = hasil
			} else {
				status = []
			}

			soal_latihan[i].status = status
		}


		const data_tryout = await Database
			.select('t1.kd_pelajaran', 't2.nm_pelajaran')
			.table('soal_ujian as t1')
			.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
			.where('t1.jenis_ujian', data_peserta.jenis_ujian)
			.where('t1.kelas', data_peserta.kelas)
			.where('t2.status_pelajaran', '1')
			.groupBy('t1.kd_pelajaran', 't2.nm_pelajaran')


		return response.json({
			data_peseta: data_peserta,
			data_ujian: data_ujian,
			soal_latihan: soal_latihan,
			soal_tryout: data_tryout,
		})

	}

	async test({ response, request }) {
		const Inputs = request.only(['username', 'password'])
		return response.json(Inputs.username)
	}

	async info({ response, request }) {
		try {

			const _request 	= request.only(['jenis', 'id', 'tanggal', 'search'])

			// const berita_local = await Database
			// 	.table('berita as t1')
			// 	.where('t1.category_id', 1)
			// 	// .where('status', 'Approved')
			// 	.orderBy('id_berita', 'DESC')
			// 	.limit(3)

			// const berita_global = await Database
			// 	.table('berita as t1')
			// 	.where('t1.category_id', 2)
			// 	// .where('status', 'Approved')
			// 	.orderBy('id_berita', 'DESC')
			// 	.limit(3)

			let tanggal_manual 	= new Date(new Date(_request.tanggal).getTime()+(24*60*60*1000));
			let cari_tgl = moment(tanggal_manual).format('Y-MM-D');

		    let where_category = 't1.category_id is not null';
		    if(_request.jenis == 'category') {
		      where_category = `t1.category_id = ${_request.id}`
		    }else if(_request.jenis == 'sub_category'){
		      where_category = `t1.id_sub = ${_request.id}`
		  	}else if(_request.jenis == 'sektor'){
		      where_category = `t1.id_sektor = ${_request.id}`
		  	}

		    let where_search = `judul is not null`;
		    if (_request.search) {
		      where_search = `judul like '%${_request.search.toUpperCase()}%'`
		    }

		    let where_tgl = 't1.tanggal_manual is not null';
		    if(_request.tanggal != 0) {
		      where_tgl = `t1.tanggal_manual = '${_request.tanggal}'`
		    }

		    let where = `${where_category} AND ${where_search} AND ${where_tgl}`

			const tanggal = await Database
				.select('tanggal_manual')
				.table('berita')
				.where('status', 'Approved')
				.groupBy('tanggal_manual')

	        if (tanggal) {
	            // DATE FORMATTING FOR EXPIRED
	            for (let i = 0; i < tanggal.length; i++) {
					tanggal[i].cari_tgl 		= new Date(new Date(tanggal[i].tanggal_manual).getTime()+(24*60*60*1000));
	                tanggal[i].tanggal_manusia 	= moment(tanggal[i].cari_tgl).format('LL')
	            }
	        }

			let berita_local 	= []
			let berita_global 	= [] 

			if (_request.jenis == 'bursa') {

				const berita_satu = await Database
					.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
					.table('berita as t1')
					.where('status', 'Approved')
					.where('t1.category_id', 25)
					.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
					.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
					.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
					.orderBy('id_berita', 'DESC')
					.paginate(1, 6)

		        if (berita_satu.data) {
		            // DATE FORMATTING FOR EXPIRED
		            for (let i = 0; i < berita_satu.data.length; i++) {
		                berita_satu.data[i].tanggal_manusia 	= moment(berita_satu.data[i].tanggal_manual).format('LL')
		            }
		        }	

				berita_local = berita_satu.data

			}else if(_request.jenis == 'emiten'){

				const berita_satu = await Database
					.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
					.table('berita as t1')
					.where('status', 'Approved')
					.where('t1.category_id', 26)
					.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
					.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
					.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
					.orderBy('id_berita', 'DESC')
					.paginate(1, 6)

		        if (berita_satu.data) {
		            // DATE FORMATTING FOR EXPIRED
		            for (let i = 0; i < berita_satu.data.length; i++) {
		                berita_satu.data[i].tanggal_manusia 	= moment(berita_satu.data[i].tanggal_manual).format('LL')
		            }
		        }	

				berita_local = berita_satu.data

			}else if (_request.jenis || _request.search || _request.tanggal) {

				const berita_satu = await Database
					.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
					.table('berita as t1')
					.where('status', 'Approved')
					.whereNotIn('t1.category_id', [25,26,27,28])
					.whereRaw(where)
					.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
					.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
					.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
					.orderBy('id_berita', 'DESC')
					.paginate(1, 6)

		        if (berita_satu.data) {
		            // DATE FORMATTING FOR EXPIRED
		            for (let i = 0; i < berita_satu.data.length; i++) {
		                berita_satu.data[i].tanggal_manusia 	= moment(berita_satu.data[i].tanggal_manual).format('LL')
		            }
		        }	

				berita_local = berita_satu.data
			}else{

				const berita_satu = await Database
					.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
					.table('berita as t1')
					.where('t1.category_id', 1)
					.where('status', 'Approved')
					.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
					.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
					.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
					.orderBy('id_berita', 'DESC')
					.paginate(3, 3)

		        if (berita_satu.data) {
		            // DATE FORMATTING FOR EXPIRED
		            for (let i = 0; i < berita_satu.data.length; i++) {
		                berita_satu.data[i].tanggal_manusia 	= moment(berita_satu.data[i].tanggal_manual).format('LL')
		            }
		        }	

				const berita_dua = await Database
					.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
					.table('berita as t1')
					.where('t1.category_id', 2)
					.where('status', 'Approved')
					.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
					.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
					.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
					.orderBy('id_berita', 'DESC')
					.paginate(3, 3)

		        if (berita_dua.data) {
		            // DATE FORMATTING FOR EXPIRED
		            for (let i = 0; i < berita_dua.data.length; i++) {
		                berita_dua.data[i].tanggal_manusia 	= moment(berita_dua.data[i].tanggal_manual).format('LL')
		            }
		        }	

				berita_local = berita_satu.data
				berita_global = berita_dua.data

			}

			const id_berita = await Database
				.table('t_category')
				.whereIn('category_id', [1, 2, 3])
				.orderBy('category_id', 'ASC')
				.limit(6)

			var berita = [];
			for (var IdBerita = 0; IdBerita < id_berita.length; IdBerita++) {
				const beritaq = await Database
					.table('berita')
					.where('category_id', id_berita[IdBerita].category_id)
					.where('status', 'Approved')
					.orderBy('id_berita', 'DESC')
					.limit(2)

				berita.push(beritaq);
			}


			return response.json({
				status 			: 200,
				berita_local 	: berita_local,
				berita_global 	: berita_global,
				berita 			: berita,
				tanggal 		: tanggal,
			});
		} catch (e) {
			return response.json({
				status 			: 500,
				berita_local 	: [],
				berita_global 	: [],
				berita 			: [],
				tanggal 		: [],
			});
		}
	}

	async slider_berita({ response, request })
	{

		const data = await Database
			.select('t1.*','t2.category_desc', 't4.sektor', 't3.sub_category')
			.table('berita as t1')
			.whereIn('t1.category_id', [1, 2])
			.where('status', 'Approved')
			.whereNotNull('foto')
			.leftJoin('t_category as t2', 't2.category_id', 't1.category_id')
			.leftJoin('t_sub_category as t3', 't3.id_sub', 't1.id_sub')
			.leftJoin('t_sektor as t4', 't4.id_sektor', 't1.id_sektor')
			.orderBy('id_berita', 'DESC')
			.paginate(1, 5)

		return response.json({
			status 	: 200,
			data 	: data.data,
		});

	}

	async saham({ response, request })
	{

		const saham = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'saham')

		if (saham) {
            for (let i = 0; i < saham.length; i++) {
            	if (saham[i].persentase) {
                	saham[i].persentase 		= saham[i].persentase.substring(0, 5);
            	};
            }
		};

		const datasaham = await Database
			.select('mulai', 'selesai')
			.table('ringkasan_dagang')
			.where('kategori', 'saham')
			.groupBy('mulai', 'selesai')
			.limit(1)

        if (datasaham) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < datasaham.length; i++) {
                datasaham[i].mulai 		= moment(datasaham[i].mulai).format('LL')
                datasaham[i].selesai 	= moment(datasaham[i].selesai).format('LL')
            }
        }
		
		const komoditas = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'komoditas')

		if (komoditas) {
            for (let i = 0; i < komoditas.length; i++) {
            	if (komoditas[i].persentase) {
                	komoditas[i].persentase 		= komoditas[i].persentase.substring(0, 5);
            	};
            }
		};

		const datakomoditas = await Database
			.select('mulai', 'selesai')
			.table('ringkasan_dagang')
			.where('kategori', 'komoditas')
			.groupBy('mulai', 'selesai')
			.limit(1)

        if (datakomoditas) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < datakomoditas.length; i++) {
                datakomoditas[i].mulai 		= moment(datakomoditas[i].mulai).format('LL')
                datakomoditas[i].selesai 	= moment(datakomoditas[i].selesai).format('LL')
            }
        }

		const currency = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'currency')

		if (currency) {
            for (let i = 0; i < currency.length; i++) {
            	if (currency[i].persentase) {
                	currency[i].persentase 		= currency[i].persentase.substring(0, 5);
               	};
            }
		};

		const datacurrency = await Database
			.select('mulai', 'selesai')
			.table('ringkasan_dagang')
			.where('kategori', 'currency')
			.groupBy('mulai', 'selesai')
			.limit(1)

        if (datacurrency) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < datacurrency.length; i++) {
                datacurrency[i].mulai 		= moment(datacurrency[i].mulai).format('LL')
                datacurrency[i].selesai 	= moment(datacurrency[i].selesai).format('LL')
            }
        }

        return response.json({
            status 			: true,
            responses 		: 200,
            saham 			: saham,
            komoditas 		: komoditas,            
            currency 		: currency,
            datasaham 		: datasaham,
            datakomoditas 	: datakomoditas,            
            datacurrency 	: datacurrency,
        })
		
	}

	async materi({ response, params }) {
		try {
			const data = await Database
				.select('t1.no_materi', 't1.jenis_ujian', 't1.topik', 't1.file_name', 't1.link_url', 't1.status_materi', 't2.jenis_ujian_desc')
				.table('t_unduh_materi as t1')
				.leftJoin('m_jenis_ujian as t2', 't1.jenis_ujian', 't2.jenis_ujian_id')
				.where('t1.jenis_ujian', params.id)
				.where('t1.status_materi', '1')

			for (var i = 0; i < data.length; i++) {
				let file_materi = data[i].link_url.replace(/ /g, '%20')
				data[i].link_mobile = 'https://investalearning.com/public/assets/materi/' + file_materi
			}

			return response.json({ response: 200, data: data })
		} catch (e) {
			return response.json({ response: 201, data: e })
		}
	}

	async data_materi({response, request}) {

		const _request = request.only(['jenis_ujian', 'uid'])

		const data = await Database
			.select('t1.no_materi', 't1.jenis_ujian', 't1.topik', 't1.file_name', 't1.link_url', 't1.status_materi', 't2.jenis_ujian_desc')
			.table('t_unduh_materi as t1')
			.leftJoin('m_jenis_ujian as t2', 't1.jenis_ujian', 't2.jenis_ujian_id')
			.where('t1.jenis_ujian', _request.jenis_ujian)
			.where('t1.status_materi', '1')

		for (var i = 0; i < data.length; i++) {
			let file_materi = data[i].link_url.replace(/ /g, '%20')
			data[i].link_mobile = 'https://investalearning.com/public/assets/materi/' + file_materi

			const peserta = await Database
				.table('materi_submit')
				.where('no_materi', data[i].no_materi)
				.where('uid', _request.uid)
				.whereNotNull('masuk')
				.whereNotNull('keluar')
				.orderBy('id_materi_submit', 'DESC')
				.first()

			let time = ""

			if (peserta) {
				peserta.masuk = new Date(peserta.masuk)
				peserta.keluar = new Date(peserta.keluar)

				time = peserta.keluar - peserta.masuk

			}

			data[i].waktu 	= time != "" ? new Date(time).toISOString().substr(11, 8) : 'null'
			data[i].read 	= peserta ? peserta : 'null'

		}

		return response.json({ response: 200, data: data })

	}

	async peraturan({ response, params }) {
		try {
			const data = await Database
				.select('t1.no_materi', 't1.jenis_ujian', 't1.topik', 't1.file_name', 't1.link_url', 't1.status_materi', 't2.jenis_ujian_desc')
				.table('t_unduh_peraturan as t1')
				.leftJoin('m_jenis_ujian as t2', 't1.jenis_ujian', 't2.jenis_ujian_id')
				.where('t1.jenis_ujian', params.id)
				.where('t1.status_materi', '1')

			for (var i = 0; i < data.length; i++) {
				let file_peraturan = data[i].link_url.replace(/ /g, '%20')
				data[i].link_mobile = 'https://investalearning.com/public/assets/materi/' + file_peraturan
			}
			return response.json({ response: 200, data: data })
		} catch (e) {
			return response.json({ response: 201, data: e })
		}
	}

	async dokumentasi({ response, params }) {
		try {
			const data = await Database
				.select('t1.no_materi', 't1.jenis_ujian', 't1.topik', 't1.file_name', 't1.link_url', 't1.status_materi', 't2.jenis_ujian_desc')
				.table('t_unduh_dokumentasi as t1')
				.leftJoin('m_jenis_ujian as t2', 't1.jenis_ujian', 't2.jenis_ujian_id')
				.where('t1.jenis_ujian', params.id)
				.where('t1.status_materi', '1')

			for (var i = 0; i < data.length; i++) {
				let file_dokumentasi = data[i].link_url.replace(/ /g, '%20')
				data[i].link_mobile = 'https://investalearning.com/public/assets/materi/' + file_dokumentasi
			}
			return response.json({ response: 200, data: data })
		} catch (e) {
			return response.json({ response: 201, data: e })
		}
	}

	async video({ response, params }) {
		try {
			const Internal = await Database
				.table('video')
				.where('status', 'YES')
				.where('type', 'internal')
				.where('jenis', params.id)
				.orderBy('id', 'ASC')

			for (var i = 0; i < Internal.length; i++) {
				let file_video_internal = Internal[i].nama_video.replace('(', '%28').replace(')', '%29')
				Internal[i].link_mobile = 'https://investalearning.com/public/assets/video/' + file_video_internal
			}

			const Eksternal = await Database
				.table('video')
				.where('status', 'YES')
				.where('type', 'eksternal')
				.where('jenis', params.id)
				.orderBy('id', 'ASC')

			for (var a = 0; a < Eksternal.length; a++) {
				let file_video_eksternal = Eksternal[a].nama_video.replace('(', '%28').replace(')', '%29')
				Eksternal[a].link_mobile = 'https://investalearning.com/public/assets/video/' + file_video_eksternal
			}

			let data = []
			data.push({ page: 'Internal', data: Internal })
			data.push({ page: 'Eksternal', data: Eksternal })

			return response.json({
				response: 200,
				data: data
			})
		}

		catch (e) {
			return response.json({
				response: 201,
				data: e
			})
		}
	}

	async berita({ response, params }) {
		const data = await Database
			.table('berita as t1')
			.where('id_berita', params.id)
	
        for (let i = 0; i < data.length; i++) {
            if (data[i].image_no) {
                data[i].image_no_temp	= data[i].image_no.split(',')
            };
        }	

		const update = await Database
			.table('berita')
			.where('id_berita', params.id)
			.update({
				total_akses : data[0].total_akses + 1,
			})

		if (data[0].image_no_temp) {

			const image = await Database
				.table('t_images as t1')
				.whereIn('image_no', data[0].image_no_temp)

			var result = data.map((value) => {
	            const filter = image.filter(obj => obj.image_status == 34) 
	            return {
	                ...value,
	                gambar : filter,
	            }        
	        });

			return response.json(result[0])

		}else{

			const image = await Database
				.table('t_images as t1')

			var result = data.map((value) => {
	            const filter = image.filter(obj => obj.image_status == 34) 
	            return {
	                ...value,
	                gambar : filter,
	            }        
	        });
			
			return response.json(result[0])

		}

	}

	async beritaMobile({ response, params }) {
		const data = await Database
			.table('berita')
			.where('id_berita', params.id)
			.first()

		if (data) {
			return response.json({
				status: 200,
				data: data,
			})
		} else {
			return response.json({
				status: 500,
				data: "Not Found",
			})
		}
	}

	async LatihanMobile({ response, request }) {
		const Inputs = request.only(['uid', 'jenis'])
		let hari_ini = moment().format('Y-MM-D')
		try {
			const data_peserta = await Database
				.select('t1.*', 't2.kelas_desc')
				.table('peserta as t1')
				.leftJoin('m_kelas as t2', 't1.kelas', 't2.kelas_id')
				.where('t1.uid', Inputs.uid)
				.first()

			let data = []
			if (Inputs.jenis == 'latihan') {
				data = await Database
					.select('t1.kd_pelajaran', 't2.nm_pelajaran')
					.table('soal_latihan as t1')
					.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
					.where('t1.jenis_ujian', data_peserta.jenis_ujian)
					.where('t1.kelas', data_peserta.kelas)
					.where('t2.status_pelajaran', '1')
					.groupBy('t1.kd_pelajaran', 't2.nm_pelajaran')
			} else {
				data = await Database
					.select('t1.kd_pelajaran', 't2.nm_pelajaran')
					.table('soal_ujian as t1')
					.leftJoin('pelajaran as t2', 't1.kd_pelajaran', 't2.kd_pelajaran')
					.where('t1.jenis_ujian', data_peserta.jenis_ujian)
					.where('t1.kelas', data_peserta.kelas)
					.where('t2.status_pelajaran', '1')
					.groupBy('t1.kd_pelajaran', 't2.nm_pelajaran')
			}
			const result = ({
				dataPeserta: data_peserta,
				dataLatihan: data,
			})

			return response.json({
				status: 200,
				data: result,
			})
		} catch (e) {
			return response.json({
				status: 500,
				data: e,
			})
		}

	}

	async subscriber({request, response})
	{

		const _request = request.only(['email'])

		const cek = await Database
			.table('subscriber')
			.where('email', _request.email)
			.first()

		if (!cek) {
			const insert = await Database
				.insert({
					email 		: _request.email,
					created_at 	: new Date(),
					updated_at	: new Date(),
				})
				.into('subscriber')
				.returning('email')

	        return response.json({
	            status 		: true,
	            responses 	: 200,
	            data 		: 'Success',
	        })	

		}else{
			if (cek.status == true) {

		        return response.json({
		            status 		: true,
		            responses 	: 300,
		            data 		: 'Approved',
		        })

			}else{

		        return response.json({
		            status 		: false,
		            responses 	: 500,
		            data 		: 'Error',
		        })

		    }

		}

	}

	async cekusername({request, response})
	{

		const _request = request.only(['username'])

		const cek = await Database
			.table('langganan_berita')
			.where('username', _request.username)
			.first()

		const cek_dua = await Database
			.table('peserta')
			.where('userid', _request.username)
			.first()

		const cek_tiga = await Database
			.table('guru')
			.where('userg', _request.username)
			.first()

		if (!cek && !cek_dua && !cek_tiga) {

	        return response.json({
	            status 		: true,
	            responses 	: 200,
	            data 		: '',
	        })

		}else{

	        return response.json({
	            status 		: false,
	            responses 	: 500,
	            data 		: 'username '+_request.username+' sudah digunakan. Silahkan username nama lain. Terima kasih.',
	        })

		}

	}

	async submit_materi({request, response})
	{

		const _request = request.only(['uid', 'no_materi'])

		const insert = await Database
			.insert({
				no_materi 	: _request.no_materi,
				uid 		: _request.uid,
				masuk 		: new Date(),
			})
			.into('materi_submit')
			.returning('id_materi_submit')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: insert[0],
        })

	}

	async close_Read({request, response})
	{

		const _request = request.only(['id_materi_submit'])

		const update = await Database
			.table('materi_submit')
			.where('id_materi_submit', _request.id_materi_submit)
			.update({
				keluar : new Date(),
			})

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async question({request, response})
	{

		const _request = request.only(['nama','email','telp','question'])

		const insert = await Database
			.insert({
				nama 	: _request.nama,
				email 	: _request.email,
				telp 	: _request.telp,
				question: _request.question,
			})
			.into('question')
			.returning('question')

        return response.json({
            status 		: true,
            responses 	: 200,
            question 	: insert[0],
        })

	}

	async artikel({request, response})
	{

		const data = await Database
			.table('berita')
			.where('status', 'Approved')
			.where('category_id', 27)
			.whereNotNull('id_investor')
			.orderBy('id_berita', 'DESC')
			.limit(3)

        if (data) {

            for (let i = 0; i < data.length; i++) {
			    
			    var tanggallengkap = data[i].tanggal_manual;
			    var namahari = ("Minggu Senin Selasa Rabu Kamis Jumat Sabtu");
			    namahari = namahari.split(" ");
			    var namabulan = ("Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember");
			    namabulan = namabulan.split(" ");
			    var tgl = new Date(tanggallengkap);
			    var hari = tgl.getDay();
			    var tanggal = tgl.getDate();
			    var bulan = tgl.getMonth();
			    var tahun = tgl.getFullYear();
			    tanggallengkap = namahari[hari] + ", " +tanggal + " " + namabulan[bulan] + " " + tahun;
	            
			    data[i].tanggal_manusia = tanggallengkap

            // DATE FORMATTING FOR EXPIRED
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }


        }
	    

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async kolom({request, response})
	{

		const data = await Database
			.table('berita')
			.where('status', 'Approved')
			.where('category_id', 28)
			.orderBy('id_berita', 'DESC')
			.limit(3)

        if (data) {

            for (let i = 0; i < data.length; i++) {
			    
			    var tanggallengkap = data[i].tanggal_manual;
			    var namahari = ("Minggu Senin Selasa Rabu Kamis Jumat Sabtu");
			    namahari = namahari.split(" ");
			    var namabulan = ("Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember");
			    namabulan = namabulan.split(" ");
			    var tgl = new Date(tanggallengkap);
			    var hari = tgl.getDay();
			    var tanggal = tgl.getDate();
			    var bulan = tgl.getMonth();
			    var tahun = tgl.getFullYear();
			    tanggallengkap = namahari[hari] + ", " +tanggal + " " + namabulan[bulan] + " " + tahun;
	            
			    data[i].tanggal_manusia = tanggallengkap

            // DATE FORMATTING FOR EXPIRED
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }

        }

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async youtube({ response, request })
	{

		const jamini = moment().format('hhmmss')

		const data = await Database
			.table('youtube')
			.whereRaw(`DATE_FORMAT(start, "%H%i%s") <= ${jamini}`)
			.andWhereRaw(`DATE_FORMAT(finish, "%H%i%s") >= ${jamini}`)
			.orderBy('id_youtube', 'DESC')
			.first()

		const refresh = await Database
			.table('youtube')
			.orderBy('id_youtube', 'DESC')
			.first()

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data ? data : [],
            refresh 	: refresh
        })

	}

	async list_suara({ response, request })
	{

		const data = await Database
			.table('berita')
			.where('status', 'Approved')
			.where('category_id', 27)
			.whereNotNull('id_investor')
			.orderBy('id_berita', 'DESC')
			.limit(10)

        if (data) {

            for (let i = 0; i < data.length; i++) {
			    
			    var tanggallengkap = data[i].tanggal_manual;
			    var namahari = ("Minggu Senin Selasa Rabu Kamis Jumat Sabtu");
			    namahari = namahari.split(" ");
			    var namabulan = ("Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember");
			    namabulan = namabulan.split(" ");
			    var tgl = new Date(tanggallengkap);
			    var hari = tgl.getDay();
			    var tanggal = tgl.getDate();
			    var bulan = tgl.getMonth();
			    var tahun = tgl.getFullYear();
			    tanggallengkap = namahari[hari] + ", " +tanggal + " " + namabulan[bulan] + " " + tahun;
	            
			    data[i].tanggal_manusia = tanggallengkap

            // DATE FORMATTING FOR EXPIRED
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }

        }

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async list_kolom({ response, request })
	{

		const data = await Database
			.table('berita')
			.where('status', 'Approved')
			.where('category_id', 28)
			.orderBy('id_berita', 'DESC')
			.limit(10)

        if (data) {

            for (let i = 0; i < data.length; i++) {
			    
			    var tanggallengkap = data[i].tanggal_manual;
			    var namahari = ("Minggu Senin Selasa Rabu Kamis Jumat Sabtu");
			    namahari = namahari.split(" ");
			    var namabulan = ("Januari Februari Maret April Mei Juni Juli Agustus September Oktober November Desember");
			    namabulan = namabulan.split(" ");
			    var tgl = new Date(tanggallengkap);
			    var hari = tgl.getDay();
			    var tanggal = tgl.getDate();
			    var bulan = tgl.getMonth();
			    var tahun = tgl.getFullYear();
			    tanggallengkap = namahari[hari] + ", " +tanggal + " " + namabulan[bulan] + " " + tahun;
	            
			    data[i].tanggal_manusia = tanggallengkap

            // DATE FORMATTING FOR EXPIRED
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }

        }

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

}

module.exports = HomeController
