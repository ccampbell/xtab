/* global $, Aftershave */
function _handleChange() {
    var input = $('#input-max');
    if (this.value === 'other') {
        input.show();
        input.trigger('focus');
        return;
    }

    localStorage.max = this.value;
    input.hide();
}

function _saveMax() {
    var input = $('#input-max');
    localStorage.max = input.val();
}

function _saveAlgo() {
    localStorage.algo = this.value;
}

function _run() {
    var options = {
        10: 10,
        15: 15,
        20: 20,
        25: 25,
        30: 30,
        35: 35,
        40: 40,
        45: 45,
        50: 50
    };

    var algo = localStorage.algo || 'used';
    var max = parseInt(localStorage.max || 20);
    $('body').html(Aftershave.render('popup', {options: options, algo: algo, max: max}));
}

$.ready(function() {
    $(document).on('change', 'select', _handleChange);
    $(document).on('change', '#input-max', _saveMax);
    $(document).on('change', 'input[type=radio]', _saveAlgo);
    _run();
});
