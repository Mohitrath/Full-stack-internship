import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'FlowPilot — AI Project Manager',description:'Innovation Hacks full-stack internship capstone'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
