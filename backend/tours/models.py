from django.db import models


class Country(models.Model):
    """Country model for tour destinations."""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=3)
    lat = models.FloatField(default=0)
    lng = models.FloatField(default=0)

    class Meta:
        db_table = 'countries'
        verbose_name_plural = 'countries'

    def __str__(self):
        return self.name


class TourCategory(models.Model):
    """Tour category model."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        db_table = 'tour_categories'

    def __str__(self):
        return self.name


class Tour(models.Model):
    """Tour model."""

    title = models.CharField(max_length=200)
    description = models.TextField()
    country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name='tours')
    category = models.ForeignKey(TourCategory, on_delete=models.CASCADE, related_name='tours')
    price = models.IntegerField()
    discount = models.IntegerField(default=0)
    duration_days = models.IntegerField(default=1)
    max_participants = models.IntegerField(default=10)
    main_image = models.CharField(max_length=500, blank=True, default='')
    gallery = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    rating = models.FloatField(default=0)
    lat = models.FloatField(default=0)
    lng = models.FloatField(default=0)

    class Meta:
        db_table = 'tours'

    def __str__(self):
        return self.title