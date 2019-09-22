import '../styles/styles.less';
import Utils from './utilits/utils.js';
import Error404 from './utilits/error404.js';
import Registr from './registr.js';
import WorkObj from './gameBody.js';

document.body.ondragstart = () => {
    return false;
};

const Routes = {
    '/': Registr,
    '/game': WorkObj
};


function router() {
    const request = Utils.parseRequestURL(),
        parsedURL = `/${request.resource || ''}`;
    let obj = Routes[parsedURL] ? new Routes[parsedURL]() : new Error404();
    obj.render().then(result => {
        document.body.innerHTML = result;
        obj.afterRender();
    });
}


window.addEventListener('load', router);
window.addEventListener('hashchange', router);

