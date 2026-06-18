import { Plane, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">TravelAgency</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ваш надёжный партнёр в мире путешествий. Мы создаём незабываемые впечатления с 2010 года.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +7 (800) 555-35-35
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                info@travelagency.ru
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ульяновск, ул. Пушкина, 15
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Разделы</h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>Поиск туров</li>
              <li>Избранное</li>
              <li>Бонусная программа</li>
              <li>Конструктор открыток</li>
            </ul>
          </div>
        </div>
        
      </div>
    </footer>
  );
}
