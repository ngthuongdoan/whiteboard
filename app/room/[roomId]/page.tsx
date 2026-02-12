import { redirect } from "next/navigation";
import RoomClient from "@/components/RoomClient";
import { getBackendAuthToken, getRoomsApiUrl } from "@/lib/collaboration/env";

interface RoomPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const token = getBackendAuthToken();

  try {
    const response = await fetch(`${getRoomsApiUrl()}/${encodeURIComponent(roomId)}`, {
      method: "GET",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (response.status === 404) {
      redirect("/?joinError=room-not-found");
    }
  } catch {
    // Fall through: if backend is temporarily unreachable, let the page render.
  }

  return <RoomClient roomId={roomId} />;
}
