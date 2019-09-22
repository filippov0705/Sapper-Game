import gamehtml from '../templates/gamehtml';
import imgFlag from '../img/flag.png';
import imgQestion from '../img/question.png';
import ServerCalls from './serverCalls';
import animate from './utilits/animate';
import aminId from './utilits/animate';

export default class WorkObj extends ServerCalls {
    constructor() {
        super();
        this.tdArr = document.body.getElementsByTagName('TD');
        this.load = 0;
        this.winrate;
        this.login;
    }

    render() {
        return new Promise(resolve => resolve(gamehtml({imgFlag, imgQestion})));
    }

    afterRender() {
        this.login = JSON.parse(localStorage.getItem('user')).login;
        this._loginCheck(this.login, JSON.parse(localStorage.getItem('user')).password, 'submit')
            .then(resolve => {
                try {
                    if (!+JSON.parse(resolve)) throw new Error();
                } catch (e) {
                    this.catchError('Ошибка аутентификации');
                }
            });


        this._addListeners();
        this.getWinrate().then(resolve => {
            try {
                this.setWinrate(resolve);
            } catch (e) {
                const winrateSpan = document.body.getElementsByClassName('winrate')[0].children[0];
                winrateSpan.innerHTML = '??%';
            }

        });
    }

    _clearTable() {
        for (let i = 0; i < this.tdArr.length; i++) {
            this.tdArr[i].classList.remove('green');
            this.tdArr[i].classList.remove('mine');
            this.tdArr[i].classList.add('droppable');
            this.tdArr[i].innerHTML = '';
        }
    }

    _addListeners() {
        const table = document.body.getElementsByClassName('mainWrapper')[0];

        this.setButtonOnClickAction();
        this.dragAndDrop();
        this._clearTable();
        this.createMines().then(() => {
            table.onclick = (event) => {
                if (event.target.nodeName == 'TD') {
                    this._actionAfterClickOnTd(event.target);
                }
            };
        });
    }

    _isWin() {
        const table = document.body.getElementsByClassName('mainWrapper')[0],
            tds = table.getElementsByTagName('td');

        let numb = 0;
        for (let i = 0; i < tds.length; i++) {
            if (tds[i].classList.contains('green')) continue;
            if (!tds[i].children.length || tds[i].children[0].classList.contains('question')) return;
            if (numb <= 15) {
                numb++;
                continue;
            }
            return;
        }

        this.youWinAction(table);
    }

    _actionAfterClickOnTd(item) {
        if (item.classList.contains('green')) return;

        this._check(item).then(response => {
            try {
                const table = document.body.getElementsByClassName('mainWrapper')[0];
                if (item.classList.contains('green')) return;
                let rez = response;
                if (rez != -1) {
                    this.actionIfNoMine(rez, item);
                    return;
                }

                this.actionIfThereIsMine(table);
            } catch (e) {
                this.catchError('Ошибка');
            }
        });

    }

    actionIfNoMine(rez, item) {
        this.load++;
        this.loadStep(this.load);

        if (rez == 0) {
            this._isWin();
            item.classList.remove('droppable');
            item.innerHTML = '';
            item.classList.add('green');
            const compareNumb = [-11, -10, -9, -1, 1, 9, 10, 11];
            for (let i = 0; i < this.tdArr.length; i++) {
                if (this.tdArr[i].classList.contains('green')) continue;
                for (let j = 0; j < compareNumb.length; j++) {
                    if (this.tdArr[i].dataset.position == +item.dataset.position + compareNumb[j]) {
                        this.tdArr[i].click();
                    }
                }
            }
            return;
        }
        item.classList.remove('droppable');
        item.classList.add('green');
        item.innerHTML = `<span class="number">${rez}</span>`;
        this._isWin();
    }

    actionIfThereIsMine(table) {
        this.winCount(0);
        document.body.getElementsByClassName('winrate')[0].children[0].innerHTML = `${Math.round(this.winrate[0] / this.winrate[1] * 100)}%`;
        document.body.insertAdjacentHTML('afterbegin', '<div class="alert-wrapper"><div class="alert"><p class="alert-text">Вы проиграли</p><button class="alert-button">Принято</button></div></div>');

        this._loose().then(response => {
            response = JSON.parse(response);
            for (let val of this.tdArr) {
                if (response.indexOf(val.dataset.position) != -1) {
                    val.innerHTML = '';
                    val.classList.add('mine');
                }
            }

        });
        document.body.getElementsByClassName('alert-button')[0].onclick = () => {
            document.body.getElementsByClassName('alert-wrapper')[0].remove();
        };

        document.body.onmousedown = null;
        table.onclick = null;
    }

    winCount(num) {
        this.winrate[1]++;
        if (num) this.winrate[0]++;
    }

