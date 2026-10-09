import {managePhotos} from '../../../lib/manage-photos';
export async function POST(req:Request){return managePhotos(req,false);}
