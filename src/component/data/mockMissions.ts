import { Mission, MissionStatus } from "@/component/interface/interface"

export const mockData: Mission[] = [];
const statusList: MissionStatus[] = ["planned", "in-progress", "completed", "failed"];
const dronesList = ["UAV-Alpha-01", "UAV-Beta-02", "UAV-Gamma-03"];

for (let i = 1; i <= 35; i++) {
    const status = statusList[(i - 1) % statusList.length];
    const drone = dronesList[(i - 1) % dronesList.length];

    mockData.push({
        id: i,
        idMission: `MSN-${i}`,
        name: `Mission-${i}`,
        drone: drone,
        scheduled_at: new Date(Date.now() - i * 86400000).toISOString().slice(0, 16).replace("T", " "),
        duration_seconds: Math.floor(Math.random() * 10000) + 1,
        status: status,
    });
}