    dragAndDrop() {
        document.body.onmousedown = (event) => {
            const trg = event.target;
            if (!trg.classList.contains('flag') && !trg.classList.contains('question')) return;
            let currentDroppable = null;
            let workObj = null;
            if (trg.classList.contains('flag')) {
                document.body.insertAdjacentHTML('afterbegin', '<img src="img/flag.png" alt="flag" class="workFlag">');
                workObj = document.body.getElementsByClassName('workFlag')[0];
            } else {
                document.body.insertAdjacentHTML('afterbegin', '<img src="img/question.png" alt="question" class="workQuestion">');
                workObj = document.body.getElementsByClassName('workQuestion')[0];
            }
            workObj.style.position = 'absolute';
            workObj.style.zIndex = 1000;
            const shiftX = event.clientX - event.target.getBoundingClientRect().left;
            const shiftY = event.clientY - event.target.getBoundingClientRect().top;
            workObj.style.left = event.target.getBoundingClientRect().left - 9 + 'px';
            workObj.style.top = event.target.getBoundingClientRect().top - 9 + 'px';
            if (!trg.parentElement.classList.contains('flag-wrapper') && !trg.parentElement.classList.contains('question-wrapper')) trg.remove();

            document.body.onmousemove = (event) => {
                workObj.style.left = event.pageX - shiftX - 9 + 'px';
                workObj.style.top = event.pageY - shiftY - 9 + 'px';
                workObj.hidden = true;
                let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
                workObj.hidden = false;
                if (!elemBelow) return;
                let droppableBelow = elemBelow.closest('.droppable');
                if (currentDroppable != droppableBelow) {
                    if (currentDroppable) {
                        currentDroppable.classList.remove('focus');
                    }
                    currentDroppable = droppableBelow;
                    if (currentDroppable) {
                        currentDroppable.classList.add('focus');
                    }
                }
            };

            document.body.onmouseup = () => {
                if (currentDroppable == null || currentDroppable.tagName != 'TD' || !currentDroppable.classList.contains('droppable')) {
                    document.body.onmousemove = null;
                    document.body.onmouseup = null;
                    return workObj.remove();
                }

                if (currentDroppable.children.length) currentDroppable.children[0].remove();
                if (trg.classList.contains('flag')) {
                    currentDroppable.insertAdjacentHTML('afterbegin', '<img src="img/flag.png" alt="flag" class="flag">');
                } else {
                    currentDroppable.insertAdjacentHTML('afterbegin', '<img src="img/question.png" alt="question" class="question">');
                }
                if (trg.classList.contains('flag')) this._isWin();
                currentDroppable.classList.remove('focus');
                workObj.remove();
                document.body.onmousemove = null;
                document.body.onmouseup = null;
                currentDroppable = null;
            };
        };
    }

    setButtonOnClickAction() {
        const startAgainBtn = document.body.getElementsByClassName('button')[0];

        startAgainBtn.onclick = () => {
            animate({
                duration: 1400,
                timing(timeFraction) {
                    return timeFraction;
                },
                draw(progress) {
                    startAgainBtn.disabled = 'true';
                    if (progress == 1) return startAgainBtn.disabled = '';
                }
            });
            this.flip(this);
        };
    }

    setWinrate(resolve) {
        const winrateSpan = document.body.getElementsByClassName('winrate')[0].children[0];
        this.winrate = JSON.parse(resolve);
        if (!(this.winrate[0] / this.winrate[1])) return winrateSpan.innerHTML = '0%';
        winrateSpan.innerHTML = `${Math.round(this.winrate[0] / this.winrate[1] * 100)}%`;
    }

    catchError(message) {
        document.body.insertAdjacentHTML('afterbegin', `<div class="alert-wrapper"><div class="alert"><p class="alert-text">${message}</p><button class="alert-button">Принято</button></div></div>`);
        document.body.getElementsByClassName('alert-button')[0].onclick = () => {
            document.body.getElementsByClassName('alert-wrapper')[0].remove();
            localStorage.clear();
            location.hash = '#/';
        };
    }

    flip(self) {
        const table = document.body.getElementsByClassName('mainWrapper')[0],
            loadDiv = document.body.getElementsByClassName('progress')[0];

        animate({
            duration: 700,
            timing(timeFraction) {
                return timeFraction;
            },
            draw(progress) {
                if (progress < 0) progress = 0;
                table.style.transform = `rotate3d(0, 1, 0, ${progress * 90}deg)`;
                loadDiv.style.backgroundImage = `linear-gradient(to right, blue ${self.load - progress * self.load}% , rgb(235, 219, 219) 0%)`;
                if (progress == 1) {
                    table.style.transform = 'rotate3d(0, 1, 0, 270deg)';
                    self.load = 0;
                    self._addListeners();
                    animate({
                        duration: 700,
                        timing(timeFraction) {
                            return timeFraction;
                        },
                        draw(progress) {
                            if (progress < 0) return;
                            table.style.transform = `rotate3d(0, 1, 0, ${270 + progress * 90}deg)`;
                            if (progress > 1) cancelAnimationFrame(aminId);
                        }
                    });
                    return;
                }
            }
        });
    }

    youWinAction(table) {
        table.onclick = null;
        setTimeout(() => {
            table.onclick = null;
            this.winCount(1);
            this._winAction();
            document.body.getElementsByClassName('winrate')[0].children[0].innerHTML = `${Math.round(this.winrate[0] / this.winrate[1] * 100)}%`;
            document.body.insertAdjacentHTML('afterbegin', '<div class="alert-wrapper"><div class="alert"><p class="alert-text">Вы выиграли</p><button class="alert-button">Принято</button></div></div>');
            document.body.getElementsByClassName('alert-button')[0].onclick = () => {
                document.body.getElementsByClassName('alert-wrapper')[0].remove();
            };

            document.body.onmousedown = null;
        }, 100);
    }

    loadStep(load) {
        const loadDiv = document.body.getElementsByClassName('progress')[0];
        animate({
            duration: 10,
            timing(timeFraction) {
                return timeFraction;
            },
            draw(progress) {
                if (progress < 0) progress = 0;
                loadDiv.style.backgroundImage = `linear-gradient(to right, blue ${100 / 65 * (load - 1) + progress}% , rgb(235, 219, 219) 0%)`;
            }
        });
    }

}
