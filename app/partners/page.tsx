import PunchPlatform from '../components/punch-platform';
import {pageMetadata} from '../lib/seo';
export const metadata=pageMetadata('Find sparring partners','Find approved boxing partners in Los Angeles and Orange County. Compare availability and express interest in organized rounds.','/partners');
export default function Page(){return <PunchPlatform view="partners"/>;}
