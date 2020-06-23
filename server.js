'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const NewsAPI = require('newsapi');

const cors = require('cors');

const { PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO, NEWSAPI_KEY } = require('./config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.get('/', (req, res) => {
    res.json({ok: true});
});


app.post('/api/email-amy', (req,res) => {
    const data = req.body;

    // Send the email to Amy
    let transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: 465,
        secure: true,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const mailOptions = {
    from: data.email,
    to: EMAIL_TO,
    subject: `From Website: ${data.subject}`,
    html: `<p>Amy,<br/>
            You have a new message from <i>${data.firstName} ${data.lastName}</i>, at: ${data.email}<br/>
            ${data.firstName} is interested in <strong>${data.subject}</strong>.<br/>
            Here's your message: <br/>
            <strong>${data.message}</strong><br/>
            <br/>
            Love Always,<br/>Your Website</p>`
    };

    transporter.sendMail(mailOptions,
        (error, response) => {
            if (error) {
                console.log(data);
                console.log(mailOptions);
                console.log('ERROR')
                console.log(error)
                res.send(error)
            }
            else {
                console.log(data);
                console.log(mailOptions);
                console.log('SUCCESS')
                res.send('Success')
            }
        transporter.close();
    });
});


app.get('/api/covid-19-news', (req, res) => {

    const newsapi = new NewsAPI(NEWSAPI_KEY);

    newsapi.v2.topHeadlines({
        q: 'COVID',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 6,
        page: 1
        })
        .then(response => {
            console.log(response);
            res.json(response);
        })
        .catch(err => {
          console.log(err)
          res.json(err);
    });
})


app.use('*', function (req, res) {
    res.status(404).json({ message: `Not Found` });
});

let server;

function runServer(port = PORT) {
    return new Promise((resolve, reject) => {
            server = app.listen(port, () => {
                console.log(`App is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    reject(err);
                });
    });
}

function closeServer() {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };