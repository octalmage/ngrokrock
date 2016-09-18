#!/usr/bin/env node
const program = require('commander');
const rp = require('request-promise');
const _ = require('underscore');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
let tunnels;

updateNotifier({pkg}).notify();

program
	.version(pkg.version)
	.option('-u, --username <value>', 'Your ngrokrock username.')
	.option('-p, --password <value>', 'Your ngrokrock password.')
	.option('-h, --host [value]', 'The ngrok API host.', 'http://127.0.0.1:4040')
	.option('-a, --api [value]', 'The ngrokrock API host.', 'https://ngrokrock.com')
	.parse(process.argv);

if (!program.username) {
	console.log('--username option required')
	process.exit();
}

if (!program.password) {
	console.log('--password option required')
	process.exit();
}

const host = program.host;

check();

function buildDomain(query) {
	let parse = program.api.split('://');
	let domain = parse[1] + '/api/v1/domains';
	let full = parse[0] + '://' + program.username + ':' + program.password + '@' + domain;

	if (query) {
		full += query;
	}
	return full;
}

function check() {
	rp(program.host + '/api/tunnels')
		.then(parseJson)
		.then(parseTunnels)
		.then(_.uniq)
		.then(uniqueTunnels)
		.then((response) => {
			if ( !_.isEqual(response, tunnels) ) {
				tunnels = response;
				if (!_.isEmpty(tunnels)) {
					submit(response);
				}
			}
		})
		.catch((err) => {
			// TODO: Do something here.
			// ngrok isn't running.
		}).finally(() => {
			defer();
		});
}
function submit(tunnels) {
	let domain = buildDomain(buildQuery(tunnels));
	let options = {
		method: 'POST',
		uri: domain,
	};

	rp(options)
		.then(parseJson)
		.then((response) => {
			if (response.success) {
				console.log(tunnels + ' added!');
			}
		})
		.catch((err) => {
			console.log(err);
		});
}

function uniqueTunnels(tunnels) {
	let promise = new Promise((resolve, reject) => {
		rp(buildDomain())
			.then(parseJson)
			.then((response) => {
				resolve(_.difference(tunnels, response));
			})
			.catch((err) => {
				// TODO: Do something here.
				// ngrokrock didn't respond.
				reject(err);
			});
	});

	return promise;
}

function defer() {
	setTimeout(() => {
		check();
	}, 5000);
}

function buildQuery(tunnels) {
	let query = '?';
	for (let domain of tunnels) {
		if (query !== '?') query += '&';
		query += 'domain[]=' + encodeURIComponent(domain);
	}
	return query;
}

function parseJson(response){
	return JSON.parse(response);
}

function parseTunnels(response) {
	return response.tunnels.map((tunnel) => {
		return tunnel.public_url.replace(/^.*?:\/\//, '');
	});
}
