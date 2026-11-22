import { mockData } from "@/component/data/mockMissions";
import { Mission } from "@/interface/interface";

let missionsData: Mission[] = [...mockData]

function wait(ms = 500): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getAllMissions(shouldError = false): Promise<Mission[]> {
  await wait(2000);

  if (shouldError) {
    throw new Error("โหลดข้อมูลภารกิจไม่สำเร็จ");
  }

  return [...missionsData];
}

export async function getMissionById(
  id: string | number,
  shouldError = false
): Promise<Mission | null> {
  const list = await getAllMissions(shouldError);
  const found = list.find((item) => String(item.id) === String(id));
  return found ?? null;
}

export async function addMission(newItem: Mission): Promise<Mission> {
  await wait(2000);
  missionsData.unshift(newItem);
  return newItem;
}

export async function editMission(updatedItem: Mission): Promise<Mission> {
  await wait(2000);
  missionsData = missionsData.map((item) => {
    if (item.id === updatedItem.id) {
      return updatedItem;
    }
    return item;
  });
  return updatedItem;
}

export async function removeMission(id: number): Promise<void> {
  await wait(500);
  missionsData = missionsData.filter((item) => item.id !== id);
}