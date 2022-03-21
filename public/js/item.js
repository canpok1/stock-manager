let params = {
    itemNo: null,
};

function load() {
    fetch('/api/items/' + params.itemNo, { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const nums = document.getElementsByClassName('item-no');
            for (let i = 0; i < nums.length; i++) {
                nums[i].innerHTML = data.itemNo;
            }

            const names = document.getElementsByClassName('item-name');
            for (let i = 0; i < names.length; i++) {
                names[i].innerHTML = data.name;
            }

            const statuses = document.getElementsByClassName('item-status');
            for (let i = 0; i < statuses.length; i++) {
                statuses[i].innerHTML = data.shouldOrder ? '要注文' : '注文済';
            }

            const rules = document.getElementsByClassName('item-rule');
            for (let i = 0; i < rules.length; i++) {
                rules[i].innerHTML = data.rule;
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
    document.getElementById('error').innterHTML = msg;
    console.error(msg, error);
}
function clearError() {
    document.getElementById('error').innterHTML = '';
}

window.onload = () => {
    params.itemNo = document.getElementById('detail').dataset.itemNo;
    load();
}