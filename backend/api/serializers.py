from rest_framework import serializers
from django.contrib.auth.models import User
from datetime import date, datetime
from .models import (
    CoupleRoom, LoveStory, ImportantDate, MemoryPhoto,
    WishlistItem, TiffEntry, FutureLetter, Habit, HabitLog
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class CoupleRoomSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    partner_username = serializers.CharField(source='partner.username', read_only=True, default=None)
    days_together = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()
    my_gender = serializers.SerializerMethodField()
    my_pet_name = serializers.SerializerMethodField()
    partner_gender_display = serializers.SerializerMethodField()
    partner_pet_name_display = serializers.SerializerMethodField()

    class Meta:
        model = CoupleRoom
        fields = (
            'id', 'code', 'togetherness_date', 'created_at',
            'creator', 'creator_username', 'creator_pet_name', 'creator_gender',
            'partner', 'partner_username', 'partner_pet_name', 'partner_gender',
            'days_together', 'my_role', 'my_gender', 'my_pet_name',
            'partner_gender_display', 'partner_pet_name_display'
        )

    def get_days_together(self, obj):
        if not obj.togetherness_date:
            return 0
        diff = date.today() - obj.togetherness_date
        return max(0, diff.days)

    def _get_request_user(self):
        request = self.context.get('request')
        return request.user if request and request.user.is_authenticated else None

    def get_my_role(self, obj):
        user = self._get_request_user()
        if not user:
            return 'visitor'
        if obj.creator == user:
            return 'creator'
        if obj.partner == user:
            return 'partner'
        return 'visitor'

    def get_my_gender(self, obj):
        role = self.get_my_role(obj)
        if role == 'creator':
            return obj.creator_gender
        if role == 'partner':
            return obj.partner_gender
        return 'girl'

    def get_my_pet_name(self, obj):
        role = self.get_my_role(obj)
        if role == 'creator':
            return obj.creator_pet_name
        if role == 'partner':
            return obj.partner_pet_name
        return ''

    def get_partner_gender_display(self, obj):
        role = self.get_my_role(obj)
        if role == 'creator':
            return obj.partner_gender
        if role == 'partner':
            return obj.creator_gender
        return obj.partner_gender

    def get_partner_pet_name_display(self, obj):
        role = self.get_my_role(obj)
        if role == 'creator':
            return obj.partner_pet_name
        if role == 'partner':
            return obj.creator_pet_name
        return obj.partner_pet_name


class LoveStorySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_gender = serializers.SerializerMethodField()
    author_pet_name = serializers.SerializerMethodField()

    class Meta:
        model = LoveStory
        fields = (
            'id', 'author', 'author_username', 'author_gender', 'author_pet_name',
            'title', 'content', 'first_met', 'favorite_memory', 'updated_at'
        )
        read_only_fields = ('author', 'room')

    def get_author_gender(self, obj):
        if obj.author == obj.room.creator:
            return obj.room.creator_gender
        if obj.author == obj.room.partner:
            return obj.room.partner_gender
        return 'other'

    def get_author_pet_name(self, obj):
        if obj.author == obj.room.creator:
            return obj.room.creator_pet_name
        if obj.author == obj.room.partner:
            return obj.room.partner_pet_name
        return obj.author.username


class ImportantDateSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    creator_gender = serializers.SerializerMethodField()
    days_until = serializers.SerializerMethodField()

    class Meta:
        model = ImportantDate
        fields = (
            'id', 'creator', 'creator_username', 'creator_gender',
            'title', 'date', 'category', 'description', 'created_at', 'days_until'
        )
        read_only_fields = ('creator', 'room')

    def get_creator_gender(self, obj):
        if obj.creator == obj.room.creator:
            return obj.room.creator_gender
        if obj.creator == obj.room.partner:
            return obj.room.partner_gender
        return 'other'

    def get_days_until(self, obj):
        if not obj.date:
            return 0
        diff = obj.date - date.today()
        return diff.days


class MemoryPhotoSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    creator_gender = serializers.SerializerMethodField()

    class Meta:
        model = MemoryPhoto
        fields = (
            'id', 'creator', 'creator_username', 'creator_gender',
            'title', 'image_data', 'caption', 'date_taken', 'location', 'aspect', 'created_at'
        )
        read_only_fields = ('creator', 'room')

    def get_creator_gender(self, obj):
        if obj.creator == obj.room.creator:
            return obj.room.creator_gender
        if obj.creator == obj.room.partner:
            return obj.room.partner_gender
        return 'other'


class WishlistItemSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    creator_gender = serializers.SerializerMethodField()

    class Meta:
        model = WishlistItem
        fields = (
            'id', 'creator', 'creator_username', 'creator_gender',
            'for_whom', 'title', 'notes', 'link', 'is_fulfilled', 'created_at'
        )
        read_only_fields = ('creator', 'room')

    def get_creator_gender(self, obj):
        if obj.creator == obj.room.creator:
            return obj.room.creator_gender
        if obj.creator == obj.room.partner:
            return obj.room.partner_gender
        return 'other'


class TiffEntrySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_gender = serializers.SerializerMethodField()
    author_pet_name = serializers.SerializerMethodField()

    class Meta:
        model = TiffEntry
        fields = (
            'id', 'author', 'author_username', 'author_gender', 'author_pet_name',
            'title', 'what_happened', 'how_i_felt', 'what_would_help',
            'partner_reply', 'is_resolved', 'created_at', 'updated_at'
        )
        read_only_fields = ('author', 'room')

    def get_author_gender(self, obj):
        if obj.author == obj.room.creator:
            return obj.room.creator_gender
        if obj.author == obj.room.partner:
            return obj.room.partner_gender
        return 'other'

    def get_author_pet_name(self, obj):
        if obj.author == obj.room.creator:
            return obj.room.creator_pet_name
        if obj.author == obj.room.partner:
            return obj.room.partner_pet_name
        return obj.author.username


class FutureLetterSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_gender = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    days_until_unlock = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()

    class Meta:
        model = FutureLetter
        fields = (
            'id', 'author', 'author_username', 'author_gender',
            'title', 'content', 'unlock_date', 'hint',
            'is_locked', 'days_until_unlock', 'created_at'
        )
        read_only_fields = ('author', 'room')

    def _is_locked_calc(self, obj):
        if not obj.unlock_date:
            return False
        return date.today() < obj.unlock_date

    def get_is_locked(self, obj):
        return self._is_locked_calc(obj)

    def get_days_until_unlock(self, obj):
        if not obj.unlock_date:
            return 0
        diff = obj.unlock_date - date.today()
        return max(0, diff.days)

    def get_content(self, obj):
        request = self.context.get('request')
        user = request.user if request and request.user.is_authenticated else None
        
        # If locked AND the current user is not the author, hide content!
        if self._is_locked_calc(obj) and (not user or user != obj.author):
            return "" # Locked from partner's view until unlock date!
        return obj.content

    def get_author_gender(self, obj):
        if obj.author == obj.room.creator:
            return obj.room.creator_gender
        if obj.author == obj.room.partner:
            return obj.room.partner_gender
        return 'other'

class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ('id', 'habit', 'date', 'performance', 'level', 'minutes_or_count', 'note', 'updated_at')
        read_only_fields = ('updated_at',)

class HabitSerializer(serializers.ModelSerializer):
    logs = HabitLogSerializer(many=True, read_only=True)
    author_username = serializers.CharField(source='user.username', read_only=True)
    author_gender = serializers.SerializerMethodField()
    author_pet_name = serializers.SerializerMethodField()
    is_mine = serializers.SerializerMethodField()
    is_finished = serializers.SerializerMethodField()
    good_days_count = serializers.SerializerMethodField()
    average_days_count = serializers.SerializerMethodField()
    worst_days_count = serializers.SerializerMethodField()
    total_target_days = serializers.SerializerMethodField()
    completion_count = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = (
            'id', 'title', 'category', 'color', 'month',
            'start_date', 'end_date', 'color_good', 'color_average', 'color_worst',
            'created_at', 'logs', 'author_username', 'author_gender', 'author_pet_name',
            'is_mine', 'is_finished', 'good_days_count', 'average_days_count',
            'worst_days_count', 'total_target_days', 'completion_count', 'streak',
            'comments'
        )
        read_only_fields = ('user', 'room', 'created_at')

    def _get_request_user(self):
        request = self.context.get('request')
        return request.user if request and request.user.is_authenticated else None

    def get_is_mine(self, obj):
        user = self._get_request_user()
        return bool(user and user == obj.user)

    def get_author_gender(self, obj):
        if obj.user == obj.room.creator:
            return obj.room.creator_gender
        if obj.user == obj.room.partner:
            return obj.room.partner_gender
        return 'other'

    def get_author_pet_name(self, obj):
        if obj.user == obj.room.creator:
            return obj.room.creator_pet_name or 'Room Creator'
        if obj.user == obj.room.partner:
            return obj.room.partner_pet_name or 'Partner'
        return 'Partner'

    def _parse_date(self, d):
        if not d:
            return None
        if isinstance(d, datetime):
            return d.date()
        if isinstance(d, date):
            return d
        if isinstance(d, str):
            try:
                return datetime.strptime(d[:10], '%Y-%m-%d').date()
            except Exception:
                return None
        return None

    def get_is_finished(self, obj):
        end = self._parse_date(obj.end_date)
        if not end:
            return False
        return date.today() > end

    def get_good_days_count(self, obj):
        return obj.logs.filter(performance='good').count()

    def get_average_days_count(self, obj):
        return obj.logs.filter(performance='average').count()

    def get_worst_days_count(self, obj):
        return obj.logs.filter(performance='worst').count()

    def get_total_target_days(self, obj):
        start = self._parse_date(obj.start_date)
        end = self._parse_date(obj.end_date)
        if start and end:
            diff = (end - start).days + 1
            return max(1, diff)
        return 30

    def get_completion_count(self, obj):
        return obj.logs.filter(level__gt=0).count()

    def get_comments(self, obj):
        logs_with_notes = obj.logs.exclude(note='').exclude(note__isnull=True).order_by('-date')
        return [
            {
                'id': log.id,
                'date': str(log.date),
                'performance': log.performance,
                'minutes_or_count': log.minutes_or_count,
                'note': log.note,
            }
            for log in logs_with_notes
        ]

    def get_streak(self, obj):
        logged_dates = set(obj.logs.filter(level__gt=0).values_list('date', flat=True))
        if not logged_dates:
            return 0
        from datetime import date, timedelta
        cur = date.today()
        if cur not in logged_dates:
            cur = cur - timedelta(days=1)
            if cur not in logged_dates:
                return 0
        streak = 0
        while cur in logged_dates:
            streak += 1
            cur -= timedelta(days=1)
        return streak

