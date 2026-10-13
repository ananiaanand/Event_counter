from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CreateRoomView, JoinRoomView, RoomLoginView, RoomStatusView, DeleteAccountView,
    LoveStoryViewSet, ImportantDateViewSet, MemoryPhotoViewSet,
    WishlistItemViewSet, TiffEntryViewSet, FutureLetterViewSet,
    HabitViewSet
)

router = DefaultRouter()
router.register(r'stories', LoveStoryViewSet, basename='story')
router.register(r'dates', ImportantDateViewSet, basename='date')
router.register(r'memories', MemoryPhotoViewSet, basename='memory')
router.register(r'wishlist', WishlistItemViewSet, basename='wishlist')
router.register(r'tiff', TiffEntryViewSet, basename='tiff')
router.register(r'future-letters', FutureLetterViewSet, basename='future-letter')
router.register(r'habits', HabitViewSet, basename='habit')

urlpatterns = [
    path('room/create/', CreateRoomView.as_view(), name='room-create'),
    path('room/join/', JoinRoomView.as_view(), name='room-join'),
    path('room/login/', RoomLoginView.as_view(), name='room-login'),
    path('room/status/', RoomStatusView.as_view(), name='room-status'),
    path('user/delete-account/', DeleteAccountView.as_view(), name='delete-account'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
