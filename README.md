# Final Project

Web Programming with Python and JavaScript

CryptoChief

The website is live at the following URL
<a href="https://cryptochief.herokuapp.com/">https://cryptochief.herokuapp.com/</a>

<h1>HTML</h1>

<h2>layout.html</h2>
<p>
layout.html contains the included libraries that are used across multiple html pages in my project.
These libraries include Google Fonts, Handelbars, Bootstrap JS & CSS, Cookie. Also, I import
my custom CSS file here that contains the theme for my web app. Because portfolio.html and index.html
require different JS functionality, I have a block that will import varying JS depending on what page the user is on.
</p>

<h2>index.html</h2>
<p>
index.html is the home page of the website. It has the project name, CryptoChief in the top left, user login/signup in the top
right, and a large button that takes you to your portfolio. Lastly, it streams data about 4 large cryptocurrencies: Bitcoin,
Ethereum, Stellar Lumens, and Zcash. The data gets updated every 2 seconds without the screen refreshing.
The data is formatted conditionally in terms of colors, plus or minus sign, depending on a loss or gain. The data displayed
for each crypto is price, percent change, value change, and market cap.
</p>

<h2>login.html & signup.html</h2>
<p>
These are the views for logging in and signing up. They were quite straightforward to implement.
</p>

<h2>portfolio.html</h2>
<p>
portfolio.html contains the layout of a user's portfolio. A user can only access this page after logging in.
The top left of the page has a button to log out. The top right of the page has a button to return to the home page.
The inital view of a user who has no assets in their portfolio is an empty table with the table headers showing the type of data
they will be able to track in real time. The type of data includes asset name and code, price, quantity held, value in USD,
24h percent and value change in USD, and percent return in USD. If the user has positions in their portfolio, their overall portfolio
value is displayed in the center of the screen. To the right is their overall return percent, and to the left is their username.
At the bottom of the page there are 2 large buttons. One button, 'Add Position' brings up a modal form where the user enters data to track their position. This data includes the
crypto code ticker, the price purchased at, the quantity purchased, and the date purchased. I was not able to make use of the date purchased
item in this project, but had I had enough time, this data point can be used in an API GET request to the Coin Compare API
to return historical price data of an asset, which in turn could be used to construct a graph of value over time.
The other three values, ticker, price_purchased in usd, and quantity are stored in the DB model the user's position, and
and are combined with current streaming price data to generate all the other metrics, and display them on the user's screen
without refreshing. Below the add position button is the 'Remove Selected Positions' button. The user is able to
click on rows in the table, highlighting them or 'selecting' them. After they select the positions they want to remove,
they can click on the 'Remove Selected Positions' button to delete positions from their portfolio, and from the model.
Also to note, is that this page is mobile responsive. If the screen is shrunk to 481px, only the most relevant data from the table
is displayed, asset ticker, price, value in USD, and percent change. Lastly, in contrast to the 2 second data update rate on the home
screen, the portfolio page has a 5 second data update rate.
</p>

<h1>CSS and SCSS</h1>
<h2>styles.css & styles.scss</h2>
<p>Similar to my other projects, these files contain the styling that I use throughout my website.</p>

<h1>Javascript: Client</h1>
<h2>index.js</h2>
<p>
index.js contains the async JS code responsible for dynamically updating the home page
view as new data is streamed from the Coin Compare API. To accomplish this a function that makes async requests to my
Django server, which makes requests to the Coin Compare API, is called every 2 seconds. On every response, the data is parsed
and the screen is updated. The data is also formatted conditionally depending on a loss or gain.
</p>

