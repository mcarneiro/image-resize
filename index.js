var gm = require('gm');
var path = require('path');
var glob = require('glob');
var fs = require('fs');
var w = 250;
var h = 150;
var origin = process.argv[2];
var destination = path.resolve(origin, 'output');

function processFile(location) {
	return new Promise(function(ok, fail) {
		var img = gm(path.resolve(origin, location));

		img.size(function(err, val) {
			val = val || {};
			img.gravity('Center');
			if (val.width > w || val.height > h) {
				img.resize(w, h);
			}

			img.extent(w, h).write(path.resolve(destination, location), function (err) {
				if (err) {
					return fail(err);
				}
				console.log('Created ', location);
				ok();
			});
		});
	})
}

if (origin) {
	console.log('Destination folder', destination);

	fs.access(origin, fs.R_OK, function(err) {
		if (err) {
			console.log(err);
			process.exit(1);
			return;
		}

		fs.access(origin, fs.R_OK, function(err) {
			if (err) fs.mkdirSync(destination);

			glob('*.{png,jpg}', {
				cwd: origin
			}, function(err, files) {
				if (err) {
					console.log(err);
					process.exit(1);
					return;
				}

				Promise.all(files.map(processFile))
					.then(function() {
						process.exit(0);
					})
					.catch(function(err) {
						console.log('[ERRO]', err);
						process.exit(1);
					});
			});
		});

	});
}