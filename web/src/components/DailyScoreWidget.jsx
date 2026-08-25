import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DailyScoreWidget({ userData, transactions, dailyScore: dailyScoreProp }) {
    const [scoreData, setScoreData] = useState(null);

    useEffect(() => {
        // If the parent already fetched /insights/daily, reuse it instead of fetching again.
        if (dailyScoreProp) return;

        const fetchDailyScore = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/daily`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userData: userData || {},
                        transactions: transactions || []
                    })
                });

                if (!response.ok) throw new Error('Failed to fetch daily score');

                const data = await response.json();
                setScoreData(data);
            } catch (error) {
                console.error('Error fetching daily score:', error);
            }
        };

        if (userData && Object.keys(userData).length > 0) {
            fetchDailyScore();
        }
    }, [userData, transactions, dailyScoreProp]);

    // Show default state if no data yet
    const dailyScore = dailyScoreProp || scoreData?.dailyScore || {
        score: 50,
        savingsRate: 0,
        emergencyMonths: 0,
        insights: ['Start tracking expenses to see your financial health!'],
        trend: 'stable'
    };

    const scoreColor = dailyScore.score >= 70 ? 'text-green-600' : dailyScore.score >= 40 ? 'text-yellow-600' : 'text-red-600';
    const trendLabel = dailyScore.trend === 'improving' ? 'Improving' :
        dailyScore.trend === 'stable' ? 'Stable' : 'Needs Attention';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-black/10 rounded-sm font-mono"
        >
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60 font-bold">Financial Health</h3>

            {/* Score Circle */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-6xl font-bold ${scoreColor}`}>
                            {dailyScore.score}
                        </span>
                        <span className="text-sm opacity-30 font-bold">/100</span>
                    </div>
                    <div className="text-xs tracking-wide opacity-40 mt-2">
                        {trendLabel}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm opacity-60 font-bold">Savings Rate</div>
                    <div className="text-2xl font-bold">{dailyScore.savingsRate}%</div>

                    <div className="text-sm opacity-60 mt-4 font-bold">Emergency Fund</div>
                    <div className="text-lg font-bold">{dailyScore.emergencyMonths} months</div>
                </div>
            </div>

            {/* Insights */}
            <div className="border-t border-black/10 pt-6">
                {dailyScore.insights.slice(0, 2).map((insight, idx) => (
                    <div key={idx} className="text-xs opacity-60 mb-2">
                        • {insight}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
