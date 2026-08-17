from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, UserRegistrationView, UserDeleteView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('delete-account/', UserDeleteView.as_view(), name='delete-account'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
