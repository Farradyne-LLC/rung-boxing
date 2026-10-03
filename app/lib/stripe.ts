import 'server-only';
import Stripe from 'stripe';
import {env} from './server';
export function stripe(){return new Stripe(env('STRIPE_SECRET_KEY'),{maxNetworkRetries:2});}
