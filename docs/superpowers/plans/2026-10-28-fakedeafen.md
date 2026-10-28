# FakeDeafen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Plugin de Vencord con un botón en el panel de voz que hace que los demás te vean muteado y ensordecido mientras tú sigues oyendo.

**Architecture:** Un parche reescribe `self_mute`/`self_deaf` en el mensaje `voiceStateUpdate` que el cliente manda al gateway (el audio local no depende de ese mensaje). Otro parche inserta un botón junto a los de micrófono/audífonos. Estado en una opción oculta del plugin.

**Tech Stack:** Vencord 1.15.13 (fuente), Node 22, pnpm 11.9.0, TypeScript/React.

## Global Constraints

- Sin `sudo`: todo en `~` (`~/vencord-src`, `~/vencord-fakedeafen`).
- No tocar tokens, `.env` ni bots del usuario.
- Mantener los 17 plugins y ajustes actuales de Vencord (copia de `~/.config/Vencord/settings`).
- El repo del plugin no debe contener rutas, tokens ni datos personales.
- No subir nada a GitHub sin que el usuario lo pida.
- Cerrar Discord solo con permiso del usuario (puede estar en una llamada).

---

### Task 1: Compilar Vencord desde la fuente e inyectarlo

**Files:**
- Uses: `~/vencord-src` (ya clonado, v1.15.13)
- Backup: `~/.config/Vencord/settings` → `~/vencord-src/settings`

**Interfaces:** Produces: Vencord compilado en `~/vencord-src/dist`, inyectado en `~/.config/discord/app-1.0.166`. La inyección de desarrollo usa `VENCORD_USER_DATA_DIR=~/vencord-src`, así que los ajustes se leen de `~/vencord-src/settings`.

- [ ] **Step 1: Instalar pnpm y dependencias**

```bash
cd ~/vencord-src && npm config set prefix ~/.npm-global && npm i -g pnpm@11.9.0 && export PATH=~/.npm-global/bin:$PATH && pnpm install --frozen-lockfile
```
Expected: termina sin errores.

- [ ] **Step 2: Copiar ajustes y compilar**

```bash
cp -r ~/.config/Vencord/settings ~/vencord-src/settings && cd ~/vencord-src && pnpm build
```
Expected: `dist/` con `patcher.js` y `renderer.js`, sin errores.

- [ ] **Step 3: Pedir permiso para cerrar Discord, cerrarlo e inyectar**

```bash
cd ~/vencord-src && pnpm inject -- --install -location ~/.config/discord/app-1.0.166
```
Si el instalador pide elegir, usar `-location` como arriba. Expected: "Successfully patched".

- [ ] **Step 4: Abrir Discord y verificar**

Abrir Discord; en Ajustes debe aparecer "Vencord" con los 17 plugins activos. Si no carga, restaurar con `~/vencord/VencordInstallerCli -install -location ~/.config/discord/app-1.0.166`.

---

### Task 2: Plugin con el parche de estado de voz

**Files:**
- Create: `~/vencord-fakedeafen/fakeDeafen/index.tsx`
- Link: `ln -s ~/vencord-fakedeafen/fakeDeafen ~/vencord-src/src/userplugins/fakeDeafen`

**Interfaces:** Produces: `plugin.force(value: boolean): boolean` (devuelve `true` si `settings.store.fake`, si no el valor original); `settings.store.fake: boolean`.

- [ ] **Step 1: Escribir el plugin**

```tsx
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

export const settings = definePluginSettings({
    fake: {
        type: OptionType.BOOLEAN,
        description: "Aparecer muteado y ensordecido para los demás",
        default: false,
        hidden: true
    }
});

export default definePlugin({
    name: "FakeDeafen",
    description: "Botón para aparecer muteado y ensordecido sin dejar de escuchar la llamada",
    authors: [{ name: "wiliams", id: 0n }],
    settings,

    patches: [
        {
            find: "shouldIncludePreferredRegion()",
            all: true,
            replacement: {
                match: /self_mute:(\i),self_deaf:(\i),self_video/,
                replace: "self_mute:$self.force($1),self_deaf:$self.force($2),self_video"
            }
        }
    ],

    force: (value: boolean) => settings.store.fake || value
});
```

