import RegistrHtml from '../templates/registrHtml';
import ServerCalls from './serverCalls';

export default class Registr extends ServerCalls {
    render() {
        return new Promise(resolve => resolve(RegistrHtml()));
    }

    afterRender() {
        this.regSubmEvents();
        this.formRegistration();
        this.formSubmit();
    }

    regSubmEvents() {
        const registrationMark = document.body.getElementsByClassName('registrationMark')[0],
            submitMark = document.body.getElementsByClassName('submitMark')[0];

        submitMark.addEventListener('click', () => {
            this.submReg(submitMark, registrationMark);
        });

        registrationMark.addEventListener('click', () => {
            this.submReg(registrationMark, submitMark);
        });
    }

    submReg(focusToWhat, focusFromWhat) {
        if (focusToWhat.classList.contains('active')) return;
        focusFromWhat.classList.remove('active');
        focusToWhat.classList.add('active');

        if (focusToWhat.classList.contains('submitMark')) {
            document.body.getElementsByClassName('submit-wrapper')[0].classList.add('flex');
            document.body.getElementsByClassName('submit-wrapper')[0].classList.remove('none');
            document.body.getElementsByClassName('registration-wrapper')[0].classList.add('none');
            document.body.getElementsByClassName('registration-wrapper')[0].classList.remove('flex');
        } else {
            document.body.getElementsByClassName('submit-wrapper')[0].classList.add('none');
            document.body.getElementsByClassName('submit-wrapper')[0].classList.remove('flex');
            document.body.getElementsByClassName('registration-wrapper')[0].classList.add('flex');
            document.body.getElementsByClassName('registration-wrapper')[0].classList.remove('none');
        }

    }

    formRegistration() {
        const formRegistration = document.body.getElementsByClassName('registration')[0];

        formRegistration.addEventListener('submit', event => {
            event.preventDefault();
            const inputLogin = document.body.getElementsByClassName('registrationLogin')[0].value;
            const inputPassword = document.body.getElementsByClassName('registrationPassword')[0].value;
            if (/[_!"':;#$%^&?*()-+]/.test(inputLogin)) {
                document.body.getElementsByClassName('registrationLogin')[0].value = '';
                document.body.getElementsByClassName('registrationPassword')[0].value = '';
                return this.errorMessage('Некорректный логин!', 'Попробуйте снова.');
            }
            this.postUser(inputLogin, inputPassword, 'registration').then(resolve => {
                try {
                    if (+JSON.parse(resolve)) throw new Error();
                    this.setToLS(inputLogin, inputPassword);
                } catch (e) {
                    document.body.getElementsByClassName('registrationPassword')[0].value = '';
                    return this.errorMessage('Такой пользователь уже есть!', 'Введите другой логин.');
                }
            });

        });
    }

    formSubmit() {
        const formSubmit = document.body.getElementsByClassName('submit')[0];

        formSubmit.addEventListener('submit', event => {
            event.preventDefault();
            const inputLogin = document.body.getElementsByClassName('submitLogin')[0].value,
                inputPassword = document.body.getElementsByClassName('submitPassword')[0].value;

            this.postUser(inputLogin, inputPassword, 'submit').then(resolve => {
                try {
                    if (!+JSON.parse(resolve)) throw new Error();
                    this.setToLS(inputLogin, inputPassword);
                } catch (e) {
                    document.body.getElementsByClassName('submitPassword')[0].value = '';
                    this.errorMessage('Неверный логин или пароль!', 'Попробуйте снова.');
                }
            });
        });
    }

    setToLS(inputLogin, inputPassword) {
        localStorage.clear();
        localStorage.setItem('user', JSON.stringify({login: inputLogin, password: inputPassword}));
        location.hash = '#/game';
    }

    errorMessage(messageOne, messageTwo) {
        document.body.insertAdjacentHTML('afterbegin', `<div class="alert-wrapper"><div class="alert"><p class="alert-text"><span class="registration-alert">${messageOne}</span><span class="registration-alert">${messageTwo}</span></p><button class="alert-button">Принято</button></div></div>`);
        document.body.getElementsByClassName('alert-button')[0].onclick = () => {
            document.body.getElementsByClassName('alert-wrapper')[0].remove();
        };
    }
}
