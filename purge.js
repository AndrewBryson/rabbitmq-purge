var request = require('request'),
	format = require('util').format,
	JSONStream = require('JSONStream'),
	es = require('event-stream');

process.env.NO_PROXY = '*';
var queueSpec = 'http://localhost:15672/api/queues';
var purgeQueueSpec = format("%s/%2F/%s", queueSpec);

var auth = {
	'user' : 'guest',
	'pass' : 'guest'
};

// Get a list of queues from the server.
request
	.get(queueSpec)
	.auth(auth.user, auth.pass)
	.pipe(JSONStream.parse('*'))
	.pipe(es.mapSync(function (data) {
		// Purge the queue
		purgeQueue(data.name);
	}));

// Handles purging of the queue
function purgeQueue(queue) {
	var url = format(purgeQueueSpec, queue);
	console.log('request to: ' + url);
	
	request
		.del(url)
		.auth(auth.user, auth.pass)
		.on('error', function(err) { 
			console.log('error: ' + err); 
		})
		.pipe(process.stdout);
}