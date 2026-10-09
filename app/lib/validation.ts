import { z } from 'zod';
import { ageFromDob } from './application';
export const TERMS_VERSION = 'participation-2026-10-09';
const text = (max = 200) => z.string().trim().min(1).max(max);
export const safeUrl = z.string().trim().max(1500).refine(v => {
  if (!v) return true;
  try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password && !['localhost','127.0.0.1','::1'].includes(u.hostname); } catch { return false; }
}, 'Use a valid HTTPS URL.');
export const applicationSchema = z.object({
 request_id:z.uuid(), lead_token:z.string().regex(/^[a-f0-9]{64}$/).optional(), session_id:z.union([z.uuid(),z.literal('')]).default(''),
 first_name:text(80),last_name:z.string().trim().min(1,'Enter your last name.').max(80),display_name:z.string().trim().max(100).default(''),date_of_birth:text(10).refine(v=>ageFromDob(v)!==null,'Enter a valid date of birth.'),
 email:z.email().max(254).transform(v=>v.toLowerCase()),phone:text(40),instagram:z.string().trim().max(100).default(''),city:text(100),gym:z.string().trim().max(160).default(''),
 height:z.coerce.number().min(36).max(100),current_weight:z.coerce.number().min(50).max(500),stance:z.enum(['Orthodox','Southpaw','Switch']),
 years_boxing:z.coerce.number().min(0).max(90),competition_experience:z.enum(['No fights','Amateur','Professional']),amateur_fights:z.coerce.number().int().min(0).max(1000),professional_fights:z.coerce.number().int().min(0).max(1000),
 sparring_experience:text(2000),skill_level:z.enum(['Beginner','Developing','Intermediate','Advanced','Competitive amateur','Professional']),
 preferred_intensity:z.enum(['Technical/light','Controlled/moderate','Competitive technical']),availability:text(1000),video_url:safeUrl.default(''),boxrec_url:safeUrl.refine(v=>!v||/^https:\/\/(www\.)?boxrec\.com(?:[/?#]|$)/i.test(v),'Use a BoxRec HTTPS link.').default(''),notes:z.string().trim().max(3000).default(''),
 emergency_name:z.string().trim().max(150).default(''),emergency_phone:z.string().trim().max(40).default(''),visibility:z.enum(['PUBLIC','PRIVATE']),media_consent:z.boolean(),
 rules_accepted:z.literal(true),accuracy_accepted:z.literal(true),no_guarantee_accepted:z.literal(true),recording_accepted:z.literal(true),
 guardian_name:z.string().trim().max(150).default(''),guardian_contact:z.string().trim().max(254).default(''),website:z.literal('').default(''),
}).superRefine((d,ctx)=>{
 const age=ageFromDob(d.date_of_birth)!;
 if(d.years_boxing>age)ctx.addIssue({code:'custom',path:['years_boxing'],message:'Experience cannot exceed age.'});
 if(age<18&&(!d.guardian_name||!d.guardian_contact))ctx.addIssue({code:'custom',path:['guardian_name'],message:'A guardian contact is required for individual review.'});
 if(age>=18&&d.visibility==='PUBLIC'&&!d.media_consent)ctx.addIssue({code:'custom',message:'Choose Private if you do not consent to public media use.'});
}).transform(d=>({...d,display_name:d.display_name||d.first_name,competition_experience:d.professional_fights>0?'Professional':d.amateur_fights>0&&d.competition_experience==='No fights'?'Amateur':d.competition_experience}));
export const sessionSchema=z.object({title:text(150),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),date:z.iso.date(),start_time:z.string().regex(/^\d{2}:\d{2}$/),location_name:text(150),city:text(100),protected_location_field:text(400),description:z.string().max(3000),is_public:z.boolean()});
export const matchupSchema=z.object({application_a_id:z.uuid(),application_b_id:z.uuid(),session_id:z.uuid(),rounds:z.coerce.number().int().min(1).max(12),round_length:z.coerce.number().refine(n=>[60,90,120,180].includes(n)),internal_notes:z.string().max(3000).default('')});
export type FighterInput=z.infer<typeof applicationSchema>;
export function csvCell(value:unknown){return '"'+String(value??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';}

export const contactSchema=z.object({
 request_id:z.uuid(),lead_token:z.string().regex(/^[a-f0-9]{64}$/),
 first_name:text(80),last_name:z.string().trim().min(1,'Enter your last name.').max(80),email:z.email().max(254).transform(v=>v.toLowerCase()),
 phone:text(40).refine(v=>v.replace(/\D/g,'').length>=7,'Enter a valid phone number.'),
 date_of_birth:text(10).refine(v=>ageFromDob(v)!==null,'Enter a valid date of birth.'),
 marketing_consent:z.boolean().default(false),website:z.literal('').default(''),
 source:z.object({utm_source:z.string().max(150).default(''),utm_medium:z.string().max(150).default(''),utm_campaign:z.string().max(150).default('')}).default({utm_source:'',utm_medium:'',utm_campaign:''}),
});
export const boxingSchema=z.object({
 city:text(100),height:z.coerce.number().min(36).max(100),current_weight:z.coerce.number().min(50).max(500),stance:z.enum(['Orthodox','Southpaw','Switch']),years_boxing:z.coerce.number().min(0).max(90),
 skill_level:z.enum(['Beginner','Developing','Intermediate','Advanced','Competitive amateur','Professional']),
 sparring_experience:text(2000),preferred_intensity:z.enum(['Technical/light','Controlled/moderate','Competitive technical']),availability:text(1000),
});
export const leadSchema=contactSchema.extend({boxing:boxingSchema.optional()});
