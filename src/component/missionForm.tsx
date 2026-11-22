"use client";

import { addMission, editMission } from "@/services/services";
import React, { useEffect, useState } from "react";
import { MissionStatus, Waypoint } from "@/interface/interface";
import { Mission } from "@/interface/interface";
import "@/component/missionForm.css"

interface MissionFormProps {
    onCreate?: (mission: Mission) => void;
    defaultData?: Mission | null;
    onUpdate?: (mission: Mission) => void;
    onClose: () => void;
}

export const MissionForm: React.FC<MissionFormProps> = ({ onCreate, defaultData, onUpdate, onClose }) => {
    const [missionName, setMissionName] = useState<string>("");
    const [droneSelect, setDroneSelect] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [startAt, setStartAt] = useState<string>("");
    const [endAt, setEndAt] = useState<string>("");
    const [statusSelect, setStatusSelect] = useState<MissionStatus | "">("");
    const [notes, setNotes] = useState<string>("");
    const [waypoint, setWaypoint] = useState<Waypoint[]>([
        { id: "1", lat: "", lng: "" },
        { id: "2", lat: "", lng: "" },
    ]);

    const [isSubmiting, setIsSubmiting] = useState<boolean>(false);

    const newStart = new Date(startAt).getTime();
    const newEnd = new Date(endAt).getTime();

    const dronesList = ["UAV-Alpha-01", "UAV-Beta-02", "UAV-Gamma-03"];
    const statuslist: MissionStatus[] = ["planned", "in-progress", "completed", "failed"];

    const resetForm = () => {
        setMissionName("");
        setDroneSelect("");
        setStartAt("");
        setEndAt("");
        setStatusSelect("");
        setSubmitted(false);
        setNotes("");
        setWaypoint(
            [
                { id: "1", lat: "", lng: "" },
                { id: "2", lat: "", lng: "" },
            ]
        );
    };

    useEffect(() => {
        if (defaultData) {
            setMissionName(defaultData.missionName),
                setDroneSelect(defaultData.drone),
                setStartAt(defaultData.startAt),
                setEndAt(defaultData.endAt),
                setStatusSelect(defaultData.status),
                setNotes(defaultData.notes ?? ""),
                setWaypoint(
                    defaultData.waypoints ?? [
                        { id: "1", lat: "", lng: "" },
                        { id: "2", lat: "", lng: "" },
                    ]
                );
        } else {
            resetForm();
        }
    }, [defaultData]);

    const handleSubmitedCheck = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);

        if (missionName.trim().length < 3 || missionName === "") {
            return;
        }
        if (droneSelect === "") {
            return;
        }
        if (startAt === "" || endAt === "") {
            return;
        } else if (newEnd <= newStart) {
            return;
        }
        if (statusSelect === "") {
            return;
        }
        if (notes.length > 500) {
            return;
        }
        if (waypoint.length < 2) {
            return;
        }
        const hasInvalidWaypoint = waypoint.some((row) => {
            const latStr = row.lat.trim();
            const lngStr = row.lng.trim();
            const latNum = Number(latStr);
            const lngNum = Number(lngStr);

            const latInvalid =
                latStr === "" || Number.isNaN(latNum) || latNum < -90 || latNum > 90;
            const lngInvalid =
                lngStr === "" || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180;

            return latInvalid || lngInvalid;
        });

        if (hasInvalidWaypoint) {
            return;
        }
        const payload = {
            id: defaultData ? defaultData.id : Date.now(),
            idMission: defaultData ? defaultData.idMission : `MNS-${Date.now()}`,
            missionName: missionName,
            drone: droneSelect,
            startAt: startAt,
            endAt: endAt,
            status: statusSelect,
            duration_seconds: (newEnd - newStart) / 1000,
            notes: notes,
            waypoints: waypoint,
        }
        try {
            setIsSubmiting(true);
            if (defaultData) {
                const updated = await editMission(payload);
                resetForm();
                onUpdate?.(updated);
            } else {
                const create = await addMission(payload);
                resetForm();
                onCreate?.(create);
            }

        } catch (err) {
            console.error(err)
        } finally { setIsSubmiting(false); }
    }

    const isDirty =
        missionName.trim() !== "" ||
        droneSelect !== "" ||
        startAt !== "" ||
        endAt !== "" ||
        statusSelect !== "" ||
        notes.trim() !== "" ||
        waypoint.length > 2 ||
        waypoint.some((w) => w.lat.trim() !== "" || w.lng.trim() !== "")
        ;

    const handleCancel = () => {
        if (isDirty && !isSubmiting) {
            const ok = window.confirm("มีข้อมูลที่กรอกหรือแก้ไขไว้ ต้องการปิดฟอร์มและทิ้งข้อมูลใช่ไหม?");
            if (!ok) return;
        }
        resetForm();
        onClose?.();
    };

    return (
        <div style={{ position: "relative" }}>
            {/* ปุ่มปิด */}
            <div style={{ position: "sticky", top: "0px", display: "flex", justifyContent: "flex-end", zIndex: 10, backgroundColor: "#ffffff", padding: "10px" }}>
                <button type="button" onClick={handleCancel}>X</button>
            </div>
            {/* กล่องForm */}
            <div style={{ display: "flex", justifyContent: "center", padding: "15px" }}>
                <form onSubmit={handleSubmitedCheck}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label htmlFor="missionname">ภารกิจ</label>
                        <input type="text" id="missionname" value={missionName} onChange={(e) => setMissionName(e.target.value)}
                            aria-invalid={submitted && (missionName.trim().length < 3 || missionName === "")}
                            aria-describedby={submitted && (missionName.trim().length < 3 || missionName === "") ? "missionname-error" : undefined}
                            style={{ width: "100%", height: "20px", borderRadius: "5px", border: "1px solid #c0c0c0" }}
                        />
                        {submitted && (missionName.trim().length < 3 || missionName === "") &&
                            <div id="missionname-error" style={{ color: "#ff0000" }}>กรุณากรอกชื่อภารกิจอย่างน้อย 3 ตัวอักษร</div>
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "5px", padding: "10px 0px" }}>
                        <label htmlFor="drone">โดรนที่ต้องการใช้</label>
                        <select id="drone" value={droneSelect} onChange={(e) => setDroneSelect(e.target.value)}
                            style={{ color: droneSelect === "" ? "#9ca3af" : "#111827", width: "100%", height: "20px", borderRadius: "5px", border: "1px solid #c0c0c0" }}
                            aria-invalid={submitted && droneSelect === ""}
                            aria-describedby={submitted && droneSelect === "" ? "drone-error" : undefined}
                        >
                            <option value="" style={{ color: "#9ca3af" }}>--- โปรดเลือก ---</option>
                            {dronesList.map((drone) => (
                                <option key={drone} value={drone} style={{ color: "#111827" }}>{drone}</option>
                            ))}
                        </select>
                        {submitted && droneSelect === "" &&
                            <div id="drone-error" style={{ color: "#ff0000" }}>กรุณาเลือกโดรนที่ต้องการใช้</div>
                        }
                    </div>
                    <div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                            <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
                                <label htmlFor="startAt">วันและเวลาเริ่ม</label>
                                <input type="datetime-local" id="startAt" value={startAt} onChange={(e) => setStartAt(e.target.value)}
                                    aria-invalid={submitted && startAt === ""}
                                    aria-describedby={submitted && startAt === "" ? "startAt-error" : undefined}
                                    style={{ width: "100%", height: "20px", borderRadius: "5px", border: "1px solid #c0c0c0" }}
                                />
                                {submitted && startAt === "" &&
                                    <div id="startAt-error" style={{ color: "#ff0000" }}>
                                        กรุณาเลือกวันและเวลาเริ่มต้น
                                    </div>
                                }
                            </div>
                            <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
                                <label htmlFor="endAt">วันและเวลาสิ้นสุด</label>
                                <input type="datetime-local" id="endAt" value={endAt} onChange={(e) => setEndAt(e.target.value)}
                                    aria-invalid={submitted && (newEnd <= newStart || endAt === "")}
                                    aria-describedby={submitted && (newEnd <= newStart || endAt === "") ? "endAt-error" : undefined}
                                    style={{ width: "100%", height: "20px", borderRadius: "5px", border: "1px solid #c0c0c0" }}
                                />
                                {submitted && (newEnd <= newStart || endAt === "") &&
                                    <div id="endAt-error" style={{ color: "#ff0000" }}>
                                        {endAt === "" ? "กรุณาเลือกวันและเวลาสิ้นสุด" : "วันและเวลาสิ้นสุดต้องไม่น้อยกว่าวันและเวลาเริ่มต้น"}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0px" }}>
                            <span>จุดพิกัด</span>
                            <button type="button" onClick={() => setWaypoint((prev) => [...prev, { id: `${Date.now()}-${prev.length + 1}`, lat: "", lng: "" }])}
                                style={{ border: "1px solid #d1d5db " }}
                            >+ เพิ่มจุด</button>
                        </div>
                        <table style={{ border: "1px solid #e5e7eb", borderCollapse: "collapse", padding: "10px 0px" }}>
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>lat</th>
                                    <th>lng</th>
                                    <th>ลบ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waypoint.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <input type="number"
                                                aria-label={`lat จุดที่ ${idx + 1}`}
                                                value={item.lat}
                                                onChange={(e) => setWaypoint((prev) => prev.map((row) => row.id === item.id ? { ...row, lat: e.target.value } : row))}
                                                aria-invalid={submitted && (item.lat.trim() === "" || Number.isNaN(Number(item.lat.trim())) || Number(item.lat.trim()) < -90 || Number(item.lat.trim()) > 90)}
                                                aria-describedby={submitted && (item.lat.trim() === "" || Number.isNaN(Number(item.lat.trim())) || Number(item.lat.trim()) < -90 || Number(item.lat.trim()) > 90) ? "waypoint-error" : undefined}
                                            />
                                        </td>
                                        <td>
                                            <input type="number"
                                                aria-label={`lng จุดที่ ${idx + 1}`}
                                                value={item.lng}
                                                onChange={(e) => setWaypoint((prev) => prev.map((row) => row.id === item.id ? { ...row, lng: e.target.value } : row))}
                                                aria-invalid={submitted && (item.lng.trim() === "" || Number.isNaN(Number(item.lng.trim())) || Number(item.lng.trim()) < -180 || Number(item.lng.trim()) > 180)}
                                                aria-describedby={submitted && (item.lng.trim() === "" || Number.isNaN(Number(item.lng.trim())) || Number(item.lng.trim()) < -180 || Number(item.lng.trim()) > 180) ? "waypoint-error" : undefined}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                disabled={waypoint.length <= 2}
                                                onClick={() => setWaypoint((prev) => prev.length <= 2 ? prev : prev.filter((row) => row.id !== item.id))}
                                            >
                                                ลบ
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {submitted && waypoint.some((w) => {
                            const lat = Number(w.lat.trim());
                            const lng = Number(w.lng.trim());
                            return w.lat.trim() === "" || Number.isNaN(lat) || lat < -90 || lat > 90 ||
                                w.lng.trim() === "" || Number.isNaN(lng) || lng < -180 || lng > 180;
                        }) && (
                                <div id="waypoint-error" style={{ color: "#ff0000", marginTop: "6px" }}>
                                    ต้องมีอย่างน้อย 2 จุด และกรอก lat (-90 ถึง 90) กับ lng (-180 ถึง 180) ให้ถูกต้อง
                                </div>
                            )}
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flex: "0.25", flexDirection: "column" }}>
                            <label htmlFor="status">สถานะ</label>
                            <select id="status" value={statusSelect} onChange={(e) => setStatusSelect(e.target.value as MissionStatus | "")}
                                style={{ color: statusSelect === "" ? "#9ca3af" : "#111827" }}
                                aria-invalid={submitted && statusSelect === ""}
                                aria-describedby={submitted && statusSelect === "" ? "status-error" : undefined}
                            >
                                <option value="" style={{ color: "#9ca3af" }}>--- โปรดเลือก ---</option>
                                {statuslist.map((status) => (
                                    <option key={status} value={status} style={{ color: "#111827" }}>{status}</option>
                                ))}
                            </select>
                            {submitted && statusSelect === "" &&
                                <div id="status-error" style={{ color: "#ff0000" }}>กรุณาเลือกสถานะ</div>
                            }
                        </div>
                        <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
                            <label htmlFor="note">หมายเหตุ</label>
                            <textarea id="note" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)}
                                aria-invalid={submitted && notes.length > 500}
                                aria-describedby={submitted && notes.length > 500 ? "note-error" : undefined}
                            ></textarea>{notes.length}/500
                            {submitted && notes.length > 500 &&
                                <div id="note-error" style={{ color: "#ff0000" }}>หมายเหตุต้องไม่เกิน 500 ตัวอักษร</div>
                            }
                        </div>

                    </div>

                    <div style={{
                        display: "flex", justifyContent: "end", alignItems: "center", gap: "8px", position: "sticky", bottom: "0px", backgroundColor: "#fff", zIndex: 10, height: "35px"
                    }}>
                        <button type="button" onClick={handleCancel} style={{ border: "1px solid #d1d5db", height: "30px" }}>
                            ยกเลิก
                        </button>
                        <button type="submit" disabled={isSubmiting}
                            style={{
                                backgroundColor: isSubmiting ? "#7c99ee" : "#4169e1", color: "white", width: "120px", height: "30px", border: "none",
                                cursor: isSubmiting ? "not-allowed" : "pointer",
                            }}>
                            {isSubmiting ? (<><span className="btn-spiner" aria-hidden="true"></span><span>กำลังบันทึก</span></>) : ("บันทึก")}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default MissionForm;