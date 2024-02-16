# Навигация
1. [Разворот](#deploy)
	1. [Докер](#deploy-docker)
	2. [Мануальная установка](#deploy-manualy)
2. [Внутренние плагины](#plugins)
	1. [Загрузка файлов](#plugins-file)
	2. [Логирование](#plugins-logger)
	3. [Очистка нулей](#plugins-nullable)


<h1  id="deploy"> Разворот </h1>

* [Докер](#deploy-docker)
* [Мануальная установка](#deploy-manualy)

<h3  id="deploy-docker">Докер</h3>

Сначала скопировать .env
```bash
cp  .env.example  .env
```
Далее заполните .env файл в зависимости от той конфигурации которая вам нужна

  

Поднятие докера

```bash

docker-compose  up  -d  # Поднятие докера в корне проекта

```

  

<h3  id="deploy-manualy">Мануальная установка</h3>

  

Сначала скопировать .env

```bash

cp  .env.example  .env

```

Далее заполните .env файл в зависимости от той конфигурации которая вам нужна

  

Далее скачивание пакетов bun/npm

```bash

bun  i

```

  

*После нужно поднять mongo сервере на указаном вами в .env файле сервер*

  

Запуск bun

```bash

bun  run  dev  # development

bun  run  start  # product

```

  
  

<h1  id="plugins"> Внутренние плагины </h1>

  

* [Загрузка файлов](#plugins-file)

* [Логирование](#plugins-logger)

  

<h3  id="plugins-file"> Загрузка файлов </h3>

  

Из-за баганной работы [multer](https://www.npmjs.com/package/multer) с **bun** и **Elysia** сервером непосредственно

Был написан самописный bun-node скрипт, для сохранения и выдачи файлов, который совместим только с **Elysia**

  

#### Проблематика

```js

Bun.resolve(SomePath)

```

Работает не очень корректно, и не правильно выдает пути из строк `` "./public" `` выдавая ошибку

Поэтому намного более простым и лакончиным решением было изпользовать [node-path](https://nodejs.org/api/path.html)

  

#### Настройка

Чтобы настроить путь хранения приходящих файлов

Нужно дать в .env файле переменной `` SERVER_PUBLIC="./public" `` свое значение (поддерживаются любые значение от абсолютных до относительных, [Подробнее](https://nodejs.org/api/path.html#pathresolvepaths))

**Не забудьте создать папку по указнному пути**

  

#### Взаимодействие внутри кода

Любой запрос в **Elysia** имеет внутренний [store](https://elysiajs.com/essential/context.html#store) значений, в него и попадет обьект сохраненного файла

```ts

type  File = {

field: string, // Название поля с которого файл был получен

originalName: string, // Имя файла до перезаписи

filename: string, // Имя файла после перезаписи

size: number, // Размер файла

destantion: string, // Путь в который был сохранен новый файл

}

```

Поддерживается любой тип файла, он в любом случае будет сохранен

**Будьте осторожны, если файл будет конфиденциальным он все равно будет доступен, по пути /ВашаПеременнаПутиВEnv/имяФайла**

  

Если файл один то в [store](https://elysiajs.com/essential/context.html#store) будет один обьект в поле upload, если файлов больше одного то будет массив файлов (`` File[] ``)

То, есть доступ будет подобным

```ts

app.post('/test', ({ store: File | File[] }) => {

store.upload  // Доступ к файлам

});

```

**Важно!**

Файлы будут загруженны лишь в одном случае если, прищедшие данные имееют `` Content-Type: 'multipart/form-data' ``

Регистр заголовка не важен **Elysia** все равно переведет его в lowerCase нотацию

  
  

<h3  id="plugins-logger"> Логирование </h3>

  

Логирование написано просто, оно опирается на хуки запроса **Elysia**

[onRequest](https://elysiajs.com/life-cycle/request.html)

[onResponce](https://elysiajs.com/life-cycle/on-response.html)

  

Он получает ответ сначала от запроса, дошел ли он или нет

Потом он дает ответ что дал сервер

  

Логирование сделано на [log4js](https://www.npmjs.com/package/log4js)

<h3 id="plugins-nullable"> Очистка нулевых значений </h3>
**Elysia** Работает на системе [хуков](https://elysiajs.com/essential/life-cycle.html)  
Одним из таких хуков роута является `onBeforeHandle()` хук, до выдачи route данные в `body`

#### Проблематика
Бывают ситуации, когда требуется принять `FormData`, но в ней нужна типизация
К примеру создание обьектов, требует использование `FormData`, но при этом некоторые поля
Должны иметь типы отличные от `String`  (Пример поля в обьектах поле `price` которое должно быть `Number`, но из-за `FormData` , прийдет `String` ) 
Для этого существует [transform](https://elysiajs.com/life-cycle/transform.html) в **Elysia**.
Но, вот незадача, если каждое поле в ручную указать какого оно должно быть типа, появляются значения
типа `NaN`.

#### Решение
Плагин `nullableTransform` как раз таки нужен для простого парсинга обьектов `body/query/params`
Встраиваясь в [onBeforeHandle](https://elysiajs.com/life-cycle/before-handle.html) он очищает значения после [transform](https://elysiajs.com/life-cycle/transform.html), выдавая `body` готовые и чистые значения
