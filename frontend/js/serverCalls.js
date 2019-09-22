export default class ServerCalls {

    constructor() {
    }

    postUser(login, password, action) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', 'http://localhost:3000/api/task', true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);
            xhr.send(JSON.stringify({login, password, action}));
        });
    }

    _loginCheck(login, password, action) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('POST', 'http://localhost:3000/api/task', true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);
            xhr.send(JSON.stringify({login, password, action}));
        });

    }

    getWinrate() {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', `http://localhost:3000/api/winrate/${this.login}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);

            xhr.send();
        });
    }

    createMines() {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://localhost:3000/api/mines/${this.login}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => resolve(xhr.response);

            xhr.send();
        });
    }

    _winAction() {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', `http://localhost:3000/api/winaction/${this.login}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);
            xhr.send();
        });
    }

    _check(item) {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();

            xhr.open('GET', `http://localhost:3000/api/minescheck/${this.login}/${item.dataset.position}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);
            xhr.send();
        });
    }

    _loose() {
        return new Promise(resolve => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `http://localhost:3000/api/loose/${this.login}`, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = () => resolve(xhr.response);
            xhr.send();
        });
    }

}
