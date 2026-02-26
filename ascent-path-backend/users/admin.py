from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ['email', 'username', 'target_role', 'streak', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('target_role', 'streak', 'consistency_score')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('target_role', 'streak', 'consistency_score')}),
    )

admin.site.register(User, CustomUserAdmin)
