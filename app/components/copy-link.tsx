'use client';
import {useState} from 'react';
export default function CopyLink({url}:{url:string}){const [message,setMessage]=useState('');return <div className="copy-profile-link"><input aria-label="Public profile address" value={url} readOnly onFocus={e=>e.currentTarget.select()}/><button type="button" className="button outline" onClick={async()=>{try{await navigator.clipboard.writeText(url);setMessage('Copied.');}catch{setMessage('Select the address above and copy it.');}}}>COPY LINK</button><span role="status">{message}</span></div>;}
