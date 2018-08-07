from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Position(models.Model):
    user = models.ForeignKey(User, related_name='position', on_delete=models.CASCADE)
    crypto = models.ForeignKey('Crypto', related_name='position', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=17, decimal_places=8)
    price_purchased_usd = models.DecimalField(max_digits=10, decimal_places=4)
    date_purchased = models.DateTimeField()
    date_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user}, {self.crypto}, {self.quantity}, {self.price_purchased_usd}, {self.date_purchased}, {self.date_updated}"

class Crypto(models.Model):
    name = models.CharField(max_length=64)
    code = models.CharField(max_length=3)

    def __str__(self):
        return f"{self.name}, {self.code}"
