# Configuración de correo (SMTP y AWS SES)

Resumen de cómo configurar el envío de correos en la aplicación (flujos como "Olvidé contraseña", verificación de email, etc.).

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

Variables que **sí** se usan:

```env
MAIL_MAILER=ses
MAIL_FROM_ADDRESS=noreply@tudominio.com
MAIL_FROM_NAME=Fleetbase

AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
```

- **MAIL_FROM_ADDRESS**: Debe ser un email o dominio **verificado en SES**.
- **AWS_***: Usuario/rol IAM con permisos `ses:SendEmail` (y `SendRawEmail` si aplica).

Con `ses`, las variables SMTP (**MAIL_HOST**, **MAIL_PORT**, **MAIL_USERNAME**, **MAIL_PASSWORD**, **MAIL_ENCRYPTION**) **no** se usan; puedes omitirlas o dejarlas vacías.

**En AWS además necesitas:**

1. **SES**: Identidad verificada (email o dominio) para el remitente.
2. **IAM**: Credenciales con permisos SES (o rol asignado al contenedor/servidor).
3. **Producción**: Solicitar "production access" en SES para enviar a cualquier correo (fuera del sandbox).

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
