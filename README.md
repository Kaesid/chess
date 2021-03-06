# kaesid-JSFE2021Q1

## codejam-chess:

## Deploy: https://kaesid.github.io/chess/codejam-chess/dist/

## Development logs:

### 17 июня:

add: Реализована базовая верстка. Реализована шахматная доска на базовом уровне. Реализован таймер.

План на завтра: Реализация всех фич шахматной доски.

### 18 июня:

add: Реализована координатная сетка для шахматной доски. Реализовано отображение маркировки сетки шахматной доски.

План на завтра: Реализация всех фич шахматной доски.

### 19 июня:

add: Реализована генерация шахматных фигур. Реализован поворот шахматной доски с перегенерацией фигур.

План на завтра: Реализация всех фич шахматной доски.

### 20 июня:

add: Реализован базовый Drag&Drop.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 21 июня:

add: Реализован базовый алгоритм движения для пешки.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 22 июня:

add: Реализован базовый алгоритм движения для всех фигур.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 23 июня:

add: Реализована подсветка возможных ходов и атак для фигур. Реализовано перемещение фигур по клику мыши.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 24 июня:

add: Реализован базовый алгоритм рокировки и шаха.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 25 июня:

add: Реализован базовый алгоритм анализа возможностей хода фигур противника и исключение суицидальных ходов из пула ходов.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 26 июня:

add: Реализован базовый алгоритм отображения последовательности шахматных ходов, для использования дебютных баз. Реализована возможность взятия вражеских фигур.

refactor: Изменения в структуре проекта, для повышения читаемости.

План на завтра: Реализация всех фич, связанных с шахматными фигурами.

### 27 июня:

add: Реализована передача хода. Реализован мат. Оптимизирован алгоритм рокировки.

План на завтра: Реализовать пат, превращение пешки в ферзя. Добавить в алгоритм прогнозирования проверку на суицидальные атаки для короля. Глобальный рефакторинг, с целью повышения читаемости проекта.

### 28 июня:

add: Реализован пат. Реализовано превращение пешки в ферзя. Король более не может совершить атаку, если это подведет его под удар. Реализованы визуальные эффекты для всех ситуаций, завершающих игру. Начат глобальный рефакторинг, с целью повышения читаемости проекта.

План на завтра: Глобальный рефакторинг, с целью повышения читаемости проекта. Реализовать отображение логов ходов. Реализовать базововое оформление и функционал для таблицы игроков на странице игры.

### 29 июня:

add: Изменение в алгоритме превращения пешки в ферзя, с учетом будущей потребности в использовании данного алгоритма для ии.

refactor: Продолжен глобальный рефакторинг. Значительно измененена структура класса, отвечающего за логику шахмат. Оптимизирован рекурсивный алгоритм прохода через фигуры, для значительного уменьшения числа "холостых" проходов.

fix: Исправлена ошибка логики, в следствии которой можно было произвести рокировку вопреки шахматным правилам.

План на завтра: Завершение глобального рефакторинга, с целью повышения читаемости проекта. Реализовать отображение логов ходов. Реализовать базововое оформление и функционал для таблицы игроков на странице игры.

### 30 июня:

add: Реализован предход. Реализовано базовое оформление для модального окна регистрации игроков. В алгоритме совершения шахматных ходов по координатам (для поддержки дебютных баз) реализованы проверки на корректность и очередность хода.

refactor: Завершена данная итерация глобального рефакторинга.

План на завтра: Реализовать отображение логов ходов. Реализовать базововое оформление и функционал для таблицы игроков на странице игры.

### 1 июля:

add: Реализован функционал страницы "Лобби". Реализована загрузка аватара. Реализовано сохранение имени и аватара при смене страницы. Реализовано отображение имени игрока в таблице игроков на странице игры.

refactor: Адаптирован алгоритм превращения пешки, с учетом изменений в логике игры, связанных с добавлением предхода. Функционал модального окна был перенесен на страницу "Лобби".

План на завтра: Реализовать отображение логов ходов. Реализовать базововое оформление и функционал для таблицы игроков на странице игры. Начать компоновку страницы "Настройки".

### 2 июля:

add: Реализовано отображение логов ходов. Реализовано базововое оформление и функционал для таблицы игроков на странице игры.

План на завтра: Реализовать компоновку страницы "Настройки".

### 3 июля:

refactor: Функционал страницы "Настройки" перенесен на страницу "Лобби".

add: Реализован базовый функционал блока "Настройки" на странице "Лобби".

План на завтра: реализовать изменения в игровой логике в соответствии с изменениями в блоке "Настройки". Реализовать возможность дать фору оппоненту.

### 4 июля:

refactor: Рефакторинг кода, отвечающего за генерацию страницы "Лобби".

add: Закончено оформление блока "Настройки" страницы "Лобби". Реализован сброс настроек при смене режима игры.

План на завтра: реализовать изменения в игровой логике в соответствии с изменениями в блоке "Настройки". Реализовать возможность дать фору оппоненту. Реализовать возможность выбора цвета фигур.

### 5 июля:

