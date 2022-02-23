'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class BukuTamuController {

	async tampil ({response,params}){
		const data = await Database
			.table('bukutamu')
			.orderBy('id_btamu','DESC')
		return response.json(data)
	}

}
module.exports = BukuTamuController
