'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
export default function PhotoPicker({files,onChange,limit=3,disabled=false}:{files:File[];onChange:(files:File[])=>void;limit?:number;disabled?:boolean}){
 const [urls,setUrls]=useState<string[]>([]),[error,setError]=useState('');
 useEffect(()=>{const next=files.map(f=>URL.createObjectURL(f));setUrls(next);return()=>next.forEach(u=>URL.revokeObjectURL(u));},[files]);
 return <div className="photo-picker"><label>Add photos (optional)<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={disabled||files.length>=limit} onChange={e=>{const added=Array.from(e.target.files||[]);e.target.value='';if(files.length+added.length>limit||added.some(f=>f.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(f.type))){setError(`Choose up to ${limit} photos in total. JPEG, PNG or WebP, maximum 5 MB each.`);return;}setError('');onChange([...files,...added]);}}/></label><p className="fine">JPEG, PNG or WebP · 5 MB each · up to {limit} photos. Remove a photo to choose another. Files must be reselected after reloading.</p>{error&&<p role="alert">{error}</p>}<div className="photo-selection">{files.map((f,i)=><figure key={`${f.name}-${i}`}>{urls[i]&&<Image unoptimized src={urls[i]} width={180} height={140} alt={`Selected photo ${i+1}`}/>}<figcaption>Photo {i+1}: {f.name}</figcaption><button type="button" className="button outline" disabled={disabled} onClick={()=>onChange(files.filter((_,n)=>n!==i))}>REMOVE PHOTO {i+1}</button></figure>)}</div></div>;
}
