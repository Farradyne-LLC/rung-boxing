import Access from './access';
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <Access token={token||''}/>;}
