'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class HalamanDepanController {
	async HalamanDepanTampil ({response}){
		const data = await Database
			// .select('t1.*','t2.category_desc')
			.select('t1.*','t2.category_desc', 't3.sub_category', 't4.sektor')
			.table('berita as t1')
			.leftJoin('t_category as t2','t1.category_id','t2.category_id')
			.leftJoin('t_sub_category as t3','t1.id_sub','t3.id_sub')
			.leftJoin('t_sektor as t4','t1.id_sektor','t4.id_sektor')
			.whereIn('t1.category_id',['4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'])
			.orderBy('t1.id_berita','ASC')
		return response.json(data)
	}

	async HalamanDepanId ({response,params}){
		const data = await Database
			.table('berita')
			.where('id_berita',params.id)
			.first()

		const kategori = await Database
			.select('category_id','category_desc')
			.table('t_category')
			.where('category_id',data.category_id)
			.first()

		return response.json({
			data : data,
			category : kategori
		})
	}

	async UpdateHalamanDepan ({response,request}){
		const Inputs = request.only(['id_berita','judul','ringkasan','lengkap','tanggal','foto','free','sub_category','sektor','image_no'])
		const update = await Database
			.table('berita')
			.where('id_berita',Inputs.id_berita)
			.update({
				judul     		: Inputs.judul,
				ringkasan 		: Inputs.ringkasan,
				lengkap   		: Inputs.lengkap,
				tanggal_manual  : Inputs.tanggal,
				foto 			: Inputs.foto,
				free 			: Inputs.free,
				id_sub 	   		: Inputs.sub_category,
				id_sektor 		: Inputs.sektor,
				image_no 		: Inputs.image_no,
			})
	}

	async DeleteHalamanDepan ({response,params}){

		const cek = await Database
			.table('berita')
			.where('id_berita', params.id)
			.first()

		if (cek.id_investor) {

			const hapus = await Database
				.table('user_investor')
				.where('id_investor', cek.id_investor)
				.delete()

		}

		const update = await Database
			.table('berita')
			.where('id_berita',cek.id_berita)
			.delete()
	}

	async InsertHalamanDepan ({response,request}){
		const Inputs = request.only(['id_berita','judul','ringkasan','lengkap','tanggal','category','foto','free','sub_category','sektor','image_no'])
		const update = await Database
			.table('berita')
			.insert({
				category_id 	: Inputs.category,
				id_sub 	   		: Inputs.sub_category,
				id_sektor 		: Inputs.sektor,
				judul       	: Inputs.judul,
				ringkasan   	: Inputs.ringkasan,
				lengkap     	: Inputs.lengkap,
				tanggal     	: Inputs.tanggal,
				tanggal_manual 	: Inputs.tanggal,
				foto           	: Inputs.foto,
				image_no 		: Inputs.image_no,
				free           	: Inputs.free,
			})
	}

	async update_foto({response,request})
	{

		const _request = request.only(['id_berita','image_no'])

		const update = await Database
			.table('berita')
			.where('id_berita', _request.id_berita)
			.update({
				image_no	: _request.image_no
			})

        return response.json({
            status 			: true,
            responses 		: 200,
        })

	}

	async youtube({ response })
	{

		const data = await Database
			.table('youtube')

    	for (let i = 0; i < data.length; i++) {

    		if (data[i].start && data[i].finish) {

				var start 	= data[i].start
				var finish	= data[i].finish

				start.setHours(start.getHours() - 12)
				start = new Date(start)
				data[i].start = moment(start).format('Y-MM-DD hh:mm:ss')

				finish.setHours(finish.getHours() - 12)
				finish = new Date(finish)
				data[i].finish= moment(finish).format('Y-MM-DD hh:mm:ss')

    		}

		}

		var baru  	= new Date()
		baru= moment(baru).format('Y-MM-DD hh:mm')

        return response.json({
            status 			: true,
            responses 		: 200,
            data 			: data,
            baru 			: baru,
        })

	}

	async StoreYoutube({ response, request })
	{

		const _request = request.only(['nama','link','start','finish'])

		var cek = _request.link.substring(0, 16)

		if (cek == 'https://youtu.be') {

			const validate = await Database
				.table('youtube')
				.where('link', _request.link)
				.first()

			if (!validate) {

				const insert = await Database
					.insert({
						nama 	: _request.nama,
						link 	: _request.link,
						start 	: _request.start,
						finish 	: _request.finish,
					})
					.into('youtube')

		        return response.json({
		            status 			: true,
		            responses 		: 200,
		        })

			}else{

		        return response.json({
		            status 			: false,
		            responses 		: 400,
		            data 			: _request,
		            massage 		: 'Link Youtube Sudah ada'
		        })

			}

		}else{

	        return response.json({
	            status 			: false,
	            responses 		: 400,
	            data 			: _request,
	            massage 		: 'Harap Menggunakan Link youtube'
	        })

		}

	}

	async StatusYoutube({ response, request })
	{

		const _request = request.only(['id_youtube', 'status'])

		const update = await Database
			.table('youtube')
			.where('id_youtube', _request.id_youtube)
			.update({
				status 	: _request.status
			})

        return response.json({
            status 			: true,
            responses 		: 200,
        })

	}

	async EditYoutube({ response, params })
	{

		const data = await Database
			.table('youtube')
			.where('id_youtube', params.id)
			.first()

		var start 	= data.start
		var finish	= data.finish

		start.setHours(start.getHours())
		start = new Date(start)
		data.start = moment(start).format('Y-MM-DDThh:mm:ss')

		finish.setHours(finish.getHours())
		finish = new Date(finish)
		data.finish=  moment(finish).format('Y-MM-DDThh:mm:ss')

        return response.json({
            status 		: true,
            responses 	: 200,
        	data 		: data,
        })

	}

	async UpdateYoutube({ response, request })
	{

		const _request = request.only(['nama','link','id_youtube','start','finish'])

		var cek = _request.link.substring(0, 16)

		if (cek == 'https://youtu.be') {

			const validate = await Database
				.table('youtube')
				.where('link', _request.link)
				.whereNotIn('id_youtube', [_request.id_youtube])
				.first()

			if (!validate) {

				const insert = await Database
					.table('youtube')
					.where('id_youtube', _request.id_youtube)
					.update({
						nama 	: _request.nama,
						link 	: _request.link,
						start 	: _request.start,
						finish 	: _request.finish,
					})

		        return response.json({
		            status 			: true,
		            responses 		: 200,
		        })

			}else{

		        return response.json({
		            status 			: false,
		            responses 		: 400,
		            massage 		: 'Link Youtube Sudah ada',
		            data 			: _request.id_youtube,
		        })

			}

		}else{

	        return response.json({
	            status 			: false,
	            responses 		: 400,
	            massage 		: 'Harap Menggunakan Link youtube',
	            data 			: _request.id_youtube,
	        })

		}

	}

	async DeleteYoutube({ response, params })
	{

		const data = await Database
			.table('youtube')
			.where('id_youtube', params.id)
			.delete()

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

}
module.exports = HalamanDepanController
