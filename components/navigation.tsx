'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
const links = [['/', 'The club'], ['/profile', 'Fighter passport'], ['/session', 'The session'], ['/coaches', 'For coaches']];
export default function Navigation(){const pathname=usePathname(); const [open,setOpen]=useState(false);return <><div className="topline"><div className="shell"><span><i/> LOS ANGELES PILOT</span><span>COACH LED. PRIVATE FIRST.</span><span>PRODUCT PREVIEW / V2</span></div></div><header className="navigation shell"><Link href="/" className="wordmark" onClick={()=>setOpen(false)}>PUNCH<br/>MENTALITY<span className="brand-dot">®</span></Link><nav className={open?'navlinks open':'navlinks'} aria-label="Primary">{links.map(([href,label])=><Link key={href} href={href} aria-current={pathname===href?'page':undefined} onClick={()=>setOpen(false)}>{label}</Link>)}</nav><Link href="/request" className="nav-cta" onClick={()=>setOpen(false)}>Request rounds <span>↗</span></Link><button className="menu-button" aria-expanded={open} aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(!open)}>{open?'×':'☰'}</button></header></>;}
