"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMissionById } from "@/services/services";
import { Mission } from "@/interface/interface";
import "@/page/missionTable.css";
import "@/component/missionForm.css";

export default function MissionDetailPage() {
  const params = useParams<{ id: string }>();
  const missionId = params?.id;

  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const fetchByID = async () => {
    if (!missionId) return;
    setLoading(true);
    setHasError(false);
    try {
      const data = await getMissionById(missionId);
      setMission(data);
    } catch (err) {
      console.error(err);
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchByID();
  }, [missionId]);

  return (
    <div style={{ padding: "24px" }}>
      <Link href="/mission" className="btn">
        ← กลับไปหน้ารายการภารกิจ
      </Link>

      {loading && (
        <div style={{ margin: "12px 0" }}>
          <span className="btn-spiner" />
          <span>กำลังโหลดข้อมูลภารกิจ...</span>
        </div>
      )}

      {!loading && hasError && (
        <div>
          <p>โหลดข้อมูลภารกิจไม่สำเร็จ</p>
          <button type="button" className="btn" onClick={fetchByID}>
            ลองใหม่
          </button>
        </div>
      )}

      {!loading && !hasError && !mission && (
        <div>
          <h1>ไม่พบภารกิจ ({missionId})</h1>
          <p>ไม่มีข้อมูลภารกิจตามรหัสนี้ในระบบ</p>
        </div>
      )}

      {!loading && !hasError && mission && (
        <div style={{ marginTop: "16px" }}>
          <h1>
            {mission.missionName} ({mission.idMission})
          </h1>
          <p>โดรน: {mission.drone}</p>
          <p>สถานะ: {mission.status}</p>
          <p>
            เริ่ม: {mission.startAt} | สิ้นสุด: {mission.endAt}
          </p>
          {mission.notes && <p>หมายเหตุ: {mission.notes}</p>}

          <h2>รายการพิกัดเส้นทางบิน (Waypoints)</h2>
          <table className="mission-table" style={{ marginTop: "8px" }}>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {mission.waypoints && mission.waypoints.length > 0 ? (
                mission.waypoints.map((wp, index) => (
                  <tr key={wp.id ?? index}>
                    <td>{index + 1}</td>
                    <td>{wp.lat}</td>
                    <td>{wp.lng}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>ไม่มีข้อมูลพิกัด waypoints</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}