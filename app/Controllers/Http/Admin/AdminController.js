'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class AdminController {

	async login({request,response}){
		const Inputs = request.only(['username','password'])
		const login = await Database
			.table('guru')
			.where('userg',Inputs.username)
			.where('passg',Inputs.password)

		return response.json({
			data  : login[0],
			count : login.length,
		})
	}

	async listAdmin({response,params}){
		const data = await Database
			.table('guru')
			.orderBy('idg','ASC')
			.paginate(params.page, 20)
		return response.json(data)
	}

	async updateStatus({request,response}){
		const Inputs = request.only(['idg','status'])
		const update = await Database
			.table('guru')
			.where('idg',Inputs.idg)
			.update({
				statusaktif : Inputs.status 
			})
		return response.json({
            status      : 200,
            responses   : true,
        })
	}

	async lastCode({response}){
		const lastProduk = await Database
			.select(Database.raw('substr(idg,4,6) as idg'))
		  	.from('guru')
		  	.orderBy(Database.raw('substr(idg,4,6)'), 'desc')
		  	.first();

		const ratusan = await Database
			.select(Database.raw('substr(idg,4,1) as idg'))
		  	.from('guru')
		  	.orderBy(Database.raw('substr(idg,4,1)'), 'desc')
		  	.first();
			
		let FormatNumberId = null;	  
		if (lastProduk ) {	  
			if (ratusan.idg == 0) {
				FormatNumberId = 'PDG'+ 0 + ++lastProduk.idg;
			}else{
				FormatNumberId = 'PDG'+  ++lastProduk.idg;
			}
		} else {	  
			FormatNumberId = 'PDG'+ '001';	  
		}

		let number = FormatNumberId
		return response.json({ number : number})
	}

	async detailAdmin({request,response}){
		const req = request.only(['idg', 'kelas', 'mujian', 'institusi', 'search'])

		const kelas 		= req.kelas != 0 ? req.kelas : ''
		const mujian 		= req.mujian != 0 ? req.mujian : ''
		const institusi 	= req.institusi != 0 ? req.institusi : ''
		const nama 			= req.search != 0 ? req.search : ''
		
		const wherekelas 	= kelas ? `kelas = '${kelas}'` : `kelas is not null`;
		const wheremujian	= mujian ? `jenis_ujian = ${mujian}` : `jenis_ujian is not null`;
		const whereinstitusi= institusi ? `institusi = '${institusi}'` : `institusi is not null`;
		const wherenama 	= nama ? `nama = '${nama}'` : `nama is not null`;
		const wherestatus	= `statusaktif = 'YES'`
		const where 		= `${wherekelas} AND ${wheremujian} AND ${wherestatus} AND ${whereinstitusi} AND ${wherenama}`

		const datakoor = await Database
			.select('koor.idg', 'koor.uid', 'peserta.nama as nama', 'peserta.userid', 'ujian.jenis_ujian_desc as ujian', 'kelas.kelas_desc as kelas')
			.table('guru_koordinasi as koor')
			.where('koor.idg',req.idg)
			.leftJoin('peserta', 'peserta.uid', 'koor.uid')
			.leftJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'peserta.jenis_ujian')
			.leftJoin('m_kelas as kelas', 'kelas.kelas_id', 'peserta.kelas')
			.groupBy('koor.idg', 'koor.uid', 'peserta.nama','ujian.jenis_ujian_desc', 'kelas.kelas_desc')

		const koorpeserta = await Database
			.table('guru_koordinasi as koorp')
			.where('koorp.idg',req.idg)

		const data = [];
		for (var a = 0; a < koorpeserta.length; a++) {
			data.push(koorpeserta[a].uid)
		}

		const peserta = await Database
			.select('peserta.uid' ,'peserta.nama as nama', 'peserta.userid', 'ujian.jenis_ujian_desc as ujian', 'kelas.kelas_desc as kelas')
			.table('peserta')
			.leftJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'peserta.jenis_ujian')
			.leftJoin('m_kelas as kelas', 'kelas.kelas_id', 'peserta.kelas')
			.whereRaw(where)
			.whereNotIn('peserta.uid',data)
			.orderBy('peserta.nama', 'ASC')
			.groupBy('peserta.uid' ,'peserta.nama','ujian.jenis_ujian_desc', 'kelas.kelas_desc')

		const update = await Database
			.table('guru')
			.where('idg',req.idg)
			.first()

		return response.json({
            status 		: true,
            responses 	: 200,
            update 		: update,
            data 		: peserta,
            datakoor	: datakoor,
        })
	}


	async DeleteAdmin({params,response}){
		const update = await Database
			.table('guru')
			.where('idg',params.id)
			.delete()
	}

	async StoreAdmin({request,response}){
		const Inputs = request.only(['submit','idg','namag','userg','passg','access'])
		
		const getDataExist = await Database
			.table('guru')
			.where('userg', Inputs.userg)
            .first()

		if (!getDataExist) {
			if (Inputs.submit == 'store') {
					const insert = await Database
						.insert({
							idg			: Inputs.idg,
							namag		: Inputs.namag,
							kelamin 	: 'P',
							kd_pelajaran: '',
							userg 		: Inputs.userg,
							passg		: Inputs.passg,
							access 		: Inputs.access,
						})
						.into('guru')
			}else{
				if (Inputs.passg) {
					const update = await Database
						.table('guru')
						.where('idg',Inputs.idg)
						.update({ 
							namag		: Inputs.namag,
							userg 		: Inputs.userg,
							kd_pelajaran: '',
							passg		: Inputs.passg,
							access 		: Inputs.access,
						})
					return response.json({
			            status 		: true,
			            responses 	: 200,
			        })
				}else{
					const update = await Database
						.table('guru')
						.where('idg',Inputs.idg)
						.update({ 
							namag		: Inputs.namag,
							userg 		: Inputs.userg,
							kd_pelajaran: '',
							access 		: Inputs.access,
						})
				}
				
			}	
		}else{
			const update = await Database
				.table('guru')
				.where('idg',Inputs.idg)
				.update({ 
					namag		: Inputs.namag,
					kd_pelajaran: '',
					passg		: Inputs.passg,
					access 		: Inputs.access,
				})

			return response.json({
	            status 		: false,
	            responses 	: 201,
	        })
		}
	}
	
	// ALIF OUTHER

	async Storeguru({ params, response}){

		const getDataExist = await Database
            .table('guru_koordinasi')
            .where('uid', params.id)
            .where('idg', params.idg)
            .first()

        if (!getDataExist) {
			const guru = await Database
				.table('guru_koordinasi')
				.insert({
					idg		: params.idg,
					uid		: params.id,

				})
                .returning('id')
			return response.json({
        	    status: 200,
            	responses: true,
            })
         }else{
      		return response.json({
                status: 500,
                responses: false,
            })
      	}
			
	}

	async filter({response}){
		const jenis_ujian = await Database
			.select('jenis_ujian_desc', 'jenis_ujian')
			.table('peserta')
			.innerJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'peserta.jenis_ujian')
			.where('statusaktif', 'YES')
			.orderBy('jenis_ujian', 'ASC')
			.groupBy('jenis_ujian_desc', 'jenis_ujian')

		const kelas = await Database
			.select('kelas_desc', 'kelas')
			.table('peserta')
			.innerJoin('m_kelas as kelas', 'kelas.kelas_id', 'peserta.kelas')
			.where('statusaktif', 'YES')
			.orderBy('kelas', 'ASC')
			.groupBy('kelas_desc', 'kelas')

		const institusi = await Database
			.select('institusi')
			.table('peserta')
			.where('statusaktif', 'YES')
			.orderBy('institusi', 'ASC')
			.groupBy('institusi')

		return response.json({
            status 		: 200,
            responses	: true,
            jenis_ujian : jenis_ujian,
            kelas 		: kelas,
            institusi	: institusi,
        })
	}	

	async get_peserta({request, response}){

		const req = request.only(['idg', 'kelas', 'mujian', 'institusi'])

		const kelas 	= req.kelas != 0 ? req.kelas : ''
		const mujian 	= req.mujian != 0 ? req.mujian : ''
		const institusi = req.institusi != 0 ? req.institusi : ''
		
		const wherekelas 	= kelas ? `kelas = '${kelas}'` : `kelas is not null`;
		const wheremujian	= mujian ? `jenis_ujian = ${mujian}` : `jenis_ujian is not null`;
		const whereinstitusi= institusi ? `institusi = '${institusi}'` : `institusi is not null`;
		const wherestatus	= `statusaktif = 'YES'`
		const where 		= `${wherekelas} AND ${wheremujian} AND ${wherestatus} AND ${whereinstitusi}`

		const data = await Database
			.select('peserta.uid' ,'peserta.nama as nama', 'ujian.jenis_ujian_desc as ujian', 'kelas.kelas_desc as kelas')
			.table('peserta')
			.leftJoin('m_jenis_ujian as ujian', 'ujian.jenis_ujian_id', 'peserta.jenis_ujian')
			.leftJoin('m_kelas as kelas', 'kelas.kelas_id', 'peserta.kelas')
			.where('statusaktif', 'YES')
			.whereRaw(where)

		const koor = await Database
			.table('guru_koordinasi as koor')
			.where('idg', req.idg)

		return response.json({
            status: true,
            responses: 200,
            data: data,
            cek: koor,
        })

	}

	async Delguru({ params, request }){
		const update = await Database
			.table('guru')
			.where('idg',params.id)
			.delete()

	}

	async Deldetailpeserta({ params, request }){
		const update = await Database
			.table('guru_koordinasi')
			.where('uid', params.id)
			.delete()
	}

}
module.exports = AdminController
