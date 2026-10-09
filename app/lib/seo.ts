import type {Metadata} from 'next';
export const publicOrigin='https://punchmentality.com';
export function indexable(){return process.env.SITE_INDEXABLE==='true'&&process.env.SITE_PREVIEW!=='true';}
export function pageMetadata(title:string,description:string,path:string):Metadata{return {title,description,alternates:{canonical:publicOrigin+path},openGraph:{title,description,url:publicOrigin+path,type:'website'}};}
