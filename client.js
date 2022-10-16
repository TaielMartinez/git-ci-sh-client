for (let i = 0; i < 10; i++) {
    console.log('-')
}

require('dotenv').config()
const fs = require('fs'),
    express = require('express'),
    { exec } = require("child_process"),
    bodyParser = require('body-parser'),
    request = require('https'),
    app = express(),
    port = process.env.PORT || 3535,
    debug = process.env.DEBUG || false,
    url_server = process.env.URL_SERVER || '127.0.0.1'

var token

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    const url_send = `${url_server}/${token}`
    console.log(`Send request to: ${url_send}`)
    request.get(
        url_send, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                log('Request susses:')
                log(body)
            } else {
                log('Request error:')
                log(error)
                log(body)
            }
        }
    )
}

app.post('/', (req, res) => {
    try {
        log('Start commands')
        fs.writeFile('deploy.sh', req.body.commands, 'utf8', err => {
            if (err) throw err
        })

        exec(`sudo ${__dirname}/deploy.sh`, (error, stdout, stderr) => {
            res.json({ error: error, stdout: stdout, stderr: stderr, token: token })
        })

    } catch (error) {
        console.error(error)
        res.json({ error: error, stdout: '', stderr: '', token: token })
    }
})

app.listen(port, () => {
    console.log(`Server start in ${port}`)
})

function makeid(length) {
    var result = ''
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength))
    }
    return result
}

function log(msg) {
    if (debug) console.log(msg)
}
