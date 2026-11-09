# MCP Tool List

This build contains 168 catalogued tools. Use only tools also exposed by the live provider, with their live input schemas. A catalog entry is not proof of deployment.

For intelligent marketing-plan task lists, use `campaign2_plan_list` and display results in the conversation. Its inputs are `page_num`, `page_size`, `keyword`, `start_time`, `end_time`, and `invite_status`. Preserve filters when requesting the next page. Do not infer a failed status: invite_status only accepts the declared invitation states.

## collection

- `add_collection_creators`
- `apply_collection_add_to_crm`
- `apply_collection_batch_copy`
- `apply_collection_batch_delete`
- `apply_collection_batch_label`
- `apply_collection_batch_move`
- `apply_collection_refresh`
- `apply_collection_refresh_email`
- `apply_collection_unlock_audience`
- `create_collection`
- `create_collection_export`
- `delete_collection`
- `get_collection`
- `get_collection_import_template`
- `list_collection_items`
- `list_collection_resources`
- `list_collections`
- `preview_collection_add_to_crm`
- `preview_collection_batch_copy`
- `preview_collection_batch_delete`
- `preview_collection_batch_label`
- `preview_collection_batch_move`
- `preview_collection_refresh`
- `preview_collection_refresh_email`
- `preview_collection_unlock_audience`
- `update_collection`
- `validate_collection_add_to_crm`
- `validate_collection_batch_copy`
- `validate_collection_batch_delete`
- `validate_collection_batch_label`
- `validate_collection_batch_move`
- `validate_collection_refresh`
- `validate_collection_refresh_email`
- `validate_collection_unlock_audience`

## creator-analysis

- `creator_audience`
- `creator_content`
- `creator_cooperation`
- `creator_profile`

## creator-contact

- `get_creator_contacts`

## creator-discovery

- `add_not_interested_creators`
- `create_creator_export`
- `create_creator_lookalikes_export`
- `creator_search`
- `filter_creator_search_results`
- `find_similar_creators`
- `list_creator_search_filter_options`
- `list_not_interested_creators`
- `preview_creator_export`
- `remove_not_interested_creators`

## crm

- `apply_crm_add_to_email`
- `apply_crm_batch_update`
- `archive_crm_channel`
- `create_crm_export`
- `create_crm_group`
- `create_crm_label`
- `delete_crm_group`
- `delete_crm_label`
- `get_crm_channel`
- `get_crm_group`
- `get_crm_import_template`
- `list_crm_channels`
- `list_crm_groups`
- `list_crm_labels`
- `prepare_crm_import_report_download`
- `preview_crm_add_to_email`
- `preview_crm_batch_update`
- `restore_crm_channel`
- `update_crm_channel`
- `update_crm_group`
- `update_crm_label`
- `validate_crm_add_to_email`
- `validate_crm_batch_update`

## files-exports

- `get_export`
- `get_export_download`
- `list_exports`

## marketing-plan

- `campaign2_auto_advance_settings_apply`
- `campaign2_auto_advance_settings_get`
- `campaign2_auto_discovery_settings_delete`
- `campaign2_auto_discovery_settings_get`
- `campaign2_auto_discovery_settings_save`
- `campaign2_auto_discovery_switch`
- `campaign2_automations_get`
- `campaign2_automations_switch`
- `campaign2_candidates_add`
- `campaign2_candidates_list`
- `campaign2_candidates_remove`
- `campaign2_context`
- `campaign2_cooperations_add`
- `campaign2_cooperations_label_assign`
- `campaign2_cooperations_label_create`
- `campaign2_cooperations_label_delete`
- `campaign2_cooperations_label_update`
- `campaign2_cooperations_labels_list`
- `campaign2_cooperations_list`
- `campaign2_cooperations_record_save`
- `campaign2_cooperations_status_update`
- `campaign2_discovery_search`
- `campaign2_discovery_snapshot_get`
- `campaign2_discovery_snapshot_save`
- `campaign2_discovery_snapshots_list`
- `campaign2_invitation_pending_add`
- `campaign2_invitations_automation_get`
- `campaign2_invitations_automation_switch`
- `campaign2_invitations_detail`
- `campaign2_invitations_import_collection`
- `campaign2_invitations_list`
- `campaign2_invitations_metrics`
- `campaign2_invitations_preflight`
- `campaign2_invitations_readiness`
- `campaign2_invitations_recipient_preview`
- `campaign2_invitations_regions`
- `campaign2_invitations_send`
- `campaign2_invitations_send_result`
- `campaign2_invitations_sender_options`
- `campaign2_invitations_sequence`
- `campaign2_invitations_settings_apply`
- `campaign2_invitations_settings_get`
- `campaign2_invitations_settings_reset`
- `campaign2_invitations_settings_save`
- `campaign2_invitations_state`
- `campaign2_invitations_task`
- `campaign2_not_interested_list`
- `campaign2_not_interested_mark`
- `campaign2_not_interested_restore`
- `campaign2_notes_save`
- `campaign2_plan_create`
- `campaign2_plan_delete`
- `campaign2_plan_get`
- `campaign2_plan_init`
- `campaign2_plan_list`
- `campaign2_plan_members`
- `campaign2_plan_metrics`
- `campaign2_plan_overview`
- `campaign2_plan_settings_apply`
- `campaign2_plan_settings_save`
- `campaign2_plan_status`
- `campaign2_products_add`
- `campaign2_search_condition_get`
- `campaign2_search_condition_save`

## monitor

- `add_monitor_task`
- `add_monitor_task_labels`
- `create_monitor_label`
- `create_monitor_project`
- `delete_monitor_label`
- `get_monitor_auto_track_import_template`
- `get_monitor_auto_track_rule`
- `get_monitor_import_template`
- `list_monitor_auto_track_rules`
- `list_monitor_labels`
- `monitor_history`
- `monitor_list`
- `monitor_summary`
- `monitor_tasks`
- `prepare_monitor_auto_track_import_report_download`
- `prepare_monitor_dashboard_report_download`
- `prepare_monitor_import_report_download`
- `prepare_monitor_project_report_download`
- `prepare_monitor_task_report_download`
- `remove_monitor_task_labels`
- `replace_monitor_task_labels`
- `update_monitor_label`

## product

- `create_product`
- `get_product`
- `list_products`
- `update_product`

## quota-pricing

- `list_membership_pricing`
- `list_tool_pricing`
- `quota`
