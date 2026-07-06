-- CloudBase PG mode: table-level GRANT (run after 001-024)
-- CloudBase requires GRANT + RLS; Supabase migrations only define RLS policies.

-- User-owned tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ieps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.iep_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_sessions TO authenticated;

-- Assessment score tables (RLS restricts to own sessions)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vb_mapp_milestone_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vb_mapp_barrier_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vb_mapp_transition_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.c_pep3_developmental_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.c_pep3_pathological_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kg_integration_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kg_integration_behavior_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.elem_integration_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.elem_integration_behavior_records TO authenticated;

-- Reference/definition tables (read-only for authenticated)
GRANT SELECT ON public.vb_mapp_milestones TO authenticated;
GRANT SELECT ON public.vb_mapp_barriers TO authenticated;
GRANT SELECT ON public.vb_mapp_transitions TO authenticated;
GRANT SELECT ON public.c_pep3_developmental_items TO authenticated;
GRANT SELECT ON public.c_pep3_pathological_items TO authenticated;
GRANT SELECT ON public.kg_integration_items TO authenticated;
GRANT SELECT ON public.elem_integration_items TO authenticated;

-- Summary views
GRANT SELECT ON public.v_vbmapp_milestone_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_dev_summary TO authenticated;
GRANT SELECT ON public.v_cpep3_pat_summary TO authenticated;
GRANT SELECT ON public.v_kg_integration_summary TO authenticated;
GRANT SELECT ON public.v_elem_integration_summary TO authenticated;
