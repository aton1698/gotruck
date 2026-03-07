# Logs de autenticación por SMS / 2FA

Para depurar el error **"Unable to send SMS Verification code"** y respuestas **400** en autenticación por teléfono (navigator o console), el API escribe logs detallados que puedes ver en la terminal de despliegue.

## Ver logs en la terminal de despliegue (AWS, etc.)

1. **Logs de SMS/2FA siempre en stdout**  
   El middleware `LogSmsAuthRequests` escribe en el canal `stdout` en cada petición a:
   - `two-fa/validate`, `two-fa/resend`, `two-fa/verify`, `two-fa/invalidate`
   - `onboard/send-verification-sms`, `onboard/send-verification-email`
   - `auth/create-verification-session`

   Verás en la consola donde corre el API (por ejemplo el contenedor o proceso en AWS):
   - `[SMS Auth] [1/3] Request received` – método, path y body (teléfono enmascarado)
   - `[SMS Auth] [2/3] Response status` – código HTTP
   - `[SMS Auth] [3/3] Error response body` – cuerpo de la respuesta cuando el status es 4xx/5xx (ahí suele estar el mensaje del 400)

2. **Todo el log del API en terminal**  
   En el entorno de despliegue configura:
   ```env
   LOG_CHANNEL=stdout
   ```
   Así todo el log de Laravel (incluidas excepciones 4xx en rutas de auth) se verá en la misma terminal.

3. **Archivo y terminal a la vez**  
   Con:
   ```env
   LOG_CHANNEL=stack
   ```
   (valor por defecto en `.env.example`) se escribe en archivo y en stdout.

## Flujo que se registra

1. **Login con 2FA**: login → `checkForTwoFactor` → redirección a `two-fa` con token.
2. **Ruta two-fa**: `two-fa/validate` (token + identity + clientToken).
3. **Reenvío de código**: `two-fa/resend` (identity + token) → el backend envía el SMS.
4. **Verificación por SMS (onboard)**: `onboard/send-verification-sms` (phone + session).

Cuando haya un 400, en `[SMS Auth] [3/3] Error response body` aparecerá el JSON de la respuesta del API (mensaje de error, código, etc.) para poder localizar la causa (Twilio, sesión inválida, teléfono incorrecto, etc.).
