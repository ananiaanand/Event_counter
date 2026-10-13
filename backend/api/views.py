import random
import string
from datetime import datetime, date
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    CoupleRoom, LoveStory, ImportantDate, MemoryPhoto,
    WishlistItem, TiffEntry, FutureLetter, Habit, HabitLog
)
from .serializers import (
    CoupleRoomSerializer, LoveStorySerializer, ImportantDateSerializer,
    MemoryPhotoSerializer, WishlistItemSerializer, TiffEntrySerializer,
    FutureLetterSerializer, HabitSerializer, HabitLogSerializer, UserSerializer
)

def generate_room_code():
    chars = string.ascii_uppercase + string.digits
    # Avoid confusing characters like O, 0, I, 1
    safe_chars = [c for c in chars if c not in ('O', '0', 'I', '1')]
    while True:
        code = ''.join(random.choices(safe_chars, k=6))
        if not CoupleRoom.objects.filter(code=code).exists():
            return code

def get_user_room(user):
    return CoupleRoom.objects.filter(Q(creator=user) | Q(partner=user)).first()


class CreateRoomView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        pet_name_for_partner = request.data.get('pet_name_for_partner', '').strip()
        gender = request.data.get('gender', 'girl').lower()
        togetherness_date_str = request.data.get('togetherness_date')
        custom_code = request.data.get('code', '').strip().upper()

        if not togetherness_date_str:
            return Response({'error': 'Date of togetherness is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            togetherness_date = datetime.strptime(togetherness_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        if custom_code and len(custom_code) == 6 and not CoupleRoom.objects.filter(code=custom_code).exists():
            code = custom_code
        else:
            code = generate_room_code()

        # Automatic secure account tied to the code itself
        username = f"creator_{code.lower()}"
        user = User.objects.filter(username=username).first()
        if not user:
            user = User.objects.create_user(username=username, password=f"sec_{code}_{random.randint(1000, 9999)}")

        room = CoupleRoom.objects.create(
            code=code,
            togetherness_date=togetherness_date,
            creator=user,
            creator_pet_name='',
            partner_pet_name=pet_name_for_partner,
            creator_gender=gender,
            partner_gender='boy' if gender == 'girl' else 'girl'
        )

        refresh = RefreshToken.for_user(user)
        request.user = user
        room_serializer = CoupleRoomSerializer(room, context={'request': request})

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'room': room_serializer.data,
            'user': {'id': user.id, 'username': user.username}
        }, status=status.HTTP_201_CREATED)


