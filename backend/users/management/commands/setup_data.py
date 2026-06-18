from django.core.management.base import BaseCommand
from users.models import User
from tours.models import Country, TourCategory, Tour


class Command(BaseCommand):
    help = 'Set up initial data'

    def handle(self, *args, **options):
        # Create admin user
        if not User.objects.filter(username='admin').exists():
            admin = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin',
                first_name='Admin',
                last_name='User',
            )
            admin.role = 'admin'
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        # Create demo users
        if not User.objects.filter(username='manager').exists():
            manager = User.objects.create_user(
                username='manager',
                email='manager@example.com',
                password='manager',
                first_name='Manager',
                last_name='User',
            )
            manager.role = 'manager'
            manager.save()
            self.stdout.write(self.style.SUCCESS('Created manager user'))

        if not User.objects.filter(username='client').exists():
            client = User.objects.create_user(
                username='client',
                email='client@example.com',
                password='client',
                first_name='Client',
                last_name='User',
            )
            client.bonus_points = 500
            client.save()
            self.stdout.write(self.style.SUCCESS('Created client user'))

        # Create countries
        countries_data = [
            {'name': 'Турция', 'code': 'TR', 'lat': 39.0, 'lng': 35.0},
            {'name': 'Мальдивы', 'code': 'MV', 'lat': 3.2, 'lng': 73.0},
            {'name': 'Таиланд', 'code': 'TH', 'lat': 15.0, 'lng': 101.0},
            {'name': 'Италия', 'code': 'IT', 'lat': 42.0, 'lng': 12.0},
            {'name': 'Греция', 'code': 'GR', 'lat': 39.0, 'lng': 22.0},
            {'name': 'ОАЭ', 'code': 'AE', 'lat': 24.0, 'lng': 54.0},
            {'name': 'Египет', 'code': 'EG', 'lat': 26.0, 'lng': 30.0},
            {'name': 'Испания', 'code': 'ES', 'lat': 40.0, 'lng': -4.0},
        ]
        countries = {}
        for c_data in countries_data:
            country, _ = Country.objects.get_or_create(
                code=c_data['code'],
                defaults=c_data
            )
            countries[c_data['code']] = country

        self.stdout.write(self.style.SUCCESS(f'Created {len(countries)} countries'))

        # Create categories
        categories_data = [
            {'name': 'Пляжный отдых', 'slug': 'beach'},
            {'name': 'Экскурсионный', 'slug': 'excursion'},
            {'name': 'Горнолыжный', 'slug': 'ski'},
            {'name': 'Сафари', 'slug': 'safari'},
            {'name': 'Круиз', 'slug': 'cruise'},
        ]
        categories = {}
        for cat_data in categories_data:
            cat, _ = TourCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = cat

        self.stdout.write(self.style.SUCCESS(f'Created {len(categories)} categories'))

