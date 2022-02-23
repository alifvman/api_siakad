'use strict'
const Database = use('Database')
const Encryption = use('Encryption')
const moment = require('moment');

class BeritaController {

	async pelanggan({ response, request })
	{

		const data = await Database
			.table('langganan_berita')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async list_transaksi({ response, request })
	{

		const _request = request.only(['status'])

		const data = await Database
			.select('username','order.invoice','tab_order', 'status_order', 'expired', 'total_payment', 'duration', 'type', 'nama', 'email', 'no_telp', 'order.created_at', 'nama_paket', 'order.updated_at')
			.table('berita_order as order')
			.innerJoin('langganan_berita as user', 'user.id_langganan', 'order.id_langganan')
			.innerJoin('berita_order_deal as deal', 'deal.invoice', 'order.invoice')
			.innerJoin('berita_price as price', 'price.id_price', 'order.id_price')
			.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'order.id_berita_paket')
			.whereNotIn('order.id_price', [5])

        // REPLACING VALUE ORDER.STATUS_ORDER WITH PENDING FROM PAYMENT IF ANY 
        for (let i = 0; i < data.length; i++) {
            data[i].expired              = moment(data[i].expired).format('LL')
            data[i].updated_at           = moment(data[i].updated_at).format('LL')
        }

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async edit_transaksi({ response, request })
	{

		const _request = request.only(['invoice'])

		const data = await Database
			.select('username','bukti_pembayaran','order.id_price', 'order.id_berita_paket', 'order.invoice','tab_order', 'status_order', 'expired', 'total_payment', 'duration', 'type', 'nama', 'email', 'no_telp', 'order.updated_at', 'order.created_at', 'nama_paket')
			.table('berita_order as order')
			.where('order.invoice', _request.invoice)
			.innerJoin('langganan_berita as user', 'user.id_langganan', 'order.id_langganan')
			.innerJoin('berita_order_deal as deal', 'deal.invoice', 'order.invoice')
			.innerJoin('berita_price as price', 'price.id_price', 'order.id_price')
			.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'order.id_berita_paket')
			.first()

        // REPLACING VALUE ORDER.STATUS_ORDER WITH PENDING FROM PAYMENT IF ANY
        data.expired 	= moment(data.expired).format('LL')
        data.updated_at	= moment(data.updated_at).format('LLL')
        data.created_at	= moment(data.created_at).format('LLL')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })
        
	}

	async Update_transaksi({ response, request })
	{

		const _request = request.only(['invoice'])

		const order = await Database
			.table('berita_order')
			.where('invoice', _request.invoice)
			.first()

		const dataPaket = await Database
			.table('berita_price as price')
			.innerJoin('berita_paket as paket','paket.id_berita_paket','paket.id_berita_paket')
			.where('price.id_price', order.id_price)
			.where('paket.id_berita_paket', order.id_berita_paket)
			.first()

		const tab_order 	= "selesai"
		const status_order 	= "approved"
		let inputHari 		= 1
		if (dataPaket.type == "hari") {
			inputHari 	= dataPaket.duration
		}else if (dataPaket.type == "minggu") {
			inputHari 	= dataPaket.duration * 7
		}else if (dataPaket.type == "bulan") {
			inputHari 	= dataPaket.duration * 30
		}else if (dataPaket.type == "tahun") {
			inputHari 	= dataPaket.duration * 365
		}	
		let expired 			= new Date(new Date().getTime()+(inputHari*24*60*60*1000));

		const update = await Database
			.table('berita_order')
			.where('invoice', _request.invoice)
			.update({
				tab_order  	: tab_order,
				status_order: status_order,
				expired 	: expired,
				updated_at 	: new Date(),
			})

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async paket_berita({ response, request })
	{

		const data = await Database
			.table('berita_paket as paket')
			.innerJoin('berita_price as price', 'price.id_berita_paket', 'paket.id_berita_paket')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async get_paket({ response, request })
	{

		const data = await Database
			.select('nama_paket', 'id_berita_paket')
			.table('berita_paket')

		return response.json(data)

	}

	async get_kategori({ response, request })
	{

		const _request = request.only(['id_berita_paket'])

		const data = await Database
			.select('kategori')
			.table('berita_paket')
			.where('id_berita_paket', _request.id_berita_paket)
			.first()

		if (data) {

	        return response.json({
	            status 		: true,
	            responses 	: 200,
	            data 		: data,
	        })

		}else{

	        return response.json({
	            status 		: false,
	            responses 	: 500,
	            data 		: {},
	        })

		}

	}

	async store_paket({ response, request })
	{

		const _request = request.only(['nama_paket','duration','type','price','kategori'])

		const cek_paket = await Database
			.table('berita_paket')
			.where('id_berita_paket', _request.nama_paket)
			.first()

		if (!cek_paket) {

			const insert = await Database
				.insert({
					nama_paket 	: _request.nama_paket,
					kategori 	: _request.kategori,
					created_at 	: new Date(),
					updated_at 	: new Date(),
				})
				.into('berita_paket')
				.returning('id_berita_paket')

			const insertdua = await Database
				.insert({
					id_berita_paket : insert[0],
					duration 		: _request.duration,
					type 			: _request.type,
					price 			: _request.price,
					created_at 		: new Date(),
					updated_at 		: new Date(),
				})
				.into('berita_price')
				.returning('id_price')

	        return response.json({
	            status 		: true,
	            responses 	: 200,
	            data 		: insert[0],
	            dataa 		: insertdua[0],
	        })

		}else{

			const insert = await Database
				.insert({
					id_berita_paket : _request.nama_paket,
					duration 		: _request.duration,
					type 			: _request.type,
					price 			: _request.price,
					created_at 		: new Date(),
					updated_at 		: new Date(),
				})
				.into('berita_price')
				.returning('id_price')

	        return response.json({
	            status 		: true,
	            responses 	: 200,
	            data 		: insert[0],
	            dataa 		: {},
	        })

		}

	}

	async BeritaTampil({ response, params }) {
		const data = await Database
			.select('t1.*', 't2.category_desc', 't3.nama as editor', 't4.sub_category', 't5.sektor')
			// .select('t1.*', 't2.category_desc')
			.table('berita as t1')
			.leftJoin('t_category as t2', 't1.category_id', 't2.category_id')
			.leftJoin('user_editor as t3', 't3.id_editor', 't1.created_by')
			.leftJoin('t_sub_category as t4','t1.id_sub','t4.id_sub')
			.leftJoin('t_sektor as t5','t1.id_sektor','t5.id_sektor')
			.whereIn('t1.category_id', [1, 2, 3])
			.orderBy('t1.category_id', 'ASC')
			.orderBy('t1.id_berita', 'DESC')

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal 		= moment(data[i].tanggal).format('DD MMMM Y')
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('DD MMMM Y')
            }
        }
		const waktu = await Database
			.select('start_time')
			.table('waktu')

		// const editor = await Database
		// 	.table('')
        
        if (waktu) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < waktu.length; i++) {
                waktu[i].start_time = moment(waktu[i].start_time).format('DD MMMM Y')
            }
        }

		var result = data.map((value) => {
        	const akses = waktu.filter(obj => obj.start_time == value.tanggal)
        	return{
        		...value,
        		total : akses.length
        	}
        })

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: result,
        })
	}

	async BeritaView({ response, params }) {
		const data = await Database
			.table('berita')
			.where('id_berita', params.id)
			.limit(1)

        if (data) {
            // DATE FORMATTING FOR EXPIRED
            for (let i = 0; i < data.length; i++) {
                data[i].tanggal_manual 	= moment(data[i].tanggal_manual).format('DD MMMM Y')
            }
        }

		return response.json(data)
	}

	async Category({ response }) {
		const data = await Database
			.select('category_id', 'category_desc')
			.table('t_category')
			.whereIn('category_id', [1, 2, 3])

		const sub = await Database
			.table('t_sub_category')

		const sektor = await Database
			.table('t_sektor')

        return response.json({
            status 		: true,
            responses 	: 200,
            category 	: data,
            sub 		: sub,
            sektor 		: sektor,
        })

		// return response.json(data)
	}

	async StoreVideo({ request }) {
		let current_datetime = new Date()
		const Inputs = request.only(['nama_video', 'title', 'status', 'type', 'jenis'])
		const data = await Database
			.insert({
				nama_video: Inputs.nama_video,
				title: Inputs.title,
				status: 'YES',
				type: Inputs.type,
				jenis: Inputs.jenis,
				tanggal: current_datetime,
			})
			.into('video')
	}

	async EditVideo({ response, params }) {
		const data = await Database
			.table('video')
			.where('id', params.id)
			.first()
		return response.json(data)
	}

	async UpdateDokumentasi({ request }) {
		const Inputs = request.only(['nama_video', 'title', 'status', 'type', 'jenis', 'id'])
		const data = await Database
			.table('video')
			.where('id', Inputs.id)
			.insert({
				nama_video: Inputs.nama_video,
				title: Inputs.title,
				type: Inputs.type,
				jenis: Inputs.jenis,
			})
	}

	async TambahAkses ({response, params})
	{

		const berita = await Database
			.select('tanggal','total_akses')
			.table('berita')
			.where('id_berita', params.id)
			.first()
			
		const update = await Database
			.table('berita')
			.where('id_berita', params.id)
			.update({
				total_akses : berita.total_akses ? berita.total_akses : 0 ,
			})

	}

	async edit_paket({response, request})
	{

		const _request = request.only(['id_price', 'id_berita_paket'])

		const data = await Database
			.select('paket.*', 'price.id_price', 'duration', 'type', 'price')
			.table('berita_paket as paket')
			.innerJoin('berita_price as price', 'price.id_berita_paket', 'paket.id_berita_paket')
			.where('paket.id_berita_paket', _request.id_berita_paket)
			.where('price.id_price', _request.id_price)
			.first()

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async update_paket({response, request})
	{

		const _request = request.only(['id_price', 'id_berita_paket','nama_paket','kategori','duration','type','price','aktif'])

		const cek = await Database
			.table('berita_paket')
			.where('nama_paket', _request.nama_paket)
			.where('kategori', _request.kategori)
			.first()

		if (cek) {

			const update = await Database
				.table('berita_paket')
				.where('id_berita_paket', _request.id_berita_paket)
				.update({
					kategori  	: _request.kategori,
					aktif  		: _request.aktif,
					updated_at 	: new Date(),
				})

			const update_price = await Database
				.table('berita_price')
				.where('id_price', _request.id_price)
				.update({
					duration 	: _request.duration,
					type 		: _request.type,
					price 		: _request.price,
					updated_at 	: new Date(),
				})

		}else{

			const insert = await Database
				.insert({
					nama_paket 	: _request.nama_paket,
					kategori 	: _request.kategori,
					aktif 		: _request.aktif,
					created_at 	: new Date(), 
					updated_at 	: new Date(), 
				})
				.into('berita_paket')
				.returning('id_berita_paket')

			const update = await Database
				.table('berita_price')
				.where('id_price', _request.id_price)
				.update({
					id_berita_paket : insert[0],
					duration 		: _request.duration,
					type 			: _request.type,
					price 			: _request.price,
					updated_at 		: new Date(),
				})


		}

	}

	async bukti_bayar({response, request})
	{

		const _request = request.only(['invoice','bukti_pembayaran','submit','start','expired'])

		const order = await Database
			.table('berita_order')
			.where('invoice', _request.invoice)
			.first()

		const dataPaket = await Database
			.table('berita_price as price')
			.innerJoin('berita_paket as paket','paket.id_berita_paket','paket.id_berita_paket')
			.where('price.id_price', order.id_price)
			.where('paket.id_berita_paket', order.id_berita_paket)
			.first()

		let tab_order 		= "checkout"
		let status_order 	= "requested"
		let expired 		= new Date(new Date().getTime()+(2*24*60*60*1000));
		let inputHari 		= 1

		if (_request.submit == 'approved') {
			tab_order 		= "selesai"
			status_order 	= "approved"
			let inputHari 		= 1
			if (dataPaket.type == "hari") {
				inputHari 	= dataPaket.duration
			}else if (dataPaket.type == "minggu") {
				inputHari 	= dataPaket.duration * 7
			}else if (dataPaket.type == "bulan") {
				inputHari 	= dataPaket.duration * 30
			}else if (dataPaket.type == "tahun") {
				inputHari 	= dataPaket.duration * 365
			}	
			expired 	= new Date(new Date().getTime()+(inputHari*24*60*60*1000));
		}

		const update = await Database
			.table('berita_order')
			.where('invoice', _request.invoice)
			.update({
				tab_order  		: tab_order,
				status_order 	: status_order,
				expired 		: _request.expired,
				bukti_pembayaran: _request.bukti_pembayaran,
				updated_at 		: _request.start,
			})

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async detail_langganan({response, request})
	{

		const _request = request.only(['id_langganan'])

		const data = await Database
			.table('langganan_berita as user')
			.where('id_langganan', _request.id_langganan)
			.first()

		const transaksi = await Database
			.select('order.*', 'paket.nama_paket', 'price.duration', 'price.type', 'price.price')
			.table('berita_order as order')
			.where('id_langganan', _request.id_langganan)
			.innerJoin('berita_paket as paket', 'paket.id_berita_paket', 'order.id_berita_paket')
			.innerJoin('berita_price as price', 'price.id_price', 'order.id_price')

        // REPLACING VALUE ORDER.STATUS_ORDER WITH PENDING FROM PAYMENT IF ANY 
        for (let i = 0; i < transaksi.length; i++) {
            transaksi[i].expired        = moment(transaksi[i].expired).format('LL')
            transaksi[i].created_at     = moment(transaksi[i].created_at).format('LL')
            transaksi[i].updated_at 	= moment(transaksi[i].updated_at).format('LL')
        }

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
            transaksi 	: transaksi,
        })

	}

	async get_saham({response, request})
	{

		const saham = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'saham')
        
        for (let i = 0; i < saham.length; i++) {
            saham[i].mulai 	= moment(saham[i].mulai).format('LL')
            saham[i].selesai= moment(saham[i].selesai).format('LL')
        }

		const komoditas = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'komoditas')
        
        for (let i = 0; i < komoditas.length; i++) {
            komoditas[i].mulai 	= moment(komoditas[i].mulai).format('LL')
            komoditas[i].selesai= moment(komoditas[i].selesai).format('LL')
        }

		const currency = await Database
			.table('ringkasan_dagang')
			.where('kategori', 'currency')
        
        for (let i = 0; i < currency.length; i++) {
            currency[i].mulai 	= moment(currency[i].mulai).format('LL')
            currency[i].selesai= moment(currency[i].selesai).format('LL')
        }

        return response.json({
            status 		: true,
            responses 	: 200,
            saham 		: saham,
            komoditas 	: komoditas,            
            currency 	: currency,
        })

	}

	async store_saham({response, request})
	{

		const _request = request.only(['kategori','nama','mulai','selesai','t_1','t'])

		var t_1 		= _request.t_1
		var t 			= _request.t
		var selisih 	= _request.t - _request.t_1
		var persentase 	= selisih/_request.t*100

		const insert = await Database
			.insert({
				kategori	: _request.kategori,
				nama		: _request.nama,
				mulai		: _request.mulai,
				selesai		: _request.selesai,
				t_1			: t_1,
				t			: t,
				selisih		: selisih,
				persentase	: _request.persentase,
				created_at 	: new Date(),
				updated_at 	: new Date(),
			})
			.into('ringkasan_dagang')
			.returning('id_dagang')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: insert[0],
        })

	}

	async edit_saham({response, request})
	{

		const _request = request.only(['kategori', 'id_dagang'])

		const data = await Database
			.table('ringkasan_dagang')
			.where('kategori', _request.kategori)
			.where('id_dagang', _request.id_dagang)
			.first()

        data.mulai 	= moment(data.mulai).format('LLL')
        data.selesai= moment(data.selesai).format('LLL')

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data,
        })

	}

	async update_saham({response, request})
	{

		const _request = request.only(['kategori','nama','mulai','selesai','id_dagang','t', 't_1'])

		var t_1 		= _request.t_1
		var t 			= _request.t
		var selisih 	= _request.t - _request.t_1
		var persentase 	= selisih/_request.t*100

		const update = await Database
			.table('ringkasan_dagang')
			.where('id_dagang', _request.id_dagang)
			.where('kategori', _request.kategori)
			.update({
				nama		: _request.nama,
				mulai		: _request.mulai,
				selesai		: _request.selesai,
				selisih		: selisih,
				t			: t,
				t_1			: t_1,
				persentase	: persentase,
				updated_at 	: new Date(),
			})

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async set_status_aktif({response, request})
	{

		const _request = request.only(['id_berita', 'status_aktif'])
		
		const update = await Database
			.table('berita')
			.where('id_berita', _request.id_berita)
			.update({
				status_aktif : _request.status_aktif
			})

	}

}
module.exports = BeritaController