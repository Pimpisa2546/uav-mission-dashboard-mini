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

    const [openModal, setOpenModal] = useState<boolean>(false);

    const [editingMission, setEditingMission] = useState<Mission | null>(null);

    const status_option = ["planned", "in-progress", "completed", "failed"];

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
    }
    const handleNextPage = () => {
        setCurrentPage((next) => (Math.min(totalPages, next + 1)));
    }

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
    }

    const handleAddMission = (newMission: Mission) => {
        setMissionData((prev) => [newMission, ...prev])
        closeModal();
    }

    const handleEditMission = (update: Mission) => {
        setMissionData((prev) => prev.map((item) => (item.id === update.id ? update : item)))
        closeModal();
    }

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
    }

    return (
        <>
            {/* ส่วนค้นหาและการกรอง และเพิ่มภารกิจ */}
            <div className="row" style={{ padding: "10px" }}>
                <div className="col">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", }}>
                        {status_option.map((item) => (
                            <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <input type="checkbox" checked={selectStatus.includes(item)} onChange={() => handleSelectStatus(item)} />
                                <span>{item}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="col">
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <input type="radio" id="desc" name="sortOrder" onChange={() => setSortOrder("desc")} checked={sortOrder === "desc"} />
                        <label htmlFor="desc">ใหม่เก่า</label>

                        <input type="radio" id="asc" name="sortOrder" onChange={() => setSortOrder("asc")} checked={sortOrder === "asc"} />
                        <label htmlFor="asc">เก่าใหม่</label>
                    </div>
                </div>
                <div className="col">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อภารกิจ/โดรน"
                        style={{ padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db", width: "100%" }}
                    />
                </div>
                <div className="col" style={{ alignItems: "flex-end" }}>
                    <button type="button" onClick={() => { setOpenModal(true); setEditingMission(null); }}
                        style={{ padding: "6px 14px", borderRadius: "6px", cursor: "pointer" }}>เพิ่มภารกิจ</button>
                </div>
            </div>

            {/* ส่วนตาราง */}
            <div style={{ margin: "10px auto", padding: "0 24px" }}>
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
                        {pagination.map((item) =>
                            <tr key={item.id}>
                                <td style={{ overflowWrap: "anywhere" }}>{item.idMission}</td>
                                <td style={{ overflowWrap: "anywhere" }}>{item.missionName}</td>
                                <td style={{ overflowWrap: "anywhere" }}>{item.drone}</td>
                                <td style={{ overflowWrap: "anywhere" }}>{item.startAt} <br />
                                    {item.endAt}
                                </td>
                                <td style={{ overflowWrap: "anywhere" }}>{formatDuration(item.duration_seconds)}</td>
                                <td style={{ overflowWrap: "anywhere" }}><span className={`statusBadge--${item.status}`}>{item.status}</span></td>
                                <td><button type="button" onClick={() => { setEditingMission(item); setOpenModal(true); }}>แก้ไข</button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* ส่วนแบ่งหน้า */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="button" onClick={handlePrevPage} disabled={currentPage == 1}>ย้อนกลับ</button>
                {pages.map((item) =>
                    <button key={item} onClick={() => setCurrentPage(item)} disabled={currentPage === item}>{item}</button>
                )}
                <button type="button" onClick={handleNextPage} disabled={currentPage >= totalPages}>ถัดไป</button>
            </div>

            <Modal open={openModal} >
                <MissionForm onCreate={handleAddMission} defaultData={editingMission} onUpdate={handleEditMission} onClose={closeModal} />
            </Modal>

        </>
    );
}

export default MissionTable;