<h2>portfolio.js</h2>
<p>
portfolio.js contains the async JS code responsible for dynamically updating data about a user's portfolio. If
a user has more than 0 positions, an update_crypto_data function is called every 5 seconds to fetch price data, recalculate
all of the metrics about a user's position, and update them on the screen. Like on the home page, all of the data is conditionally
formatted depending on gains or losses. In addition to the constant stream of data thats happening in the background portfolio.js
also responds to two user initiated events. One event is a user adding a position. If a user clicks "Add Position", they enter
relevant data about their position in a model, this data is sent via AJAX to the server to store it in the DB Model, metrics are
calculated on the server, the live data package is sent back, parsed, and added to the screen dynamically with a Handlebars JS
template. In addition to adding positions, a user can remove a position. To do this, the user can click on rows representing
positions in their portfolio thereby selecting them, and highlighting them in green. Once they have selected all the positions
they want to delete, they can click the 'Remove Selected Positions' button and this will remove all of the selected positions
from their portfolio.
</p>

<h1>Python: Django Server</h1>
<h2>views.py</h2>
<p>
views.py contains the backend server code that handles user requests, and interacts with the DB Model. The index endpoint
returns either a template with current data if the user refreshes the page, or a JSON response if an AJAX request is sent so
that the home page can be updated dynamically. The portfolio endpoint returns either a template with data about the user's portfolio
if the page is refreshed, or varying JSON responses depending on if the request is an AJAX GET request being used to stream data
in the background, an AJAX POST request with the goal of adding a position, or an AJAX POST request with the goal of removing user
selected positions. Both a refresh GET request, and an AJAX GET request require all of the portfolio data to be calculated with
live price data, so in both of these cases all of the math to calculate the metrics is done prior to sending a live data package to the client.
If a position is being added, the metrics are only calculated for one position. The login_view, and signup_view handle
user authentication. These views were straightforward to implement as much of the heavy lifting is done by Django including
all of the security details such as hashing and salting passwords. The last endpoint, crypto, takes in a crypto code argument
and trys to find it in the DB Model. If the code is in the DB Model, the crypto is supported by my app, and if its not, the crypto
code is not supported by my app.
</p>

<h2>models.py</h2>
<p>
models.py defines the DB Model and the data that must be stored persistently to keep track of a user's portfolio.
A Position model keepts track of who owns the position with a Foreign Key to the Django User table, the crypto asset
owned with a Foreign Key to the Crypto table, the quantity owned which can be represented by up to 8 decimal places--because
for cryptos such as Bitcoin many people own fractional parts of a coin because owning 1 may be too much money--price purchased in USD,
date purchased, and date_updated. Note date purchased is not used in this project, but it could be used in the future as explained
in the portfolio.html section. date_updated is not used in this app either, but it could be used in the future if a user wants
to get rid of a portion of their position and the position must be updated.
The second model, Crypto, stores data about the (code, name) pairs that my web app supports. Currently a user can track
up to ~2800 cryptocurrencies in their portfolio in close to real time.
</p>

<h2>insert_cryptocurrencies.py</h2>
<p>
This script loads ~2800 cryptocurrencies that my app supports in my Crypto DB Model which stores (code, name) pairs.
The data is pulled from cryptocurrencies.json, which I found here:
https://raw.githubusercontent.com/crypti/cryptocurrencies/master/cryptocurrencies.json
Note: The true original source is actually from the same API I make requests to, but this user had a nice json file
output that I could easily feed into my DB Model.
</p>

<h1>Deployment to Heroku</h1>

<h2>Procfile</h2>
<p>I chose to deploy my web app to heroku so that it is more accessible. In order to do this, I had to include a
Procfile telling gunicorn to how to run my Django app on Heroku. I also had to add gunicorn to my requirements.txt.
</p>

<h1>Next Steps</h1>
<p>
Given more time, I would have implemented 2 graphing features, and a button to swap all metrics to measure against Bitcoin
rather than USD. One graph I would implemented would be a pie chart displaying the diversity of the user's
portfolio allocation. The second graph I would implement would be a line graph displaying the user's portfolio value
over time. The line graph could be constructed by making requests for historical data to the Coin Compare API using
the date purchased data about the user's position. Although I was not able to finish these 3 extra features,
there is a good chance I'll add these extra features after the class ends.
</p>