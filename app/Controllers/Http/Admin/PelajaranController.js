'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class PelajaranController {

	async ListPelajaran({response,params}){
		const data = await Database
			.table('pelajaran')
			.orderBy('kd_pelajaran','DESC')
			.paginate(params.page, 20)
		return response.json(data)
	}

	async UpdateStatus ({response,request}){
		const Inputs = request.only(['kd_pelajaran','status'])
		const data = await Database
			.table('pelajaran')
			.where('kd_pelajaran',Inputs.kd_pelajaran)
			.update({
				status_pelajaran : Inputs.status 
			})
	}

	async EditPelajaran ({response,params}){
		const data = await Database
			.table('pelajaran')
			.where('kd_pelajaran',params.id)
			.first()
		return response.json(data)
	}

	async lastCode({response}){
		const lastPelajaran = await Database
			.select(Database.raw('substr(kd_pelajaran,2,6) as kd_pelajaran'))
		  	.from('pelajaran')
		  	.orderBy(Database.raw('substr(kd_pelajaran,2,6)'), 'desc')
		  	.first();

		const ratusan = await Database
			.select(Database.raw('substr(kd_pelajaran,2,1) as kd_pelajaran'))
		  	.from('pelajaran')
		  	.orderBy(Database.raw('substr(kd_pelajaran,2,1)'), 'desc')
		  	.first();
		
		let FormatNumberId = null;	  
		if (lastPelajaran) {	  
			if (ratusan.kd_pelajaran == 0) {
				FormatNumberId = 'P'+ 0 + ++lastPelajaran.kd_pelajaran;
			}else{
				FormatNumberId = 'P'+  ++lastPelajaran.kd_pelajaran;
			}
		} else {	  
			FormatNumberId = 'P'+ '001';	  
		}

		let number = FormatNumberId
		return response.json({ number : number})
	}

	async StorePelajaran({response, request}){
		const Inputs = request.only(['kd_pelajaran','nm_pelajaran'])
		const insert = await Database
			.insert({
				kd_pelajaran	: Inputs.kd_pelajaran,
				nm_pelajaran	: Inputs.nm_pelajaran,	
			})
			.into('pelajaran')
		return response.json(Inputs)
			
	}

	async UpdatePelajaran({response, request}){
		const Inputs = request.only(['kd_pelajaran','nm_pelajaran'])
		const update = await Database
			.table('pelajaran')
			.where('kd_pelajaran',Inputs.kd_pelajaran)
			.update({
				nm_pelajaran	: Inputs.nm_pelajaran,
			})
	}

}

module.exports = PelajaranController