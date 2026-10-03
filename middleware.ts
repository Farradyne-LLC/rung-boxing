import {NextResponse,type NextRequest} from 'next/server';
export function middleware(req:NextRequest){
 const res=NextResponse.next();
 res.headers.set('X-Content-Type-Options','nosniff');res.headers.set('X-Frame-Options','DENY');res.headers.set('Referrer-Policy','no-referrer');
 res.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(/^\/(admin|api|match)(\/|$)/.test(req.nextUrl.pathname)){
  res.headers.set('Cache-Control','private, no-store, max-age=0');res.headers.set('X-Robots-Tag','noindex, nofollow, noarchive');
 }
 return res;
}
export const config={matcher:['/((?!_next/static|_next/image|brand|images|favicon.ico).*)']};
