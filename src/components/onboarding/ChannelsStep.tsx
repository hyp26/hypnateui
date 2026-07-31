import React from "react";
import { Share2 } from "lucide-react";
import { ErrorBanner } from "./ErrorBanner";
import { ChannelCard } from "./ChannelCard";
import { CHANNEL_CFG } from "../../data/channels";
import type { ChannelData, ModalType } from "../../types/onboarding";

interface ChannelsStepProps {
    channels: ChannelData;
    error: string;
    onClear: () => void;
    onOpenChannel: (channel: ModalType) => void;
}

export const ChannelsStep: React.FC<ChannelsStepProps> = ({ channels, error, onClear, onOpenChannel }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#ec4899,#db2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 24px rgba(236,72,153,0.25)" }}>
                <Share2 size={22} color="#fff" />
            </div>
            <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.3px" }}>Connect Channels</h2>
                <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Link social accounts to automate selling and support.</p>
            </div>
        </div>

        {error && <ErrorBanner error={error} onClear={onClear} />}

        <div className="ob-channel-grid">
            {(Object.keys(CHANNEL_CFG) as (keyof ChannelData)[]).map((key) => (
                <ChannelCard
                    key={key}
                    cfg={CHANNEL_CFG[key]}
                    connected={channels[key].connected}
                    onClick={() => !channels[key].connected && onOpenChannel(key as ModalType)}
                />
            ))}
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>This step is optional — you can connect channels later from Settings.</p>
    </div>
);