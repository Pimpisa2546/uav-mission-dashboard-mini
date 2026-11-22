export type MissionStatus = "planned" | "in-progress" | "completed" | "failed"

export interface Waypoint {
    id: string;
    lat: string;
    lng: string;
}

export interface Mission {
    id: number;
    idMission: string;
    missionName: string;
    drone: string;
    startAt: string;
    endAt: string;
    duration_seconds: number;
    status: MissionStatus;
    notes: string;
    waypoints?: Waypoint[];
}

