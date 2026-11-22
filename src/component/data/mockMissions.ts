import { Mission, MissionStatus } from "@/interface/interface";

export const mockData: Mission[] = [];
const statusList: MissionStatus[] = ["planned", "in-progress", "completed", "failed"];
const dronesList = ["UAV-Alpha-01", "UAV-Beta-02", "UAV-Gamma-03"];

const realNames = [
  "สำรวจพื้นที่เกษตรแปลง A",
  "ตรวจแนวสายส่งไฟฟ้าโซนเหนือ",
  "สำรวจชายฝั่งอ่าวไทย",
  "ตรวจสอบหลังคาโรงงาน 1",
  "บินสำรวจเส้นทางขนส่ง",
  "ตรวจสภาพป่าไม้เขต 2",
  "สำรวจพื้นที่ก่อสร้างใหม่",
  "ตรวจระบบโซลาร์ฟาร์ม",
  "บินลาดตระเวนพื้นที่เสี่ยง",
  "สำรวจแหล่งน้ำอ่างเก็บน้ำ",
];

const realWaypoints = [
  [
    { id: "wp-1-a", lat: "13.7563", lng: "100.5018" },
    { id: "wp-1-b", lat: "13.7650", lng: "100.5120" },
  ],
  [
    { id: "wp-2-a", lat: "18.7883", lng: "98.9853" },
    { id: "wp-2-b", lat: "18.8010", lng: "99.0020" },
  ],
  [
    { id: "wp-3-a", lat: "12.9236", lng: "100.8825" },
    { id: "wp-3-b", lat: "12.9350", lng: "100.8950" },
  ],
  [
    { id: "wp-4-a", lat: "14.3532", lng: "100.5689" },
    { id: "wp-4-b", lat: "14.3610", lng: "100.5790" },
  ],
  [
    { id: "wp-5-a", lat: "13.9126", lng: "100.6012" },
    { id: "wp-5-b", lat: "13.9250", lng: "100.6150" },
  ],
  [
    { id: "wp-6-a", lat: "19.9105", lng: "99.8406" },
    { id: "wp-6-b", lat: "19.9220", lng: "99.8510" },
  ],
  [
    { id: "wp-7-a", lat: "13.1168", lng: "100.9236" },
    { id: "wp-7-b", lat: "13.1280", lng: "100.9340" },
  ],
  [
    { id: "wp-8-a", lat: "14.9799", lng: "102.0978" },
    { id: "wp-8-b", lat: "14.9910", lng: "102.1100" },
  ],
  [
    { id: "wp-9-a", lat: "7.8804", lng: "98.3923" },
    { id: "wp-9-b", lat: "7.8920", lng: "98.4050" },
  ],
  [
    { id: "wp-10-a", lat: "14.2975", lng: "101.1662" },
    { id: "wp-10-b", lat: "14.3080", lng: "101.1780" },
  ],
];

for (let i = 1; i <= 35; i++) {
  const isReal = i <= 10;
  const start = new Date(Date.now() - i * 3600000);
  const end = new Date(start.getTime() + 1800000);

  mockData.push({
    id: i,
    idMission: `MSN-${i}`,
    missionName: isReal ? realNames[i - 1] : `ภารกิจที่ ${i}`,
    drone: isReal ? dronesList[(i - 1) % 3] : dronesList[Math.floor(Math.random() * 3)],
    startAt: start.toISOString().slice(0, 16).replace("T", " "),
    endAt: end.toISOString().slice(0, 16).replace("T", " "),
    duration_seconds: (end.getTime() - start.getTime()) / 1000,
    status: isReal ? statusList[(i - 1) % 4] : statusList[Math.floor(Math.random() * 4)],
    notes: "-",
    waypoints: isReal ? realWaypoints[i - 1] : undefined,
  });
}