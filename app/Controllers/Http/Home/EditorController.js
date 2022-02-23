'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class EditorController 
{

	async index({response,request})
	{

        const _request = request.only(['id_editor'])

		const data = await Database
			.table('berita as t1')
            .where('created_by', _request.id_editor)
            .leftJoin('t_category as t2', 't2.category_id','t1.category_id')
            .leftJoin('t_sub_category as t3', 't3.id_sub','t1.id_sub')
            .leftJoin('t_sektor as t4', 't4.id_sektor','t1.id_sektor')
            .whereNotIn('t1.category_id', [25,26])
			.orderBy('id_berita', 'DESC')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal 		= moment(data[i].tanggal).format('LL')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('LL')
            }
        }

        return response.json({
            status 			: true,
            responses 		: 200,
            data 			: data,
        })		

	}

    async store_berita({response,request})
    {

        const Inputs = request.only(['created_by','judul','ringkasan','lengkap','tanggal','category','foto','free','image_no','sub_category','sektor'])
        const data = await Database
            .table('berita')
            .insert({
                category_id     : Inputs.category,
                id_sub          : Inputs.sub_category,
                id_sektor       : Inputs.sektor,
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                tanggal         : Inputs.tanggal,
                tanggal_manual  : Inputs.tanggal,
                foto            : Inputs.foto,
                free            : Inputs.free,
                image_no        : Inputs.image_no,
                created_by      : Inputs.created_by,
            })
            .returning('id_berita')

        return response.json({
            status          : true,
            responses       : 200,
            data            : data[0],
        })      

    }

    async upload({response,params})
    {

        const data = await Database
            .table('t_images')
            .where('created_by', params.id)

        if (data) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].file_size) {
                    data[i].file_size         = data[i].file_size.substring(0, 5);
                };
            }
        };

        return response.json({
            status          : true,
            responses       : 200,
            data            : data,
        })  

    }

    async store_image({response,request})
    {

        const _request = request.only(['nama_gambar','image_desc','file_size','created_by'])

        const insert = await Database
            .insert({
                nama_gambar     : _request.nama_gambar,
                image_desc      : _request.image_desc,
                file_size       : _request.file_size,
                created_by      : _request.created_by,
                image_status    : 34,
            })
            .into('t_images')

        return response.json({
            status          : true,
            responses       : 200,
        }) 

    }

    async hapus_foto({response,params})
    {

        const del = await Database
            .table('t_images')
            .where('image_no', params.id)
            .delete()

    }

    async suara({response})
    {

        const data = await Database
            .table('berita as t1')
            .where('category_id', 27)
            .innerJoin('user_investor as t2', 't2.id_investor', 't1.id_investor')

        return response.json({
            status      : true,
            responses   : 200,
            data        : data,
        }) 

    }

    async store_suara({ request, response })
    {

        const Inputs = request.only(['judul','ringkasan','lengkap','foto','image_no','email','no_telp',''])
        
        const insert = await Database
            .insert({
                email   : Inputs.email,
                no_telp : Inputs.no_telp,
            })
            .into('user_investor')
            .returning('id_investor')

        const data = await Database
            .table('berita')
            .insert({
                category_id     : 27,
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                tanggal         : new Date(),
                tanggal_manual  : new Date(),
                foto            : Inputs.foto,
                image_no        : Inputs.image_no,
                id_investor     : insert[0],
                created_by      : Inputs.created_by,
            })
            .returning('id_berita')

        return response.json({
            status      : true,
            responses   : 200,
        }) 

    }

    async edit_suara({ response, params })
    {

        const data = await Database
            .table('berita as t1')
            .innerJoin('user_investor as t2','t2.id_investor','t1.id_investor')
            .where('id_berita', params.id)
            .first()

        return response.json({
            status      : true,
            responses   : 200,
            data        : data
        }) 

    }

    async update_suara({ response, request })
    {

        const Inputs = request.only(['judul','ringkasan','lengkap','foto','email','no_telp','id_berita','id_investor','image_no','tanggal'])
        
        if (Inputs.id_investor) {

            const insert = await Database
                .table('user_investor')
                .where('id_investor', Inputs.id_investor)
                .update({
                    email   : Inputs.email,
                    no_telp : Inputs.no_telp,
                })

        }

        const data = await Database
            .table('berita')
            .where('id_berita', Inputs.id_berita)
            .update({
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                foto            : Inputs.foto,
                image_no        : Inputs.image_no,
                tanggal_manual  : Inputs.tanggal,
            })

        return response.json({
            status      : true,
            responses   : 200,
        }) 

    }

    async emiten({ response })
    {

        const data = await Database
            .table('berita as t1')
            .where('category_id', 26)

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
            data        : data
        }) 

    }

    async store_emiten({ response, request })
    {

        const Inputs = request.only(['judul','ringkasan','lengkap','foto','image_no','tanggal','created_by'])

        const data = await Database
            .insert({
                category_id     : 26,
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                tanggal         : new Date(),
                tanggal_manual  : Inputs.tanggal,
                foto            : Inputs.foto,
                image_no        : Inputs.image_no,
                created_by      : Inputs.created_by,

            })
            .into('berita')
            .returning('id_berita')

        return response.json({
            status      : true,
            responses   : 200,
        }) 

    }

    async bursa({ response })
    {

        const data = await Database
            .table('berita as t1')
            .where('category_id', 25)

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
            data        : data
        })

    }

    async store_bursa({ response, request })
    {

        const Inputs = request.only(['judul','ringkasan','lengkap','foto','email','no_telp','image_no','tanggal','created_by'])
        
        const data = await Database
            .insert({
                category_id     : 25,
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                tanggal         : new Date(),
                tanggal_manual  : Inputs.tanggal,
                foto            : Inputs.foto,
                image_no        : Inputs.image_no,
                created_by      : Inputs.created_by,
            })
            .into('berita')
            .returning('id_berita')

        return response.json({
            status      : true,
            responses   : 200,
        }) 

    }

    async kolom({ response })
    {

        const data = await Database
            .table('berita as t1')
            .where('category_id', 28)

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
            data        : data
        })

    }

    async store_kolom({ response, request })
    {

        const Inputs = request.only(['judul','ringkasan','lengkap','foto','email','no_telp','image_no','tanggal','created_by'])
        
        const data = await Database
            .insert({
                category_id     : 28,
                judul           : Inputs.judul,
                ringkasan       : Inputs.ringkasan,
                lengkap         : Inputs.lengkap,
                tanggal         : new Date(),
                tanggal_manual  : Inputs.tanggal,
                foto            : Inputs.foto,
                image_no        : Inputs.image_no,
                created_by      : Inputs.created_by,
            })
            .into('berita')
            .returning('id_berita')

        return response.json({
            status      : true,
            responses   : 200,
        }) 

    }

}

module.exports = EditorController
