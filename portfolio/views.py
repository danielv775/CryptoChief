from django.shortcuts import render, redirect
from .models import Position
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
# Create your views here.

def index(request):
    if request.user.is_authenticated:
        context = {
            'user': request.user
        }
        return render(request, 'portfolio/index.html', context)
    else:
        context = {
            'user': ''
        }
        return render(request, 'portfolio/index.html', context)

def portfolio(request):
    context = {
        'positions': Position.objects.all()
    }
    return render(request, 'portfolio/portfolio.html', context)

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
            return render(request, 'portfolio/signup.html')
    else:
        return redirect('portfolio')

def logout_view(request):
    logout(request)
    return redirect('index')