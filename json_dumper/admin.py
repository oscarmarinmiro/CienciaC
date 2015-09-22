from django.contrib import admin

# Register your models here.


from models import Series, Users, Rounds, Games

admin.site.register(Series)
admin.site.register(Users)
admin.site.register(Rounds)
admin.site.register(Games)