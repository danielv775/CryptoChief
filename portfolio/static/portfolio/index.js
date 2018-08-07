
document.addEventListener('DOMContentLoaded', () => {

    function update_crypto_data(token_string, token_data) {
        var price_id = `#${token_string}-price`;
        var pct_change_id = `#${token_string}-change-24h-pct`;
        var usd_change_id = `#${token_string}-change-24h-usd`;
        var mktcap_id = `#${token_string}-mktcap`;
        document.querySelector(price_id).innerHTML = `$${token_data.PRICE}`;
        var change_pct_24h = `${token_data.CHANGEPCT24HOUR}%`;
        var change_24h = token_data.CHANGE24HOUR;
        if(change_pct_24h[0] == '-')  {
            document.querySelector(pct_change_id).style.color = '#ff2848';
            document.querySelector(usd_change_id).style.color = '#ff2848';
            change_24h = `${change_24h}`.substring(1);
            change_24h = `-$${change_24h}`;
        }
        else {
            change_pct_24h = `+${change_pct_24h}`;
            change_24h = `+$${change_24h}`
        }
        document.querySelector(pct_change_id).innerHTML = change_pct_24h;
        document.querySelector(usd_change_id).innerHTML = change_24h;
        document.querySelector(mktcap_id).innerHTML = `$${token_data.MKTCAP}`;
    }

    function get_crypto_data() {
        const request = new XMLHttpRequest();
        var csrftoken = Cookies.get('csrftoken');
        request.open('GET', '/');
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.setRequestHeader('Vary', 'X-Requested-With');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if(data.success) {
                console.log('Crypto data request successful');

                // Bitcoin
                btc = data.btc;
                // Ethereum
                eth = data.eth;
                // Stellar Lumens
                xlm = data.xlm;
                // Zcash
                zec = data.zec;
                console.log(data);
                // Update Crypto Data
                update_crypto_data('btc', btc);
                update_crypto_data('eth', eth);
                update_crypto_data('xlm', xlm);
                update_crypto_data('zec', zec);

                console.log('Updated');

            }
            else {
                console.log('Crypto data request failed');
            }
        }
        request.send();
    }

    get_crypto_data();
    setInterval(get_crypto_data, 2000);

});