import {z} from 'zod';
import {instagramSchema,safeUrl} from './validation';
const text=(max:number)=>z.string().trim().min(1).max(max);
const common={request_id:z.uuid(),name:text(160),email:z.email().max(254).transform(s=>s.toLowerCase()),instagram:z.union([z.literal(''),instagramSchema]).default(''),brief:text(3000),website:z.literal('').default('')};
export const serviceRequestSchema=z.discriminatedUnion('kind',[
 z.object({...common,kind:z.literal('HIGHLIGHT_EDIT'),source_url:safeUrl.default(''),session_reference:z.string().trim().max(500).default(''),edit_type:z.enum(['Personal highlight','Social reel','Both — separate edits']),rights_confirmed:z.literal(true)}),
 z.object({...common,kind:z.literal('PRIVATE_SHOOT'),shoot_type:z.enum(['Training session','Fighter story / interview','Fight preparation','Social content','Other']),location:text(300),preferred_dates:text(200),budget:z.string().trim().max(150).default('')})
]);
export const serviceNames={HIGHLIGHT_EDIT:'Highlight Edit',PRIVATE_SHOOT:'Private Shoot'};
