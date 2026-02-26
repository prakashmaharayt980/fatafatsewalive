'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Mail } from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────── */
interface Member {
    name: string;
    role: string;
    tag: string;
    initials: string;
    image?: string;
    linkedin?: string;
    email?: string;
}

/* ─── Data ────────────────────────────────────────────────────────── */
const founders: Member[] = [
    {
        name: 'Prakash Maharjan',
        role: 'Founder & Chief Executive Officer',
        tag: 'Founder',
        initials: 'PM',
        image: '',
        linkedin: 'https://linkedin.com',
        email: 'prakash@fatafatsewa.com',
    },
    {
        name: 'Sujata Maharjan',
        role: 'Co-Founder & Chief Operating Officer',
        tag: 'Co-Founder',
        initials: 'SM',
        image: '',
        linkedin: 'https://linkedin.com',
        email: 'sujata@fatafatsewa.com',
    },
    {
        name: 'Bikash Shrestha',
        role: 'Co-Founder & Chief Technology Officer',
        tag: 'Co-Founder',
        initials: 'BS',
        image: '',
        linkedin: 'https://linkedin.com',
        email: 'bikash@fatafatsewa.com',
    },
];

const boardMembers: Member[] = [
    { name: 'Anita Tamang', role: 'Chief Marketing Officer', tag: 'Marketing', initials: 'AT' },
    { name: 'Roshan Karmacharya', role: 'Chief Financial Officer', tag: 'Finance', initials: 'RK' },
    { name: 'Nisha Thapa', role: 'Head of Customer Experience', tag: 'Support', initials: 'NT' },
    { name: 'Suresh Poudel', role: 'Head of EMI & Partnerships', tag: 'Partnerships', initials: 'SP' },
    { name: 'Manisha Giri', role: 'Head of Logistics', tag: 'Logistics', initials: 'MG' },
    { name: 'Dipesh Lama', role: 'Head of Product & Repairs', tag: 'Product', initials: 'DL' },
];

/* ─── Founder Card ────────────────────────────────────────────────── */
function FounderCard({ member }: { member: Member }) {
    return (
        <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <Avatar className="w-28 h-28 ring-4 ring-slate-200 shadow-lg mb-5">
                {member.image && <AvatarImage src={member.image} alt={member.name} />}
                <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold tracking-wide">
                    {member.initials}
                </AvatarFallback>
            </Avatar>

            {/* Info */}
            <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 mb-3">
                {member.tag}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">{member.name}</h3>
            <p className="text-slate-500 text-sm font-medium mb-4">{member.role}</p>

            {/* Links */}
            <div className="flex items-center gap-2">
                {member.linkedin && (
                    <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200"
                    >
                        <Linkedin className="w-3.5 h-3.5" />
                    </a>
                )}
                {member.email && (
                    <a
                        href={`mailto:${member.email}`}
                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200"
                    >
                        <Mail className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>
        </div>
    );
}

/* ─── Board Member Card ───────────────────────────────────────────── */
function MemberCard({ member }: { member: Member }) {
    return (
        <div className="group flex flex-col items-center text-center bg-white border border-slate-100 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-300">
            <Avatar className="w-16 h-16 ring-2 ring-slate-100 group-hover:ring-slate-300 transition-all mb-3">
                {member.image && <AvatarImage src={member.image} alt={member.name} />}
                <AvatarFallback className="bg-slate-800 text-white text-base font-bold">
                    {member.initials}
                </AvatarFallback>
            </Avatar>

            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-400 mb-2">
                {member.tag}
            </span>
            <p className="text-sm font-bold text-slate-900 leading-tight">{member.name}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">{member.role}</p>
        </div>
    );
}

/* ─── Main Component ──────────────────────────────────────────────── */
export default function BoardMembers() {
    return (
        <section className="w-full bg-slate-50 border-t border-slate-100 py-20 md:py-28">
            <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">

                {/* ── Section header ──────────────────────────────── */}
                <div className="text-center max-w-xl mx-auto mb-16">
                    <span className="inline-block px-4 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-200 text-slate-600">
                        Leadership
                    </span>
                    <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-slate-900 leading-tight tracking-tight mb-4 font-heading">
                        Board & Founders
                    </h2>
                    <p className="text-slate-500 text-base leading-relaxed">
                        The people building Nepal&apos;s most trusted tech commerce experience — one decision at a time.
                    </p>
                </div>

                {/* ── Founders row (top) ──────────────────────────── */}
                <div className="flex justify-center mb-0">
                    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm px-8 py-10 w-full">
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                            {founders.map((f, i) => (
                                <div key={i} className="py-6 sm:py-0 sm:px-8 first:pt-0 last:pb-0">
                                    <FounderCard member={f} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Connector: vertical line ─────────────────────── */}
                <div className="flex flex-col items-center my-0">
                    <div className="w-px h-10 bg-slate-300" />
                    {/* Horizontal spread line */}
                    <div className="relative w-full max-w-5xl">
                        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-slate-200" />
                    </div>
                </div>

                {/* ── Board row connector dots ─────────────────────── */}
                <div className="relative flex justify-center">
                    {/* Full-width top border acting as the hub bar */}
                    <div className="absolute top-0 left-[7%] right-[7%] h-px bg-slate-200" />
                </div>

                {/* ── Board Members grid ───────────────────────────── */}
                <div className="relative pt-0">
                    {/* Hub bar line across top of grid */}
                    <div className="flex justify-center mb-0">
                        {/* short vertical down from founder line to hub */}
                    </div>

                    {/* Grid of member cards */}
                    <div className="border-t border-slate-200 pt-10 mt-0">
                        {/* Label */}
                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">
                            Board of Directors & Executive Team
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {boardMembers.map((member, i) => (
                                <MemberCard key={i} member={member} />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
