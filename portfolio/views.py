from django.shortcuts import render, redirect
from .models import Position
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
import requests, json
from django.http import JsonResponse
from decimal import Decimal
# Create your views here.

def index(request):

    api_request = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,ZEC,XLM&tsyms=USD'
    crypto_home_data = requests.get(api_request).json()['RAW']

    # Bitcoin
    btc = {
        'CHANGE24HOUR': round(crypto_home_data['BTC']['USD']['CHANGE24HOUR'], 2),
        'CHANGEPCT24HOUR': round(crypto_home_data['BTC']['USD']['CHANGEPCT24HOUR'], 2),
        'PRICE': crypto_home_data['BTC']['USD']['PRICE'],
        'MKTCAP': '{:,}'.format(int(crypto_home_data['BTC']['USD']['MKTCAP']))
    }
    # Ethereum
    eth = {
        'CHANGE24HOUR': round(crypto_home_data['ETH']['USD']['CHANGE24HOUR'], 2),
        'CHANGEPCT24HOUR': round(crypto_home_data['ETH']['USD']['CHANGEPCT24HOUR'], 2),
        'PRICE': crypto_home_data['ETH']['USD']['PRICE'],
        'MKTCAP': '{:,}'.format(int(crypto_home_data['ETH']['USD']['MKTCAP']))
    }
    # Stellar Lumens
    xlm = {
        'CHANGE24HOUR': round(crypto_home_data['XLM']['USD']['CHANGE24HOUR'], 2),
        'CHANGEPCT24HOUR': round(crypto_home_data['XLM']['USD']['CHANGEPCT24HOUR'], 2),
        'PRICE': crypto_home_data['XLM']['USD']['PRICE'],
        'MKTCAP': '{:,}'.format(int(crypto_home_data['XLM']['USD']['MKTCAP']))
    }
    # Zcash
    zec = {
        'CHANGE24HOUR': round(crypto_home_data['ZEC']['USD']['CHANGE24HOUR'], 2),
        'CHANGEPCT24HOUR': round(crypto_home_data['ZEC']['USD']['CHANGEPCT24HOUR'], 2),
        'PRICE': crypto_home_data['ZEC']['USD']['PRICE'],
        'MKTCAP': '{:,}'.format(int(crypto_home_data['ZEC']['USD']['MKTCAP']))
    }

    if request.method == 'GET':
        if request.user.is_authenticated:
            context = {
                'user': request.user,
                'btc': btc,
                'eth': eth,
                'xlm': xlm,
                'zec': zec
            }
            return render(request, 'portfolio/index.html', context)
        else:
            context = {
                'user': '',
                'btc': btc,
                'eth': eth,
                'xlm': xlm,
                'zec': zec
            }
            return render(request, 'portfolio/index.html', context)
    elif request.is_ajax():
        crypto_data = {
            'success': True,
            'btc': btc,
            'eth': eth,
            'xlm': xlm,
            'zec': zec
        }
        return JsonResponse(crypto_data)

def portfolio(request):
    if request.user.is_authenticated:
        portfolio = Position.objects.filter(user=request.user)
        portfolio_to_send = {}
        crypto_codes = ''
        for position in portfolio:
            crypto_codes += position.crypto.code + ','
            key = f'{position.crypto.code}-{position.id}'
            portfolio_to_send[key] = {'name': position.crypto.name, 'quantity': position.quantity }

        print(portfolio_to_send)
        api_request = f'https://min-api.cryptocompare.com/data/pricemultifull?fsyms={crypto_codes}&tsyms=USD'
        crypto_portfolio_data = requests.get(api_request).json()['RAW']

        context = {
            'portfolio': portfolio
        }
        return render(request, 'portfolio/portfolio.html', context)
    else:
        return redirect('login')

def login_view(request):
    if not request.user.is_authenticated:
        try:
            username = request.POST['username']
            password = request.POST['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('portfolio')
            else:
                return render(request, 'portfolio/login.html', {'message': "Invalid Credentials"})
        except Exception as e:
            print(e)
            return render(request, 'portfolio/login.html')
    else:
        return redirect('portfolio')

def signup(request):
    if not request.user.is_authenticated:
        try:
            username = request.POST['username']
            email = request.POST['email']
            password = request.POST['password']
            new_user = User.objects.create_user(username=username, email=email, password=password)
            if new_user is not None:
                return redirect('login')
            else:
                return render(request, 'portfolio/signup.html', {'message': "Invalid Credentials"})
        except Exception as e:
            print(e)
            return render(request, 'portfolio/signup.html', {'message': "Invalid Credentials"})
    else:
        return redirect('portfolio')

def logout_view(request):
    logout(request)
    return redirect('index')