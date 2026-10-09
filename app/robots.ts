import type {MetadataRoute} from 'next';
import {indexable,publicOrigin} from './lib/seo';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{return indexable()?{rules:{userAgent:'*',allow:'/',disallow:['/admin','/api/','/match/','/profile/','/preview/']},sitemap:publicOrigin+'/sitemap.xml'}:{rules:{userAgent:'*',disallow:'/'}};}
