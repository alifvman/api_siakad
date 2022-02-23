'use strict'
	const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class VidconController {

	async TampilJadwal({request,response})
	{

		const data = await Database
			.select('vidcon.*', 'guru.namag', 'submit.masuk')
			.table('vidcon')
			.innerJoin('guru', 'guru.idg', 'vidcon.idg')
			.innerJoin('vidcon_submit as submit', 'submit.id_vidcon', 'vidcon.id_vidcon')

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

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: merge,
        })

	}

	async Get_Guru({request,response})
	{

		const data = await Database
			.table('guru')
			.where('statusaktif', 'YES')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: data,
        })

	}

	async Get_kelas({request, response})
	{

		const data = await Database
			.table('m_kelas')
			.orderBy('id','DESC')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: data,
        })

	}

	async Get_jenis_ujian({request, response})
	{

		const data = await Database
			.table('m_jenis_ujian')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: data,
        })

	}

	async get_siswa({request, response})
	{

		const _request = request.only(['idg'])

		const koor = await Database
			.table('guru_koordinasi as koor')
			.innerJoin('peserta', 'peserta.uid', 'koor.uid')
			.where('idg', _request.idg)

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: koor,
        })

	}

	async store_vidcon({request, response})
	{

		const _request = request.only(['idg','kelas','jenis_ujian','jadwal','title','code'])

		const insert = await Database
			.insert({
				title 			: _request.title,
				jenis_ujian_id 	: _request.jenis_ujian,
				id_kelas 		: _request.kelas,
				idg 			: _request.idg,
				jadwal 			: _request.jadwal,
				code 			: _request.code,
			})
			.into('vidcon')
			.returning('id_vidcon')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: insert[0],
        })

	}

	async list_peserta({request, response})
	{

		const _request = request.only(['id'])

		const data = await Database
			.select('peserta.*')
			.table('vidcon_submit as submit')
			.where('id_vidcon', _request.id)
			.innerJoin('peserta', 'peserta.uid', 'submit.uid')

		const notin = [];
		for (var a = 0; a < data.length; a++) {
			notin.push(data[a].uid)
		}

		const peserta = await Database
			.table('peserta')
			.whereNotIn('uid', notin)
			.where('statusaktif', 'YES')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: data,
            peserta		: peserta,
        })

	}

	async add_peserta({request, response})
	{

		const _request = request.only(['uid', 'id_vidcon'])

		const insert = await Database
			.insert({
				uid 		: _request.uid,
				id_vidcon 	: _request.id_vidcon,
			})
			.into('vidcon_submit')
			.returning('id_vidcon_submit')

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data		: insert[0],
        })

	}

	async remove_peserta({request, response})
	{

		const _request = request.only(['uid', 'id_vidcon'])

		const remove = await Database
			.table('vidcon_submit')
			.where('uid', _request.uid)
			.where('id_vidcon', _request.id_vidcon)
			.delete()

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async del_vidcon({request, response})
	{

		const _request = request.only(['id_vidcon'])

		const remove = await Database
			.table('vidcon')
			.where('id_vidcon', _request.id_vidcon)
			.delete()

		const remove_submit = await Database
			.table('vidcon_submit')
			.where('id_vidcon', _request.id_vidcon)
			.delete()

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async edit_vidcon({request, response})
	{

		const _request = request.only(['id_vidcon'])

		const data = await Database
			.table('vidcon')
			.where('id_vidcon', _request.id_vidcon)
			.first()

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            data.jadwal = moment(data.jadwal).format('Y-MM-DThh:mm')
        }

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async update_vidcon({request, response})
	{

		const _request = request.only(['id_vidcon','idg','kelas','jenis_ujian','jadwal','title','code'])

		const update = await Database
			.table('vidcon')
			.where('id_vidcon', _request.id_vidcon)
			.update({
				title 			: _request.title,
				jenis_ujian_id 	: _request.jenis_ujian,
				id_kelas 		: _request.kelas,
				idg 			: _request.idg,
				jadwal 			: _request.jadwal,
				code 			: _request.code,
			})

        // SEND DATA TO FRONT-END
        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

}
module.exports = VidconController