# Create SVG images for tours (embedded, no external dependencies)
        def make_svg_tour_image(color1, color2, tour_num):
            """Generate SVG tour image with gradient."""
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
            <defs>
                <linearGradient id="grad{tour_num}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:{color1};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:{color2};stop-opacity:1" />
                </linearGradient>
            </defs>
            <rect width="800" height="600" fill="url(#grad{tour_num})"/>
            <circle cx="650" cy="100" r="60" fill="rgba(255,255,255,0.2)"/>
            <text x="400" y="300" font-family="Arial" font-size="60" fill="white" text-anchor="middle" opacity="0.3">ТУР {tour_num}</text>
            <text x="400" y="400" font-family="Arial" font-size="24" fill="white" text-anchor="middle" opacity="0.5">Путешествия</text>
            </svg>'''
            import base64
            return 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
        
        # Color schemes for different tours
        color_schemes = [
            ('#1a5f7a', '#57c5b6'),   # turquoise blue
            ('#8B4513', '#D2691E'),    # brown/tan
            ('#2E8B57', '#3CB371'),    # forest green
            ('#4169E1', '#6495ED'),    # royal blue
            ('#FF6347', '#FF7F50'),    # coral
            ('#9370DB', '#BA55D3'),    # medium purple
            ('#20B2AA', '#48D1CC'),    # light sea green
            ('#FFD700', '#FFA500'),    # gold/orange
            ('#708090', '#B0C4DE'),    # slate gray
            ('#DC143C', '#B22222'),    # crimson
        ]
        
        tours_data = [
            {
                'title': 'Отдых на Мальдивах',
                'description': 'Райский отдых на белоснежных пляжах Мальдивских островов. Кристально чистая вода, роскошные виллы и незабываемые закаты.',
                'country': countries['MV'],
                'category': categories['beach'],
                'price': 250000,
                'discount': 10,
                'duration_days': 7,
                'max_participants': 20,
                'rating': 4.9,
                'lat': 4.175,
                'lng': 73.509,
            },
            {
                'title': 'Тур по Италии',
                'description': 'Незабываемое путешествие по Италии: Рим, Флоренция, Венеция. История, культура и итальянская кухня.',
                'country': countries['IT'],
                'category': categories['excursion'],
                'price': 95000,
                'discount': 0,
                'duration_days': 10,
                'max_participants': 15,
                'rating': 4.7,
                'lat': 41.902,
                'lng': 12.496,
            },
            {
                'title': 'Горнолыжный курорт в Альпах',
                'description': 'Прекрасный горнолыжный курорт для любителей зимних видов спорта. Современные подъемники и подготовленные трассы.',
                'country': countries['IT'],
                'category': categories['ski'],
                'price': 120000,
                'discount': 5,
                'duration_days': 7,
                'max_participants': 12,
                'rating': 4.8,
                'lat': 46.5,
                'lng': 11.35,
            },
            {
                'title': 'Сафари в Кении',
                'description': 'Удивительное сафари в национальных парках Кении. Великая миграция, Большая пятерка и роскошные лоджи.',
                'country': countries['AE'],
                'category': categories['safari'],
                'price': 180000,
                'discount': 0,
                'duration_days': 8,
                'max_participants': 10,
                'rating': 4.9,
                'lat': -1.292,
                'lng': 36.821,
            },
            {
                'title': 'Круиз по Средиземному морю',
                'description': 'Роскошный круиз на лайнере по Средиземному морю. Посещение Греции, Турции и Кипра.',
                'country': countries['GR'],
                'category': categories['cruise'],
                'price': 150000,
                'discount': 15,
                'duration_days': 12,
                'max_participants': 50,
                'rating': 4.6,
                'lat': 37.983,
                'lng': 23.727,
            },
            {
                'title': 'Отдых в Турции',
                'description': 'All-inclusive отдых на берегу Средиземного моря. Лучшие отели, развлечения и экскурсии.',
                'country': countries['TR'],
                'category': categories['beach'],
                'price': 85000,
                'discount': 20,
                'duration_days': 7,
                'max_participants': 30,
                'rating': 4.5,
                'lat': 36.9,
                'lng': 30.7,
            },
            {
                'title': 'Тайланд Паттайя',
                'description': 'Яркий отдых в сердце Паттайи. Пляжи, ночная жизнь, храмы и традиционная кухня.',
                'country': countries['TH'],
                'category': categories['beach'],
                'price': 95000,
                'discount': 5,
                'duration_days': 10,
                'max_participants': 25,
                'rating': 4.4,
                'lat': 12.93,
                'lng': 100.88,
            },
            {
                'title': 'Дубай и ОАЭ',
                'description': 'Роскошный отдых в Дубае. Шопинг, небоскребы, пустыни и пляжи.',
                'country': countries['AE'],
                'category': categories['excursion'],
                'price': 175000,
                'discount': 0,
                'duration_days': 7,
                'max_participants': 20,
                'rating': 4.8,
                'lat': 25.204,
                'lng': 55.270,
            },
            {
                'title': 'Отдых в Египте',
                'description': 'Красное море, дайвинг, пирамиды и незабываемые закаты.',
                'country': countries['EG'],
                'category': categories['beach'],
                'price': 65000,
                'discount': 15,
                'duration_days': 7,
                'max_participants': 30,
                'rating': 4.3,
                'lat': 27.18,
                'lng': 33.48,
            },
            {
                'title': 'Испания Барселона',
                'description': 'Гауди, пляжи, тапас и атмосфера Барселоны.',
                'country': countries['ES'],
                'category': categories['excursion'],
                'price': 110000,
                'discount': 10,
                'duration_days': 8,
                'max_participants': 20,
                'rating': 4.7,
                'lat': 41.385,
                'lng': 2.173,
            },
        ]

        for i, tour_data in enumerate(tours_data):
            # Add SVG image
            colors = color_schemes[i % len(color_schemes)]
            tour_data['main_image'] = make_svg_tour_image(colors[0], colors[1], i + 1)
            tour_data['gallery'] = [
                make_svg_tour_image(colors[1], colors[0], i + 10),
                make_svg_tour_image(colors[0], colors[0], i + 20)
            ]
            Tour.objects.get_or_create(
                title=tour_data['title'],
                defaults=tour_data
            )

        self.stdout.write(self.style.SUCCESS(f'Created {len(tours_data)} tours'))
        self.stdout.write(self.style.SUCCESS('Initial data setup complete!'))