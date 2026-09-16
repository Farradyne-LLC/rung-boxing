import {Suspense} from 'react';
import RequestFlow from '../../components/request-flow';
export default function RequestPage(){return <main id="main" className="shell product-page"><Suspense fallback={<p>Loading your request…</p>}><RequestFlow/></Suspense></main>}
