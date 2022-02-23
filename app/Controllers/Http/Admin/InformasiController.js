'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class InformasiController {
	async TampilInformasi({response,params}){
		const data = await Database
			.table('info')
			.where('idg',params.id)
			.orderBy('id','ASC')
		return response.json(data)
	}

	async StoreInformasi({request}){
		const Inputs = request.only(['idg','judul','info'])
		const data = await Database
			.insert({
				idg		: Inputs.idg,
				judul	: Inputs.judul,
				info	: Inputs.info,
			})
			.into('info')
	}

	async EditInformasi({response,params}){
		const data = await Database
			.table('info')
			.where('id',params.id)
			.first()
		return response.json(data)
	}

	async UpdateInformasi({request}){
		const Inputs = request.only(['id','judul','info'])
		const data = await Database
			.table('info')
			.where('id',Inputs.id)
			.update({
				judul	: Inputs.judul,
				info	: Inputs.info,
			})
	}

	async DeleteInformasi({params}){
		const delet = await Database
			.table('info')
			.where('id',params.id)
			.delete()
	}
}
module.exports = InformasiController

