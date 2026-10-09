import type {MetadataRoute} from 'next';
import {indexable,publicOrigin} from './lib/seo';
import {publicSessions} from './lib/public-data';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(!indexable())return [];const sessions=await publicSessions();return ['','/apply','/gym','/sessions','/content-pack','/highlight-edit','/private-shoot','/privacy','/terms',...sessions.map(s=>'/sessions/'+s.slug)].map(path=>({url:publicOrigin+path}));}
