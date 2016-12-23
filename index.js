'use strict';

const usdBaseURL = 'http://api.fixer.io/latest?base=USD';
const rubBaseURL = 'http://api.fixer.io/latest?base=RUB';
const postsURL = 'https://jsonplaceholder.typicode.com/posts/';
const jsonpURL = 'http://run.plnkr.co/plunks/v8xyYN64V4nqCshgjKms/data-2.json';
const HttpStatusCode = {
    OK: 200
};
const contentDiv = $('.content');
const lastMethod = $('.lastMethod');

$('.control').on('click', function(event) {
    let button = event.target;
    if (button.tagName !== 'BUTTON') return;
    switch (button.id) {
        case 'nativeXhr' :
            useNativeXhr();
            break;
        case 'nativeFetch' :
            useNativeFetch();
            break;
        case 'scriptJsonp' :
            getJsonpWithScript();
            break;
        case 'ajaxJsonp' :
            getJsonpWithAjax();
            break;
        case 'ajax' :
            useAjax();
            break;
        case 'get' :
            useGet();
            break;
        case 'post' :
            usePost();
            break;
        case 'clean' :
           contentDiv.empty();
           break;
    }
    lastMethod.text(button.textContent);
});

//--------------------------------------

function useNativeXhr() {
    const nativeXhr = new XMLHttpRequest();

    nativeXhr.addEventListener('readystatechange', function () {
        if (nativeXhr.readyState === nativeXhr.DONE) {
            if (nativeXhr.status === HttpStatusCode.OK) {
                try {
                    printData(JSON.parse(nativeXhr.responseText));
                } catch (xhrDataErr) {
                    printError(xhrDataErr);
                }
            } else {
                printError(nativeXhr.status);
            }
        }
    });

    nativeXhr.open('GET', usdBaseURL);
    nativeXhr.send();
}

function useNativeFetch() {
    fetch(rubBaseURL, {method: 'GET'})
        .then(function(response) {
            if (response.status  === HttpStatusCode.OK)
                return response.json();
            else throw response.status;
        })
        .then(printData)
        .catch(printError);
}

function getJsonpWithScript() {
    let script = document.createElement('script');
    script.src = jsonpURL;
    document.head.appendChild(script);
}

function getJsonpWithAjax() {
    $.ajax({
        url: jsonpURL,
        type: 'GET',
        jsonp: "jsonCallback",
        dataType: "jsonp",
        error: function(responseInfo) {
            if (responseInfo.status !== HttpStatusCode.OK)
                printError(responseInfo.status.toString());
        }
    });
}

function useAjax() {
    $.ajax({
        url: postsURL,
        type: 'GET',
        datatype: 'json'
    })
        .done( printData /*function(response) {
         printData(response);
         }*/)
        .fail(function(responseInfo) {
            printError(responseInfo.status);
        });
}

function useGet() {
    $.get(postsURL + '3', printData)
        .fail(function(responseInfo) {
            printError(responseInfo.status);
        });
}

function usePost() {
    let data = [
        {
            team: 'McLaren',
            pilots: [
                {
                    name: 'Alonso',
                    points: 54
                },
                {
                    name: 'Button',
                    bestResult: 21
                }
            ],
            points: 76
        },
        {
            team: 'Mersedes',
            pilots: [
                {
                    name: 'Hamilton',
                    bestResult: 380
                },
                {
                    name: 'Rosberg',
                    bestResult: 385
                }
            ],
            points: 765
        }
    ];

    data = data.map((item) => JSON.stringify(item));
    $.post(postsURL, {data: data }, 'json')
        .done(function (response) {
            printData(response['data[]'].map((user) => JSON.parse(user)));
        })
        .fail(function(responseInfo) {
            printError(responseInfo.status);
        });
}


function jsonCallback(data) {
    printData(data);
}

function printError(
    error  = 'unknown error',
    domParent = contentDiv.empty()
) {
    if (typeof(error) !== 'string') error = error.toString();

    let objectDiv = document.createElement('div');
    objectDiv.className = 'data';

    let dataField = document.createElement('span');
    dataField.className = 'error';
    dataField.textContent = error;
    objectDiv.appendChild(dataField);

    domParent.appendChild(objectDiv);
}

function printData(
    data,
    domParent = contentDiv.empty()
) {
    if (typeof data !== 'object') return;

    if (!domParent.tagName) domParent = contentDiv.empty();

    let objectDiv = document.createElement('div');
    objectDiv.className = 'data';

    for (let key in data) {
        if (data[key] instanceof Object) {
            let keyField = document.createElement('span');
            keyField.className = 'key';
            keyField.textContent = key;
            objectDiv.appendChild(keyField);

            printData(data[key], objectDiv);
        }
        else {
            let innerObjectDiv = document.createElement('div');

            let keyField = document.createElement('span');
            keyField.className = 'key';
            keyField.textContent = key;
            innerObjectDiv.appendChild(keyField);

            let dataField = document.createElement('span');
            dataField.className = 'value';
            dataField.textContent = data[key];
            innerObjectDiv.appendChild(dataField);

            objectDiv.appendChild(innerObjectDiv);
        }
    }

    domParent.append(objectDiv);
}
