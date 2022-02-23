'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment 		= require('moment');

class BanksoalController {
	async MataPelajaran({response}){
		const data = await Database
			.raw("SELECT LEFT(kd_soal_statis,3) as kd_soal_statis FROM soal group by LEFT(kd_soal_statis,3)")
		return response.json(data[0])
	}

	async ListSoal({response,request,params}){
		const Inputs 	= request.only(['soal_statis'])
		let data 		= []
		if(Inputs.soal_statis == '0'){
			data = await Database
				.select('kd_soal','kd_soal_statis','soal','kunci','soal','pil_a','pil_b','pil_c','pil_d','pil_e','solusi','keterangan')
				.table('soal')			
				.paginate(params.page,35)
		}else{
			data = await Database
				.where(Database.raw('LEFT(soal.kd_soal_statis,3)'),Inputs.soal_statis)
				.table('soal')
				.paginate(params.page,35)
		}
		
		return response.json(data)
	}

	async StoreSoal({request,response}){
		const Inputs 	= request.only(['kd_soal_statis','kd_pelajaran','soal','pil_a','pil_b','pil_c','pil_d','pil_e','kunci','solusi','status_soal','keterangan'])

		const struktur 	= await Database
				.table('soal')
				.max('kd_soal')
				.first()
		
		let panjang 		= 6
		let angka_sementara = struktur['max(`kd_soal`)'].substring(1);
		let angka 			= String(parseInt(angka_sementara)).length
		let hasil 			= parseInt(angka_sementara) + 1
		
		let tmp = 0
		for (var i = 1; i <= 3; i++) {
			tmp = tmp + 0 
		}

		let noujian = 'U'+ tmp + hasil
		
		const store = await Database
			.table('soal')
			.insert({
				kd_soal         : noujian,
				kd_soal_statis  : Inputs.kd_soal_statis,
				soal            : Inputs.soal,
				pil_a           : Inputs.pil_a,
				pil_b           : Inputs.pil_b,
				pil_c           : Inputs.pil_c,
				pil_d           : Inputs.pil_d,
				pil_e           : Inputs.pil_e  == null ? '' : Inputs.pil_e,
				kunci           : Inputs.kunci,
				solusi          : Inputs.solusi,
				status_soal     : Inputs.status_soal,
				keterangan      : Inputs.keterangan,
				jenis			: '',
			})
	}

	async EditSoal({response,params}){
		const data = await Database
			.table('soal')
			.where('kd_soal',params.id)
			.first()

		return response.json(data)
	}

	async UpdateSoal({response,request}){
		const Inputs = request.only(['kd_soal','kd_soal_statis','kd_pelajaran','soal','pil_a','pil_b','pil_c','pil_d','pil_e','kunci','solusi','status_soal','keterangan'])
		const update = await Database
			.table('soal')
			.where('kd_soal',Inputs.kd_soal)
			.update({
				kd_soal_statis  : Inputs.kd_soal_statis,
				soal            : Inputs.soal,
				pil_a           : Inputs.pil_a,
				pil_b           : Inputs.pil_b,
				pil_c           : Inputs.pil_c,
				pil_d           : Inputs.pil_d,
				pil_e           : Inputs.pil_e,
				kunci           : Inputs.kunci,
				solusi          : Inputs.solusi,
				status_soal     : Inputs.status_soal,
				keterangan      : Inputs.keterangan,
			})
	}

	async DeleteSoal({response,params}){
		const data = await Database
			.table('soal')
			.where('kd_soal',params.id)
			.delete()
	}
}
module.exports = BanksoalController

