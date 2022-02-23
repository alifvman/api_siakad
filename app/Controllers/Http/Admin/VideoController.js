'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class VideoController {

	async TampilVideo({response,params}){
		const data = await Database
			.table('video')
			.orderBy('id','ASC')
			.paginate(params.page,25)
		return response.json(data)
	}

	async UpdateStatus({response,request}){
		const Inputs = request.only(['id','status'])
		const data = await Database
			.table('video')
			.where('id',Inputs.id)
			.update({
				status : Inputs.status
			})
	}

	async StoreVideo({request}){
		let current_datetime = new Date()
		const Inputs = request.only(['nama_video','title','status','type','jenis','banner'])
		const data = await Database
			.insert({
				nama_video  : Inputs.nama_video,
				banner 		: Inputs.banner,
				title		: Inputs.title,
				status      : 'YES',
				type        : Inputs.type,
				jenis  		: Inputs.jenis,
				tanggal     : current_datetime,
			})
			.into('video')
	}

	async EditVideo({response,params}){
		const data = await Database
			.table('video')
			.where('id',params.id)
			.first()
		return response.json(data)
	}

	async delVideo({response,params}){

		const data = await Database
			.table('video')
			.where('id', params.id)
			.delete()

		return response.json(data)
	}

	async UpdateVideo({request}){
		const Inputs = request.only(['nama_video','title','type','jenis','id','banner'])
		const data = await Database
			.table('video')
			.where('id',Inputs.id)
			.update({
				nama_video  : Inputs.nama_video,
				banner  	: Inputs.banner,
				title		: Inputs.title,
				type        : Inputs.type,
				jenis  		: Inputs.jenis,
			})
	}

}
module.exports = VideoController