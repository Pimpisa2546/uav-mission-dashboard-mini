"use client";
import React, { useEffect, useState } from "react"
import { Mission } from "../interface/interface"
import { getAllMissions } from "@/services/services";
import "./missionTable.css"

export const MissionTable: React.FC = () => {
    const [missionData, setMissionData] = useState<Mission[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const dataMission = await getAllMissions();
            setMissionData(dataMission);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            {/* <div>
                <input></>
            </div> */}
            <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "0 24px" }}>
                <table className="mission-table">
                    <thead>
                        <tr>
                            <th>รหัสภารกิจ</th>
                            <th>ชื่อภารกิจ</th>
                            <th>ชื่อโดรน</th>
                            <th>วันและเวลาที่บิน</th>
                            <th>ระยะเวลาบิน</th>
                            <th>สถานะ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {missionData.map((item) =>
                            <tr key={item.id}>
                                <td>{item.idMission}</td>
                                <td>{item.name}</td>
                                <td>{item.drone}</td>
                                <td>{item.scheduled_at}</td>
                                <td>{item.duration_seconds}</td>
                                <td>{item.status}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>

    );
}

export default MissionTable;