var request = require('request'),
	format = require('util').format,
	JSONStream = require('JSONStream'),
	es = require('event-stream');

var vhostName = ''; // e.g. 'dev'
var connectionString = format("http://localhost:15672/api/queues/%s", vhostName);
var purgeQueueSpecification = format("%s/%s", connectionString);

var auth = {
	'user' : 'guest',
	'pass' : 'guest'
};

// Prevent 'request' from trying to use a proxy, go direct on the URL instead.
process.env.NO_PROXY = '*';

// Get a list of queues from the server.
request
	.get(connectionString)
	.auth(auth.user, auth.pass)
	.pipe(JSONStream.parse('*'))
	.pipe(es.mapSync(function (data) {
		// Purge the queue
		purgeQueue(data.name);
	}));

// Handles purging of the queue
function purgeQueue(queueNameToPurge) {
	var url = format(purgeQueueSpecification, queueNameToPurge);
	console.log('request to: ' + url);
	
	request
		.del(url)
		.auth(auth.user, auth.pass)
		.on('error', function(err) { 
			console.error('error: ' + err); 
		})
		.pipe(process.stdout);
}