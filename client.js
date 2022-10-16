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
    token = process.env.TOKEN,
    url_server = process.env.URL_SERVER || '127.0.0.1'

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
    console.log(`Server start in ${port} port`)
    console.log(`Send request to: ${url_server}/${token}`)
    request.get(
        `${url_server}/${token}`, (error, response, body) => {
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
})

function log(msg) {
    if (debug) console.log(msg)
}
