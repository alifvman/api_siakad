'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class PesertaController {

	async ListPeserta ({response,request}){
		const req = request.only(['page', 'nama'])

		const nama 			= req.nama != 0 ? req.nama : ''
		
		const wherenama 	= nama ? `nama = '${nama}'` : `nama is not null`;

		const data = await Database
			.table('peserta')
			.orderBy('tgl_daftar','DESC')
			.whereRaw(wherenama)
			// .paginate(req.page, 20)

		let dataku = data

		for (var i = 0; i < dataku.length; i++) {
			dataku[i].tgl_daftar = moment(dataku[i].tgl_daftar).format('Y-MM-D hh:mm:ss')
		}

		return response.json({data : data, dataku :dataku})
	}

	async DetailPeserta ({response,params}){
		const data = await Database
			.table('peserta')
			.where('uid',params.id)
			.limit(1)

		for (var i = 0; i < data.length; i++) {
			data[i]['tahun'] = moment(data[i].tgl_lahir).format('Y')
			data[i]['bulan'] = moment(data[i].tgl_lahir).format('MM')
			data[i]['hari'] = moment(data[i].tgl_lahir).format('D')
		}

		const jenis_ujian = await Database
			.table('m_jenis_ujian')

		const kelas = await Database 
			.table('m_kelas')

		return response.json({
			data 		: data,
			jenis_ujian : jenis_ujian,
			kelas		: kelas,
		})
	}

	async UpdatePeserta ({response,request}){
		const Inputs = request.only(['uid','nama','password','kelamin','institusi','alamat','email','telepon','tgl_lahir','foto','kelas','jenis_ujian','waktu'])
		const update = await Database
			.table('peserta')
			.where('uid',Inputs.uid)
			.update({
				nama		: Inputs.nama,
				password	: Inputs.password,
				kelamin		: Inputs.kelamin,
				institusi	: Inputs.institusi,
				alamat		: Inputs.alamat,
				email		: Inputs.email,
				telepon		: Inputs.telepon,
				tgl_lahir	: Inputs.tgl_lahir,
				foto		: Inputs.foto,
				kelas 		: Inputs.kelas,
				jenis_ujian : Inputs.jenis_ujian,
				waktu		: Inputs.waktu,
			})
	}

	async DeletePeserta ({response,params}){
		const update = await Database
			.table('peserta')
			.where('uid',params.id)
			.delete()
	}

	async UpdateStatus ({response,params}){
		const update = await Database
			.table('peserta')
			.where('uid',params.uid)
			.update({
				statusaktif : params.status
			})
	}

	async LogPeserta ({response,params}){
		const data = await Database
			.select('id','uid','start_time','end_time','waktu','jam','menit','detik','IP')
			.table('waktu')
			.where('uid',params.uid)
			.orderBy('id','DESC')

		for (var i = 0; i < data.length; i++) {
			data[i].start_time 	= moment(data[i].start_time).format('D-MM-Y hh:mm:ss');
			data[i].end_time 	= moment(data[i].end_time).format('D-MM-Y hh:mm:ss');
		}

		const jam = await Database
			.from('waktu')
			.sum('jam')
			.where('uid',params.uid)
			.first()

		const menit = await Database
			.from('waktu')
			.sum('menit')
			.where('uid',params.uid)
			.first()

		const detik = await Database
			.from('waktu')
			.sum('detik')
			.where('uid',params.uid)
			.first()

		return response.json({
			data  : data,
			jam   : jam['sum(`jam`)'],
			menit : menit['sum(`menit`)'],
			detik : detik['sum(`detik`)'],
		})
	}


}

module.exports = PesertaController