class JoinRoomView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        pet_name_for_partner = request.data.get('pet_name_for_partner', '').strip()
        gender = request.data.get('gender', 'boy').lower()
        togetherness_date_str = request.data.get('togetherness_date')

        if not code or len(code) != 6:
            return Response({'error': 'Please provide a valid 6-character room code.'}, status=status.HTTP_400_BAD_REQUEST)
        if not togetherness_date_str:
            return Response({'error': 'Date of togetherness is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            togetherness_date = datetime.strptime(togetherness_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        # Find room by code
        room = CoupleRoom.objects.filter(code__iexact=code).first()
        if not room:
            return Response({'error': 'Room code not found. Please verify the code.'}, status=status.HTTP_400_BAD_REQUEST)

        # CRITICAL VALIDATION: Date of Togetherness must strictly match!
        if room.togetherness_date != togetherness_date:
            return Response({
                'error': 'The date of togetherness does not match the room creator\'s date. Access denied.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # If partner already exists and is re-entering using code + date
        if room.partner:
            user = room.partner
            # If pet_name or gender were updated on re-entry, update them
            if pet_name_for_partner:
                room.creator_pet_name = pet_name_for_partner
            if gender:
                room.partner_gender = gender
            room.save()
        else:
            # First time partner joining
            partner_username = f"partner_{code.lower()}"
            user = User.objects.filter(username=partner_username).first()
            if not user:
                user = User.objects.create_user(username=partner_username, password=f"sec_{code}_{random.randint(1000, 9999)}")

            room.partner = user
            if pet_name_for_partner:
                room.creator_pet_name = pet_name_for_partner
            room.partner_gender = gender
            room.save()

        refresh = RefreshToken.for_user(user)
        request.user = user
        room_serializer = CoupleRoomSerializer(room, context={'request': request})

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'room': room_serializer.data,
            'user': {'id': user.id, 'username': user.username}
        }, status=status.HTTP_200_OK)


class RoomLoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        togetherness_date_str = request.data.get('togetherness_date')

        if not code or len(code) != 6:
            return Response({'error': 'Please enter your 6-character room code.'}, status=status.HTTP_400_BAD_REQUEST)
        if not togetherness_date_str:
            return Response({'error': 'Date of togetherness is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            togetherness_date = datetime.strptime(togetherness_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Please use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        room = CoupleRoom.objects.filter(code__iexact=code).first()
        if not room:
            return Response({'error': 'Room code not found. Please verify your code.'}, status=status.HTTP_400_BAD_REQUEST)

        # STRICT CODE + ANNIVERSARY DATE VERIFICATION
        if room.togetherness_date != togetherness_date:
            return Response({
                'error': 'The date of togetherness does not match this room code. Access denied.'
            }, status=status.HTTP_400_BAD_REQUEST)

        role = request.data.get('role', '').strip().lower()
        if role == 'partner':
            if not room.partner:
                return Response({
                    'error': 'Partner has not joined this room yet. If you created this room, please select Room Creator.'
                }, status=status.HTTP_400_BAD_REQUEST)
            user = room.partner
        elif role == 'creator':
            user = room.creator or room.partner
        else:
            user = room.creator or room.partner

        refresh = RefreshToken.for_user(user)
        request.user = user
        room_serializer = CoupleRoomSerializer(room, context={'request': request})

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'room': room_serializer.data,
            'user': {'id': user.id, 'username': user.username}
        }, status=status.HTTP_200_OK)


class RoomStatusView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        room = get_user_room(request.user)
        if not room:
            return Response({'has_room': False, 'room': None})
        serializer = CoupleRoomSerializer(room, context={'request': request})
        return Response({'has_room': True, 'room': serializer.data})


class DeleteAccountView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        room = get_user_room(user)
        
        creator_user = None
        partner_user = None

        if room:
            creator_user = room.creator
            partner_user = room.partner
            # Deleting room cascades and deletes all stories, habits, dates, memories, etc.
            room.delete()

        # Delete users tied to this room/code
        if creator_user and creator_user != user and creator_user.username.startswith(('creator_', 'partner_')):
            try:
                creator_user.delete()
            except Exception:
                pass

        if partner_user and partner_user != user and partner_user.username.startswith(('creator_', 'partner_')):
            try:
                partner_user.delete()
            except Exception:
                pass

        try:
            user.delete()
        except Exception:
            pass

        return Response({
            'success': True,
            'message': 'Account and room data successfully deleted.'
        }, status=status.HTTP_200_OK)


class LoveStoryViewSet(viewsets.ModelViewSet):
    serializer_class = LoveStorySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return LoveStory.objects.none()
        return LoveStory.objects.filter(room=room).order_by('id')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        if not room:
            return Response({'error': 'No room found'}, status=status.HTTP_400_BAD_REQUEST)
        serializer.save(room=room, author=self.request.user)


class ImportantDateViewSet(viewsets.ModelViewSet):
    serializer_class = ImportantDateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return ImportantDate.objects.none()
        return ImportantDate.objects.filter(room=room).order_by('date')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        serializer.save(room=room, creator=self.request.user)


class MemoryPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = MemoryPhotoSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return MemoryPhoto.objects.none()
        return MemoryPhoto.objects.filter(room=room).order_by('-created_at')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        serializer.save(room=room, creator=self.request.user)


class WishlistItemViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return WishlistItem.objects.none()
        return WishlistItem.objects.filter(room=room).order_by('-created_at')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        serializer.save(room=room, creator=self.request.user)


class TiffEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TiffEntrySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return TiffEntry.objects.none()
        return TiffEntry.objects.filter(room=room).order_by('-created_at')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        serializer.save(room=room, author=self.request.user)


class FutureLetterViewSet(viewsets.ModelViewSet):
    serializer_class = FutureLetterSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return FutureLetter.objects.none()
        return FutureLetter.objects.filter(room=room).order_by('unlock_date')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        serializer.save(room=room, author=self.request.user)


class HabitViewSet(viewsets.ModelViewSet):
    serializer_class = HabitSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        room = get_user_room(self.request.user)
        if not room:
            return Habit.objects.none()
        qs = Habit.objects.filter(room=room).prefetch_related('logs')
        month = self.request.query_params.get('month')
        if month:
            # Match habit by month tag or active date range overlapping with the month
            try:
                m_year, m_num = map(int, month.split('-'))
                import calendar
                _, last_day = calendar.monthrange(m_year, m_num)
                m_start = date(m_year, m_num, 1)
                m_end = date(m_year, m_num, last_day)
                qs = qs.filter(
                    Q(month=month) |
                    (Q(start_date__lte=m_end) & Q(end_date__gte=m_start))
                ).distinct()
            except Exception:
                qs = qs.filter(month=month)
        return qs.order_by('created_at')

    def perform_create(self, serializer):
        room = get_user_room(self.request.user)
        if not room:
            return Response({'error': 'No couple room found.'}, status=status.HTTP_400_BAD_REQUEST)
        month = self.request.data.get('month') or date.today().strftime('%Y-%m')
        
        start_date_val = self.request.data.get('start_date')
        if isinstance(start_date_val, str) and start_date_val:
            try:
                start_date_val = datetime.strptime(start_date_val, '%Y-%m-%d').date()
            except ValueError:
                start_date_val = date.today()
        elif not isinstance(start_date_val, date):
            start_date_val = date.today()

        end_date_val = self.request.data.get('end_date')
        if isinstance(end_date_val, str) and end_date_val:
            try:
                end_date_val = datetime.strptime(end_date_val, '%Y-%m-%d').date()
            except ValueError:
                end_date_val = date.today()
        elif not isinstance(end_date_val, date):
            end_date_val = date.today()

        color_good = self.request.data.get('color_good') or '#10B981'
        color_average = self.request.data.get('color_average') or '#FBBF24'
        color_worst = self.request.data.get('color_worst') or '#F87171'

        serializer.save(
            room=room, 
            user=self.request.user, 
            month=month,
            start_date=start_date_val,
            end_date=end_date_val,
            color_good=color_good,
            color_average=color_average,
            color_worst=color_worst
        )

    @action(detail=True, methods=['post'], url_path='log-day')
    def log_day(self, request, pk=None):
        habit = self.get_object()
        date_str = request.data.get('date')
        if not date_str:
            return Response({'error': 'Date is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            log_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        # Strict rule: Only today can be logged or edited. Past and future days are view-only.
        today_date = date.today()
        if log_date != today_date:
            return Response(
                {'error': 'Only today can be logged or edited. Past and future days are view-only.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        performance = request.data.get('performance', '').strip().lower()
        level = int(request.data.get('level', 3))
        if performance not in ('good', 'average', 'worst'):
            if level >= 3:
                performance = 'good'
            elif level == 2:
                performance = 'average'
            else:
                performance = 'worst'

        level_map = {'good': 3, 'average': 2, 'worst': 1}
        level = level_map.get(performance, 2)
        minutes_or_count = int(request.data.get('minutes_or_count', 30))
        note = request.data.get('note', '').strip()

        if request.data.get('is_clear') or level <= 0:
            HabitLog.objects.filter(habit=habit, date=log_date).delete()
        else:
            HabitLog.objects.update_or_create(
                habit=habit,
                date=log_date,
                defaults={
                    'performance': performance,
                    'level': level,
                    'minutes_or_count': minutes_or_count,
                    'note': note
                }
            )

        serializer = self.get_serializer(habit)
        return Response(serializer.data, status=status.HTTP_200_OK)

