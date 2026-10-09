import 'server-only';
import {z} from 'zod';
import {boxingSchema,instagramSchema,safeUrl} from './validation';
import {ageFromDob} from './application';
import {transaction} from './postgres';
import {HttpError} from './server';
const txt=(max:number)=>z.string().trim().max(max);
export const editSchema=boxingSchema.extend({
 id:z.uuid(),version:z.coerce.number().int().min(0),reason:txt(500).min(3,'Explain the correction.'),
 first_name:txt(80).min(1),last_name:txt(80).min(1),display_name:txt(100).min(1),date_of_birth:z.string().refine(v=>ageFromDob(v)!==null,'Enter a valid date of birth.'),email:z.email().max(254).transform(v=>v.toLowerCase()),phone:txt(40).min(1),
 instagram:z.union([z.literal(''),instagramSchema]),gym:txt(160),amateur_fights:z.coerce.number().int().min(0).max(1000),professional_fights:z.coerce.number().int().min(0).max(1000),video_url:safeUrl,boxrec_url:safeUrl.refine(v=>!v||/^https:\/\/(www\.)?boxrec\.com(?:[/?#]|$)/i.test(v),'Use a BoxRec link.'),notes:txt(3000),emergency_name:txt(150),emergency_phone:txt(40),guardian_name:txt(150),guardian_contact:txt(254),
}).superRefine((d,c)=>{if(d.years_boxing>ageFromDob(d.date_of_birth)!)c.addIssue({code:'custom',path:['years_boxing'],message:'Experience cannot exceed age.'});});
export async function editApplication(input:unknown,actor:{id:string;email:string}){
 const d=editSchema.parse(input);
 await transaction(async c=>{
 const app=(await c.query('SELECT fighter_id FROM applications WHERE id=$1',[d.id])).rows[0];if(!app)throw new HttpError(404,'Application not found.');
 const f=(await c.query('SELECT * FROM fighters WHERE id=$1 FOR UPDATE',[app.fighter_id])).rows[0];const a=(await c.query('SELECT * FROM applications WHERE id=$1 FOR UPDATE',[d.id])).rows[0];
 if(f.edit_version!==d.version)throw new HttpError(409,'Another administrator changed this application. Reload and review their changes first.');
 const active=Number((await c.query("SELECT count(*) FROM matchups WHERE (fighter_a_id=$1 OR fighter_b_id=$1) AND status<>'CANCELLED'",[f.id])).rows[0].count)>0;
 if(d.date_of_birth!==f.date_of_birth&&active)throw new HttpError(409,'Date of birth cannot be changed while this fighter has a non-cancelled matchup. Review the pairing first.');
 const age=ageFromDob(d.date_of_birth)!;const changes:Record<string,unknown>={};
 const fighterKeys=['first_name','last_name','display_name','date_of_birth','email','phone','instagram','city','gym','height','current_weight','stance','years_boxing','amateur_fights','professional_fights','sparring_experience','skill_level','video_url','boxrec_url','notes','emergency_name','emergency_phone'] as const;
 for(const key of fighterKeys){if(String(f[key]??'')!==String(d[key])){changes[key]={before:f[key],after:d[key]};await c.query(`UPDATE fighters SET ${key}=$1 WHERE id=$2`,[d[key],f.id]);}}
 for(const key of ['availability','preferred_intensity','guardian_name','guardian_contact'] as const){if(String(a[key]??'')!==d[key]){changes[key]={before:a[key],after:d[key]};await c.query(`UPDATE applications SET ${key}=$1 WHERE id=$2`,[d[key],d.id]);}}
 if(!Object.keys(changes).length)return;
 // Corrections never create consent or guardian authorization; identity changes revoke old editing links.
 if(d.email!==f.email)await c.query('DELETE FROM fighter_access_links WHERE fighter_id=$1',[f.id]);
 if(d.date_of_birth!==f.date_of_birth||d.guardian_name!==(a.guardian_name||'')||d.guardian_contact!==(a.guardian_contact||''))await c.query('UPDATE applications SET guardian_reviewed_at=NULL,guardian_reviewed_by=NULL,guardian_review_notes=NULL WHERE fighter_id=$1',[f.id]);
 if(age<18){await c.query('UPDATE applications SET guardian_required=true WHERE fighter_id=$1',[f.id]);await c.query("UPDATE fighters SET visibility='PRIVATE' WHERE id=$1",[f.id]);}
 await c.query('UPDATE fighters SET age=$1,competition_experience=$2,edit_version=edit_version+1,profile_published=false WHERE id=$3',[age,d.professional_fights>0?'Professional':d.amateur_fights>0?'Amateur':'No fights',f.id]);
 if(age<18){changes.visibility={before:f.visibility,after:'PRIVATE'};changes.guardian_required={before:a.guardian_required,after:true};}if(d.date_of_birth!==f.date_of_birth||d.guardian_name!==(a.guardian_name||'')||d.guardian_contact!==(a.guardian_contact||''))changes.guardian_reviewed_at={before:a.guardian_reviewed_at,after:null};changes.profile_published={before:f.profile_published,after:false};
 await c.query('INSERT INTO audit_log(actor,actor_label,action,entity_id,changes) VALUES($1,$2,$3,$4,$5)',[actor.id,actor.email,'EDIT_APPLICATION',d.id,{reason:d.reason,fields:changes}]);
 });return {ok:true};
}
