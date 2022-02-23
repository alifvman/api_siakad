'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class AgreementController {

	async TampilAgreement ({response,params}){
		const data = await Database
			.table('agreement')
			.first()
		return response.json(data)
	}

	async UpdateAgreement ({response,request}){
		const Inputs = request.only(['agreement'])
		const data = await Database
			.table('agreement')
			.where('id','1')
			.update({
				agreement : Inputs.agreement,
			})
		return response.json(data)
	}

	
}
module.exports = AgreementController
