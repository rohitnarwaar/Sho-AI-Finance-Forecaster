import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import CassetteImage from '@/assets/CASST.png';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function HomeDesktop() {
    const { scrollYProgress } = useScroll();
    const { currentUser, logout, checkOnboardingStatus } = useAuth();
    const router = useRouter();

    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            if (currentUser) {
                const completed = await checkOnboardingStatus(currentUser.uid);
                setHasCompletedOnboarding(completed);
            }
            setCheckingOnboarding(false);
        };
        checkStatus();
    }, [currentUser, checkOnboardingStatus]);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    // Transform scroll progress to RGB values
    // 0-0.1: Red -> White
    // 0.1-0.65: White Background + Black Text (Maximized contrast zone for Models)
    // 0.65-0.7: Transition to Black (BIOS Section starts here)
    const backgroundColor = useTransform(
        scrollYProgress,
        [0, 0.1, 0.65, 0.7],
        ['rgb(185, 28, 28)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(0, 0, 0)']
    );

    const textColor = useTransform(
        scrollYProgress,
        [0, 0.1, 0.65, 0.7],
        ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)']
    );

    return (
        <motion.div
            className="relative min-h-[200vh]"
            style={{ backgroundColor }}
        >

            {/* Navigation */}
            <motion.nav
                className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center py-6"
                style={{
                    color: textColor,
                    paddingLeft: '10%',
                    paddingRight: '10%'
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-sm tracking-widest font-bold"
                >
                    ONE&apos;S OWN
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex gap-8 text-sm tracking-wide items-center font-mono"
                >
                    {currentUser ? (
                        <>
                            {!checkingOnboarding && (
                                hasCompletedOnboarding ? (
                                    <Link href="/dashboard" className="hover:opacity-70 transition-opacity">Dashboard</Link>
                                ) : (
                                    <Link href="/onboarding" className="hover:opacity-70 transition-opacity">Complete Profile</Link>
                                )
                            )}
                            <button onClick={handleLogout} className="hover:opacity-70 transition-opacity">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:opacity-70 transition-opacity">Login</Link>
                            <Link href="/register" className="hover:opacity-70 transition-opacity">Register</Link>
                        </>
                    )}

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            const contactSection = document.getElementById('contact');
                            if (contactSection) {
                                contactSection.scrollIntoView({ behavior: 'smooth' });
                            }
                        }}
                        className="hover:opacity-70 transition-opacity"
                    >
                        Contact
                    </button>
                </motion.div>
            </motion.nav>

            {/* Hero Section - Centered */}
            <div className="relative z-10 flex w-full min-h-screen px-6 pb-12">
                <div className="flex flex-col justify-center w-full">
                    <div className="absolute left-[15%] top-[58%] -translate-y-1/2">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="text-[7rem] sm:text-[9rem] md:text-[11rem] lg:text-[13rem] xl:text-[16rem] font-bold tracking-tight leading-none text-left"
                            style={{
                                color: textColor,
                                WebkitTextStroke: '1.5px black',
                                letterSpacing: '0.0em'
                            }}
                        >
                            AXIOMÉ
                        </motion.h1>
                    </div>

                    {/* Bottom Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="absolute bottom-12 left-[15%] flex flex-col items-start gap-6"
                        style={{ color: textColor }}
                    >
                        <div>
                            <p className="text-xs tracking-widest mb-1 font-bold italic">COMPOSED OF:</p>
                            <p className="text-sm leading-relaxed font-mono">
                                Models · Forecasts · Scenarios
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(currentUser ? '/dashboard' : '/register')}
                            className="text-xs tracking-widest font-mono px-6 py-3 rounded-full border transition-opacity hover:opacity-70"
                            style={{ borderColor: textColor, color: textColor }}
                        >
                            {currentUser ? 'GO TO DASHBOARD →' : 'START MODELING YOUR FUTURE →'}
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* INFO Section - Appears on scroll */}
            <div className="pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="space-y-2 max-w-2xl"
                    style={{ marginLeft: '15%', color: textColor }}
                >
                    <h3 className="text-xs tracking-widest font-bold uppercase">INFO</h3>
                    <p className="text-sm leading-relaxed font-mono">
                        AXIOMÉ(ax-i-oh-may)is a personal system for modeling the present and reasoning about the future.
                    </p>
                    <p className="text-sm leading-relaxed font-mono">
                        It brings together fragmented financial signals into a coherent structure, allowing patterns, risks, and possibilities to surface over time. Rather than recording what has already happened, AXIOMÉ focuses on exploring what could happen, and why.<br />
                        Designed as a thinking companion, the system helps individuals understand consequences before decisions are made, offering clarity without noise and foresight without prescription.
                    </p>
                </motion.div>

                {/* Horizontal Line Separator */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: false }}
                    className="h-px mt-16 mb-16"
                    style={{
                        width: '70%',
                        marginLeft: '15%',
                        backgroundColor: textColor,
                        opacity: 0.3,
                        transformOrigin: 'left'
                    }}
                />

                {/* Models & Scenarios Section — Accordion Gallery */}
                <motion.div className="pb-4" style={{ color: textColor }}>
                    <h3 className="text-sm tracking-widest mb-12 font-light text-center z-10 font-mono">
                        MODELS & SCENARIOS
                    </h3>

                    <div className="flex w-full h-[70vh] gap-1">
                        {[
                            { date: '01', title: 'Present State', desc: 'The baseline financial reality: income, expenses, and cash flow, all in one place.', target: 'net-worth', bg: '#141414' },
                            { date: '02', title: 'Forecasts', desc: 'Savings, retirement, and long-term projections built from your real numbers.', target: 'retirement', bg: '#1c1c1c' },
                            { date: '03', title: 'Debt & Risk', desc: 'Loan payoff timelines and volatility signals that flag exposure before it compounds.', target: 'debt', bg: '#141414' },
                            { date: '04', title: 'Scenarios', desc: 'Run what-if simulations and see alternate outcomes before committing.', target: 'simulator', bg: '#1c1c1c' },
                            { date: '05', title: 'Decision Notes', desc: 'AI-synthesized, actionable takeaways drawn directly from your data.', target: 'ai-advisor', bg: '#b91c1c' }
                        ].map((panel, index) => (
                            <div
                                key={index}
                                onClick={() => currentUser ? router.push(`/dashboard#${panel.target}`) : router.push('/login')}
                                className="group relative h-full flex-1 hover:flex-5 transition-[flex-grow] duration-700 ease-in-out cursor-pointer overflow-hidden"
                                style={{ backgroundColor: panel.bg }}
                            >
                                {/* Collapsed label */}
                                <div className="absolute inset-0 flex items-end justify-center pb-10 opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                    <span className="text-xs tracking-widest font-mono text-white/80 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap">
                                        {panel.date} / {panel.title}
                                    </span>
                                </div>

                                {/* Expanded content */}
                                <div className="absolute inset-0 flex flex-col justify-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <span className="text-xs tracking-widest font-mono text-white/60 mb-2">{panel.date}</span>
                                    <h4 className="text-2xl font-bold mb-3 font-mono text-white whitespace-nowrap">{panel.title}</h4>
                                    <p className="text-sm text-white/80 leading-relaxed">{panel.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Horizontal Line Separator */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: false }}
                    className="h-px mt-16 mb-16"
                    style={{
                        width: '70%',
                        marginLeft: '15%',
                        backgroundColor: textColor,
                        opacity: 0.3,
                        transformOrigin: 'left'
                    }}
                />

                {/* BIOS Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.2 }}
                    className="pb-20"
                    style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
                >
                    <h3 className="text-2xl tracking-widest mb-4 font-light uppercase font-mono">
                        HOW IT WORKS
                    </h3>
                    <p className="text-sm leading-relaxed font-mono opacity-70 max-w-xl mb-12">
                        AXIOMÉ helps people clearly see where their money stands today and what it could look like in the future.
                    </p>

                    <div className="space-y-8 text-base font-mono">
                        <div>
                            <p className="mb-2 font-bold">Present State</p>
                            <p className="opacity-80">Brings income, expenses, savings, and debts together so nothing important is hidden.</p>
                        </div>

                        <div>
                            <p className="mb-2 font-bold">Future Outlook</p>
                            <p className="opacity-80">Shows how current habits may shape finances over time, without requiring complex planning.</p>
                        </div>

                        <div>
                            <p className="mb-2 font-bold">Scenarios</p>
                            <p className="opacity-80">Allows people to explore different choices and see possible outcomes before committing.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Horizontal Line Separator */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: false }}
                    className="h-px mt-16 mb-16"
                    style={{
                        width: '70%',
                        marginLeft: '15%',
                        backgroundColor: textColor,
                        opacity: 0.3,
                        transformOrigin: 'left'
                    }}
                />

                {/* Cassette Tape Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false, amount: 0.2 }}
                    className="pb-2"
                    style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
                >
                    <h3 className="text-xl tracking-widest mb-2 font-light uppercase text-center font-mono">
                        SEE YOUR FUTURE, BEFORE YOU LIVE IT.
                    </h3>

                    {/* Cassette Image */}
                    <div className="flex justify-center">
                        <div className="w-full max-w-4xl">
                            <Image
                                src={CassetteImage}
                                alt="Cassette Tape"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Horizontal Line Separator */}
                <motion.div
                    initial={{ opacity: 0, scaleX: 0 }}
                    whileInView={{ opacity: 1, scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: false }}
                    className="h-px mt-16 mb-16"
                    style={{
                        width: '70%',
                        marginLeft: '15%',
                        backgroundColor: textColor,
                        opacity: 0.3,
                        transformOrigin: 'left'
                    }}
                />

                {/* Footer Section */}
                <motion.footer
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: false }}
                    id="contact"
                    className="pb-12"
                    style={{ marginLeft: '15%', marginRight: '15%', color: textColor }}
                >
                    <div className="flex justify-between items-start font-mono">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <div className="text-2xl font-bold tracking-tight">
                                AXIOMÉ
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="flex gap-24 text-xs">
                            <div>
                                <p className="mb-1">Support:</p>
                                <p>hello@axiome.com</p>
                            </div>
                            <div>
                                <p className="mb-1">Rights:</p>
                                <p>All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </motion.footer>
            </div>
        </motion.div >
    );
}
