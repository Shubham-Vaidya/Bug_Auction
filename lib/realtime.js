import { supabase } from "@/lib/supabase";

const SUBSCRIBE_TIMEOUT_MS = 1200;

async function waitForChannelSubscription(channel) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error("Realtime subscription timed out"));
        }, SUBSCRIBE_TIMEOUT_MS);

        channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
                clearTimeout(timeout);
                resolve();
                return;
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
                clearTimeout(timeout);
                reject(new Error(`Realtime channel failed with status: ${status}`));
            }
        });
    });
}

export async function broadcastRoomEvent(roomCode, event, payload = {}) {
    if (!roomCode || !event) return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return;
    }

    const normalizedRoomCode = String(roomCode).toUpperCase();
    const channel = supabase.channel(`room-${normalizedRoomCode}`);

    try {
        await waitForChannelSubscription(channel);
        await channel.send({
            type: "broadcast",
            event,
            payload,
        });
    } catch (error) {
        console.error(`Realtime broadcast failed for room ${normalizedRoomCode} and event ${event}:`, error);
    } finally {
        await supabase.removeChannel(channel);
    }
}
