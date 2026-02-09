# Usar un fork de @fleetbase/ember-ui

Sí puedes montar un fork de ember-ui en tu propio repo Git y hacer que este proyecto use ese fork.

## Opción 1: dependencia desde Git (pnpm/npm)

En `package.json`, cambia la dependencia de `@fleetbase/ember-ui` a la URL de tu fork:

```json
"dependencies": {
  "@fleetbase/ember-ui": "github:TU_USUARIO/ember-ui#rama-o-tag"
}
```

O con SSH:

```json
"@fleetbase/ember-ui": "git+ssh://git@github.com/TU_USUARIO/ember-ui.git#main"
```

Luego ejecuta `pnpm install` (o `npm install`).

## Opción 2: fork local (desarrollo)

Si quieres editar ember-ui en local sin publicar el fork:

1. Clona el repo original de ember-ui en una carpeta hermana o donde prefieras.
2. En `package.json` usa `link` o `file:`:

```json
"@fleetbase/ember-ui": "file:../ember-ui"
```

(o desde la raíz del monorepo, la ruta relativa a `console/package.json`).

3. Tras cambiar la dependencia, ejecuta `pnpm install` en `console/`.

## Nota

El nombre del paquete en el fork debe seguir siendo `@fleetbase/ember-ui` (o el que use el console) para que los imports y el resolver de Ember sigan funcionando. Si en el fork cambias el nombre del paquete, tendrías que actualizar todos los imports en el proyecto.
