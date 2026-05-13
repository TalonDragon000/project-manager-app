export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          mission: string;
          device_id: string;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          mission?: string;
          device_id: string;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          mission?: string;
          device_id?: string;
          user_id?: string | null;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          reach: number;
          impact: number;
          confidence: number;
          effort: number;
          moscow: string;
          priority_column: string;
          completed: boolean;
          tags: string[];
          device_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          reach?: number;
          impact?: number;
          confidence?: number;
          effort?: number;
          moscow?: string;
          priority_column?: string;
          completed?: boolean;
          tags?: string[];
          device_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          reach?: number;
          impact?: number;
          confidence?: number;
          effort?: number;
          moscow?: string;
          priority_column?: string;
          completed?: boolean;
          tags?: string[];
          device_id?: string;
          created_at?: string;
        };
      };
    };
  };
}

export type Project = Database['public']['Tables']['projects']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
