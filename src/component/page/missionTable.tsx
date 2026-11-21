"use client";
import React, { useEffect, useRef, useState } from "react"
import { Mission } from "../interface/interface"
import { getAllMissions } from "@/services/services";
import "./missionTable.css"
import { useSearchParams, useRouter } from "next/navigation";

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
        const matchSearch = !keyword ? true : item.name.toLowerCase().includes(keyword) || item.drone.toLowerCase().includes(keyword);
        const matchStatus = selectStatus.length === 0 ? true : selectStatus.includes(item.status);
        return matchSearch && matchStatus;
    });

    const sortedMission = [...filter].sort((a, b) => {
        const timeA = new Date(a.scheduled_at).getTime();
        const timeB = new Date(b.scheduled_at).getTime();
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

    return (
        <>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาชื่อภารกิจ/โดรน" />

            <div>
                {status_option.map((item) => (
                    <label key={item}>
                        <input type="checkbox" checked={selectStatus.includes(item)} onChange={() => handleSelectStatus(item)} />
                        <span>{item}</span>
                    </label>
                ))}
            </div>

            <div>
                <input type="radio" id="desc" name="sortOrder" onChange={() => setSortOrder("desc")} checked={sortOrder === "desc"} />
                <label htmlFor="desc">ใหม่เก่า</label>

                <input type="radio" id="asc" name="sortOrder" onChange={() => setSortOrder("asc")} checked={sortOrder === "asc"} />
                <label htmlFor="asc">เก่าใหม่</label>
            </div>
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
                        {pagination.map((item) =>
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
            <div>
                <button onClick={handlePrevPage} disabled={currentPage == 1}>ย้อนกลับ</button>
                {pages.map((item) =>
                    <button key={item} onClick={() => setCurrentPage(item)} disabled={currentPage === item}>{item}</button>
                )}
                <button onClick={handleNextPage} disabled={currentPage >= totalPages}>ถัดไป</button>
            </div>
        </>
    );
}

export default MissionTable;