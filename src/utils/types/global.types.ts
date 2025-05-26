import { Database } from '../../../database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export type SchematicParts = {
  part_id: string;
  category?: string;
  part_name?: string;
}[];

export type SchematicTuning = {
  load: number;
  en_output: number;
  kp_output: number;
  lock_speed: number;
  en_capacity: number;
  aim_precision: number;
  ecm_resistance: number;
  stability_core: number;
  stability_head: number;
  stability_legs: number;
  en_weapon_skill: number;
  maneuverability: number;
  turning_ability: number;
  vertical_thrust: number;
  firing_stability: number;
  quick_boost_back: number;
  quick_boost_main: number;
  quick_boost_side: number;
  rectification_arm: number;
  rectification_leg: number;
  missile_lock_speed: number;
  quick_boost_overed: number;
  radar_refresh_rate: number;
  rectification_core: number;
  rectification_head: number;
  horizontal_thrust_back: number;
  horizontal_thrust_main: number;
  horizontal_thrust_side: number;
};
