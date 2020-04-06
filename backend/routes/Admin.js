var express = require('express')
const db = require('../db-connect')
const globals = require('../globals')
var router = express.Router()
var hat = require('hat')

router.use(function adminLog (req, res, next) {
    console.log('<LOG> -', new Date().toUTCString());
    next();
});

router.use(function isAdmin (req, res, next) {
    console.log('<LOG> - POST /admin/*')
    const incoming_token = JSON.parse(JSON.stringify(req.headers))['x-auth']
    if (incoming_token) {
        db.query('SELECT * FROM user_sessions, users WHERE user_sessions.user_id = users.id AND user_sessions.session = ? AND user_type = ?', [incoming_token, globals.user_types.admin], function (err, result) {
            if (err) {
                console.log('<LOG> - POST /admin/* - ERROR')
                console.error(err)
            }
            if (result.length > 0) {
                console.log('<LOG> - POST /admin/* - SUCCESS')
                next()
            } else {
                console.log('<LOG> - POST /admin/* - Unauthorized Access Attempt')
                res.statusCode = 401
                res.json(globals.messages.failure)
            }
        })
    } else {
        console.log('<LOG> - POST /admin/* - Missing Credentials')
        res.statusCode = 401
        res.json(globals.messages.failure)
    }
});

router.post('/dog_parks/add', function (req, res) {
    console.log('<LOG> - POST /admin/dog_parks/add')

    const {
        type,
        name, 
        SHAPE_Leng, 
        SHAPE_Area, 
        street,
        house_number,
        neighborhood,
        operator,
        handicapped,
        condition
    } = req.body.user_input

    var values = {type:type, name:name, SHAPE_Leng:SHAPE_Leng, SHAPE_Area:SHAPE_Area, street:street, house_number:house_number, neighborhood:neighborhood, operator:operator, handicapped:handicapped, condition:condition}
    db.query('INSERT INTO places SET ?', values, function (err, result) {
        if (err) {
            console.log('<LOG> - POST /admin/dog_parks/add - ERROR')
            console.error(err)
            res.json(globals.messages.failure)
        } else {
            console.log('<LOG> - POST /admin/dog_parks/add SUCCESS')
            res.json({
                status: true
            })
        }
    })
    
});

router.post('/login', function (req, res) {
    console.log('<LOG> - POST /admin/login');
    const phone = req.body.phone;
    const password = req.body.pass;
    db.query('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password], function (err, result) {
        if (err) {
            console.log('<LOG> - POST /admin/login - ERROR');
            console.error(err);
            res.json(globals.messages.failure)
        } else {
            if (result.length > 0) {
                delete result[0].password;
                var token = hat();
                db.query('INSERT INTO user_sessions(user_id,session) VALUES (?,?)',[result[0].id,token],function (err, result){
                    if (err) {
                        console.log('<LOG> - POST /admin/login - Wrong Credentials');
                        console.error(err);
                        res.statusCode = 401
                        res.json(globals.messages.failure)
                    } else {
                        console.log('<LOG> - POST /admin/login - SUCCESS');
                        res.json({
                            status: true,
                            token: token,
                            user: result[0]
                        })
                    }
                });
            } else {
                console.log('<LOG> - Admin Login Wrong Credentials');
                res.statusCode = 401
                res.json(globals.messages.failure)
            }
        }
    })
});

router.get('/login', function (req, res) {
    console.log('<LOG> - GET /admin/login');
    const incoming_token = JSON.parse(JSON.stringify(req.headers))['x-auth']
    if (incoming_token) {
        db.query('SELECT * FROM user_sessions, users WHERE user_sessions.user_id = users.id AND user_sessions.session = ?', [incoming_token], function(err, result) {
            if (err) {
                console.log('<LOG> - GET /admin/login - ERROR');
                console.error(err)
                res.json(globals.messages.failure)
            } else {
                delete result[0].password
                console.log('<LOG> - GET /admin/login - SUCCESS');
                res.json({
                    status: true,
                    user: result[0]
                })
            }
        })
    } else {
        console.log('<LOG> - GET /admin/login - Credentials Missing');
        res.statusCode = 401
        res.json(globals.messages.failure)
    }
});

module.exports = router;