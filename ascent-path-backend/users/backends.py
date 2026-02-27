from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

UserModel = get_user_model()


class EmailOrUsernameModelBackend(ModelBackend):
    """
    Authentication backend which allows users to authenticate using either their
    username or email address
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        # Some authenticators might pass 'email' instead of 'username'
        login_id = username or kwargs.get('email')
        
        if login_id is None:
            return None

        try:
            # Check if user exists by either username or email
            user = UserModel.objects.filter(
                Q(username__iexact=login_id) | Q(email__iexact=login_id)
            ).distinct().first()
            
            if user and user.check_password(password):
                return user
                
        except UserModel.DoesNotExist:
            return None
            
        return None
