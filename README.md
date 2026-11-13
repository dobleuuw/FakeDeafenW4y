# FakeDeafen

Plugin para [Vencord](https://vencord.dev/) (cliente modificado de Discord) que agrega un botón para aparecer **muteado y ensordecido** ante los demás, sin dejar de escuchar ni hablar realmente en la llamada.

## Cómo funciona

Discord envía a los demás participantes de la llamada tu estado real de `self_mute` / `self_deaf`. El plugin intercepta ese envío (vía parches de webpack sobre el cliente) y, cuando activas el botón, fuerza que el valor enviado sea `true` aunque localmente sigas escuchando y hablando normal.

- **Botón** 👻 junto a los controles de voz: lo activas/desactivas con un click.
- Mientras está activo, los demás te ven como muteado y ensordecido (ícono correspondiente, tooltip "Fingiendo: te ven ensordecido").
- Tú sigues escuchando el audio de la llamada y tu micrófono sigue funcionando de forma local — es solo lo que el servidor reporta a los demás lo que cambia.
- El estado se guarda en la configuración del plugin (`settings.fake`), así que persiste entre reinicios de Discord.

## Instalación

Requiere tener [Vencord](https://docs.vencord.dev/installing/) instalado y su entorno de build (`pnpm`) configurado.

```bash
git clone <url-de-este-repo>
cd FakeDeafenW4y
./build.sh
```

`build.sh` copia la carpeta `fakeDeafen/` a `~/vencord-src/src/userplugins/fakeDeafen` y corre `pnpm build` dentro de tu checkout de Vencord. Ajusta la ruta `~/vencord-src` en `build.sh` si tu clon de Vencord está en otro lugar.

Después de compilar, reinicia Discord (o recarga con Ctrl+R) y activa el plugin **FakeDeafen** en `Ajustes → Vencord → Plugins`.

## Estructura

- `fakeDeafen/index.tsx` — el plugin: parches de webpack + botón + configuración.
- `build.sh` — script de instalación/compilación.
- `docs/superpowers/` — diseño y plan de implementación originales.
