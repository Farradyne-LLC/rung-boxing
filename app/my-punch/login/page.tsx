import {MemberLogin} from '../../components/punch-platform';
export const metadata={title:'Sign in to My Punch',referrer:'no-referrer' as const,robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string>>}){const p=await searchParams;const next=/^\/(partners|requests|my-punch|sessions)([/?#]|$)/.test(p.next||'')?p.next:'/my-punch';return <MemberLogin token={p.token||''} next={next}/>;}
