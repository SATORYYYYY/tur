from rest_framework import serializers
from .models import Country, TourCategory, Tour


class CountrySerializer(serializers.ModelSerializer):
    """Serializer for Country model."""

    class Meta:
        model = Country
        fields = ['id', 'name', 'code', 'lat', 'lng']


class TourCategorySerializer(serializers.ModelSerializer):
    """Serializer for TourCategory model."""

    class Meta:
        model = TourCategory
        fields = ['id', 'name', 'slug']


class TourSerializer(serializers.ModelSerializer):
    """Serializer for Tour model."""

    country = CountrySerializer(read_only=True)
    category = TourCategorySerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    gallery = serializers.JSONField(required=False)

    class Meta:
        model = Tour
        fields = ['id', 'title', 'description', 'country', 'category',
                  'price', 'discount', 'duration_days', 'max_participants',
                  'main_image', 'gallery', 'is_active', 'rating', 'lat', 'lng']

    def get_main_image(self, obj):
        if not obj.main_image:
            return None
        # If it's already a URL or data URI, return it directly
        return str(obj.main_image)


class TourCreateSerializer(serializers.Serializer):
    """Serializer for creating/updating tours."""

    id = serializers.IntegerField(required=False)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    country = serializers.IntegerField()
    category = serializers.IntegerField()
    price = serializers.IntegerField()
    discount = serializers.IntegerField(default=0, required=False)
    duration_days = serializers.IntegerField(default=1, required=False)
    max_participants = serializers.IntegerField(default=10, required=False)
    main_image = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    gallery = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    is_active = serializers.BooleanField(default=True)
    lat = serializers.FloatField(default=0, required=False)
    lng = serializers.FloatField(default=0, required=False)

    def validate_country(self, value):
        try:
            Country.objects.get(id=value)
        except Country.DoesNotExist:
            raise serializers.ValidationError("Country not found")
        return value

    def validate_category(self, value):
        try:
            TourCategory.objects.get(id=value)
        except TourCategory.DoesNotExist:
            raise serializers.ValidationError("Category not found")
        return value

    def create(self, validated_data):
        country = Country.objects.get(id=validated_data.pop('country'))
        category = TourCategory.objects.get(id=validated_data.pop('category'))

        # Handle main_image - store URL directly in CharField
        main_image = validated_data.pop('main_image', None)

        # Remove _main_image_url if it exists (don't save it)
        validated_data.pop('_main_image_url', None)

        tour = Tour.objects.create(
            country=country,
            category=category,
            main_image=main_image or '',
            **validated_data
        )

        return tour

    def update(self, instance, validated_data):
        country_id = validated_data.pop('country', None)
        category_id = validated_data.pop('category', None)
        main_image = validated_data.pop('main_image', None)

        # Remove _main_image_url if it exists
        validated_data.pop('_main_image_url', None)

        if country_id:
            instance.country = Country.objects.get(id=country_id)
        if category_id:
            instance.category = TourCategory.objects.get(id=category_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if main_image is not None:
            instance.main_image = main_image

        instance.save()
        return instance


class TourListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for tour lists."""

    country = CountrySerializer(read_only=True)
    category = TourCategorySerializer(read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = ['id', 'title', 'country', 'category', 'price',
                  'discount', 'duration_days', 'max_participants',
                  'main_image', 'is_active', 'rating', 'lat', 'lng']

    def get_main_image(self, obj):
        # Check for stored URL first
        if hasattr(obj, '_main_image_url'):
            return obj._main_image_url
        if not obj.main_image:
            return None
        # Return as-is (handles URLs, data URIs, etc.)
        return str(obj.main_image)