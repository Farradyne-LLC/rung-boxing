import 'server-only';
import {sql} from './postgres';
import {deliverMail,queueDailyDigests} from './mail-delivery';
export async function flushNotifications(){await queueDailyDigests(sql(),process.env);return deliverMail(sql(),process.env);}
