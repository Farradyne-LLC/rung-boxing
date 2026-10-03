'use client';
import {useEffect} from 'react';
import {track,type AnalyticsEvent} from '../lib/analytics';
export default function EventBeacon({name}:{name:AnalyticsEvent}){useEffect(()=>track(name),[name]);return null;}
