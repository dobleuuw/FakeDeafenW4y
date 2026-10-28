# FakeDeafen (plugin de Vencord): diseño

## Objetivo
Un botón en el panel de voz de Discord que hace que los demás te vean muteado y ensordecido, mientras tú sigues oyendo la llamada.

## Estructura
- Código de Vencord en `~/vencord-src` (git clone, compilado con Node + pnpm, sin sudo).
- Plugin en su propio repo `~/vencord-fakedeafen`, enlazado en `~/vencord-src/src/userplugins/fakeDeafen/`.
- Los 17 plugins y ajustes en `~/.config/Vencord/` no cambian; solo se reemplaza el Vencord prebuilt por el compilado (`pnpm inject`, sin sudo).

## Funcionamiento
- Un estado `fingir` (on/off) guardado en la configuración del plugin.
- Con `fingir` activo, el plugin intercepta el mensaje de estado de voz que el cliente manda al servidor y fuerza `selfMute` y `selfDeaf` a `true`.
- El audio local no se toca.

## Botón
- En el panel de voz, junto a micrófono y audífonos; cambia de color al estar activo.
- Si no se puede insertar ahí, queda como opción en la configuración del plugin.

## Errores
- Si el parche no encaja tras una actualización de Discord, Vencord marca el plugin como fallido y el resto sigue funcionando.

## Pruebas
- Verificable sin ayuda: el plugin compila y carga, el botón aparece y cambia de estado.
- Necesita otra persona o segunda cuenta: que el estado se vea muteado/ensordecido desde fuera mientras el usuario sigue oyendo.

## Publicación
- Vencord no acepta plugins nuevos en su repo oficial; se publica como repo propio en GitHub con README (copiar a `src/userplugins` y compilar).
- Nada sin que el usuario lo pida; antes de publicar, el repo no debe contener tokens ni rutas personales.

## Riesgos
- Va contra los términos de Discord (igual que Vencord).
- Los demás creen que no escuchas la llamada.
