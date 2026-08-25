import { motion } from 'framer-motion';

export default function StreaksWidget({ streaks }) {
    if (!streaks) return null;

    const streakItems = [
        { name: 'Tracking Streak', value: streaks.trackingStreak, color: 'bg-blue-500' },
        { name: 'Savings Streak', value: streaks.savingsStreak, color: 'bg-green-500' },
        { name: 'Budget Streak', value: streaks.budgetStreak, color: 'bg-yellow-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 border border-black/10 rounded-sm font-mono"
        >
            <h3 className="text-xs tracking-widest uppercase mb-6 opacity-60">Your Streaks</h3>

            <div className="grid grid-cols-3 gap-4">
                {streakItems.map((item, idx) => (
                    <div key={idx} className="text-center">
                        <div className={`w-2 h-2 rounded-full mx-auto mb-3 ${item.value > 0 ? item.color : 'bg-black/10'}`} />
                        <div className="text-2xl font-light">{item.value}</div>
                        <p className="text-[10px] opacity-60">
                            {item.value > 0 ? "You're currently on a roll!" : 'Start today'}
                        </p>
                        <div className="text-xs opacity-40 mt-1">{item.name}</div>
                    </div>
                ))}
            </div>

            {streaks.trackingStreak >= 7 && (
                <div className="mt-6 text-xs text-center opacity-60 border-t border-black/10 pt-4">
                    You&apos;re on fire! {streaks.trackingStreak} days tracked!
                </div>
            )}
        </motion.div>
    );
}
