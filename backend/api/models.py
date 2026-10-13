from django.db import models
from django.contrib.auth.models import User

class CoupleRoom(models.Model):
    GENDER_CHOICES = (
        ('boy', 'Boy'),
        ('girl', 'Girl'),
        ('other', 'Other'),
    )
    code = models.CharField(max_length=12, unique=True)
    togetherness_date = models.DateField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_rooms')
    creator_pet_name = models.CharField(max_length=100, blank=True, default='')
    creator_gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='girl')
    partner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='joined_rooms')
    partner_pet_name = models.CharField(max_length=100, blank=True, default='')
    partner_gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default='boy')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Room {self.code} ({self.creator_pet_name} & {self.partner_pet_name})"

class LoveStory(models.Model):
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='stories')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, default='My Perspective')
    content = models.TextField(blank=True, default='')
    first_met = models.TextField(blank=True, default='')
    favorite_memory = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Story by {self.author.username} in {self.room.code}"

class ImportantDate(models.Model):
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='important_dates')
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    date = models.DateField()
    category = models.CharField(max_length=50, default='Milestone')
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.date})"

class MemoryPhoto(models.Model):
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='memories')
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    image_data = models.TextField() # Base64 data url or image link
    caption = models.TextField(blank=True, default='')
    date_taken = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True, default='')
    aspect = models.CharField(max_length=20, default='tall')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} in {self.room.code}"

class WishlistItem(models.Model):
    FOR_WHOM_CHOICES = (
        ('mine', 'Mine'),
        ('theirs', 'Theirs'),
        ('ours', 'Ours'),
    )
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='wishlist_items')
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    for_whom = models.CharField(max_length=20, choices=FOR_WHOM_CHOICES, default='ours')
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True, default='')
    link = models.CharField(max_length=500, blank=True, default='')
    is_fulfilled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.for_whom}"

class TiffEntry(models.Model):
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='tiff_entries')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, default='Heart to Heart')
    what_happened = models.TextField(blank=True, default='')
    how_i_felt = models.TextField(blank=True, default='')
    what_would_help = models.TextField(blank=True, default='')
    partner_reply = models.TextField(blank=True, default='')
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.room.code})"

class FutureLetter(models.Model):
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='future_letters')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    unlock_date = models.DateField()
    hint = models.CharField(max_length=200, blank=True, default='A sealed letter for our future')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (Unlocks on {self.unlock_date})"

class Habit(models.Model):
    COLOR_CHOICES = (
        ('green', 'Mint Green'),
        ('pink', 'Baby Pink'),
        ('blue', 'Baby Blue'),
        ('yellow', 'Sunshine Yellow'),
        ('purple', 'Lilac Purple'),
        ('orange', 'Coral Peach'),
    )
    room = models.ForeignKey(CoupleRoom, on_delete=models.CASCADE, related_name='habits')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, blank=True, default='Daily Habit')
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='green')
    month = models.CharField(max_length=7, default='') # Format: YYYY-MM
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    color_good = models.CharField(max_length=30, blank=True, default='#10B981')
    color_average = models.CharField(max_length=30, blank=True, default='#FBBF24')
    color_worst = models.CharField(max_length=30, blank=True, default='#F87171')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} by {self.user.username} ({self.start_date} to {self.end_date})"

class HabitLog(models.Model):
    PERF_CHOICES = (
        ('good', 'Good'),
        ('average', 'Average'),
        ('worst', 'Worst'),
    )
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    performance = models.CharField(max_length=20, choices=PERF_CHOICES, default='good')
    level = models.IntegerField(default=3) # 3 (Good), 2 (Average), 1 (Worst)
    minutes_or_count = models.IntegerField(default=30)
    note = models.TextField(blank=True, default='') # Daily comment
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('habit', 'date')

    def __str__(self):
        return f"{self.habit.title} on {self.date}: {self.performance}"


