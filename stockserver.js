var express = require('express')
  , app = express.createServer();

app.use(express.bodyDecoder());

app.get('/user/:id/:op?', function(req, res, next){
    var id = req.params.id;
    var op = req.params.op;
    if (!op) {
        op = 'no'
    }
    if (id) {
        res.send('the user is ' + id + ' op is ' + op);
    } else {
        next();
    }
});

app.get('/*', function(req, res){
    res.send('hello world');
});

app.listen(3000);
