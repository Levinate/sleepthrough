# 0.3.1-pilot — 2026-11-05

Пользователь сообщил об экране «Local storage could not be opened» при повторном входе. Ранее одна общая ошибка объединяла чтение, JSON-разбор, очистку старых сводок и немедленную повторную запись. На тестовом эмуляторе исходный APK читает данные после перезапуска; точная причина сбоя на пользовательском телефоне пока не установлена.

## Изменения

- `ready` и текущая generation защищают загрузку профиля; фоновая синхронизация и Health Connect не стартуют до успешного чтения.
- Возврат в приложение не пишет пустой или ещё не прочитанный профиль. Загрузка дожидается предыдущего сохранения. Старый результат параллельной загрузки не заменяет новый аккаунт.
- При открытии нет безусловной повторной записи состояния. Удаление устаревших данных здоровья сохраняется только после успешного чтения и при реальном изменении.
- При невалидной дате отдельной импортированной сессии весь дневник остаётся доступным; исходная проблемная запись не удаляется автоматически.
- При ошибке записи текущий снимок остаётся в памяти; Retry saving повторяет его сохранение. Повтор не загружает поверх него старый снимок с диска.
- Android Keystore не создаёт заменяющий ключ при чтении существующего шифротекста. На записи тоже запрещено создавать новый ключ, если хранилище уже содержит записи. Alias `sleepthrough-vault-v1`, preferences `sleepthrough-encrypted` и формат `base64(iv):base64(ciphertext)` сохранены.
- Чтение один раз повторяется через 200 мс при временной ошибке Keystore/provider. Повреждённый шифротекст и недоступный ключ остаются без изменения.
- Экран ошибки показывает ограниченный код этапа и причины. В сообщения не включаются email, идентификаторы записей, содержимое дневника, ключи или токены. Не добавлено удаление/сброс данных.
- `com.sleepthrough.app`, min SDK 28, target SDK 36; versionCode **2**. Подпись совпадает с выданным APK 0.3.0.

## Проверка

`node --test test/*.test.mjs`: **16/16**. Включены гонка возврата/загрузки, восстановление локального профиля и содержимого, ошибки чтения/записи/JSON/схемы, защита прежнего содержимого, повтор записи, параллельные аккаунты и ожидание незавершённого сохранения.

`:app:assembleDebug`, `:app:assembleDebugAndroidTest`, `:app:lintDebug`: успешно. Lint: 0 ошибок, 15 предупреждений о версиях зависимостей, устаревших проверках SDK, неиспользуемых ресурсах и Kotlin extensions.

Эмулятор Android 16/API 36, x86_64, Google APIs Play Store, реальный Android Keystore:

1. На исходном APK 0.3.0 прочитаны данные после Activity recreation и в другом процессе; пройден реальный JavaScript/WebView bridge round trip.
2. В отдельном эмуляторе через исходный APK записан синтетический локальный профиль с ночью, уроком и квизом.
3. APK 0.3.1 установлен через `adb install -r`, без удаления и очистки данных. Профиль показан на экране, 3 пробуждения отображены, рефлексия и шаг квиза сохранены.
4. Проверены Activity recreation, WebView bridge, отказ при повреждённом шифротексте без его изменения, отдельные процессы записи и чтения.

Физический Samsung, email login/callback и импорт реального сна в этом исправлении не проверены. Сервер и его схема не менялись.

## Повторение нативных проверок

Нужны JDK 21, SDK и отдельный тестовый эмулятор. APK приложения и test APK должны иметь совпадающую подпись. Команды ниже приведены без конкретного serial; при нескольких устройствах укажите serial тестового эмулятора.

```sh
cd mobile/android
./gradlew :app:assembleDebug :app:assembleDebugAndroidTest :app:lintDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb shell am instrument -w -e class com.sleepthrough.app.VaultReopenTest com.sleepthrough.app.test/androidx.test.runner.AndroidJUnitRunner
adb shell am instrument -w -e fixture write -e class com.sleepthrough.app.VaultReopenTest#writeProcessFixture com.sleepthrough.app.test/androidx.test.runner.AndroidJUnitRunner
adb shell am instrument -w -e fixture read -e class com.sleepthrough.app.VaultReopenTest#readProcessFixture com.sleepthrough.app.test/androidx.test.runner.AndroidJUnitRunner
```

Для проверки обновления сначала установите исходный 0.3.0, затем test APK. На отдельном пустом эмуляторе запустите `writeUpgradeProfile` с `-e fixture seed-upgrade`. После установки 0.3.1 через `install -r` запустите `readUpgradeProfile` с `-e fixture verify-upgrade`. Seed-метод намеренно задаёт синтетический `state:local`, проверяет модель эмулятора и по умолчанию пропускается.

## Коды для поддержки

| Пример | Значение |
| --- | --- |
| `read:vault_key_missing` | Существующий шифротекст есть, ключ недоступен; он не заменён |
| `read:vault_key_invalid` | Android сообщает об инвалидированном ключе |
| `read:vault_locked` | Ключ требует разблокировки |
| `read:vault_format` | Формат шифротекста не принят |
| `read:vault_decrypt` | Проверка целостности при расшифровании не прошла |
| `read:vault_read` | Другой сбой чтения/Keystore provider |
| `decode:invalid_json` / `decode:invalid_state` | Прочитанное состояние требует восстановления; исходная запись не заменена |
| `write:vault_write` | Последние изменения не сохранены; доступны для повторной попытки в текущем процессе |

При повторении ошибки достаточно сообщить код и модель/версию Android. Код помогает установить причину; он не означает, что недоступный или утраченный ключ можно автоматически восстановить.
