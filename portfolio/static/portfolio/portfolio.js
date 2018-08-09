
const template_position = Handlebars.compile(document.querySelector('#load-position').innerHTML);
document.addEventListener('DOMContentLoaded', () => {

    var selected_positions = [];

    function select_row() {
       document.querySelectorAll('#table-row-select').forEach(row => {
            row.onclick = row => {
                var position_id = row.path[1].children[0].innerHTML;
                if(!(selected_positions.includes(position_id))){
                   selected_positions.push(position_id);
                    row.path[1].style.backgroundColor = '#09c416';
                    row.path[1].style.color = '#b5ffb7';
                }
                else {
                    for(var i = 0; i<selected_positions.length; i++) {
                        if(position_id == selected_positions[i]) {
                            selected_positions.splice(i, 1);
                        }
                    }
                    row.path[1].style.backgroundColor = '#110028';
                    row.path[1].style.color = '#09c416';
                }
            }
            position_not_click_id = row.children[0].innerHTML;
            if(selected_positions.includes(position_not_click_id)) {
                row.style.backgroundColor = '#09c416';
                row.style.color = '#b5ffb7';
            }
       });
    }

    function gain_loss_formatting() {
        document.querySelectorAll('#data-change-pct-24h-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
           }
           else {
               td.innerHTML = `+${td.innerHTML}`;
           }
        });
        document.querySelectorAll('#data-change-value-24h-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
               td.innerHTML = `-$${td.innerHTML.substring(1)}`;
           }
           else {
               td.innerHTML = `+$${td.innerHTML}`;
           }
        });
        document.querySelectorAll('#data-percent-return-usd').forEach(td => {
           if(td.innerHTML[0] == '-') {
               td.style.color = '#ff2848';
               td.parentNode.children[5].style.color = '#ff2848';
           }
           else {
               td.innerHTML = `+${td.innerHTML}`;
           }
        });

    }

    function summary_gain_loss_formatting() {
        if(document.querySelector('#return_overall_percent_usd').innerHTML[0] == '-') {
            document.querySelector('#return_overall_percent_usd').style.color = '#ff2848';
        }
        else {
            document.querySelector('#return_overall_percent_usd').style.color = '#09c416';
            var return_overall_percent_usd = document.querySelector('#return_overall_percent_usd').innerHTML;
            document.querySelector('#return_overall_percent_usd').innerHTML = `+${return_overall_percent_usd}`;
        }
    }

    function add_position() {
        // Validate the requested crypto code exists
        var code = document.querySelector('#code').value;
        var date = document.querySelector('#date_purchased').value;

        // Make a small API GET request to my own DB to ensure the crypto code exists
        const test_request = new XMLHttpRequest();
        const url = `crypto/${code}`;
        test_request.open('GET', url);
        test_request.send();
        test_request.onload = () => {
            const test_response = JSON.parse(test_request.responseText);
            // If the crypto code is valid, send new position data to DB to be stored
            if(test_response.success) {
                const request = new XMLHttpRequest();
                var csrftoken = Cookies.get('csrftoken');
                request.open('POST', 'portfolio');
                request.setRequestHeader('X-CSRFToken', csrftoken);
                request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                request.setRequestHeader('Vary', 'X-Requested-With');
                request.onload = () => {
                    const data = JSON.parse(request.responseText);
                    // Parse new position data and add to portfolio view
                    if(data.success) {
                        console.log('Position stored in portfolio');
                        const position = template_position({'position': data});
                        document.querySelector('#portfolio-body').innerHTML += position;
                        update_portfolio_data();
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
                data.append('date', date);
                request.send(data);
                document.querySelector('#code').value = '';
                document.querySelector('#quantity').value = '';
                document.querySelector('#price_purchased_usd').value = '';
                document.querySelector('#date_purchased').value = '';
            }
            else {
                console.log(test_response);
            }
        }
    }

    function remove_selected_positions() {
        const request = new XMLHttpRequest();
        var csrftoken = Cookies.get('csrftoken');
        request.open('POST', 'portfolio');
        request.setRequestHeader('X-CSRFToken', csrftoken);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.setRequestHeader('Vary', 'X-Requested-With');
        request.onload = () => {
            const data = JSON.parse(request.responseText);
            if(data.success) {
                console.log('delete successful');
                selected_positions = [];
                var position_count = document.querySelector('#portfolio-body').childElementCount;
                if(position_count == 1) {
                    document.querySelector('#portfolio-body').innerHTML = '';
                    document.querySelector('#current_portfolio_value_usd').innerHTML = '';
                    document.querySelector('#return_overall_percent_usd').innerHTML = '';
                }
                update_portfolio_data();
            }
            else {
                console.log('could not delete positions');
            }
        };
        const data = new FormData();
        data.append('action', 'delete-positions');
        data.append('positions_to_delete', selected_positions);
        request.send(data);
    }

    function update_portfolio_data() {
        var position_count = document.querySelector('#portfolio-body').childElementCount;
        if(position_count > 0) {
            const request = new XMLHttpRequest();
            var csrftoken = Cookies.get('csrftoken');
            request.open('GET', 'portfolio');
            request.setRequestHeader('X-CSRFToken', csrftoken);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Vary', 'X-Requested-With');
            request.send();
            request.onload = () => {
                const data = JSON.parse(request.responseText);
                if(data.success) {
                    console.log(data);
                    document.querySelector('#portfolio-body').innerHTML = '';
                    for(var position in data['portfolio_to_send']) {
                        var refresh_position = data['portfolio_to_send'][position];
                        const refresh_position_to_add = template_position({'position': refresh_position});
                        document.querySelector('#portfolio-body').innerHTML += refresh_position_to_add;
                    }
                    select_row();
                    gain_loss_formatting();

                    // Update Summary Metrics
                    var return_overall_percent_usd = data['portfolio_overall']['return_overall_percent_usd'];
                    document.querySelector('#return_overall_percent_usd').innerHTML = return_overall_percent_usd;
                    var current_portfolio_value_usd = `$${data['portfolio_overall']['current_portfolio_value_usd']}`;
                    document.querySelector('#current_portfolio_value_usd').innerHTML = current_portfolio_value_usd;
                    summary_gain_loss_formatting();
                }
                else {
                    console.log('Crypto data request failed');
                }

            }
        }
        else {
            console.log('No position in portfolio');
        }
    }

    select_row();
    summary_gain_loss_formatting();
    gain_loss_formatting();
    setInterval(update_portfolio_data, 5000);

    // Bring up Form to enter crypto code, quantity, and price purchased in USD
    document.querySelector('#send-position-button').onclick = add_position;

    // Remove user selected positions
    document.querySelector('#remove-position-button').onclick = remove_selected_positions;

    document.querySelector('tbody').onmouseover = () => {
      document.querySelector('tbody').style.overflowY = 'auto';
    };

    document.querySelector('tbody').onmouseleave = () => {
        document.querySelector('tbody').style.overflowY = 'hidden';
    }

});