add: Реализована возможность выбора цвета фигур, а так же случайный выбор. Реализована возможность дать фору. Реализована возможность сдаться. Реализовано базовове модальное окно с результатами матча. Реализована возможность вернуться в лобби после игры.

План на завтра: Реализовать возможность ничьи по согласовании сторон. Рефакторинг проекта. Начать реализацию ИИ.

### 6 июля:

add: Реализована возможность ничьи по согласованию сторон. Рефакторинг в разделах рендеринга, "Попап" и "Лобби". Реализована блокировка недопустимых настроек, в зависимости от режима игры. Реализовано сохранение настроек при смене страницы. Реализована блокировка контроля над фигурами соперника в режиме игры против ИИ, и в серверном режиме.

План на завтра: Начать реализацию ИИ.

### 7 июля:

add: Реализован базовый ИИ, действующий в рамках шахматных правил, способный оценивать свои действия в рамках текущего хода, и выбирать, в рамках текущего хода, один из оптимальных ходов.

План на завтра: Реализовать для ИИ прогнозирование ответных действий соперника.

### 8 июля:

add: Улучшен алгоритм работы базового ИИ, добавлены проверки на нахождение под ударом. Добавлен приоритет для ИИ на совершение рокировки. Базово реализован агоритм просмотра ответного(второго) хода, для понимания ИИ ответных действий противника.

План на завтра: Завершить работу над ИИ, способным анализировать обстановку на 2 хода.

### 9 июля:

add: Продолжена работа над продвинутым ИИ.Частично решена проблема с несоответствием просчитываемой ситуации с возможными ходами фигур.

План на завтра: Завершить работу над ИИ, способным анализировать обстановку на 2 хода. Начать работу над дебютными базами.

### 10 июля:

add: Реализован ИИ, способный анализировать 2 хода. Реализовано переключение в настройках на просчет одного или двух ходов. Реализовано использование дебютных баз.

План на завтра: Поставить проверу, на случай, если в дебютной базе находится некорректная информация. Приступить к реализации второй части таска.

### 11 июля:

add: Реализована проверка корректности хода в дебютной базе. Реализован базовый сервер, способный получить сообщение и отослать его. Реализован в базовом виде алгоритм для передачи сообщений на сервер.

План на завтра: Продолжить работу над клиент-серверной частью.

### 12 июля:

add: Реализовано отображение имен игроков, подключенных к серверу. Реализовано корректное отображение цвета фигур игроков при игре через сервер. Реализована игра через сервер. Реализована анимация при игре против бота и в серверной игре.

План на завтра: Реализовать асинхронность для анимации. Реализовать возможность форы в сетевой игре. Реализовать отображение аватара в сетевой игре. Ввести дополнительные проверки при игре через сервер(таймаут, попытка подключения больше чем двух игроков, и т.д.). Провести рефакторинг.

### 13 июля:

add: Реализованна асинхронность для анимации. Реализовано отображение аватара в сетевой игре. Реализована возможность сдаться и предложить ничью в сетевой игре. Реализовано корректное взаимодействие между кнопками "Создать игру" и "Подключиться".

План на завтра: Реализовать возможность форы в сетевой игре. Реализовать возможность вести несколько одновременных партий в сетевой игре. Провести рефакторинг. Начать работу над страницей "Повторы."

### 14 июля:

add: Реализована возможность форы в сетевой игре. Реализована возможность вести несколько одновременных партий в сетевой игре. Произведен рефакторинг блока, отвечающего за отправку сообщений на сервер. Реализовано добавление информации о матче в базу данных.

План на завтра: Учитывать фору в информации по повторам. Реализовать верстку страницы "Повторы.". Реализовать отображение списка повторов из бд. Приступить к функционалу страницы "Повторы"

### 15 июля:

add: В пакет данных по повторам добавлена информация о форе. Реализован верстка страницы "Повторы". Реализована выгрузка из базы данных и корректное отображение данных о повторах на странице. Реализован базовый алгоритм функционала повторов.

План на завтра: Исправить ошибку, возникающую при длительных анимациях(предход/рокировка). Реализовать переключение скоростей воспроизведения повторов. Реализовать подсветку победителя.

### 16 июля:

add: Исправлена ошибка, нарушающая порядок ходов на длительных анимациях. Реализовано переключение скоростей воспроизведения повторов. Реализованы сообщения о победителе при повторах. Внесены изменения в проект, согласно требованиям eslint. Реализованы все функциональные требования проекта.

План на завтра: Приступить к глобальному рефакторингу проекта. Поиск и исправление ошибок.

### 17 июля:

add: Рефакторинг кода серверной части приложения. Деплой сервера на хостинге. Тестирование front-end и back-end частей приложения, с целью выявления багов.

План на завтра: Исправить баг с многократно запускаемым таймером. Исправить баг с некорретным ресетом флагов допустимости рокировки по завершению партии. Глобальный рефакторинг приложения. Поиск и исправление ошибок.

### 18 июля:

add: Поиск и устранение ошибок. Подсветка победителя при повторе. loader при поиске оппонента в серверной игре.

План на завтра: Глобальный рефакторинг приложения.

### 19 июля:

add: Глобальный рефакторинг приложения.

План на завтра: Кросс-чек.
