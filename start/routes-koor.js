'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
	
	Route.get('MateriTopik/:id', 'Home/KoorController.MateriTopik')
	Route.get('SumHasil/:id', 'Home/KoorController.SumHasil')
	Route.get('vidcon', 'Home/KoorController.vidcon')
	Route.get('MateritopikDetail/:id', 'Home/KoorController.MateritopikDetail')

}).prefix('api/migrasi/home/koor')
