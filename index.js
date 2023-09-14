const express = require('express');
const core = require('./core')
const app = express();
const port = 5000;
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({extended: true})) // for parsing application/x-www-form-urlencoded

app.get('/', async (request, response) => {
    response.send('screenshot server')
})

app.post('/page_screenshot', core.screenshot)
app.get('/page_screenshot', core.screenshot)

app.use('/static', express.static('static'))
app.listen(port, () => {
    console.log('Server is listening on port:', port)
})
