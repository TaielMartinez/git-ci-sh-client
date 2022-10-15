const fs = require('fs'),
    express = require('express'),
    { exec } = require("child_process"),
    bodyParser = require('body-parser'),
    app = express(),
    port = process.env.PORT || 3535,
    debug = process.env.DEBUG || false,
    url_server = process.env.URL_SERVER || '127.0.0.1'

var token

require('dotenv').config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

try {
    if (fs.existsSync('./token.json')) {
        setToken(require('./token.json').token)
    } else {
        setToken(makeid(40))
    }
} catch (err) {
    setToken(makeid(40))
}

function setToken(tok) {
    token = tok
    fetch(`${url_server}/${token}`)
        .then((response) => response.text())
        .then((body) => {
            log(`send connect: ${token}`);
            log(body);
        })
}

app.post('/', (req, res) => {
    try {
        log('Start commands')
        fs.writeFile('deploy.sh', req.body.commands, 'utf8', err => {
            if (err) throw err
        })

        exec(`sudo ${__dirname}/deploy.sh`, (error, stdout, stderr) => {
            res.json({ error: error, stdout: stdout, stderr: stderr, token: token })
        });

    } catch (error) {
        console.error(error);
        res.json({ error: error, stdout: '', stderr: '', token: token })
    }
})

app.listen(port, () => {
    console.log(`Server start in ${port}`)
})

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function log(msg) {
    if (debug) console.log(msg)
}







socket.on('connect_failed', function () {
    console.error('Connection Failed');
})

socket.on('connect', function () {
    console.log('Client connected');
    init = true;
    try {
        if (fs.existsSync('./token.json')) {
            token = require('./token.json').token;
            socket.emit('server_connect', token);
            console.log('send: server_connect');
        } else {
            socket.emit('server_init', token);
            console.log('send: server_init');
        }
    } catch (err) {
        socket.emit('server_init', token);
        console.log('send: server_init');
    }

    socket.on('first_connected', tok => {
        console.log('first_connected');
        token = tok;
        fs.writeFile('token.json', JSON.stringify({ token: token }), 'utf8', err => {
            if (err) {
                console.log(err);
            }
        })
    })

    socket.on('check_status_server', () => {
        console.log('check_status_server');
        socket.emit('check_status_server', token);
    })

    socket.on('run_commands', (commands, code) => {
        console.log('run_commands');
        fs.writeFile('deploy.sh', commands, 'utf8', err => {
            if (err) {
                console.log("Error: ", err);
                return;
            }
        })

        exec(`sudo ${__dirname}/deploy.sh`, (error, stdout, stderr) => {
            socket.emit('run_commands_res', { error: error, stdout: stdout, stderr: stderr, code: code });
            console.log('send run_commands_res', error, stdout, stderr, code);
        });
    })

    socket.on('disconnect', () => {
        init = false;
    })
})
