import { b64Decode, getQsParam } from './common';
import { buildDataString, parseWebauthnJson } from './common-webauthn';

// tslint:disable-next-line
require('./webauthn.scss');

let parsed = false;
let webauthnJson: any;
let btnText: string = null;
let btnReturnText: string = null;
let parentUrl: string = null;
let parentOrigin: string = null;
let callbackUri: string = null;
let stopWebAuthn = false;
let sentSuccess = false;
let obj: any = null;

document.addEventListener('DOMContentLoaded', () => {
    init();

    parseParameters();
    if (btnText) {
        const button = document.getElementById('webauthn-button');
        button.innerText = decodeURI(btnText);
        button.onclick = executeWebAuthn;
    }
});

function init() {
    start();
    onMessage();
    info('ready');
}

function parseParameters() {
    if (parsed) {
        return;
    }

    parentUrl = getQsParam('parent');
    if (!parentUrl) {
        error('No parent.');
        return;
    } else {
        parentUrl = decodeURIComponent(parentUrl);
        parentOrigin = new URL(parentUrl).origin;
    }

    const version = getQsParam('v');

    if (version === '1') {
        parseParametersV1();
    } else {
        parseParametersV2();
    }
    parsed = true;
}

function parseParametersV1() {
    const data = getQsParam('data');
    if (!data) {
        error('No data.');
        return;
    }

    webauthnJson = b64Decode(data);
    btnText = getQsParam('btnText');
    btnReturnText = getQsParam('btnReturnText');
}

function parseParametersV2() {
    let dataObj: { data: any, btnText: string; btnReturnText: string; callbackUri?: string } = null;
    try {
        dataObj = JSON.parse(b64Decode(getQsParam('data')));
    }
    catch (e) {
        error('Cannot parse data.');
        return;
    }

    callbackUri = dataObj.callbackUri;
    webauthnJson = dataObj.data;
    btnText = dataObj.btnText;
    btnReturnText = dataObj.btnReturnText;
}

function start() {
    sentSuccess = false;

    if (!('credentials' in navigator)) {
        error('WebAuthn is not supported in this browser.');
        return;
    }

    parseParameters();
    if (!webauthnJson) {
        error('No data.');
        return;
    }

    try {
        obj = parseWebauthnJson(webauthnJson);
    }
    catch (e) {
        error('Cannot parse webauthn data.');
        return;
    }

    stopWebAuthn = false;

    if (callbackUri != null || (navigator.userAgent.indexOf(' Safari/') !== -1 && navigator.userAgent.indexOf('Chrome') === -1)) {
        // Safari and mobile chrome blocks non-user initiated WebAuthn requests.
    } else {
        executeWebAuthn();
    }
}

function executeWebAuthn() {
    if (stopWebAuthn) {
        return;
    }

    navigator.credentials.get({ publicKey: obj })
        .then(success)
        .catch(error);
}

function onMessage() {
    window.addEventListener('message', event => {
        if (!event.origin || event.origin === '' || event.origin !== parentOrigin) {
            return;
        }

        if (event.data === 'stop') {
            stopWebAuthn = true;
        }
        else if (event.data === 'start' && stopWebAuthn) {
            start();
        }
    }, false);
}

function error(message: string) {
    if (callbackUri) {
        document.location.replace(callbackUri + '?error=' + encodeURIComponent(message));
        returnButton(callbackUri + '?error=' + encodeURIComponent(message));
    } else {
        parent.postMessage('error|' + message, parentUrl);
    }
}

function success(assertedCredential: PublicKeyCredential) {
    if (sentSuccess) {
        return;
    }

    const dataString = buildDataString(assertedCredential);

    if (callbackUri) {
        document.location.replace(callbackUri + '?data=' + encodeURIComponent(dataString));
        returnButton(callbackUri + '?data=' + encodeURIComponent(dataString));
    } else {
        parent.postMessage('success|' + dataString, parentUrl);
        sentSuccess = true;
    }
}

function info(message: string) {
    if (callbackUri) {
        return;
    }

    parent.postMessage('info|' + message, parentUrl);
}

function returnButton(uri: string) {
    // provides 'return' button in case scripted navigation is blocked
    const button = document.getElementById('webauthn-button');
    if (btnReturnText) {
        button.innerText = decodeURI(btnReturnText);
    } else {
        button.innerText = decodeURI('Return to App');
    }
    button.onclick = function () {
        document.location.replace(uri);
    }
}

