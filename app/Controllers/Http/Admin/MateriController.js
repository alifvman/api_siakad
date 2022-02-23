'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class MateriController {

	async TampilMateri({response,params}){
		const data = await Database
			.select('t1.no_materi','t1.jenis_ujian','t1.topik','t1.file_name','t1.link_url','t1.status_materi','t2.jenis_ujian_desc')
			.table('t_unduh_materi as t1')
			.leftJoin('m_jenis_ujian as t2','t1.jenis_ujian','t2.jenis_ujian_id')
			.paginate(params.page,25)
		return response.json(data)
	}

	async UpdateStatus({response,request}){
		const Inputs = request.only(['no_materi','status'])
		const data = await Database
			.table('t_unduh_materi')
			.where('no_materi',Inputs.no_materi)
			.update({
				status_materi : Inputs.status
			})
	}

	async StoreMateri({request}){
		const Inputs = request.only(['jenis_ujian','topik','file_name','link_url'])
		const data = await Database
			.insert({
				jenis_ujian    : Inputs.jenis_ujian,
				topik		   : Inputs.topik,
				file_name      : Inputs.file_name,
				link_url       : Inputs.link_url,
				status_materi  : '1',
			})
			.into('t_unduh_materi')
	}

	async EditMateri({response,params}){
		const data = await Database
			.table('t_unduh_materi')
			.where('no_materi',params.id)
			.first()
		return response.json(data)
	}

	async UpdateMateri({request}){
		const Inputs = request.only(['jenis_ujian','topik','file_name','link_url','no_materi'])
		const data = await Database
			.table('t_unduh_materi')
			.where('no_materi',Inputs.no_materi)
			.update({
				jenis_ujian    : Inputs.jenis_ujian,
				topik		   : Inputs.topik,
				file_name      : Inputs.file_name,
				link_url       : Inputs.link_url,
				status_materi  : '1',
			})
	}

}
module.exports = MateriController