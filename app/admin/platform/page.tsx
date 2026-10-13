import {requireAdmin} from '../../lib/admin-page';
import Organizer from './organizer';
export const dynamic='force-dynamic';
export const metadata={title:'Session desk',robots:{index:false,follow:false}};
export default async function Page(){await requireAdmin();return <Organizer/>;}
