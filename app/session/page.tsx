import {Suspense} from 'react';
import SessionView from '../../components/session-view';
export default function SessionPage(){return <main id="main" className="shell product-page"><Suspense fallback={<p>Loading sample session…</p>}><SessionView/></Suspense></main>}
