'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment')
const Mail = use('Mail')

class LoginController {

	async paket_subscribe({ request, response })
	{

		const _request = request.only(['id_langganan'])

		const data = await Database
			.select('order.*', 'total_payment', 'nama_paket', 'duration', 'type')
			.table('berita_order as order')
			.where('order.id_langganan', _request.id_langganan)
			.innerJoin('berita_order_deal as deal', 'deal.invoice', 'order.invoice')
			.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'order.id_berita_paket')
			.innerJoin('berita_price as price', 'price.id_price', 'order.id_price')

		// DATE FORMATTING FOR CREATED_AT AND EXPIRED
		for (let i = 0; i < data.length; i++) {
			data[i].updated_at = moment(data[i].updated_at).format('DD MMMM Y')
			data[i].tanggal_order = moment(data[i].tanggal_order).format('DD MMMM Y')
			data[i].expired = moment(data[i].expired).format('DD MMMM Y')
		}

		return response.json({
			status 	: 200,
			data 	: data,
		})

	}

	async tambah_paket({ request, response })
	{

		const _request = request.only(['id_langganan','id_berita_paket','id_price'])

		const dataPaket = await Database
			.select('nama_paket', 'id_price', 'price.id_berita_paket', 'duration', 'type', 'price')
			.table('berita_price as price')
			.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'price.id_berita_paket')
			.where('id_price', _request.id_price)
			.first()

		var year 	 = moment().format('YYYY').substr(2,2);
		var monthDay = moment().format('MMDD');
		const count  = await Database
			.table('berita_order')
			.count('id_order')

		const kode   = count.count ? count.count : 1
		function minTwoDigits(n) {
		  	return (n < 100 ? n < 10 ? '00' : '0' : '') + n;
		}

		const automateCode = 'PB'+year+monthDay+_request.id_langganan+minTwoDigits(kode)+0+dataPaket.id_berita_paket+0+dataPaket.id_price+'BRTIL'

		let tab_order 		= 'checkout';
		let status_order 	= 'requested';
		let inputHari 		= 2 * 7
		// if (dataPaket.type == "hari") {
		// 	inputHari 		= dataPaket.duration * 1;
		// }else if (dataPaket.type == "minggu") {
		// 	inputHari 		= dataPaket.duration * 7;
		// }else if (dataPaket.type == "bulan") {
		// 	inputHari 		= dataPaket.duration * 30;
		// }else if (dataPaket.type == "tahun") {
		// 	inputHari 		= dataPaket.duration * 365;
		// }
		let expired 		= new Date(new Date().getTime()+(inputHari*24*60*60*1000))

		const transaksi = await Database
			.insert({
				invoice 		: automateCode,
				id_langganan 	: _request.id_langganan,
				id_berita_paket : dataPaket.id_berita_paket,
				id_price 		: dataPaket.id_price,
				expired 		: expired,
				created_at 		: new Date(),
				updated_at 		: new Date(),
			})
			.into('berita_order')

		const order_deal = await Database
			.insert({
				invoice 		: automateCode,
				price 			: dataPaket.price,
				total_payment 	: dataPaket.price,
				created_at 		: new Date(),
				updated_at 		: new Date(),
			})
			.into('berita_order_deal')

		return response.json({
			status 	: 200,
			data 	: automateCode,
		})

	}

	async bukti_bayar({ request, response })
	{

		const _request = request.only(['invoice', 'bukti_pembayaran'])
		
		const update = await Database
			.table('berita_order')
			.where('invoice', _request.invoice)
			.update({
				bukti_pembayaran 	: _request.bukti_pembayaran, 
				expired 			: new Date(new Date().getTime()+(2*24*60*60*1000)),
				updated_at 			: new Date(),
			})

		return response.json({
			status 		: 200,
			message 	: "Bukti telah Ter-Upload silahkan tunggu approve dari admin",
		})

	}

}

module.exports = LoginController