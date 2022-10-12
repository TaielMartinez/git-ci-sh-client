const io = require('socket.io-client');
const fs = require('fs');
const { exec } = require("child_process");

var reconnect, socket, init = false, token;

function connect_socket() {
    console.log('check connect');
    if (!init) {
        console.log('connecting');
        socket = io.connect('http://localhost:8000');
    }
}
connect_socket();
setInterval(connect_socket, 10000);

socket.on('connect', function () {
    console.log('Client connected');
    init = true;
    try {
        if (fs.existsSync('./token.json')) {
            token = require('./token.json').token;
        }
        socket.emit('server_connect', token);
        console.log('send: server_connect');
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

