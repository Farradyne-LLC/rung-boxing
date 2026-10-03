import {admin,db,failure,result} from '../../../lib/server';
import {csvCell} from '../../../lib/validation';
export async function GET(){try{await admin();const all=[];for(let offset=0;;offset+=1000){const rows=result(await db().from('applications').select('created_at,application_status,session_id,fighters(first_name,last_name,display_name,email,phone,age,current_weight,height,stance,skill_level,gym,instagram)').order('id').range(offset,offset+999));all.push(...rows);if(rows.length<1000)break;}
 const columns=['first_name','last_name','display_name','email','phone','age','current_weight','height','stance','skill_level','gym','instagram','application_status','session_id','created_at'];
 const lines=[columns.map(csvCell).join(','),...all.map(a=>{const f=Array.isArray(a.fighters)?a.fighters[0]:a.fighters;const row={...a,...f} as Record<string,unknown>;return columns.map(k=>csvCell(row[k])).join(',');})];return new Response('\uFEFF'+lines.join('\r\n'),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':'attachment; filename="punch-applications.csv"','Cache-Control':'no-store'}});
 }catch(e){return failure(e);}}
