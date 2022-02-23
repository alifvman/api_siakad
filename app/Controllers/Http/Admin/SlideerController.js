'use strict'
const Database = use('Database')
	const Encryption = use('Encryption')
	const moment = require('moment');

class SlideerController {

	async slide ({response,params}){
		const slider = await Database
			.table('t_image_slide')
			.paginate(params.page,15)
		return response.json(slider)
	}

	async updatestatus({ response,request }){
		const Inputs = request.only(['no_image','status'])
		const update = await Database
			.table('t_image_slide')
			.where('no_image',Inputs.no_image)
			.update({
				status_image : Inputs.status
			})
	}

	async editSlider({ response,params }){
		const data = await Database
			.table('t_image_slide')
			.where('no_image',params.id)
			.first()
		return response.json(data)
	}

	async store_slider({request, response})
	{

		const _request = request.only(['file_name', 'link_url', 'status_image'])

		const insert = await Database
			.insert({
				file_name 	: _request.file_name,
				link_url 	: _request.link_url,
				status_image: _request.status_image,
			})
			.into('t_image_slide')

        return response.json({
            status 		: true,
            responses 	: 200,
        })

	}

	async edit_slider({request, response})
	{

		const _request = request.only(['no_image'])

		const data = await Database
			.table('t_image_slide')
			.where('no_image', _request.no_image)
			.first()

        return response.json({
            status 		: true,
            responses 	: 200,
            data 		: data
        })

	}

	async update_slider({request, response})
	{

		const _request = request.only(['no_image','file_name', 'link_url', 'status_image'])

		const update = await Database
			.table('t_image_slide')
			.where('no_image', _request.no_image)
			.update({
				file_name 	: _request.file_name,
				link_url 	: _request.link_url,
				status_image: _request.status_image, 
			})

        return response.json({
            status 		: true,
            responses 	: 200,
        })
        
	}

}
module.exports = SlideerController
