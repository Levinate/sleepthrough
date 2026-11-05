# Деплой веб-версии

Репозиторий: https://github.com/Levinate/sleepthrough . Публичный сайт: https://sleepthrough-production.up.railway.app . Android расположен отдельно: https://github.com/Levinate/sleepthrough-android .

Использовать Dockerfile из корня и команду `node server.cjs`, healthcheck `/health`, `HOST=0.0.0.0`, порт из `PORT`. `dist/` уже собран; при изменении воронки сначала `pnpm install --frozen-lockfile` и `pnpm run build:web-mvp`, затем тесты и commit/push.

Сервису необходимы `STRIPE_SECRET_KEY` (test only), постоянный `STRIPE_COOKIE_SECRET`, `SITE_URL=https://sleepthrough-production.up.railway.app`. Значения секретов находятся в Variables Railway и не входят в репозиторий. Для локальной работы поддерживается игнорируемый `.env.local`.

Предыдущая версия работала как статическая Railway Function. Её генератор не используется для текущего сервера оплаты. Репозиторий должен запускаться полноценным Node/Docker-сервисом.

После деплоя: `/health` = 200, `/api/payments/config` сообщает `enabled: true`, главная и квиз загружаются, `.env.local` и `payments/stripe.cjs` недоступны по HTTP. Тестовый Checkout проверять картой Stripe, не реальной. Supabase redirects должны разрешать публичный origin; доставка подтверждений зависит от SMTP.

Не включать live-платежи простым изменением ключа. Пилот использует браузерное владение checkout; production требует платёжной привязки к аккаунту, webhook-обработки и серверных прав доступа.
