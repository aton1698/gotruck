# Configuración de correo (SMTP y AWS SES)

Guía para enviar correos desde la aplicación (flujos como "Olvidé contraseña", verificación de email, etc.) tanto con SMTP como con **Amazon SES** en AWS.

---

## Dos opciones: SMTP o SES

La API usa **un solo mailer a la vez**, definido por `MAIL_MAILER`:

| Valor        | Significado | Variables que importan |
|-------------|-------------|-------------------------|
| `smtp`      | Envío por servidor SMTP (Gmail, Mailgun, etc.) | Host, port, user, password, encryption, from |
| `ses`       | Envío por **Amazon SES** (recomendado en AWS)   | Credenciales AWS + from |

Las variables **`MAIL_FROM_ADDRESS`** y **`MAIL_FROM_NAME`** se usan **siempre** (definen el remitente que ve el usuario). El resto depende del mailer elegido.

---

## 1. Si usas SMTP (`MAIL_MAILER=smtp`)

Variables que **sí** se usan:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.tuproveedor.com
MAIL_PORT=587
MAIL_USERNAME=tu_email@dominio.com
MAIL_PASSWORD=tu_contraseña
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME=Fleetbase
```

- **MAIL_HOST**: Servidor SMTP (ej. `smtp.gmail.com`, `smtp.mailgun.org`).
- **MAIL_PORT**: 587 (TLS), 465 (SSL) o 25 (sin cifrado).
- **MAIL_USERNAME / MAIL_PASSWORD**: Credenciales del servidor SMTP.
- **MAIL_ENCRYPTION**: `tls`, `ssl` o `null`.

Con `smtp`, las variables de AWS (SES) **no** intervienen en el envío.

---

## 2. Si usas Amazon SES en AWS (`MAIL_MAILER=ses`)

**Amazon SES (Simple Email Service)** es el servicio de AWS que envía los correos. La API (Laravel/Fleetbase) usa por defecto el mailer `ses` en `api/config/mail.php`.

Con `ses`, las variables SMTP (**MAIL_HOST**, **MAIL_PORT**, **MAIL_USERNAME**, **MAIL_PASSWORD**, **MAIL_ENCRYPTION**) **no** se usan; puedes omitirlas o dejarlas vacías.

### A) Cuenta y región

- Cuenta de AWS (la que uses para el deployment).
- Una región donde tengas SES activo (ej. `us-east-1`). La app usa `AWS_DEFAULT_REGION`.

### B) Identidad verificada en SES (remitente)

SES exige verificar el remitente antes de enviar:

- **Opción 1 – Verificar un email**
  - En AWS: **SES** → **Verified identities** → **Create identity** → **Email address**.
  - Indica el correo que será el remitente (ej. `noreply@tudominio.com`) y confirma el enlace que llega a ese correo.

- **Opción 2 – Verificar un dominio (recomendado en producción)**
  - Crear identidad de tipo **Domain** y añadir los registros DNS que SES indique (DKIM, etc.).
  - Permite enviar desde cualquier dirección de ese dominio.

Ese correo o dominio debe coincidir con **`MAIL_FROM_ADDRESS`** en tu `.env`.

### C) Credenciales IAM para SES

El contenedor/servidor donde corre la API debe usar un **usuario o rol IAM** con permisos para SES, por ejemplo:

- `ses:SendEmail`
- `ses:SendRawEmail`

O una política tipo **AmazonSESFullAccess** para simplificar.

Configurar en el entorno de la app:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_DEFAULT_REGION` (ej. `us-east-1`)

Si usas **roles IAM** (ECS, EC2 con instance profile), no hace falta poner Access Key/Secret; sí mantener `MAIL_MAILER=ses`, `MAIL_FROM_*` y `AWS_DEFAULT_REGION`.

### D) Salir del sandbox de SES (producción)

Por defecto SES está en **sandbox**:

- Solo envía a direcciones verificadas.
- Límites bajos.

Para enviar a cualquier usuario (p. ej. "olvidé contraseña"):

- En AWS: **SES** → **Account dashboard** → **Request production access**.
- Completar el formulario. Tras la aprobación podrás enviar a cualquier correo dentro de los límites de la cuenta.

### E) Variables de entorno en el deployment (AWS)

En el contenedor/servidor de la API (ej. servicio `application` en Docker/ECS):

```env
# Usar SES como mailer
MAIL_MAILER=ses

# Remitente (email o dominio verificado en SES)
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME=GoTruck

# Credenciales AWS (con permisos SES)
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
```

---

## Resumen rápido

| Variable                | SMTP (`smtp`) | SES (`ses`) |
|-------------------------|---------------|-------------|
| MAIL_MAILER             | `smtp`        | `ses`       |
| MAIL_FROM_ADDRESS       | ✅            | ✅          |
| MAIL_FROM_NAME          | ✅            | ✅          |
| MAIL_HOST / PORT / USER / PASS / ENCRYPTION | ✅ | ❌ No se usan |
| AWS_ACCESS_KEY_ID / SECRET / REGION | ❌ | ✅ |

**Referencia en el proyecto:** `api/config/mail.php`, `api/config/services.php`, `api/.env.example`.
