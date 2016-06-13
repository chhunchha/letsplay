var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    engines = require('consolidate'),
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID,
    url = 'mongodb://localhost:27017/letsplay';

app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render("error_template", { error: err});
}

MongoClient.connect(process.env.MONGODB_URI || url,function(err, db){
    assert.equal(null, err);
    console.log('Successfully connected to MongoDB.');

    var tennis_matches_collections = db.collection('tennis_matches');

    app.post('/get_matches', function(req, res, next) {
        // console.log("Received get /matches request");
        console.log(req.body);
        var filter = get_filter(req.body);
        tennis_matches_collections.find(filter).toArray(function(err, matches){
            if(err) throw err;

            if(matches.length < 1) {
                console.log("No matches found.");
            }

            // console.log(matches);
            res.json(matches);
        });
    });

    var get_filter = function(params) {
        var filter = {}
        if(Object.keys(params).length != 0 ) {
            if(params.type != 'All' && params.type != undefined) {
                filter.type = params.type;
            }

            if(params.team1.length != 0 && params.team2.length == 0) {
                filter['$or'] = [
                    { 'team1' : params.team1},
                    { 'team2' : params.team1}
                ];
            } else if(params.team1.length != 0 && params.team2.length != 0) {
                filter['$or'] = [
                    {
                        '$and' : [
                            { 'team1' : params.team1},
                            { 'team2' : params.team2}
                        ]
                    },
                    {
                        '$and' : [
                            { 'team1' : params.team2},
                            { 'team2' : params.team1}
                        ]
                    }
                ];
            } else if(params.team1.length == 0 && params.team2.length != 0) {
                filter['$or'] = [
                    { 'team1' : params.team2},
                    { 'team2' : params.team2}
                ];
            }
        }

        console.log(filter);

        return filter;
    }

    app.post('/matches', function(req, res, next){
        console.log(req.body);
        tennis_matches_collections.insert(req.body, function(err, doc) {
            if(err) throw err;
            console.log(doc);
            res.json(doc);
        });
    });

    app.delete('/matches/:id', function(req, res, next){
        var id = req.params.id;
        console.log("delete " + id);
        tennis_matches_collections.deleteOne({'_id': new ObjectId(id)}, function(err, results){
            console.log(results);
            res.json(results);
        });
    });

    app.put('/matches/:id', function(req, res, next){
        var id = req.params.id;
        tennis_matches_collections.updateOne(
            {'_id': new ObjectId(id)},
            { $set: {
                'name' : req.body.name,
                'email': req.body.email,
                'phone': req.body.phone
                }
            }, function(err, results){
                console.log(results);
                res.json(results);
        });
    });

    app.use(errorHandler);
    var server = app.listen(process.env.PORT || 3000, function() {
        var port = server.address().port;
        console.log('Express server listening on port %s.', port);
    })
})
