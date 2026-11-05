# Стек веб-версии

Node.js 24, JavaScript ES modules и HTML/CSS, esbuild 0.28.2, Supabase JS 2.119.0, Stripe REST API `2025-04-30.basil`, Docker и Railway.

Рантайм сервера использует встроенные HTTP/fetch/crypto/fs и не требует установки npm-зависимостей. esbuild нужен только для пересборки `dist/mvp-web.js` и CSS из `web-src/`. Версии зафиксированы в package.json/pnpm-lock.yaml.

Supabase обеспечивает аккаунты и приватные записи. Stripe-hosted Checkout принимает только тестовые платежи; secret key хранится в Variables сервера. Карты, ответы квиза и заметки не проходят через одно общее хранилище платежей. Межустройственная связь платежей с аккаунтом и production webhook-entitlements ещё не реализованы.

Android находится в отдельном [репозитории](https://github.com/Levinate/sleepthrough-android), его SDK/Gradle не нужны для веба. Полный состав функций, запуск и границы продукта — в [README](../README.md).
