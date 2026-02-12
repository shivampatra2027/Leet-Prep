import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import api from "../lib/api.js";

export default function LeetCodeHeatmap() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/api/analytics/leetcode-heatmap")
            .then(response => {
                const formattedData = Array.isArray(response.data) ? response.data : [];
                setData(formattedData);
                setLoading(false);
                setError(null);
            })
            .catch(err => {
                console.error("Heatmap fetch error:", err);
                setError(err.response?.data?.error || err.message || "Failed to load heatmap");
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="text-gray-500">Loading LeetCode heatmap…</p>;
    }

    if (error) {
        return <p className="text-red-500">Error loading heatmap: {error}</p>;
    }

    if (!data || !data.length) {
        return <p className="text-gray-500">No LeetCode activity found. Sync your profile to load activity.</p>;
    }

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">
                LeetCode Activity Heatmap
            </h2>

            <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={data}
                classForValue={(value) => {
                    if (!value || value.count === 0) return "color-empty";
                    if (value.count < 2) return "color-scale-1";
                    if (value.count < 5) return "color-scale-2";
                    return "color-scale-3";
                }}
                tooltipDataAttrs={(value) => {
                    if (!value || !value.date) return null;
                    return {
                        "data-tip": `${value.date}: ${value.count} submissions`
                    };
                }}
                showWeekdayLabels
            />
        </div>
    );
}
