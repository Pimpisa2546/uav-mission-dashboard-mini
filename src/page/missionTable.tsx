"use client";
import React, { useEffect, useRef, useState } from "react"
import { Mission } from "../interface/interface"
import { getAllMissions, editMission } from "@/services/services";
import "./missionTable.css"
import { useSearchParams, useRouter } from "next/navigation";
import { Modal } from "@/component/Modal"
import { MissionForm } from "@/component/missionForm"

export const MissionTable: React.FC = () => {
    const [missionData, setMissionData] = useState<Mission[]>([]);

    const searchParams = useSearchParams();
    const router = useRouter();

    const rawSearch = searchParams.get("q") ?? "";
    const rawStatus = searchParams.get("status") ?? "";
    const rawSort = searchParams.get("sort") ?? "";
    const rawPage = Number(searchParams.get("p") ?? "1");

    const defaultStatus = rawStatus ? rawStatus.split(",").filter(Boolean) : [];
    const defaultSort: "asc" | "desc" = rawSort === "asc" ? "asc" : "desc";
    const defaultPage = Number.isNaN(rawPage) || rawPage < 1 ? 1 : Math.floor(rawPage);

    const [loading, setLoading] = useState<boolean>(false);
    const [search, setSearch] = useState<string>(rawSearch);
    const [debounce, setDebounce] = useState<string>(rawSearch);
    const [selectStatus, setSelectStatus] = useState<string[]>(defaultStatus);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSort);

    const [errorData, setErrorData] = useState<boolean>(false);

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    const status_option = ["planned", "in-progress", "completed", "failed"];

    const fetchData = async () => {
        setErrorData(false);
        setLoading(true);
        try {
            const dataMission = await getAllMissions();
            setMissionData(dataMission);
        } catch (err) {
            console.error(err);
            setErrorData(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchDataError = async () => {
        setErrorData(false);
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 5000));
            throw new Error("mock network error");
        } catch (err) {
            console.error(err);
            setErrorData(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => { setDebounce(search); }, 500);
        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    const prevFilterRef = useRef<string | null>(null);
    useEffect(() => {
        const currentFilterKey = JSON.stringify({ debounce, selectStatus });

        if (prevFilterRef.current === null) {
            prevFilterRef.current = currentFilterKey;
            return;
        }

        if (prevFilterRef.current !== currentFilterKey) {
            prevFilterRef.current = currentFilterKey;
            setCurrentPage(1);
        }
    }, [debounce, selectStatus])

    const keyword = debounce.trim().toLowerCase();

    const filter = missionData.filter((item) => {
        const matchSearch = !keyword ? true : item.missionName.toLowerCase().includes(keyword) || item.drone.toLowerCase().includes(keyword);
        const matchStatus = selectStatus.length === 0 ? true : selectStatus.includes(item.status);
        return matchSearch && matchStatus;
    });

    const sortedMission = [...filter].sort((a, b) => {
        const timeA = new Date(a.startAt).getTime();
        const timeB = new Date(b.startAt).getTime();
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA
    });

    const handleSelectStatus = (status: string) => {
        setSelectStatus((prev) => {
            if (prev.includes(status)) {
                return prev.filter((item) => item !== status);
            }
            return [...prev, status];
        });
    };

    const [currentPage, setCurrentPage] = useState<number>(defaultPage);
    const pageSize = 10
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pagination = sortedMission.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(sortedMission.length / pageSize));
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    const handlePrevPage = () => {
        setCurrentPage((prev) => Math.max(1, prev - 1))
    };
    const handleNextPage = () => {
        setCurrentPage((next) => (Math.min(totalPages, next + 1)));
    };

    useEffect(() => {
        const params = new URLSearchParams();

        if (debounce.trim()) {
            params.set("q", debounce.trim());
        }
        if (selectStatus.length > 0) {
            params.set("status", selectStatus.join(","));
        }
        if (sortOrder === "asc") {
            params.set("sort", sortOrder);
        }
        if (currentPage > 1) {
            params.set("p", String(currentPage));
        }
        const querryString = params.toString();
        const nextURL = querryString ? `?${querryString}` : window.location.pathname;
        router.replace(nextURL, { scroll: false });
    }, [debounce, selectStatus, sortOrder, currentPage]);

    const closeModal = () => {
        setOpenModal(false);
        setEditingMission(null);
    };

    const handleAddMission = (newMission: Mission) => {
        setMissionData((prev) => [newMission, ...prev])
        closeModal();
    };

    const handleEditMission = (update: Mission) => {
        setMissionData((prev) => prev.map((item) => (item.id === update.id ? update : item)))
        closeModal();
    };

    function formatDuration(totalSec: number): string {
        const durationSec = Math.max(0, Math.floor(totalSec));
        const day = Math.floor(durationSec / (24 * 3600));
        const hours = Math.floor((durationSec % (24 * 3600)) / 3600);
        const minute = Math.floor((durationSec % 3600) / 60);
        const sec = durationSec % 60;

        const parts: string[] = [];
        if (day > 0) parts.push(`${day}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minute > 0) parts.push(`${minute}m`);
        if (sec > 0) parts.push(`${sec}s`);

        return parts.length > 0 ? parts.join(" ") : "0s";
    };

    const resetFilter = () => {
        setSearch("");
        setDebounce("");
        setSelectStatus([]);
        setCurrentPage(1);
    };

    return (
        <>
            {/* ส่วนค้นหาและการกรอง และเพิ่มภารกิจ */}
            <div className="row"
                style={{ display: "flex", flexWrap: "wrap", backgroundColor: "#f9fafb", margin: "10px 24px", alignItems: "center", padding: "12px 24px", border: "1px solid #e5e7eb", }}
            >
                <div className="col" style={{ flex: "0 0 auto" }}>
                    <div style={{ display: "inline-flex", gap: "5px", alignItems: "center" }}>
                        <input type="radio" id="desc" name="sortOrder" onChange={() => setSortOrder("desc")} checked={sortOrder === "desc"} />
                        <label htmlFor="desc">ใหม่เก่า</label>

                        <input type="radio" id="asc" name="sortOrder" onChange={() => setSortOrder("asc")} checked={sortOrder === "asc"} />
                        <label htmlFor="asc">เก่าใหม่</label>
                    </div>
                </div>
                <div className="col" style={{ flex: "1 1 220px" }}>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อภารกิจ/โดรน"
                        style={{ display: "flex", padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%", boxSizing: "border-box", }}
                    />
                </div>
                <div className="col">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", }}>
                        {status_option.map((item) => (
                            <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap", }}>
                                <input type="checkbox" checked={selectStatus.includes(item)} onChange={() => handleSelectStatus(item)} />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="col" style={{ boxSizing: "border-box" }}>
                    <button type="button" onClick={() => { setOpenModal(true); setEditingMission(null); }}
                        className="btn"
                        style={{ border: "1px solid #111827", backgroundColor: "#111827", color: "#fff", }}
                    >+ เพิ่มภารกิจ
                    </button>
                </div>
            </div>

            {/* ส่วนตาราง */}
            <div className="table-scroll-wrapper" style={{ margin: "10px auto", padding: "0 24px"}}>
                <table className="mission-table">
                    <thead style={{ backgroundColor: "#c0c0c0" }}>
                        <tr>
                            <th>รหัสภารกิจ</th>
                            <th>ชื่อภารกิจ</th>
                            <th>ชื่อโดรน</th>
                            <th>วันและเวลาที่บิน</th>
                            <th>ระยะเวลาบิน</th>
                            <th>สถานะ</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx}>
                                    {Array.from({ length: 7 }).map((__, colIdx) => (
                                        <td key={colIdx} style={{ padding: "12px", margin: "0 auto" }}>
                                            <div className="skeleton" style={{ margin: "0 auto" }} />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : errorData ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "24px", textAlign: "center" }}>
                                    <p style={{ marginBottom: "10px" }}>ไม่สามารถโหลดข้อมูลภารกิจได้</p>
                                    <button type="button" onClick={fetchData} className="btn">ลองใหม่</button>
                                </td>
                            </tr>
                        ) : pagination.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ padding: "24px", textAlign: "center" }}>
                                    {missionData.length === 0 ? (
                                        <>
                                            <p style={{ marginBottom: "10px" }}>ยังไม่มีข้อมูลภารกิจในระบบ</p>
                                            <button type="button" className="btn" onClick={() => { setOpenModal(true); setEditingMission(null); }}>
                                                + เพิ่มภารกิจแรก
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p style={{ marginBottom: "10px" }}>ไม่พบภารกิจที่ตรงกับเงื่อนไขการค้นหาหรือตัวกรอง</p>
                                            <button type="button" className="btn" onClick={resetFilter}>ล้างตัวกรอง</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            pagination.map((item) =>
                                <tr key={item.id}>
                                    <td >{item.idMission}</td>
                                    <td >{item.missionName}</td>
                                    <td >{item.drone}</td>
                                    <td >{item.startAt} <br />
                                        {item.endAt}
                                    </td>
                                    <td >{formatDuration(item.duration_seconds)}</td>
                                    <td ><span className={`statusBadge--${item.status}`}>{item.status}</span></td>
                                    <td>
                                        <button type="button" className="btn" onClick={() => { setEditingMission(item); setOpenModal(true); }}
                                            style={{ backgroundColor: "#efcc00", fontSize: "12px" }}
                                        >
                                            แก้ไข
                                        </button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>
            {/* ส่วนแบ่งหน้า */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={handlePrevPage} disabled={currentPage === 1}>ย้อนกลับ</button>
                {pages.map((item) =>
                    <button key={item} onClick={() => setCurrentPage(item)} disabled={currentPage === item}>{item}</button>
                )}
                <button type="button" onClick={handleNextPage} disabled={currentPage >= totalPages}>ถัดไป</button>
            </div>

            <Modal open={openModal} onClose={closeModal}>
                <MissionForm onCreate={handleAddMission} defaultData={editingMission} onUpdate={handleEditMission} onClose={closeModal} />
            </Modal>

        </>
    );
}

export default MissionTable;