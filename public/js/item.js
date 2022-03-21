let params = {
    itemNo: null,
};

function load() {
    fetch('/api/items/' + params.itemNo, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const nums = document.getElementsByClassName('item-no');
            for (let i = 0; i < nums.length; i++) {
                nums[i].innerText = 'No:' + data.itemNo;
            }

            if (data.name) {
                const names = document.getElementsByClassName('item-name');
                for (let i = 0; i < names.length; i++) {
                    names[i].innerText = data.name;
                }
            }

            document.getElementById('detail').dataset.shouldOrder = data.shouldOrder;
            if (data.shouldOrder) {
                document.getElementById('order-request-button').disabled = true;
                document.getElementById('order-complete-button').disabled = false;
            } else {
                document.getElementById('order-request-button').disabled = false;
                document.getElementById('order-complete-button').disabled = true;
            }

            if (data.rule) {
                const rules = document.getElementsByClassName('item-rule');
                for (let i = 0; i < rules.length; i++) {
                    rules[i].innerHTML = data.rule;
                }
            }
        })
        .catch(err => {
            setErrorMessage('エラー発生', err);
        });
}

function sendOrderRequest() {
    clearError();
    fetch('/api/items/' + params.itemNo + '/order-request', { method: 'PUT' })
        .then(res => load())
        .catch(err => {
            setErrorMessage('エラー発生', err);
        });
}

function sendOrderComplete() {
    clearError();
    fetch('/api/items/' + params.itemNo + '/order-complete', { method: 'PUT' })
        .then(res => load())
        .catch(err => {
            setErrorMessage('エラー発生', err);
        });
}

function setError(msg, error) {
    document.getElementById('error-area').innterHTML = msg;
    document.getElementById('detail').classList.add('error');
    console.error(msg, error);
}
function clearError() {
    document.getElementById('error-area').innterHTML = '';
    document.getElementById('detail').classList.remove('error');
}

window.onload = () => {
    params.itemNo = document.getElementById('detail').dataset.itemNo;
    load();
}

document.getElementById('order-request-button').onclick = function () {
    sendOrderRequest();
}
document.getElementById('order-complete-button').onclick = function () {
    sendOrderComplete();
}
