import errorHtml from '../../templates/errorHtml';

export default class Error404 {
    render() {
        return new Promise(resolve => resolve(errorHtml()));
    }

    afterRender() {
    }
}
