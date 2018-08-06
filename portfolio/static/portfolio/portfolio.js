
const template_position = Handlebars.compile(document.querySelector('#load-position').innerHTML);
document.addEventListener('DOMContentLoaded', () => {

    function gain_loss_colors() {
        document.querySelectorAll('#data-change-pct-24h-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
           }
        });
        document.querySelectorAll('#data-change-value-24h-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
           }
        });
        document.querySelectorAll('#data-percent-return-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
               td.parentNode.children[3].style.color = '#ff2848';
           }
        });

    }

    function add_position() {
        // Validate the requested crypto code exists
        var code = document.querySelector('#code').value;

        // Make a small API GET request to ensure the crypto code exists
        // Use my my own API GET endpoint to check against if the ticker is in my DB
        const test_request = new XMLHttpRequest();
        const url= `https://min-api.cryptocompare.com/data/price?fsym=${code}&tsyms=USD,BTC`;
        test_request.open('GET', url);
        test_request.send();
        test_request.onload = () => {
            const test_response = JSON.parse(test_request.responseText);
            // If the crypto code is valid, send new position data to DB to be stored
            if(test_response.Response != 'Error') {
                const request = new XMLHttpRequest();
                var csrftoken = Cookies.get('csrftoken');
                request.open('POST', 'portfolio');
                request.setRequestHeader('X-CSRFToken', csrftoken);
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                request.onload = () => {
                    const data = JSON.parse(request.responseText);
                    // Parse new position data and add to portfolio view
                    if(data.success) {
                        console.log('Position stored in portfolio');
                        const position = template_position({'position': data});
                        document.querySelector('#portfolio-body').innerHTML += position;
                    }
                    else {
                        console.log('Position not stored in portfolio');
                    }
                }
                const data = new FormData();
                data.append('action', 'add-new-position');
                data.append('code', code);
                data.append('quantity', document.querySelector('#quantity').value);
                data.append('price_purchased_usd', document.querySelector('#price_purchased_usd').value);
                request.send(data);
            }
            else {
                console.log(test_response);
            }
        }
    }

    function update_portfolio_data() {
        const request = new XMLHttpRequest();
        var csrftoken = Cookies.get('csrftoken');
        request.open('GET', 'portfolio');
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.send();
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if(data.success) {
                delete data['success'];
                console.log(data);
                document.querySelector('#portfolio-body').innerHTML = '';
                for(var position in data) {
                    var refresh_position = data[position];
                    const refresh_position_to_add = template_position({'position': refresh_position});
                    document.querySelector('#portfolio-body').innerHTML += refresh_position_to_add;
                }
                gain_loss_colors();
            }
            else {
                console.log('Crypto data request failed');
            }
        }
    }

    gain_loss_colors();

    setInterval(update_portfolio_data, 5000);

    // Bring up Form to enter crypto code, quantity, and price purchased in USD
    document.querySelector('#send-position-button').onclick = add_position;

    document.querySelector('tbody').onmouseover = () => {
      document.querySelector('tbody').style.overflowY = 'auto';
    };

    document.querySelector('tbody').onmouseleave = () => {
        document.querySelector('tbody').style.overflowY = 'hidden';
    }



});