import 'server-only';
import {redirect} from 'next/navigation';
import {admin,HttpError} from './server';
export async function requireAdmin(){try{return await admin();}catch(e){if(e instanceof HttpError&&e.status===401)redirect('/admin/login');throw e;}}
