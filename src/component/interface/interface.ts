export type MissionStatus = "planned" | "in-progress" | "completed" | "failed"

export interface Mission {
    id: number;
    idMission: string;
    name: string;
    drone: string;
    scheduled_at: string;
    duration_seconds: number;
    status: MissionStatus;
}