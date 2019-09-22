const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    fs = require('file-system'),
    shortId = require('shortid'),
    usersFile = 'users.json',
    app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('common'));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.get('/api/winrate/:id', (req, res) => {
    const users = getUsersFromDB(),
        user = users.find(item => item.login === req.params.id);

    res.send(JSON.stringify(user.winrate));
});

app.post('/api/task', (req, res) => {
    const users = getUsersFromDB(),
        user = req.body;

    if (user.action == 'submit') {
        const targetUser = users.find(item => item.login == user.login);
        if (!targetUser || targetUser.password != user.password) return res.send('0');
        return res.send('1');
    }
    if (!!users.find(item => item.login == user.login)) return res.send('1');
    delete user.action;
    user.winrate = [0, 0];
    users.push(user);
    setUsersToDB(users);
    res.send('0');
});

app.get('/api/mines/:login', (req, res) => {

    const minesArr = [],
        users = getUsersFromDB(),
        user = users.find(item => item.login === req.params.login),
        index = users.indexOf(user),
        workArr = [],
        safeTd = {};

    users.splice(index, 1);

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    for (let i = 11; i <= 99; i++) {
        if (i%10 === 0) continue;
        workArr.push(`${i}`)
    }

    while (minesArr.length < 15) {
        let workNumb = parseInt(getRandomArbitrary(0, 81))
        if (!minesArr.includes(workArr[workNumb])) {
            minesArr.push(workArr[workNumb]);
        }
    }

    user.minesArr = minesArr;

    for (let i = 0; i < workArr.length; i++) {
        if (minesArr.indexOf(workArr[i]) != -1) continue;
        let numberOfMines = 0;
        const compareNumb = [-11, -10, -9, -1, 1, 9, 10, 11];
        for (let j = 0; j < minesArr.length; j++) {
            for (let m = 0; m < compareNumb.length; m++) {
                if (+minesArr[j] + +compareNumb[m] == +workArr[i]) numberOfMines++;
            }
        }
        safeTd[workArr[i]] = numberOfMines;
    }

    user.safeTd = [safeTd];
    users.push(user);
    setUsersToDB(users);
    res.send(JSON.stringify(safeTd));

});

app.get('/api/minescheck/:login/:position', (req, res) => {
    const users = getUsersFromDB(),
        user = users.find(item => item.login === req.params.login),
        index = users.indexOf(user);

    if (user.minesArr.indexOf(req.params.position) != -1) {
        res.send(JSON.stringify(-1));
    } else {
        res.send(JSON.stringify(user.safeTd[0][`${req.params.position}`]))
    }
});

app.get('/api/loose/:login', (req, res) => {
    const users = getUsersFromDB(),
        user = users.find(item => item.login === req.params.login),
        index = users.indexOf(user);

    users.splice(index, 1);
    user.winrate[1] = +user.winrate[1] + 1;
    users.push(user);
    setUsersToDB(users);
    res.send(JSON.stringify(user.minesArr));
});

app.get('/api/winaction/:login', (req, res) => {
    const users = getUsersFromDB(),
        user = users.find(item => item.login === req.params.login),
        index = users.indexOf(user);

    users.splice(index, 1);
    user.winrate[1] = +user.winrate[1] + 1;
    user.winrate[0] = +user.winrate[0] + 1;
    users.push(user);
    setUsersToDB(users);
    res.send(JSON.stringify(''));
});



function getUsersFromDB() {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function setUsersToDB(data) {
    fs.writeFileSync(usersFile, JSON.stringify(data));
}


app.listen(3000, () => console.log('Server has been started...'));