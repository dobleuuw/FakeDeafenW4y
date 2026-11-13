import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin, { OptionType } from "@utils/types";
import { Tooltip } from "@webpack/common";

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
        },
        {
            find: "shouldShowOutputDeviceChangedTooltip",
            replacement: {
                match: /(\(0,\i\.jsx\)\(\i,\{selfDeaf:\i,serverDeaf:\i,onClick:\i,onContextMenu:\i,awaitingRemote:\i,.+?dismissTooltips:\i\}\)),(null!=\i\.\i\?)/,
                replace: "$1,$self.button(),$2"
            }
        }
    ],

    force: (value: boolean) => settings.store.fake || value,

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
});