- [ ] **Step 2: Enlazar y compilar**

```bash
mkdir -p ~/vencord-src/src/userplugins && ln -sfn ~/vencord-fakedeafen/fakeDeafen ~/vencord-src/src/userplugins/fakeDeafen && cd ~/vencord-src && pnpm build
```
Expected: compila sin errores.

- [ ] **Step 3: Verificar que el parche encaja**

Reiniciar Discord (con permiso), abrir DevTools (Ctrl+Shift+I) → pestaña Console: no debe haber "Patch by FakeDeafen had no effect" ni "failed". Comprobar plugin activo en Ajustes → Vencord → Plugins → FakeDeafen.

- [ ] **Step 4: Commit**

```bash
cd ~/vencord-fakedeafen && git add -A && git commit -m "feat: parche de estado de voz"
```

---

### Task 3: Botón en el panel de voz

**Files:**
- Modify: `~/vencord-fakedeafen/fakeDeafen/index.tsx`

**Interfaces:** Consumes: `settings.store.fake`, `settings` (de la Task 2). Produces: `plugin.button()` → elemento React que se inserta tras el botón de ensordecer.

- [ ] **Step 1: Agregar el botón y su parche**

Añadir al inicio del archivo:

```tsx
import ErrorBoundary from "@components/ErrorBoundary";
import { Tooltip } from "@webpack/common";
```

Añadir dentro de `patches` un segundo elemento:

```tsx
        {
            find: "shouldShowOutputDeviceChangedTooltip",
            replacement: {
                match: /(\(0,\i\.jsx\)\(\i,\{selfDeaf:\i,serverDeaf:\i,onClick:\i,onContextMenu:\i,awaitingRemote:\i,.+?dismissTooltips:\i\}\)),(null!=\i\.\i\?)/,
                replace: "$1,$self.button(),$2"
            }
        }
```

Y añadir tras `force`:

```tsx
    button: ErrorBoundary.wrap(() => {
        const { fake } = settings.use(["fake"]);
        return (
            <Tooltip text={fake ? "Fingiendo: te ven ensordecido" : "Fingir muteado/ensordecido"}>
                {tooltipProps => (
                    <button
                        {...tooltipProps}
                        onClick={() => { settings.store.fake = !fake; }}
                        style={{
                            width: 32, height: 32, border: "none", borderRadius: 4, cursor: "pointer",
                            background: "transparent", fontSize: 16,
                            color: fake ? "var(--status-danger)" : "var(--interactive-normal)"
                        }}
                    >👻</button>
                )}
            </Tooltip>
        );
    }, { noop: true })
```

- [ ] **Step 2: Compilar**

```bash
cd ~/vencord-src && pnpm build
```
Expected: sin errores.

- [ ] **Step 3: Verificar a la vista**

Recargar Discord (Ctrl+R) con permiso. En el panel inferior izquierdo, junto a micrófono/audífonos, debe haber un 👻; al hacer clic cambia a rojo y vuelve a gris al segundo clic. Si el parche no encaja, el botón no aparece y la consola lo dice; en ese caso exponer `fake` solo como opción visible del plugin (quitar `hidden: true`).

- [ ] **Step 4: Commit**

```bash
cd ~/vencord-fakedeafen && git add -A && git commit -m "feat: botón en el panel de voz"
```

---

### Task 4: Prueba con otra persona

**Files:** ninguno.

- [ ] **Step 1: Pedir al usuario una segunda cuenta o un amigo en una llamada**

Avisar antes: se necesita hablar/escuchar.

- [ ] **Step 2: Comprobar**

Con el 👻 activo: el otro debe ver tu icono muteado y ensordecido, y tú debes seguir oyendo su voz. Con el 👻 apagado: todo normal. Anotar qué pasa si hablas con el micrófono abierto (si el otro te oye o no) y reportarlo tal cual.

- [ ] **Step 3: Limpieza para publicar (solo si el usuario quiere)**

Crear `README.md` (copiar `fakeDeafen/` a `src/userplugins/`, `pnpm build`, `pnpm inject`), verificar con `git grep -nE "wiliams|/home|token"` que no hay datos personales (el `name` del autor es la excepción elegida por el usuario) y esperar la orden antes de subir a GitHub.
