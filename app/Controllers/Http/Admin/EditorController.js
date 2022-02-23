'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment')
const Mail = use('Mail')

class EditorController {

	async formeditor({response,request}){

		const data = await Database
			.table('user_editor')
			.orderBy('id_editor','ASC')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async store_editor({response,request})
	{

		const _request = request.only(['nama','statusaktif','username','password'])

		const cek = await Database
			.table('user_editor')
			.where('username', _request.username)
			.first()

		const cek_dua = await Database
			.table('langganan_berita')
			.where('username', _request.username)
			.first()

		if (!cek && !cek_dua) {

			const insert = await Database
				.insert({
					nama 		: _request.nama,
					username 	: _request.username,
					password 	: _request.password,
					statusaktif : _request.statusaktif,
				})
				.into('user_editor')
				.returning('nama')

			return response.json({
				status 	: 200,
				massage : "Editor telah terdaftar",
				data 	: insert[0]
			})

		}else{

			return response.json({
				status: 201,
				massage: "Username Telah Digunakan"
			})

		}

	}

	async statusaktif({response,request})
	{

		const _request = request.only(['id_editor','statusaktif'])

		const update = await Database
			.table('user_editor')
			.where('id_editor', _request.id_editor)
			.update({
				statusaktif : _request.statusaktif,
			})

	}

	async edit_editor({response,request})
	{

		const _request = request.only(['id_editor'])

		const data = await Database
			.table('user_editor')
			.where('id_editor', _request.id_editor)
			.first()

		return response.json({
			status 	: 200,
			response: true,
			data 	: data,
		})

	}

	async update_editor({response,request})
	{

		const _request = request.only(['id_editor','nama','statusaktif','username','password'])

		const cek = await Database
			.table('user_editor')
			.where('username', _request.username)
			.whereNotIn('id_editor', [_request.id_editor])
			.first()

		const cek_dua = await Database
			.table('langganan_berita')
			.where('username', _request.username)
			.first()

		if (!cek && !cek_dua) {

			const insert = await Database
				.into('user_editor')
				.where('id_editor', _request.id_editor)
				.update({
					nama 		: _request.nama,
					username 	: _request.username,
					password 	: _request.password,
					statusaktif : _request.statusaktif,
				})
				.returning('nama')

			return response.json({
				status 	: 200,
				massage : "Editor telah terdaftar",
				data 	: insert[0]
			})

		}else{

			return response.json({
				status: 201,
				massage: "Username Telah Digunakan"
			})

		}

	}

	async delete_editor({response,request})
	{

		const _request = request.only(['id_editor'])

		const hapus = await Database
			.table('user_editor')
			.where('id_editor', _request.id_editor)
			.delete()

	}

	async berita_editor({response,request})
	{

		const _request = request.only(['id_editor'])

		const data = await Database
			.select('berita.*', 'kategori.category_desc')
			.table('berita')
			.where('created_by', _request.id_editor)
			.innerJoin('t_category as kategori', 'kategori.category_id', 'berita.category_id')
			.orderBy('id_berita', 'DESC')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }
        }

		return response.json({
			status 	: 200,
			response: true,
			data 	: data,
		})		

	}

	async status_editor_berita({response, request})
	{

		const _request = request.only(['id_berita', 'status'])
		
		const update = await Database
			.table('berita')
			.where('id_berita', _request.id_berita)
			.update({
				status : _request.status
			})
		
	}

	async list_foto({response, params})
	{

		const berita = await Database
			.table('berita')
			.where('id_berita', params.id)
			.first()

		let image_no_temp	= []
		if (berita.image_no) {
							
			image_no_temp 	= berita.image_no.split(',')

		}

		const data = await Database
			.select('t1.*','t2.nama')
			.table('t_images as t1')
			.where('image_status', 34)
			.leftJoin('user_editor as t2', 't2.id_editor', 't1.created_by')
			.orderBy('image_no', 'ASC')

		const cek = await Database
			.select('image_no')
			.table('t_images')
			.whereIn('image_no', image_no_temp)

		var result = data.map((value) => {
            const filter = cek.filter(obj => obj.image_no == value.image_no) 
            return {
                ...value,
                hasil : filter.length > 0 ? true : false
            }        
        });

        if (result) {
            for (let i = 0; i < result.length; i++) {
                if (result[i].file_size) {
                    result[i].file_size         = result[i].file_size.substring(0, 5);
                };
            }
        };

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: result,
        })

	}

	async foto({ response, request })
	{

		const data = await Database
			.select('t1.*','t2.nama')
			.table('t_images as t1')
			.where('image_status', 34)
			.leftJoin('user_editor as t2', 't2.id_editor', 't1.created_by')
			.orderBy('image_no', 'ASC')

        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].file_size) {
                    data[i].file_size         = data[i].file_size.substring(0, 5);
                };
            }
        };

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async suara({ response })
	{

        const data = await Database
            .table('berita as t1')
            .where('category_id', 27)
            .innerJoin('user_investor as t2', 't2.id_investor', 't1.id_investor')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal         = moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual  = moment(data[i].tanggal_manual).format('LL')
            }
        }

        return response.json({
            status      : true,
            responses   : 200,
            data        : data,
        }) 

	}

	async emiten({ response })
	{

        const data = await Database
			.select('t1.*', 't2.nama as editor')
            .table('berita as t1')
            .where('category_id', 26)
			.leftJoin('user_editor as t2', 't2.id_editor', 't1.created_by')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal         = moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual  = moment(data[i].tanggal_manual).format('LL')
            }
        }

        return response.json({
            status      : true,
            responses   : 200,
            data        : data,
        }) 

	}

	async bursa({ response })
	{

        const data = await Database
			.select('t1.*', 't2.nama as editor')
            .table('berita as t1')
            .where('category_id', 25)
			.leftJoin('user_editor as t2', 't2.id_editor', 't1.created_by')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal         = moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual  = moment(data[i].tanggal_manual).format('LL')
            }
        }

        return response.json({
            status      : true,
            responses   : 200,
            data        : data,
        }) 

	}

	async kolom({ response })
	{

        const data = await Database
			.select('t1.*', 't2.nama as editor')
            .table('berita as t1')
            .where('category_id', 28)
			.leftJoin('user_editor as t2', 't2.id_editor', 't1.created_by')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal         = moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual  = moment(data[i].tanggal_manual).format('LL')
            }
        }

        return response.json({
            status      : true,
            responses   : 200,
            data        : data,
        }) 

	}

}

module.exports = EditorController
