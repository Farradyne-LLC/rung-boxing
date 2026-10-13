import {z} from 'zod';
export const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;
export const times=['Morning','Afternoon','Evening'] as const;
export const levels=['Beginner','Developing','Intermediate','Advanced'] as const;
export const memberProfileSchema=z.object({
 version:z.number().int().nonnegative(),first_name:z.string().trim().min(1).max(80),last_name:z.string().trim().min(1).max(80),display_name:z.string().trim().min(1).max(100),city:z.string().trim().min(1).max(100),
 current_weight:z.coerce.number().min(50).max(500),competition_weight:z.union([z.coerce.number().min(50).max(500),z.null()]),
 training_level:z.enum(levels),sparring_intensity:z.enum(['Technical/light','Controlled/moderate','Competitive technical']).default('Technical/light'),years_boxing:z.coerce.number().min(0).max(90),competition_experience:z.enum(['No fights','Amateur','Professional']),stance:z.enum(['Orthodox','Southpaw','Switch']),
 amateur_fights:z.coerce.number().int().min(0).max(1000),professional_fights:z.coerce.number().int().min(0).max(1000),
 gym:z.string().max(160),coach:z.string().max(160),instagram:z.string().trim().max(30).regex(/^[A-Za-z0-9_.]*$/),bio:z.string().max(600),preferred_venues:z.string().max(400),travel_area:z.string().max(200),
 goals:z.array(z.string().max(50)).max(8),available_days:z.array(z.enum(days)).max(7),available_times:z.array(z.enum(times)).max(3),available_dates:z.array(z.iso.date()).max(30),
 directory_visible:z.boolean(),looking_for_rounds:z.boolean(),visibility:z.enum(['PUBLIC','PRIVATE']),email_notifications:z.boolean(),advertising_consent:z.boolean(),weight_confirmed:z.literal(true),availability_confirmed:z.literal(true)
});
export const platformSessionSchema=z.object({id:z.uuid().optional(),revision:z.number().int().nonnegative().default(0),title:z.string().trim().min(3).max(150),slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),date:z.iso.date(),start_time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),location_name:z.string().trim().min(1).max(150),city:z.string().trim().min(1).max(100),protected_location_field:z.string().max(400),description:z.string().max(3000),enrollment_status:z.enum(['draft','open','full','completed','cancelled']),capacity:z.coerce.number().int().min(2).max(200),duration_minutes:z.coerce.number().int().min(15).max(720),format:z.string().min(1).max(100),requirements:z.string().max(1000),organizer:z.string().max(150),filming:z.boolean(),planned_rounds:z.coerce.number().int().min(1).max(12),round_seconds:z.coerce.number().refine(n=>[60,90,120,180].includes(n))});
